const { pool } = require("../database/Database.js");

class HoldTransaction {
  static async getAllHoldTransactions() {
    const connection = await pool.getConnection();
    const query = `SELECT * FROM hold_transactions`;
    try {
      await connection.beginTransaction();
      const [rows] = await connection.execute(query);
      return rows;
    } catch (error) {
      await connection.rollback();
      console.log("Error getting all hold transactions");
      console.log(`Error msg: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  static async getSingleHoldTransaction(holdTransactionId) {
    const connection = await pool.getConnection();
    const query = `SELECT * FROM hold_transactions WHERE hold_transaction_id = ?`;
    try {
      await connection.beginTransaction();
      const [rows] = await connection.execute(query, [holdTransactionId]);
      if (rows.length === 0) return [];
      return rows;
    } catch (error) {
      await connection.rollback();
      console.log(`Error getting hold transaction id: ${holdTransactionId}`);
      console.log(`Error msg: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  static async createHoldTransaction(holdTransactionData) {
    const connection = await pool.getConnection();
    const query = `INSERT INTO hold_transactions (user_id, parking_slot_id, payment_method, amount) 
                  VALUES (?, ?, ?, ?)`;
    try {
      await connection.beginTransaction();
      const [result] = await connection.execute(query, [
        holdTransactionData.user_id,
        holdTransactionData.parking_slot_id,
        holdTransactionData.payment_method,
        holdTransactionData.amount,
      ]);
      await connection.commit();
      return result.insertId;
    } catch (error) {
      await connection.rollback();
      console.log("Error creating hold transaction");
      console.log(`Error msg: ${error.message}`);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async updateHoldTransaction(holdTransactionId, updateData) {
    const connection = await pool.getConnection();

    const fields = [];
    const values = [];

    if (updateData.payment_method !== undefined) {
      fields.push("payment_method = ?");
      values.push(updateData.payment_method);
    }

    if (updateData.amount !== undefined) {
      fields.push("amount = ?");
      values.push(updateData.amount);
    }

    if (fields.length === 0) {
      return false;
    }

    values.push(holdTransactionId);

    const query = `UPDATE hold_transactions SET ${fields.join(
      ", "
    )} WHERE hold_transaction_id = ?`;
    try {
      await connection.beginTransaction();
      const [result] = await connection.execute(query, values);
      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      console.log("Error updating hold transaction");
      console.log(`Error msg: ${error.message}`);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async deleteHoldTransaction(holdTransactionId) {
    const connection = await pool.getConnection();
    const query = `DELETE FROM hold_transactions WHERE hold_transaction_id = ?`;
    try {
      await connection.beginTransaction();
      const [rows] = await connection.execute(query, [holdTransactionId]);
      await connection.commit();
      if (rows.affectedRows === 0) return false;
      return true;
    } catch (error) {
      await connection.rollback();
      console.log(`Error deleting hold transaction`);
      console.log(`Error msg: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  static async getHoldTransactionsByUser(userId) {
    const connection = await pool.getConnection();
    const query = `SELECT * FROM hold_transactions WHERE user_id = ? ORDER BY created_at DESC`;
    try {
      await connection.beginTransaction();
      const [rows] = await connection.execute(query, [userId]);
      return rows;
    } catch (error) {
      await connection.rollback();
      console.log("Error getting hold transactions by user");
      console.log(`Error msg: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  static async getActiveHoldTransactionBySlot(parkingSlotId) {
    const connection = await pool.getConnection();
    const query = `SELECT * FROM hold_transactions 
                   WHERE parking_slot_id = ? 
                   ORDER BY created_at DESC LIMIT 1`;
    try {
      await connection.beginTransaction();
      const [rows] = await connection.execute(query, [parkingSlotId]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      await connection.rollback();
      console.log("Error getting active hold transaction by slot");
      console.log(`Error msg: ${error.message}`);
    } finally {
      connection.release();
    }
  }
}

module.exports = HoldTransaction;
