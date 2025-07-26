const pool = require("../database/Database.js");

class Sensor {
  static selectSensorData = async (sensorId) => {
    const query = `SELECT sensor_data FROM sensors WHERE sensor_id = ?`;
    const [rows] = await pool.query(query, [sensorId]);
    return rows;
  };
}

module.exports = Sensor;
