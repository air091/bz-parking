const { pool } = require("../database/Database.js");

class Payment {
  static async selectAllPayments() {
    const query = `SELECT * FROM payments`;
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.execute(query);
      return rows;
    } catch (error) {
      await connection.rollback();
      console.log("Error in selectAllPayments: ", error);
    } finally {
      connection.release();
    }
  }

  static async selectSinglePayment(payment_id) {
    const query = `SELECT * FROM payments WHERE payment_id = ?`;
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(query, [payment_id]);
      if (rows.length === 0) {
        throw new Error("Payment not found");
      }
      return rows;
    } catch (error) {
      await connection.rollback();
      console.log("Error in selectSinglePayment: ", error);
    } finally {
      connection.release();
    }
  }
}

module.exports = Payment;
