import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const EndOccupancyPayment = ({
  parkingSlot,
  parkingActivity,
  onTransactionComplete,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("gcash");
  const [phoneNumber, setPhoneNumber] = useState("09123456789");
  const [transactionId, setTransactionId] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [parkingDuration, setParkingDuration] = useState(0);
  const [parkingFee, setParkingFee] = useState(0);

  // Generate transaction ID on component mount
  useEffect(() => {
    const generateTransactionId = () => {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      return `TXN${timestamp}${random}`;
    };
    setTransactionId(generateTransactionId());
  }, []);

  // Calculate parking duration and fee
  useEffect(() => {
    if (parkingActivity?.start_time) {
      const startTime = new Date(parkingActivity.start_time);
      const currentTime = new Date();
      const durationMs = currentTime - startTime;
      const durationMinutes = Math.ceil(durationMs / (1000 * 60));
      setParkingDuration(durationMinutes);

      // Calculate fee based on duration
      let fee = 0;
      if (durationMinutes >= 1) {
        fee += 30; // First minute
      }
      if (durationMinutes >= 2) {
        fee += 40; // Second minute
      }
      if (durationMinutes >= 3) {
        fee += (durationMinutes - 2) * 30; // Additional minutes
      }
      setParkingFee(fee);
    }
  }, [parkingActivity]);

  // Update current date and time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleConfirmPayment = async () => {
    if (!user) {
      setError("You must be logged in to make a payment");
      return;
    }

    if (!parkingSlot || !parkingActivity) {
      setError("No parking slot or activity selected");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First, create a payment record
      const paymentResponse = await axios.post(
        "http://localhost:2701/api/payment",
        {
          parking_act_id: parkingActivity.parking_act_id,
          amount: parkingFee,
          payment_method: paymentMethod,
        }
      );

      if (!paymentResponse.data.success) {
        throw new Error("Failed to create payment record");
      }

      // Then, end the parking activity
      const endActivityResponse = await axios.put(
        `http://localhost:2701/api/parking-activity/${parkingActivity.parking_act_id}`,
        {
          end_time: new Date().toISOString(),
        }
      );

      if (!endActivityResponse.data.success) {
        throw new Error("Failed to end parking activity");
      }

      // Update the parking slot status to "available" with 1-minute cooldown
      const slotUpdateResponse = await axios.put(
        `http://localhost:2701/api/parking-slot/${parkingSlot.slot_id}`,
        {
          status: "available",
          user_id: null,
          cooldown_until: new Date(Date.now() + 60000).toISOString(), // 1 minute from now
        }
      );

      if (!slotUpdateResponse.data.success) {
        throw new Error("Failed to update parking slot status");
      }

      setSuccess(true);

      // Close the modal after a short delay
      setTimeout(() => {
        if (onTransactionComplete) {
          onTransactionComplete();
        }
      }, 2000);
    } catch (err) {
      console.error("Payment error:", err);
      setError(
        err.response?.data?.errorMessage || err.message || "Payment failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onTransactionComplete) {
      onTransactionComplete();
    }
  };

  const formatDateTime = (date) => {
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <div
          style={{ color: "#4caf50", fontSize: "48px", marginBottom: "10px" }}
        >
          ✓
        </div>
        <h2>Payment Successful!</h2>
        <p>Your parking session has ended successfully.</p>
        <p>Transaction ID: {transactionId}</p>
        <p>Duration: {parkingDuration} minutes</p>
        <p>Amount Paid: PHP {parkingFee}</p>
        <p>Redirecting...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <header style={{ marginBottom: "20px" }}>
        <h1 style={{ margin: 0, color: "#333" }}>End Parking Session</h1>
      </header>

      <main>
        {/* SELECT PAYMENT METHOD */}
        <div style={{ marginBottom: "30px" }}>
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontWeight: "bold", marginBottom: "10px" }}>
              Select Payment Method
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setPaymentMethod("gcash")}
                style={{
                  padding: "10px 20px",
                  border:
                    paymentMethod === "gcash"
                      ? "2px solid #007bff"
                      : "1px solid #ddd",
                  backgroundColor:
                    paymentMethod === "gcash" ? "#e3f2fd" : "white",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Gcash
              </button>
              <button
                onClick={() => setPaymentMethod("paymaya")}
                style={{
                  padding: "10px 20px",
                  border:
                    paymentMethod === "paymaya"
                      ? "2px solid #007bff"
                      : "1px solid #ddd",
                  backgroundColor:
                    paymentMethod === "paymaya" ? "#e3f2fd" : "white",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                PayMaya
              </button>
            </div>
          </div>

          <div>
            <p style={{ fontWeight: "bold", marginBottom: "10px" }}>
              Phone Number
            </p>
            <div style={{ marginBottom: "10px" }}>
              <input
                type="radio"
                id="number"
                checked={phoneNumber === "09123456789"}
                onChange={() => setPhoneNumber("09123456789")}
                style={{ marginRight: "8px" }}
              />
              <label htmlFor="number">09123456789</label>
            </div>
            <button
              style={{
                padding: "8px 16px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Add Phone Number
            </button>
          </div>
        </div>

        {/* PAYMENT DETAILS */}
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "20px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontWeight: "bold", margin: 0 }}>Session Details</p>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <p style={{ marginBottom: "15px" }}>
              Please confirm your parking session details
            </p>
            <div style={{ display: "grid", gap: "8px" }}>
              <div>
                <strong>Transaction ID:</strong> {transactionId}
              </div>
              <div>
                <strong>Username:</strong> {user?.first_name} {user?.last_name}
              </div>
              <div>
                <strong>Parking Slot:</strong> {parkingSlot?.slot_id}
              </div>
              <div>
                <strong>Start Time:</strong>{" "}
                {parkingActivity?.start_time
                  ? formatDateTime(new Date(parkingActivity.start_time))
                  : "—"}
              </div>
              <div>
                <strong>Duration:</strong> {parkingDuration} minutes
              </div>
              <div>
                <strong>Pay with:</strong> {paymentMethod.toUpperCase()}
              </div>
              <div>
                <strong>End Time:</strong> {formatDateTime(currentDateTime)}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              padding: "15px",
              backgroundColor: "white",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
          >
            <span style={{ fontWeight: "bold" }}>Total Amount:</span>
            <h1 style={{ margin: 0, color: "#007bff" }}>PHP {parkingFee}</h1>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={handleCancel}
              disabled={loading}
              style={{
                padding: "10px 20px",
                border: "1px solid #6c757d",
                backgroundColor: "white",
                color: "#6c757d",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmPayment}
              disabled={loading}
              style={{
                padding: "10px 20px",
                border: "none",
                backgroundColor: "#28a745",
                color: "white",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Processing..." : "Confirm Payment & End Session"}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              marginTop: "15px",
              padding: "10px",
              backgroundColor: "#f8d7da",
              color: "#721c24",
              border: "1px solid #f5c6cb",
              borderRadius: "4px",
            }}
          >
            {error}
          </div>
        )}
      </main>
    </div>
  );
};

export default EndOccupancyPayment;
