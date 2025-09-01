const express = require("express");
const HoldTransactionController = require("../controllers/HoldTransaction.controller.js");
const holdTransactionRoutes = express.Router();

holdTransactionRoutes.get(
  "/",
  HoldTransactionController.getAllHoldTransactions
);
holdTransactionRoutes.get(
  "/:hold_transaction_id",
  HoldTransactionController.getSingleHoldTransaction
);
holdTransactionRoutes.post(
  "/",
  HoldTransactionController.createHoldTransaction
);
holdTransactionRoutes.put(
  "/:hold_transaction_id",
  HoldTransactionController.updateHoldTransaction
);
holdTransactionRoutes.delete(
  "/:hold_transaction_id",
  HoldTransactionController.deleteHoldTransaction
);
holdTransactionRoutes.get(
  "/user/:user_id",
  HoldTransactionController.getHoldTransactionsByUser
);

module.exports = holdTransactionRoutes;
