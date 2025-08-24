import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import ConfirmHoldSlot from "./ConfirmHoldSlot";

const ParkingSlotCard = ({
  selectedParkingSlot,
  setSelectedParkingSlot,
  onSlotUpdate,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmHold, setShowConfirmHold] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);

  // Local state to maintain slot data independently of parent updates
  const [localSlotData, setLocalSlotData] = useState(null);

  // Initialize local state when component mounts or slot changes
  useEffect(() => {
    if (selectedParkingSlot) {
      setLocalSlotData(selectedParkingSlot);
    }
  }, [selectedParkingSlot]);

  // Calculate time remaining for held slots using local data
  useEffect(() => {
    if (localSlotData?.status === "held" && localSlotData?.updated_at) {
      const updateTimer = () => {
        const heldTime = new Date(localSlotData.updated_at).getTime();
        const currentTime = new Date().getTime();
        const elapsedSeconds = Math.floor((currentTime - heldTime) / 1000);
        const remainingSeconds = Math.max(0, 180 - elapsedSeconds); // 3 minutes = 180 seconds

        setTimeRemaining(remainingSeconds);

        if (remainingSeconds <= 0) {
          // Timer expired, update local state only
          handleTimerExpiration();
        }
      };

      // Update immediately
      updateTimer();

      // Set up interval to update every second
      const timer = setInterval(updateTimer, 1000);

      return () => clearInterval(timer);
    } else {
      setTimeRemaining(null);
    }
  }, [localSlotData]);

  // Handle timer expiration locally without affecting parent
  const handleTimerExpiration = () => {
    if (localSlotData) {
      const expiredSlot = {
        ...localSlotData,
        status: "available",
        updated_at: new Date().toISOString(),
      };

      // Update local state only
      setLocalSlotData(expiredSlot);
      setTimeRemaining(null);

      // Optionally notify parent about the change (but don't force refresh)
      if (onSlotUpdate) {
        onSlotUpdate(expiredSlot);
      }

      console.log("Timer expired - slot status updated locally:", expiredSlot);
    }
  };

  // Function to fetch updated slot data when timer expires (now optional)
  const fetchUpdatedSlotData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:2701/api/parking-slot/${localSlotData.slot_id}`
      );

      if (response.data.success && response.data.parkingSlot) {
        const updatedSlot = response.data.parkingSlot;

        // Ensure all required fields are present with fallbacks
        const completeSlot = {
          slot_id: updatedSlot.slot_id || localSlotData.slot_id,
          status: updatedSlot.status || "available",
          vehicle_type:
            updatedSlot.vehicle_type ||
            localSlotData.vehicle_type ||
            "Not specified",
          location: updatedSlot.location || localSlotData.location,
          updated_at: updatedSlot.updated_at || localSlotData.updated_at,
          vehicle_type_id:
            updatedSlot.vehicle_type_id || localSlotData.vehicle_type_id,
        };

        // Validate that we have the essential data
        if (!completeSlot.slot_id || !completeSlot.location) {
          console.warn(
            "Missing essential slot data, using original data with status update"
          );
          const fallbackSlot = {
            ...localSlotData,
            status: "available",
            updated_at: new Date().toISOString(),
          };
          setLocalSlotData(fallbackSlot);
          if (onSlotUpdate) {
            onSlotUpdate(fallbackSlot);
          }
          return;
        }

        setLocalSlotData(completeSlot);

        // Notify parent component about the update
        if (onSlotUpdate) {
          onSlotUpdate(completeSlot);
        }

        console.log(
          "Slot status updated after timer expiration:",
          completeSlot
        );
      } else {
        // If API response is incomplete, fallback to safe default
        console.warn("Incomplete API response, using fallback data");
        const fallbackSlot = {
          ...localSlotData,
          status: "available",
          updated_at: new Date().toISOString(),
        };
        setLocalSlotData(fallbackSlot);
        if (onSlotUpdate) {
          onSlotUpdate(fallbackSlot);
        }
      }
    } catch (err) {
      console.error("Error fetching updated slot data:", err);
      // Fallback: preserve existing data but update status to available
      const fallbackSlot = {
        ...localSlotData,
        status: "available",
        updated_at: new Date().toISOString(),
      };
      setLocalSlotData(fallbackSlot);
      if (onSlotUpdate) {
        onSlotUpdate(fallbackSlot);
      }
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleHoldSlotClick = () => {
    if (!user) {
      setError("You must be logged in to hold a parking slot");
      return;
    }

    if (localSlotData.status !== "available") {
      setError("Only available parking slots can be held");
      return;
    }

    // Show confirmation popup
    setShowConfirmHold(true);
  };

  const handleConfirmHold = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.put(
        `http://localhost:2701/api/parking-slot/${localSlotData.slot_id}`,
        {
          status: "held",
        }
      );

      if (response.data.success) {
        // Update the local slot data with current timestamp
        const updatedSlot = {
          ...localSlotData,
          status: "held",
          updated_at: new Date().toISOString(), // Set current time for timer
        };

        setLocalSlotData(updatedSlot);

        // Notify parent component about the update
        if (onSlotUpdate) {
          onSlotUpdate(updatedSlot);
        }

        // Close confirmation popup
        setShowConfirmHold(false);

        console.log("Slot held successfully, timer should start");
      }
    } catch (err) {
      setError("Failed to hold parking slot. Please try again.");
      console.error("Error holding parking slot:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelHold = () => {
    setShowConfirmHold(false);
  };

  const isSlotHoldable = user && localSlotData?.status === "available";

  // Use localSlotData instead of selectedParkingSlot for rendering
  const displaySlot = localSlotData || selectedParkingSlot;

  return (
    <>
      <div className="parking-slot-card">
        {displaySlot ? (
          <div>
            <header>
              <h2>Parking Slot Details</h2>
            </header>
            <div>
              <div>
                <span>Slot ID: {displaySlot.slot_id}</span>
              </div>
              <div>
                <span>Status: {displaySlot.status}</span>
              </div>
              <div>
                <span>Type: {displaySlot.vehicle_type || "Not specified"}</span>
              </div>
              <div>
                <span>Location: {displaySlot.location}</span>
              </div>
              <div>
                <span>
                  Updated:{" "}
                  {displaySlot.updated_at
                    ? new Date(displaySlot.updated_at).toLocaleString()
                    : "—"}
                </span>
              </div>

              {/* Timer for held slots */}
              {displaySlot.status === "held" && timeRemaining !== null && (
                <div
                  style={{
                    marginTop: "10px",
                    padding: "8px",
                    backgroundColor:
                      timeRemaining <= 30 ? "#ffebee" : "#e8f5e8",
                    borderRadius: "4px",
                    border:
                      timeRemaining <= 30
                        ? "1px solid #f44336"
                        : "1px solid #4caf50",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "bold",
                      color: timeRemaining <= 30 ? "#d32f2f" : "#2e7d32",
                    }}
                  >
                    Time Remaining: {formatTime(timeRemaining)}
                  </span>
                  {timeRemaining <= 30 && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#d32f2f",
                        marginTop: "4px",
                      }}
                    >
                      ⚠️ Slot will expire soon!
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Hold Slot Button - Only show for logged-in users with available slots */}
            {isSlotHoldable && (
              <div style={{ marginTop: "15px" }}>
                <button
                  onClick={handleHoldSlotClick}
                  disabled={loading}
                  style={{
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "4px",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  Hold Slot
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div
                style={{
                  marginTop: "10px",
                  color: "red",
                  fontSize: "14px",
                }}
              >
                {error}
              </div>
            )}

            {/* Not logged in message */}
            {!user && displaySlot?.status === "available" && (
              <div
                style={{
                  marginTop: "10px",
                  color: "#666",
                  fontSize: "14px",
                }}
              >
                Please log in to hold this parking slot
              </div>
            )}

            <div style={{ marginTop: "15px" }}>
              <button onClick={() => setSelectedParkingSlot(null)}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <p>Select a parking slot to view details.</p>
        )}
      </div>

      {/* Confirmation Popup */}
      {showConfirmHold && (
        <ConfirmHoldSlot
          parkingSlot={displaySlot}
          onConfirm={handleConfirmHold}
          onCancel={handleCancelHold}
          loading={loading}
        />
      )}
    </>
  );
};

export default ParkingSlotCard;
