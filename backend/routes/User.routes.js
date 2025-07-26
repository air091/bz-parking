const express = require("express");
const UserController = require("../controllers/User.controller.js");
const userRoutes = express.Router();

userRoutes.post("/register", UserController.postRegister);

userRoutes.post("/login", UserController.postLogin);

userRoutes.put("/:userId", UserController.putUser);

userRoutes.delete("/:userId", UserController.deleteUser);

userRoutes.get("/", UserController.getUsers);

userRoutes.get("/:userId", UserController.getUser);

module.exports = userRoutes;
