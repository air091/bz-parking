const { pool } = require("../database/Database.js");

class ParkingSlot {
  static async insertSingleParkingSlot(location, sensor_id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const query = `INSERT INTO parking_slots (location, sensor_id)
                  VALUES (?, ?)`;
      const [rows] = await connection.execute(query, [location, sensor_id]);
      await connection.commit();
      return rows;
    } catch (error) {
      console.log("Error adding parking slot");
      console.log(`Error message: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  static async updateParkingSlotsData(parkingSlotId, parkingSlotInfo) {
    const connection = await pool.getConnection();
    try {
      const fields = [];
      const values = [];
      await connection.beginTransaction();

      if (parkingSlotInfo.location !== undefined) {
        fields.push("location = ?");
        values.push(parkingSlotInfo.location);
      }
      if (parkingSlotInfo.status !== undefined) {
        fields.push("status = ?");
        values.push(parkingSlotInfo.status);
      }
      if (parkingSlotInfo.sensorId !== undefined) {
        fields.push("sensor_id = ?");
        values.push(parkingSlotInfo.sensorId);
      }
      values.push(parkingSlotId);

      const query = `UPDATE parking_slots
                    SET ${fields.join(", ")}
                    WHERE slot_id = ?`;
      const [rows] = await connection.execute(query, values);
      await connection.commit();

      if (rows.affectedRows === 0) return [];
      return rows;
    } catch (error) {
      await connection.rollback();
      console.log(
        `Error updating parkingSlotId: ${parkingSlotId}`,
        error.message
      );
    } finally {
      connection.release();
    }
  }

  static async getAllParkingSlots() {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // First, check and auto-expire held slots that are older than 3 minutes
      await this.checkAndExpireHeldSlots(connection);

      const query = `SELECT ps.*, v.vehicle_type 
                     FROM parking_slots ps 
                     LEFT JOIN vehicles v ON ps.vehicle_type_id = v.vehicle_id`;
      const [rows] = await connection.execute(query);
      await connection.commit();
      if (rows.length === 0) return [];
      return rows;
    } catch (error) {
      await connection.rollback();
      console.log(`Error getting all parking slots`);
      console.log(`Error message: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  static async getSingleParkingSlot(parkingSlotId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Check and auto-expire held slots before getting the specific slot
      await this.checkAndExpireHeldSlots(connection);

      const query = `SELECT ps.*, v.vehicle_type 
                     FROM parking_slots ps 
                     LEFT JOIN vehicles v ON ps.vehicle_type_id = v.vehicle_id 
                     WHERE ps.slot_id = ?`;
      const [rows] = await connection.execute(query, [parkingSlotId]);
      await connection.commit();

      if (rows.length === 0) return [];
      return rows;
    } catch (error) {
      await connection.rollback();
      console.log(`Error getting parking slot ${parkingSlotId}`);
      console.log(`Error message: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  static async checkAndExpireHeldSlots(connection) {
    try {
      // Find held slots that are older than 3 minutes (180 seconds)
      const expireQuery = `
        UPDATE parking_slots 
        SET status = 'available' 
        WHERE status = 'held' 
        AND TIMESTAMPDIFF(SECOND, updated_at, NOW()) > 180
      `;
      const [result] = await connection.execute(expireQuery);

      if (result.affectedRows > 0) {
        console.log(`Auto-expired ${result.affectedRows} held parking slot(s)`);
      }
    } catch (error) {
      console.log(`Error checking held slots expiration: ${error.message}`);
    }
  }

  static async deleteSingleParkingSlot(parkingSlotId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const query = `DELETE FROM parking_slots WHERE slot_id = ?`;
      const [rows] = await connection.execute(query, [parkingSlotId]);
      await connection.commit();

      if (rows.affectedRows === 0) return [];
      return rows;
    } catch (error) {
      await connection.rollback();
      console.log(`Error deleting parking slot ${parkingSlotId}`);
      console.log(`Error message: ${error.message}`);
    } finally {
      connection.release();
    }
  }
}

module.exports = ParkingSlot;
