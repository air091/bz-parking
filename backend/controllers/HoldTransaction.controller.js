const HoldTransaction = require("../model/HoldTransaction.model.js");

class HoldTransactionController {
  static getAllHoldTransactions = async (request, response) => {
    try {
      const holdTransactions = await HoldTransaction.getAllHoldTransactions();
      response.status(200).json({
        success: true,
        holdTransactions: holdTransactions,
      });
    } catch (error) {
      console.log("Error getting hold transactions");
      response.status(500).json({
        success: false,
        errorMessage: `Hold transaction err: ${error.message}`,
      });
    }
  };

  static getSingleHoldTransaction = async (request, response) => {
    try {
      const { hold_transaction_id } = request.params;
      const holdTransaction = await HoldTransaction.getSingleHoldTransaction(
        hold_transaction_id
      );

      if (holdTransaction.length === 0) {
        return response.status(404).json({
          success: false,
          errorMessage: "Hold transaction not found",
        });
      }

      response.status(200).json({
        success: true,
        holdTransaction: holdTransaction[0],
      });
    } catch (error) {
      console.log("Error getting single hold transaction");
      response.status(500).json({
        success: false,
        errorMessage: `Hold transaction err: ${error.message}`,
      });
    }
  };

  static createHoldTransaction = async (request, response) => {
    try {
      const { user_id, parking_slot_id, payment_method, amount } = request.body;

      if (!user_id || !parking_slot_id || !payment_method || !amount) {
        return response.status(400).json({
          success: false,
          errorMessage:
            "Missing required fields: user_id, parking_slot_id, payment_method, amount",
        });
      }

      const holdTransactionData = {
        user_id,
        parking_slot_id,
        payment_method,
        amount,
      };

      const hold_transaction_id = await HoldTransaction.createHoldTransaction(
        holdTransactionData
      );

      response.status(201).json({
        success: true,
        message: "Hold transaction created successfully",
        hold_transaction_id: hold_transaction_id,
      });
    } catch (error) {
      console.log("Error creating hold transaction:", error);
      response.status(500).json({
        success: false,
        errorMessage: `Hold transaction creation error: ${error.message}`,
      });
    }
  };

  static updateHoldTransaction = async (request, response) => {
    try {
      const { hold_transaction_id } = request.params;
      const updateData = request.body;

      const success = await HoldTransaction.updateHoldTransaction(
        hold_transaction_id,
        updateData
      );

      if (success) {
        response.status(200).json({
          success: true,
          message: "Hold transaction updated successfully",
        });
      } else {
        response.status(404).json({
          success: false,
          errorMessage: "Hold transaction not found",
        });
      }
    } catch (error) {
      console.log("Error updating hold transaction:", error);
      response.status(500).json({
        success: false,
        errorMessage: `Hold transaction update error: ${error.message}`,
      });
    }
  };

  static deleteHoldTransaction = async (request, response) => {
    try {
      const { hold_transaction_id } = request.params;
      const success = await HoldTransaction.deleteHoldTransaction(
        hold_transaction_id
      );

      if (success) {
        response.status(200).json({
          success: true,
          message: "Hold transaction deleted successfully",
        });
      } else {
        response.status(404).json({
          success: false,
          errorMessage: "Hold transaction not found",
        });
      }
    } catch (error) {
      console.log("Error deleting hold transaction");
      response.status(500).json({
        success: false,
        errorMessage: `Hold transaction deletion error: ${error.message}`,
      });
    }
  };

  static getHoldTransactionsByUser = async (request, response) => {
    try {
      const { user_id } = request.params;
      const holdTransactions = await HoldTransaction.getHoldTransactionsByUser(
        user_id
      );

      response.status(200).json({
        success: true,
        holdTransactions: holdTransactions,
      });
    } catch (error) {
      console.log("Error getting hold transactions by user");
      response.status(500).json({
        success: false,
        errorMessage: `Hold transaction err: ${error.message}`,
      });
    }
  };
}

module.exports = HoldTransactionController;
