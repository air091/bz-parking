const express = require("express");
const PaymentController = require("../controllers/Payment.controller.js");
const paymentRoutes = express.Router();

paymentRoutes.get("/", PaymentController.getPayments);

module.exports = paymentRoutes;
