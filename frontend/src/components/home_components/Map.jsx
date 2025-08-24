import React, { useEffect, useMemo, useState } from "react";
import ParkingSlotCard from "./ParkingSlotCard";
import { useParkingSlots } from "../../hooks/useParkingSlots";
import "./home-style.css";

const Map = ({ onParkingSlotSelect }) => {
  const [showMap, setShowMap] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState("car");
  const [selectedLocation, setSelectedLocation] = useState("GF");
  const [selectedParkingSlot, setSelectedParkingSlot] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Use the custom hook for parking slots management
  const {
    parkingSlots,
    loading,
    error,
    hasChanges,
    lastUpdateTime,
    updateSlot,
  } = useParkingSlots();

  // Update current time every second for real-time timer calculations
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  const clearFilters = () => {
    setSelectedVehicle("");
    setSelectedLocation("");
  };

  const handleParkingSlotClick = (slot) => {
    setSelectedParkingSlot(slot);
    // If parent component provided callback, call it
    if (onParkingSlotSelect) {
      onParkingSlotSelect(slot);
    }
  };

  const handleSlotUpdate = (updatedSlot) => {
    // Update the selected parking slot
    setSelectedParkingSlot(updatedSlot);

    // Update the parking slots list with the updated slot
    updateSlot(updatedSlot);

    // If parent component provided callback, call it with updated slot
    if (onParkingSlotSelect) {
      onParkingSlotSelect(updatedSlot);
    }
  };

  const handleCloseModal = () => {
    setSelectedParkingSlot(null);
  };

  const filteredSlots = useMemo(() => {
    return parkingSlots.filter((slot) => {
      const vehicleMatch =
        !selectedVehicle ||
        (slot.vehicle_type || "").toLowerCase() ===
          selectedVehicle.toLowerCase();
      const locationMatch =
        !selectedLocation || slot.location === selectedLocation;
      return vehicleMatch && locationMatch;
    });
  }, [parkingSlots, selectedVehicle, selectedLocation]);

  return (
    <div className="map__container">
      <header className="row__1">
        <h1>Parking Facility</h1>
      </header>

      <nav className="row__2">
        <div className="col__1">
          <button onClick={() => setShowMap(true)}>Map</button>
          <button onClick={() => setShowMap(false)}>Tabs</button>
        </div>
        <div className="col__2">
          <span>Filter</span>
          <div>
            <button onClick={clearFilters}>Show all</button>
            <button onClick={() => setSelectedVehicle("car")}>Car</button>
            <button onClick={() => setSelectedVehicle("bike")}>Bike</button>
            <button onClick={() => setSelectedLocation("GF")}>GF</button>
            <button onClick={() => setSelectedLocation("BSMT")}>BSMT</button>
          </div>
        </div>
      </nav>

      <main className="row__3">
        {showMap ? (
          <div style={{ padding: "12px" }}>
            {/* Map placeholder - not implemented per request */}
            <em>Map view to be implemented.</em>
          </div>
        ) : (
          <div style={{ padding: "12px" }}>
            {loading && <p>Loading...</p>}
            {error && <p className="err">{error}</p>}
            {!loading && !error && (
              <>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginBottom: "10px",
                  }}
                >
                  {hasChanges ? (
                    <span style={{ color: "#4caf50" }}>
                      ✓ Auto-updating when changes detected
                    </span>
                  ) : (
                    <span style={{ color: "#666" }}>
                      Monitoring for changes...
                    </span>
                  )}
                  {lastUpdateTime && (
                    <span style={{ marginLeft: "10px", fontSize: "11px" }}>
                      Last update: {lastUpdateTime.toLocaleTimeString()}
                    </span>
                  )}
                </div>
                {filteredSlots.length === 0 ? (
                  <p>No slots match the current filters.</p>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(180px, 1fr))",
                      gap: "10px",
                    }}
                  >
                    {filteredSlots.map((slot) => (
                      <div
                        className="parking__tab"
                        key={slot.slot_id}
                        onClick={() => handleParkingSlotClick(slot)}
                        style={{ cursor: "pointer" }}
                      >
                        <div
                          className="row__1"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "8px",
                            padding: "6px 8px",
                          }}
                        >
                          <span>Slot {slot.slot_id}</span>
                          <span style={{ textTransform: "capitalize" }}>
                            {slot.status}
                          </span>
                        </div>
                        <div
                          style={{
                            padding: "6px 8px",
                            fontSize: "12px",
                            color: "#444",
                          }}
                        >
                          <div>
                            Type: {(slot.vehicle_type || "").toString()}
                          </div>
                          <div>Loc: {slot.location}</div>
                          <div>
                            Updated:{" "}
                            {slot.updated_at
                              ? new Date(slot.updated_at).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                  }
                                )
                              : "—"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Parking Slot Card Modal - Now always shown when slot is selected */}
      {selectedParkingSlot && (
        <div>
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
            }}
          >
            <ParkingSlotCard
              selectedParkingSlot={selectedParkingSlot}
              setSelectedParkingSlot={setSelectedParkingSlot}
              onSlotUpdate={handleSlotUpdate}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
