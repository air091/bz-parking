const UserBalance = require("../model/UserBalance.model.js");

class UserBalanceController {
  static async getUserBalance(request, response) {
    try {
      const { userId } = request.params;
      const userBalance = await UserBalance.getUserBalance(userId);
      
      if (!userBalance || userBalance.length === 0) {
        return response
          .status(404)
          .json({ success: false, message: "User balance not found" });
      }
      
      response.status(200).json({ success: true, userBalance: userBalance });
    } catch (error) {
      console.log("Error getting user balance");
      console.log(`Error message: ${error.message}`);
      response.status(500).json({
        success: false,
        message: "Error getting user balance",
        errorMessage: error.message,
      });
    }
  }

  static async updateUserBalance(request, response) {
    try {
      const { userId } = request.params;
      const { amount } = request.body;
      
      if (amount === undefined || amount === null) {
        return response.status(400).json({
          success: false,
          message: "Amount is required"
        });
      }
      
      const updatedUserBalance = await UserBalance.updateUserBalance(userId, amount);
      
      if (!updatedUserBalance || updatedUserBalance.length === 0) {
        return response
          .status(404)
          .json({ success: false, message: "User balance not found" });
      }
      
      response.status(200).json({ 
        success: true, 
        message: "User balance updated successfully",
        userBalance: updatedUserBalance 
      });
    } catch (error) {
      console.log("Error updating user balance");
      console.log(`Error message: ${error.message}`);
      response.status(500).json({
        success: false,
        message: "Error updating user balance",
        errorMessage: error.message,
      });
    }
  }

  static async createUserBalance(request, response) {
    try {
      const { userId, initialBalance = 0.00 } = request.body;
      
      if (!userId) {
        return response.status(400).json({
          success: false,
          message: "User ID is required"
        });
      }
      
      const newUserBalance = await UserBalance.createUserBalance(userId, initialBalance);
      
      response.status(201).json({ 
        success: true, 
        message: "User balance created successfully",
        userBalance: newUserBalance 
      });
    } catch (error) {
      console.log("Error creating user balance");
      console.log(`Error message: ${error.message}`);
      response.status(500).json({
        success: false,
        message: "Error creating user balance",
        errorMessage: error.message,
      });
    }
  }
}

module.exports = UserBalanceController;
