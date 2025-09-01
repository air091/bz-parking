import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

export const useParkingSlots = () => {
  const [parkingSlots, setParkingSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true); // Auto-refresh toggle
  const [refreshInterval, setRefreshInterval] = useState(2000); // Refresh interval in ms
  const previousSlotsRef = useRef([]);
  const abortControllerRef = useRef(null);

  // Function to check if there are actual changes in parking slots
  const checkForChanges = useCallback((oldSlots, newSlots) => {
    if (oldSlots.length !== newSlots.length) {
      return true;
    }

    for (let i = 0; i < oldSlots.length; i++) {
      const oldSlot = oldSlots[i];
      const newSlot = newSlots[i];

      // Check if slot_id, status, or updated_at has changed
      if (
        oldSlot.slot_id !== newSlot.slot_id ||
        oldSlot.status !== newSlot.status ||
        oldSlot.updated_at !== newSlot.updated_at
      ) {
        return true;
      }
    }

    return false;
  }, []);

  const fetchParkingSlots = useCallback(
    async (forceRefresh = false) => {
      try {
        // Cancel any ongoing request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // Create new abort controller
        abortControllerRef.current = new AbortController();

        setLoading(true);
        setError(null);

        const response = await axios.get(
          "http://localhost:2701/api/parking-slot",
          { signal: abortControllerRef.current.signal }
        );

        const newSlots = response.data.parkingSlots || [];

        // Check if there are actual changes (unless force refresh)
        const hasActualChanges =
          forceRefresh || checkForChanges(previousSlotsRef.current, newSlots);

        if (hasActualChanges) {
          setParkingSlots(newSlots);
          previousSlotsRef.current = newSlots;
          setLastUpdateTime(new Date());
          setHasChanges(true);
          console.log("Parking slots updated - changes detected");
        } else {
          setHasChanges(false);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Failed to load parking slots.");
          console.log(`Error getting parking slots: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    },
    [checkForChanges]
  );

  // Update a specific slot in the list
  const updateSlot = useCallback((updatedSlot) => {
    setParkingSlots((prevSlots) =>
      prevSlots.map((slot) =>
        slot.slot_id === updatedSlot.slot_id ? updatedSlot : slot
      )
    );
    setHasChanges(true);
    setLastUpdateTime(new Date());
  }, []);

  // Force refresh function for manual updates
  const forceRefresh = useCallback(() => {
    fetchParkingSlots(true);
  }, [fetchParkingSlots]);

  // Toggle auto-refresh
  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh((prev) => !prev);
  }, []);

  // Change refresh interval
  const changeRefreshInterval = useCallback((interval) => {
    setRefreshInterval(interval);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchParkingSlots();
  }, [fetchParkingSlots]);

  // Conditional polling based on auto-refresh setting
  useEffect(() => {
    let intervalId = null;

    if (autoRefresh) {
      intervalId = setInterval(() => {
        fetchParkingSlots();
      }, refreshInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchParkingSlots, autoRefresh, refreshInterval]);

  return {
    parkingSlots,
    loading,
    error,
    hasChanges,
    lastUpdateTime,
    autoRefresh,
    refreshInterval,
    fetchParkingSlots,
    updateSlot,
    forceRefresh,
    toggleAutoRefresh,
    changeRefreshInterval,
  };
};
