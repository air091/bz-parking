const { pool } = require("../database/Database.js");

class ParkingActivity {
  static async getAllParkingActivities() {
    const connection = await pool.getConnection();
    const query = `SELECT * FROM parking_activities`;
    try {
      await connection.beginTransaction();
      const [rows] = await connection.execute(query);
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

  static async createParkingActivity(parkingActivityData) {
    const connection = await pool.getConnection();

    // Convert ISO string to MySQL datetime format
    let startTime = parkingActivityData.start_time;
    if (startTime) {
      // Convert ISO string to MySQL datetime format (YYYY-MM-DD HH:MM:SS)
      const date = new Date(startTime);
      startTime = date.toISOString().slice(0, 19).replace("T", " ");
    }

    const query = `INSERT INTO parking_activities (user_id, parking_slot_id, start_time) 
                  VALUES (?, ?, ?)`;
    try {
      await connection.beginTransaction();
      const [result] = await connection.execute(query, [
        parkingActivityData.user_id,
        parkingActivityData.parking_slot_id,
        startTime,
      ]);
      await connection.commit();
      return result.insertId;
    } catch (error) {
      await connection.rollback();
      console.log("Error creating parking activity");
      console.log(`Error msg: ${error.message}`);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async updateParkingActivity(parkingActivityId, updateData) {
    const connection = await pool.getConnection();

    // Convert ISO string to MySQL datetime format
    let endTime = updateData.end_time;
    if (endTime) {
      // Convert ISO string to MySQL datetime format (YYYY-MM-DD HH:MM:SS)
      const date = new Date(endTime);
      endTime = date.toISOString().slice(0, 19).replace("T", " ");
    }

    const query = `UPDATE parking_activities SET end_time = ? WHERE parking_act_id = ?`;
    try {
      await connection.beginTransaction();
      const [result] = await connection.execute(query, [
        endTime,
        parkingActivityId,
      ]);
      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      console.log("Error updating parking activity");
      console.log(`Error msg: ${error.message}`);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getParkingActivitiesByUser(userId) {
    const connection = await pool.getConnection();
    const query = `SELECT * FROM parking_activities WHERE user_id = ? ORDER BY start_time DESC`;
    try {
      await connection.beginTransaction();
      const [rows] = await connection.execute(query, [userId]);
      return rows;
    } catch (error) {
      await connection.rollback();
      console.log("Error getting parking activities by user");
      console.log(`Error msg: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  // New method to get active parking activity for a slot (no end_time)
  static async getActiveParkingActivityBySlot(parkingSlotId) {
    const connection = await pool.getConnection();
    const query = `SELECT * FROM parking_activities 
                   WHERE parking_slot_id = ? AND end_time IS NULL 
                   ORDER BY start_time DESC LIMIT 1`;
    try {
      await connection.beginTransaction();
      const [rows] = await connection.execute(query, [parkingSlotId]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      await connection.rollback();
      console.log("Error getting active parking activity by slot");
      console.log(`Error msg: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  // New method to end parking activity (set end_time)
  static async endParkingActivity(parkingActivityId, endTime = null) {
    const connection = await pool.getConnection();

    // If no end time provided, use current time
    let endTimeValue = endTime || new Date();

    // Convert to MySQL datetime format
    if (endTimeValue instanceof Date) {
      endTimeValue = endTimeValue.toISOString().slice(0, 19).replace("T", " ");
    } else if (typeof endTimeValue === "string") {
      const date = new Date(endTimeValue);
      endTimeValue = date.toISOString().slice(0, 19).replace("T", " ");
    }

    const query = `UPDATE parking_activities SET end_time = ? WHERE parking_act_id = ?`;
    try {
      await connection.beginTransaction();
      const [result] = await connection.execute(query, [
        endTimeValue,
        parkingActivityId,
      ]);
      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      console.log("Error ending parking activity");
      console.log(`Error msg: ${error.message}`);
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = ParkingActivity;
