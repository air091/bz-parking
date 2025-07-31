import axios from "axios";
import { useCallback, useEffect, useState } from "react";

const ParkingManagement = () => {
  const [parkingSlots, setParkingSlots] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("GF");
  const [showMap, setShowMap] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:2701/api/parking-slot"
      );
      console.log(response.data.parkingSlots);
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
  }, [getData]);

  const filteredSlots = parkingSlots.filter(
    (slot) => slot.location === selectedLocation
  );

  return (
    <div>
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
            <table>
              <thead>
                <tr>
                  <th>Slot Id</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Added in</th>
                  <th>Last update</th>
                </tr>
              </thead>
              <tbody>
                {filteredSlots.length > 0 ? (
                  filteredSlots.map((slot) => (
                    <tr key={slot.slot_id} className="parking__slot">
                      <td>{slot.slot_id}</td>
                      <td>{slot.location}</td>
                      <td>{slot.status}</td>
                      <td>{new Date(slot.created_at).toLocaleString()}</td>
                      <td>{new Date(slot.updated_at).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4}>No parking slot available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      )}
    </div>
  );
};

export default ParkingManagement;
