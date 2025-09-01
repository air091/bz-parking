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

  static async createPayment(paymentData) {
    const query = `INSERT INTO payments (parking_act_id, amount, is_paid, payment_method) VALUES (?, ?, ?, ?)`;
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.execute(query, [
        paymentData.parking_act_id,
        paymentData.amount,
        paymentData.is_paid,
        paymentData.payment_method,
      ]);
      await connection.commit();
      return result.insertId;
    } catch (error) {
      await connection.rollback();
      console.log("Error in createPayment: ", error);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async updatePaymentStatus(payment_id, is_paid) {
    const query = `UPDATE payments SET is_paid = ? WHERE payment_id = ?`;
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.execute(query, [is_paid, payment_id]);
      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      console.log("Error in updatePaymentStatus: ", error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = Payment;
