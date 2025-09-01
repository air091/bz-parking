const express = require("express");
const PaymentController = require("../controllers/Payment.controller.js");
const paymentRoutes = express.Router();

paymentRoutes.get("/", PaymentController.getPayments);
paymentRoutes.post("/", PaymentController.createPayment);
paymentRoutes.put("/:payment_id", PaymentController.updatePaymentStatus);

module.exports = paymentRoutes;
