const User = require("../model/User.model.js");

class UserController {
  static postRegister = async (request, response) => {
    try {
      let { user_type, phone_num } = request.body;
      const { first_name, last_name, password, email } = request.body;

      if (user_type === undefined) user_type = "guest";
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
  };

  static postLogin = async (request, response) => {
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
  };

  static putUser = async (request, response) => {
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
  };

  static getUsers = async (request, response) => {
    try {
      const users = await User.selecAllUsers();
      response.status(200).json({ status: true, users: users });
    } catch (error) {
      console.error(error);
      response.status(500).json({ status: false, message: error.message });
    }
  };

  static getUser = async (request, response) => {
    try {
      const { userId } = request.params;
      const user = await User.selectUserById(userId);
      response.status(200).json({ status: true, user: user });
    } catch (error) {
      console.error(error);
      response.status(500).json({ status: false, message: error.message });
    }
  };

  static deleteUser = async (request, response) => {
    try {
      const { userId } = request.params;
      const deletedUser = await User.deleteUser(userId);

      if (deletedUser.length === 0)
        return response.status(404).json({ message: "User not found" });

      response
        .status(200)
        .json({ status: true, message: "User deleted successfully" });
    } catch (error) {
      console.error(error);
      response.status(500).json({ status: false, message: error.message });
    }
  };
}

module.exports = UserController;
