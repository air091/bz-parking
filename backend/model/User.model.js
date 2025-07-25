const pool = require("../database/Database.js");

class User {
  static insertUser = async (
    user_type,
    first_name,
    last_name,
    password,
    email,
    phone_num
  ) => {
    const query = `INSERT INTO users (user_type, first_name, last_name, password, email, phone_num)
                VALUES (?, ?, ?, ?, ?, ?)`;
    const [rows] = await pool.query(query, [
      user_type,
      first_name,
      last_name,
      password,
      email,
      phone_num,
    ]);
    return rows[0];
  };

  static loginUser = async (credentials) => {
    const field = [];
    const value = [];

    if (credentials.username !== undefined) {
      field.push("username = ?");
      value.push(credentials.username);
    } else if (credentials.email !== undefined) {
      field.push("email = ?");
      value.push(credentials.email);
    } else if (credentials.phone_num !== undefined) {
      field.push("phone_num = ?");
      value.push(credentials.phone_num);
    }
    value.push(credentials.password);

    const query = `SELECT * FROM users WHERE (${field} AND password = ?)`;
    const [rows] = await pool.query(query, value);
    if (rows.length === 0) return null;
    return rows[0];
  };

  static selecAllUsers = async () => {
    const query = `SELECT * FROM users`;
    const [rows] = await pool.query(query);
    return rows;
  };

  static selectUserById = async (userId) => {
    const query = `SELECT * FROM users WHERE user_id = ?`;
    const [rows] = await pool.query(query, [userId]);
    return rows[0];
  };

  static deleteUser = async (userId) => {
    const query = `DELETE FROM users WHERE user_id = ?`;
    const [rows] = await pool.query(query, [userId]);
    return rows[0];
  };

  static updateUser = async (userId, credentials) => {
    const fields = [];
    const values = [];

    if (credentials.user_type !== undefined) {
      fields.push("user_type = ?");
      values.push(credentials.user_type);
    }

    if (credentials.first_name !== undefined) {
      fields.push("first_name = ?");
      values.push(credentials.first_name);
    }

    if (credentials.last_name !== undefined) {
      fields.push("last_name = ?");
      values.push(credentials.last_name);
    }

    if (credentials.password !== undefined) {
      fields.push("password = ?");
      values.push(credentials.password);
    }

    if (credentials.email !== undefined) {
      fields.push("email = ?");
      values.push(credentials.email);
    }

    if (credentials.phone_num !== undefined) {
      fields.push("phone_num = ?");
      values.push(credentials.phone_num);
    }
    if (fields.length === 0) return "No fields to update";
    values.push(userId);

    const query = `UPDATE users
                SET ${fields.join(", ")}
                WHERE user_id = ?`;
    const [rows] = await pool.query(query, values);
    return rows[0];
  };
}

module.exports = User;
