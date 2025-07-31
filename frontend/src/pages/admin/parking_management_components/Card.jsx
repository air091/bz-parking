import axios from "axios";
import { useCallback, useEffect, useState } from "react";

const Card = ({ selectedParkingSlot, setSelectedParkingSlot }) => {
  const [sensor, setSensor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getData = useCallback(async () => {
    if (!selectedParkingSlot) return;
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:2701/api/sensor");
      const sensorsData = response.data.sensors || [];
      const slotSensor = sensorsData.find(
        (sensorData) => sensorData.sensor_id === selectedParkingSlot.slot_id
      );
      setSensor(slotSensor || null);
    } catch (error) {
      console.log(`Error getting sensors data: ${error}`);
      setError("Error getting sensors data");
    } finally {
      setLoading(false);
    }
  }, [selectedParkingSlot]);

  useEffect(() => {
    if (selectedParkingSlot) {
      getData();
    } else {
      setSensor(null);
      setError(null);
    }
  }, [selectedParkingSlot, getData]);

  return (
    <div className="card__container">
      {selectedParkingSlot ? (
        <main>
          <header>
            <h2>Parking details</h2>
          </header>
          <div className="row2">
            <div className="row2__row1">
              <div className="row2-row1__col1">
                <span>Slot</span>
                <span>{selectedParkingSlot.slot_id}</span>
              </div>
              <div className="row2-row1__col2">
                <span>{selectedParkingSlot.status}</span>
              </div>
            </div>
            <div className="row2__row2">
              <span>Rate/hour: {selectedParkingSlot.rate}</span>
            </div>
          </div>
          <div className="row3">
            <header>
              <h2>Sensor details</h2>
            </header>
            {loading ? (
              <p>Loading sensor data...</p>
            ) : error ? (
              <p>{error}</p>
            ) : sensor ? (
              <div className="row3__row2">
                <p>Sensor id: {sensor.sensor_id}</p>
                <p>Sensor type: {sensor.sensorType}</p>
                <p>Status: {sensor.status}</p>
                <p>
                  Installed in: {new Date(sensor.created_at).toLocaleString()}
                </p>
                <p>
                  Last update: {new Date(sensor.updated_at).toLocaleString()}
                </p>
              </div>
            ) : (
              <p>No sensor data.</p>
            )}
          </div>
          <div>
            <button>Maintenace</button>
            <button onClick={() => setSelectedParkingSlot(null)}>Clear</button>
          </div>
        </main>
      ) : (
        <p>Select a parking slot.</p>
      )}
    </div>
  );
};

export default Card;
