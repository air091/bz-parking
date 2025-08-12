const Payment = require("../model/Payment.model.js");

class PaymentController {
  static getPayments = async (request, response) => {
    try {
      const payments = await Payment.selectAllPayments();
      response.status(200).json({ success: true, payments: payments });
    } catch (error) {
      console.log("Error getting payments");
      response.status(500).json({
        success: false,
        errorMessage: `Payment err: ${error.message}`,
      });
    }
  };
}

module.exports = PaymentController;
