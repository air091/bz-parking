const { pool } = require("../database/Database.js");

class UserBalance {
  static async getUserBalance(userId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const query = `SELECT * FROM user_balance WHERE user_id = ?`;
      const [rows] = await connection.execute(query, [userId]);
      await connection.commit();
      if (rows.length === 0) return [];
      return rows[0];
    } catch (error) {
      await connection.rollback();
      console.log(`Error getting user balance for user ${userId}`);
      console.log(`Error message: ${error.message}`);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async updateUserBalance(userId, amount) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const query = `UPDATE user_balance SET balance = balance + ? WHERE user_id = ?`;
      const [rows] = await connection.execute(query, [amount, userId]);
      await connection.commit();
      
      if (rows.affectedRows === 0) return [];
      
      // Return the updated balance
      const updatedBalance = await this.getUserBalance(userId);
      return updatedBalance;
    } catch (error) {
      await connection.rollback();
      console.log(`Error updating user balance for user ${userId}`);
      console.log(`Error message: ${error.message}`);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async createUserBalance(userId, initialBalance = 0.00) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const query = `INSERT INTO user_balance (user_id, balance) VALUES (?, ?)`;
      const [rows] = await connection.execute(query, [userId, initialBalance]);
      await connection.commit();
      return rows;
    } catch (error) {
      await connection.rollback();
      console.log(`Error creating user balance for user ${userId}`);
      console.log(`Error message: ${error.message}`);
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = UserBalance;
