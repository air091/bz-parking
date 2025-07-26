const express = require("express");
const cors = require("cors");
const Sensor = require("./model/Sensor.model.js");
const ParkingSlot = require("./model/ParkingSlot.model.js");
const pool = require("./database/Database.js");
require("dotenv").config();

const app = express();
const port = process.env.SERVER_PORT;

app.use(cors());
app.use(express.json());

app.put("/api/parking-slot/:slotId", async (request, response) => {
  try {
    const { slotId } = request.params;

    const sensorIdQuery = `SELECT sensor_id FROM parking_slots WHERE slot_id = ?`;
    const [sensorRows] = await pool.query(sensorIdQuery, [slotId]);

    const sensorId = sensorRows[0].sensor_id;

    const sensorData = await Sensor.selectSensorData(sensorId);
    const sensorValue = sensorData[0].sensor_data;
    if (!sensorData || sensorData.length === 0)
      throw new Error(`Sensor data not found`);
    const status = sensorValue < 50 ? "occupied" : "available";

    const updateResult = await ParkingSlot.updateColumn(status, slotId);
    response.status(200).json({
      status: true,
      data: {
        slotId,
        sensorValue,
        parkingStatus: status,
        affectedRows: updateResult.affectedRows,
      },
    });
  } catch (error) {
    console.log("error message:", error);
    response.status(500).json({ status: false, message: error.message });
  }
});

function startServer() {
  try {
    app.listen(port, () => {
      console.log("Server running on port:", port);
    });
  } catch (error) {
    console.log(error);
  }
}

startServer();
