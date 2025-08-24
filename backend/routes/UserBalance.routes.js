const express = require("express");
const UserBalanceController = require("../controllers/UserBalance.controller.js");
const userBalanceRoutes = express.Router();

userBalanceRoutes.get("/:userId", UserBalanceController.getUserBalance);
userBalanceRoutes.put("/:userId", UserBalanceController.updateUserBalance);

module.exports = userBalanceRoutes;
