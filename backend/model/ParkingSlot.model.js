const { pool } = require("../database/Database.js");

class ParkingSlot {
  static async insertSingleParkingSlot(location, sensor_id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const query = `INSERT INTO parking_slots (location, sensor_id)
                  VALUES (?, ?)`;
      const [rows] = await connection.execute(query, [
        location,
        status,
        sensor_id,
      ]);
      await connection.commit();
      return rows;
    } catch (error) {
      console.log("Error adding parking slot");
      console.log(`Error messsage: ${error.message}`);
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
      const query = `SELECT * FROM parking_slots`;
      const [rows] = await connection.execute(query);
      await connection.commit();
      if (rows.length === 0) return [];
      return rows;
    } catch (error) {
      await connection.rollback();
      console.log(`Error getting all parking slosts`);
      console.log(`Error message: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  static async getSingleParkingSlot(parkingSlotId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const query = `SELECT * FROM parking_slots WHERE slot_id = ?`;
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
