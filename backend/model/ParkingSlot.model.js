const pool = require("../database/Database.js");

class ParkingSlot {
  // static updateColumn = async (status, slot_id) => {
  //   const connection = await pool.getConnection();
  //   const query = `UPDATE parking_slots
  //                       SET status = ?
  //                       WHERE slot_id = ?`;
  //   const [rows] = await connection.execute(query, [status, slot_id]);
  //   return rows;
  // };
}

module.exports = ParkingSlot;
