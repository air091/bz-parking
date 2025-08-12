import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import Card from "./Card";
import { Outlet } from "react-router-dom";

const ParkingManagement = () => {
  const [parkingSlots, setParkingSlots] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("GF");
  const [showMap, setShowMap] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedParkingSlot, setSelectedParkingSlot] = useState(null);

  const getData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:2701/api/parking-slot"
      );
      setParkingSlots(response.data.parkingSlots);
    } catch (error) {
      console.log(`Error getting parking slots: ${error.message}`);
      setError("Failed to get parking slots.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getData();

    // Set up automatic polling every 3 seconds
    const intervalId = setInterval(() => {
      getData();
    }, 3000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [getData]);

  const filteredSlots = parkingSlots.filter(
    (slot) => slot.location === selectedLocation
  );

  return (
    <div className="col1__a">
      <div className="col1__a_b">
        <header>
          <h1>Parking Management</h1>
        </header>
        <nav>
          <div className="row1">
            <button onClick={() => setShowMap(!showMap)}>
              {showMap ? "Hide map" : "Show map"}
            </button>
          </div>
          <div className="row2">
            <button onClick={() => setSelectedLocation("GF")}>GF</button>
            <button onClick={() => setSelectedLocation("BSMT")}>BSMT</button>
          </div>
        </nav>
        {loading && <p>Loading...</p>}
        {error && <p className="err">{error}</p>}
        {!loading && !error && (
          <main>
            <div className="col1">
              {showMap && (
                <div className="map__wrapper">
                  <img src="../../../public/vite.svg" alt="image" />
                </div>
              )}
            </div>
            <div className="col2">
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginBottom: "10px",
                }}
              >
                Auto-refreshing every 3 seconds...
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Slot Id</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Added in</th>
                    <th>Last update</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSlots.length > 0 ? (
                    filteredSlots.map((slot) => (
                      <tr
                        key={slot.slot_id}
                        className={`parking__slot ${
                          selectedParkingSlot?.slot_id === slot.slot_id
                            ? "selected"
                            : ""
                        }`}
                        onClick={() => setSelectedParkingSlot(slot)}
                      >
                        <td>{slot.slot_id}</td>
                        <td>{slot.vehicle_type}</td>
                        <td>{slot.location}</td>
                        <td>{slot.status}</td>
                        <td>{new Date(slot.created_at).toLocaleString()}</td>
                        <td>{new Date(slot.updated_at).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6}>Parking slot is empty.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </main>
        )}
      </div>
      <Card
        selectedParkingSlot={selectedParkingSlot}
        setSelectedParkingSlot={setSelectedParkingSlot}
      />
    </div>
  );
};

export default ParkingManagement;
