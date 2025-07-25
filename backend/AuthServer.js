const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const User = require("./model/User.model.js");
require("dotenv").config();

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cors());

app.post("/api/user", async (request, response) => {
  try {
    let { user_type, phone_num } = request.body;
    const { first_name, last_name, password, email } = request.body;

    if (user_type === undefined) user_type = "Guest";
    if (phone_num === undefined) phone_num = null;

    const user = await User.insertUser(
      user_type,
      first_name,
      last_name,
      password,
      email,
      phone_num
    );

    response.status(200).json({ status: true, message: user });
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
    const updatedUser = await User.updateUser(userId, {
      user_type: user_type,
      first_name: first_name,
      last_name: last_name,
      password: password,
      email: email,
      phone_num: phone_num,
    });
    response.status(200).json({ status: true, update: updatedUser });
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
        .json({ status: false, message: "No user selected" });
    response.status(200).json({ status: true, message: deletedUser });
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
      .json({ status: true, message: "Login successful", user });
  } catch (error) {
    console.error(error);
    response.status(500).json({ status: false, message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
