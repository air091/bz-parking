import React from "react";

const ConfirmHoldSlot = ({ parkingSlot, onConfirm, onCancel, loading }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "24px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          maxWidth: "400px",
          width: "90%",
          textAlign: "center",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "16px" }}>
          Confirm Hold Slot
        </h3>

        <div style={{ marginBottom: "20px", textAlign: "left" }}>
          <p style={{ margin: "8px 0" }}>
            <strong>Slot ID:</strong> {parkingSlot?.slot_id}
          </p>
          <p style={{ margin: "8px 0" }}>
            <strong>Location:</strong> {parkingSlot?.location}
          </p>
          <p style={{ margin: "8px 0" }}>
            <strong>Type:</strong>{" "}
            {parkingSlot?.vehicle_type || "Not specified"}
          </p>
          <p style={{ margin: "8px 0" }}>
            <strong>Current Status:</strong> {parkingSlot?.status}
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "12px",
            borderRadius: "4px",
            marginBottom: "20px",
            border: "1px solid #e9ecef",
          }}
        >
          <p style={{ margin: 0, color: "#495057" }}>
            Are you sure you want to hold this parking slot? This will reserve
            it for your use, and will cost you P10 for every due and{" "}
            <span style={{ color: "red" }}>cannot be undone</span>.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: "8px 16px",
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
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: "8px 16px",
              border: "none",
              backgroundColor: "#007bff",
              color: "white",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Holding..." : "Confirm Hold"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmHoldSlot;
