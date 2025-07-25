const { pool } = require("../database/Database.js");

class Sensor {
  static startAutmation() {
    console.log("Sensor autimation...");
    setInterval(async () => {
      await this.updateSensorData();
    }, 5000);
    console.log("Aumation started - updates sensor data every second");
  }

  static async updateSensorData() {
    try {
      const query = `SELECT sensor_id, status FROM sensors`;
      const [sensors] = await pool.execute(query);
      // update working sensor with random data
      for (const sensor of sensors) {
        if (sensor.status === "working") {
          await this.updateSingleSensor(sensor.sensor_id);
        } else if (sensor.status === "defective") {
          await this.handleDefectiveSensor(sensor.sensor_id);
        }
      }
    } catch (error) {
      console.log("Error updating sensor data:", error.message);
    }
  }

  static async updateSingleSensor(sensorId) {
    const connection = await pool.getConnection();
    try {
      // start transaction data to ensure data consistency
      await connection.beginTransaction();

      const sensorData = Math.floor(Math.random() * 101);
      const queryUpdateSensorData = `UPDATE sensors SET sensor_data = ? WHERE sensor_id = ?`;
      await connection.execute(queryUpdateSensorData, [sensorData, sensorId]);

      const slotStatus = sensorData < 50 ? "occupied" : "available";

      const queryUpdateParkingSlotStatus = `UPDATE parking_slots SET status = ? WHERE sensor_id = ?`;
      await connection.execute(queryUpdateParkingSlotStatus, [
        slotStatus,
        sensorId,
      ]);

      await connection.commit();
      console.log(`📊 Sensor ${sensorId}: ${sensorData} → Slot: ${slotStatus}`);
    } catch (error) {
      await connection.rollback();
      console.error(`Error updating sensor ${sensorId}`, error.message);
    } finally {
      connection.release();
    }
  }

  static async handleDefectiveSensor(sensor_id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // sensor data for defective
      const queryUpdateSensorData = `UPDATE sensors SET sensor_data = 0 WHERE sensor_id = ?`;
      await connection.execute(queryUpdateSensorData, [sensor_id]);

      // set parking slot to maintenance
      const queryUpdateParkingSlotStatus = `UPDATE parking_slots SET status = "maintenace" WHERE sensor_id = ?`;
      await connection.execute(queryUpdateParkingSlotStatus, [sensor_id]);

      await connection.commit();
      console.log(`🔧 Sensor ${sensor_id}: DEFECTIVE -> Slot: maintenance`);
    } catch (error) {
      await connection.rollback();
      console.error("Error handling defective sensor:", error.message);
    } finally {
      connection.release();
    }
  }
}

module.exports = Sensor;
