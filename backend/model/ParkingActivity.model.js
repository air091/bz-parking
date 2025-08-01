const { pool } = require("../database/Database.js");

class ParkingActivity {
  static async getAllParkingActivities() {
    const connection = await pool.getConnection();
    const query = `SELECT * FROM parking_activities`;
    try {
      await connection.beginTransaction();
      const [rows] = connection.execute(query);
      return rows;
    } catch (error) {
      await connection.rollback();
      console.log("Error getting all parking activities");
      console.log(`Error msg: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  static async getSingleParkingActivity(parkingActivityId) {
    const connection = await pool.getConnection();
    const query = `SELECT * FROM parking_activities WHERE parking_act_id = ?`;
    try {
      await connection.beginTransaction();
      const [rows] = await connection.execute(query, [parkingActivityId]);
      if (rows.length === 0) return [];
      return rows;
    } catch (error) {
      await connection.rollback();
      console.log(`Error getting parking Activity id: ${parkingActivityId}`);
      console.log(`Error msg: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  static async deleteSingleParkingActivity(parkingActivityId) {
    const connection = await pool.getConnection();
    const query = `DELETE FROM parking_activities WHERE parking_act_id = ?`;
    try {
      await connection.beginTransaction();
      const [rows] = await connection.execute(query, [parkingActivityId]);
      await connection.commit();
      if (rows.length === 0) return [];
      return rows;
    } catch (error) {
      await connection.rollback();
      console.log(`Error deleting a parking Activity`);
      console.log(`Error msg: ${error.message}`);
    } finally {
      connection.release();
    }
  }
}

module.exports = ParkingActivity;
