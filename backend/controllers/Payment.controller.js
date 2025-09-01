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

  static createPayment = async (request, response) => {
    try {
      const { parking_act_id, amount, payment_method } = request.body;

      if (!parking_act_id || !amount || !payment_method) {
        return response.status(400).json({
          success: false,
          errorMessage:
            "Missing required fields: parking_act_id, amount, payment_method",
        });
      }

      const paymentData = {
        parking_act_id,
        amount,
        is_paid: 1, // Set as paid when created
        payment_method,
      };

      const payment_id = await Payment.createPayment(paymentData);

      response.status(201).json({
        success: true,
        message: "Payment created successfully",
        payment_id: payment_id,
      });
    } catch (error) {
      console.log("Error creating payment:", error);
      response.status(500).json({
        success: false,
        errorMessage: `Payment creation error: ${error.message}`,
      });
    }
  };

  static updatePaymentStatus = async (request, response) => {
    try {
      const { payment_id } = request.params;
      const { is_paid } = request.body;

      if (is_paid === undefined) {
        return response.status(400).json({
          success: false,
          errorMessage: "Missing required field: is_paid",
        });
      }

      const success = await Payment.updatePaymentStatus(payment_id, is_paid);

      if (success) {
        response.status(200).json({
          success: true,
          message: "Payment status updated successfully",
        });
      } else {
        response.status(404).json({
          success: false,
          errorMessage: "Payment not found",
        });
      }
    } catch (error) {
      console.log("Error updating payment status:", error);
      response.status(500).json({
        success: false,
        errorMessage: `Payment update error: ${error.message}`,
      });
    }
  };
}

module.exports = PaymentController;
