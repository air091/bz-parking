const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const User = require("./model/User.model.js");
require("dotenv").config();

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cors());

app.post("/api/user/register", async (request, response) => {
  try {
    let { user_type, phone_num } = request.body;
    const { first_name, last_name, password, email } = request.body;

    if (user_type === undefined) user_type = "Guest";
    if (phone_num === undefined) phone_num = null;

    await User.insertUser(
      user_type,
      first_name,
      last_name,
      password,
      email,
      phone_num
    );

    response
      .status(200)
      .json({ status: true, message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    response.status(500).json({ status: false, message: error.message });
  }
});

app.put("/api/user/:userId", async (request, response) => {
  try {
    const { userId } = request.params;
    const { user_type, first_name, last_name, password, email, phone_num } =
      request.body;
    await User.updateUser(userId, {
      user_type: user_type,
      first_name: first_name,
      last_name: last_name,
      password: password,
      email: email,
      phone_num: phone_num,
    });
    response
      .status(200)
      .json({ status: true, message: "User updated successfully" });
  } catch (error) {
    console.error(error);
    response.status(500).json({ status: false, message: error.message });
  }
});

app.delete("/api/user/:userId", async (request, response) => {
  try {
    const { userId } = request.params;
    const deletedUser = await User.deleteUser(userId);
    if (!deletedUser)
      return response
        .status(404)
        .json({ status: false, message: "User not found" });
    response
      .status(200)
      .json({ status: true, message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    response.status(500).json({ status: false, message: error.message });
  }
});

app.post("/api/user/login", async (request, response) => {
  try {
    const { email, phone_num, password } = request.body;
    const user = await User.loginUser({
      email: email,
      phone_num: phone_num,
      password: password,
    });

    if (!user)
      return response
        .status(401)
        .json({ status: false, message: "Incorrect credentials" });
    response
      .status(200)
      .json({ status: true, message: "User logged in successful", user });
  } catch (error) {
    console.error(error);
    response.status(500).json({ status: false, message: error.message });
  }
});

app.get("/api/user", async (request, response) => {
  try {
    const users = await User.selecAllUsers();
    response.status(200).json({ status: true, users: users });
  } catch (error) {
    console.error(error);
    response.status(500).json({ status: false, message: error.message });
  }
});

app.get("/api/user/:userId", async (request, response) => {
  try {
    const { userId } = request.params;
    const user = await User.selectUserById(userId);
    response.status(200).json({ status: true, user: user });
  } catch (error) {
    console.error(error);
    response.status(500).json({ status: false, message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
