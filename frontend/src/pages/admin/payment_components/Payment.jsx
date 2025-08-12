import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Card from "./Card";

const Payment = () => {
  const [paymentDetails, setPaymentDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getPaymentData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:2701/api/payment");
      setPaymentDetails(response.data.payments);
    } catch (error) {
      console.log(`Error getting payment details: ${error.message}`);
      setError("Failed to get payment details");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getPaymentData();
  }, [getPaymentData]);

  return (
    <div>
      <header>
        <h1>Payments</h1>
      </header>
      <div>
        {loading && <p>Loading...</p>}
        {error && <p className="err">{error}</p>}
        {!loading && !error && (
          <table>
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Method</th>
                <th>Creation Date</th>
                <th>Paid Date</th>
              </tr>
            </thead>
            <tbody>
              {paymentDetails.length > 0 ? (
                paymentDetails.map((payment) => (
                  <tr key={payment.payment_id}>
                    <td>{payment.payment_id}</td>
                    <td>${payment.amount}</td>
                    <td>{payment.paid_at ? "Paid" : "Not paid"}</td>
                    <td>{payment.payment_method}</td>
                    <td>{new Date(payment.created_at).toLocaleDateString()}</td>
                    <td>
                      {payment.paid_at
                        ? new Date(payment.paid_at).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>No payments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      <Card />
    </div>
  );
};

export default Payment;
