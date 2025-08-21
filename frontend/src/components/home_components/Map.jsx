import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./home-style.css";

const Map = () => {
  const [showMap, setShowMap] = useState(false);
  const [parkingSlots, setParkingSlots] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("car");
  const [selectedLocation, setSelectedLocation] = useState("GF");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        "http://localhost:2701/api/parking-slot"
      );
      setParkingSlots(response.data.parkingSlots || []);
    } catch (err) {
      setError("Failed to load parking slots.");
      console.log(`Error getting parking slots: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getData();
    const intervalId = setInterval(() => {
      getData();
    }, 3000);
    return () => clearInterval(intervalId);
  }, [getData]);

  const clearFilters = () => {
    setSelectedVehicle("");
    setSelectedLocation("");
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
            <button onClick={() => setSelectedVehicle("motor")}>Motor</button>
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
                  Auto-refreshing every 3 seconds...
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
                      <div className="parking__tab" key={slot.slot_id}>
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
    </div>
  );
};

export default Map;
