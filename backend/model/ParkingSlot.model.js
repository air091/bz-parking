const pool = require("../database/Database.js");

class ParkingSlot {
  static updateColumn = async (status, slot_id) => {
    const query = `UPDATE parking_slots
                        SET status = ?
                        WHERE slot_id = ?`;
    const [rows] = await pool.query(query, [status, slot_id]);
    return rows;
  };
}

module.exports = ParkingSlot;
