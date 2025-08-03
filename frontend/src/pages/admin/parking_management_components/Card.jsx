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

  const updateSensorStatus = useCallback(async () => {
    if (!selectedParkingSlot || !sensor) return null;
    try {
      setLoading(true);
      setError(null);

      const newSensorStatus =
        sensor.status === "working" ? "defective" : "working";

      // Update sensor status
      const sensorResponse = await axios.put(
        `http://localhost:2701/api/sensor/${sensor.sensor_id}`,
        {
          status: newSensorStatus,
        }
      );
      setSensor(sensorResponse.data.sensor);

      // If sensor becomes defective, update parking slot status to maintenance
      if (newSensorStatus === "defective") {
        await axios.put(
          `http://localhost:2701/api/parking-slot/${selectedParkingSlot.slot_id}`,
          {
            status: "maintenace",
          }
        );

        // Update the selected parking slot locally
        setSelectedParkingSlot((prev) => ({
          ...prev,
          status: "maintenace",
        }));
      } else if (newSensorStatus === "working") {
        // If sensor becomes working again, update parking slot status back to available
        await axios.put(
          `http://localhost:2701/api/parking-slot/${selectedParkingSlot.slot_id}`,
          {
            status: "available",
          }
        );

        // Update the selected parking slot locally
        setSelectedParkingSlot((prev) => ({
          ...prev,
          status: "available",
        }));
      }

      console.log("Sensor updated:", sensorResponse.data.sensor);
    } catch (error) {
      console.log(`Error updating sensor status: ${error}`);
      setError("Failed to update sensor status");
    } finally {
      setLoading(false);
    }
  }, [selectedParkingSlot, sensor, setSelectedParkingSlot]);

  useEffect(() => {
    if (selectedParkingSlot) {
      getData();

      // Set up automatic polling every 3 seconds for sensor data
      const intervalId = setInterval(() => {
        getData();
      }, 3000);

      // Cleanup interval on component unmount or when selectedParkingSlot changes
      return () => clearInterval(intervalId);
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
            <div
              style={{ fontSize: "12px", color: "#666", marginBottom: "10px" }}
            >
              Auto-refreshing sensor data...
            </div>
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
            {sensor && (
              <button onClick={updateSensorStatus}>
                {sensor.status === "defective" ? "Start" : "Stop"}
              </button>
            )}
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
