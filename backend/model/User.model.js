const e = require("express");
const pool = require("../database/Database.js");

const insertUser = async (
  user_type,
  first_name,
  last_name,
  password,
  email,
  phone_num
) => {
  const query = `INSERT INTO users (user_type, first_name, last_name, password, email, phone_num)
                VALUES (?, ?, ?, ?, ?, ?)`;
  await pool.query(query, [
    user_type,
    first_name,
    last_name,
    password,
    email,
    phone_num,
  ]);
  return "registration success";
};

const loginUser = async (credentials) => {
  const field = [];
  const value = [];

  if (credentials.username !== undefined) {
    field.push("username = ?");
    values.push(credentials.username);
  } else if (credentials.email !== undefined) {
    field.push("email = ?");
    values.push(credentials.email);
  } else if (credentials.phone_num !== undefined) {
    field.push("phone_num = ?");
    values.push(credentials.phone_num);
  }

  const query = `SELECT * FROM users WHERE ${field}`;
  const [row] = await pool.query(query, value);
  return row[0];
};

const selecAllUsers = async () => {
  const query = `SELECT * FROM users`;
  const [rows] = await pool.query(query);
  return rows;
};

const selectUserById = async (userId) => {
  const query = `SELECT * FROM users WHERE user_id = ?`;
  const [row] = await pool.query(query, [userId]);
  return row[0];
};

const deleteUser = async (userId) => {
  const query = `DELETE FROM users WHERE id = ?`;
  await pool.query(query, [userId]);
  return "User deleted successfully.";
};

const updateUser = async (userId, credentials) => {
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

  const query = `UDPATE users
                SET user_type = ?, first_name = ?, last_name = ?, password = ?, email = ?, phone_num = ?
                WHERE user_id = ?`;
  await pool.query(query, values);
  const updatedUser = await selectUserById(userId);
  return updatedUser;
};
