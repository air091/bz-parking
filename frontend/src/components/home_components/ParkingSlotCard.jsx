import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ConfirmHoldSlot from "./ConfirmHoldSlot";
import Login from "../../pages/user/Login";
import Register from "../../pages/user/Register";
import ConfirmHoldTransaction from "../../pages/ConfirmHoldTransaction";
import EndOccupancyPayment from "../../pages/EndOccupancyPayment"; // New component

const ParkingSlotCard = ({
  selectedParkingSlot,
  setSelectedParkingSlot,
  onSlotUpdate,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmHold, setShowConfirmHold] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showEndOccupancyModal, setShowEndOccupancyModal] = useState(false); // New state
  const [currentParkingActivity, setCurrentParkingActivity] = useState(null); // New state

  // Local state to maintain slot data independently of parent updates
  const [localSlotData, setLocalSlotData] = useState(null);

  // Initialize local state when component mounts or slot changes
  useEffect(() => {
    if (selectedParkingSlot) {
      setLocalSlotData(selectedParkingSlot);
      // Fetch current parking activity for this slot
      fetchCurrentParkingActivity(selectedParkingSlot.slot_id);
    }
  }, [selectedParkingSlot]);

  // Fetch current parking activity for the slot
  const fetchCurrentParkingActivity = async (slotId) => {
    try {
      const response = await axios.get(
        `http://localhost:2701/api/parking-activity/slot/${slotId}/active`
      );
      if (response.data.success) {
        setCurrentParkingActivity(response.data.parkingActivity);
      }
    } catch (error) {
      console.log("No active parking activity found for this slot");
      setCurrentParkingActivity(null);
    }
  };

  // Calculate time remaining for held slots using local data
  useEffect(() => {
    // Only show timer for "held" status, stop timer for "occupied" or other statuses
    if (localSlotData?.status === "held" && localSlotData?.updated_at) {
      const updateTimer = () => {
        const heldTime = new Date(localSlotData.updated_at).getTime();
        const currentTime = new Date().getTime();
        const elapsedSeconds = Math.floor((currentTime - heldTime) / 1000);
        const remainingSeconds = Math.max(0, 180 - elapsedSeconds); // 3 minutes = 180 seconds

        setTimeRemaining(remainingSeconds);

        if (remainingSeconds <= 0) {
          // Timer expired, update local state only
          handleTimerExpiration();
        }
      };

      // Update immediately
      updateTimer();

      // Set up interval to update every second
      const timer = setInterval(updateTimer, 1000);

      return () => clearInterval(timer);
    } else {
      // Clear timer for non-held statuses (including "occupied")
      setTimeRemaining(null);
    }
  }, [localSlotData]);

  // Handle timer expiration locally without affecting parent
  const handleTimerExpiration = async () => {
    if (localSlotData) {
      try {
        // End the parking activity on the backend
        const response = await axios.put(
          `http://localhost:2701/api/parking-activity/end/${localSlotData.slot_id}`,
          {
            end_time: new Date().toISOString(),
          }
        );

        if (response.data.success) {
          console.log("Parking activity ended successfully");
        }
      } catch (error) {
        console.error("Error ending parking activity:", error);
      }

      const expiredSlot = {
        ...localSlotData,
        status: "available",
        updated_at: new Date().toISOString(),
      };

      // Update local state only
      setLocalSlotData(expiredSlot);
      setTimeRemaining(null);

      // Optionally notify parent about the change (but don't force refresh)
      if (onSlotUpdate) {
        onSlotUpdate(expiredSlot);
      }

      console.log("Timer expired - slot status updated locally:", expiredSlot);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleHoldSlotClick = () => {
    if (!user) {
      setError("You must be logged in to hold a parking slot");
      setShowLoginModal(true);
      return;
    }

    if (localSlotData.status !== "available") {
      setError("Only available parking slots can be held");
      return;
    }

    // Show confirmation popup
    setShowConfirmHold(true);
  };

  const handleEndOccupancyClick = () => {
    if (!user) {
      setError("You must be logged in to end occupancy");
      setShowLoginModal(true);
      return;
    }

    if (localSlotData.status !== "occupied") {
      setError("Only occupied parking slots can end occupancy");
      return;
    }

    // Check if current user is the one occupying the slot
    if (
      currentParkingActivity &&
      currentParkingActivity.user_id !== user.user_id
    ) {
      setError("Only the user occupying this slot can end the occupancy");
      return;
    }

    // Show end occupancy payment modal
    setShowEndOccupancyModal(true);
  };

  const handleConfirmHold = async () => {
    // Close confirmation popup
    setShowConfirmHold(false);

    // Navigate to payment page with parking slot data
    setShowTransactionModal(true);
  };

  const handleCancelHold = () => {
    setShowConfirmHold(false);
  };

  const handleEndOccupancyComplete = () => {
    setShowEndOccupancyModal(false);
    // Refresh the parking activity data
    if (localSlotData) {
      fetchCurrentParkingActivity(localSlotData.slot_id);
    }
  };

  const isSlotHoldable = localSlotData?.status === "available";
  const isSlotEndable =
    localSlotData?.status === "occupied" &&
    currentParkingActivity &&
    currentParkingActivity.user_id === user?.user_id;

  // Use localSlotData instead of selectedParkingSlot for rendering
  const displaySlot = localSlotData || selectedParkingSlot;

  const openLoginModal = () => {
    setShowLoginModal(true);
    setShowRegisterModal(false);
  };

  const openRegisterModal = () => {
    setShowRegisterModal(true);
    setShowLoginModal(false);
  };

  const closeModals = () => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
    setShowTransactionModal(false);
    setShowEndOccupancyModal(false);
  };

  const closeTransactionModal = () => {
    setShowTransactionModal(false);
  };

  return (
    <>
      <div className="parking-slot-card">
        {displaySlot ? (
          <div>
            <header>
              <h2>Parking Slot Details</h2>
            </header>
            <div>
              <div>
                <span>Slot ID: {displaySlot.slot_id}</span>
              </div>
              <div>
                <span>Status: {displaySlot.status}</span>
              </div>
              <div>
                <span>Type: {displaySlot.vehicle_type || "Not specified"}</span>
              </div>
              <div>
                <span>Location: {displaySlot.location}</span>
              </div>
              <div>
                <span>
                  Updated:{" "}
                  {displaySlot.updated_at
                    ? new Date(displaySlot.updated_at).toLocaleString()
                    : "—"}
                </span>
              </div>

              {/* Show current occupant for occupied slots */}
              {displaySlot.status === "occupied" && currentParkingActivity && (
                <div
                  style={{
                    marginTop: "10px",
                    padding: "8px",
                    backgroundColor: "#fff3cd",
                    borderRadius: "4px",
                  }}
                >
                  <span style={{ fontWeight: "bold" }}>Current Occupant:</span>
                  <div>User ID: {currentParkingActivity.user_id}</div>
                  <div>
                    Started:{" "}
                    {new Date(
                      currentParkingActivity.start_time
                    ).toLocaleString()}
                  </div>
                  {currentParkingActivity.user_id === user?.user_id && (
                    <div style={{ color: "#28a745", fontWeight: "bold" }}>
                      ✓ This is your slot
                    </div>
                  )}
                </div>
              )}

              {/* Timer for held slots ONLY - not for occupied slots */}
              {displaySlot.status === "held" && timeRemaining !== null && (
                <div
                  style={{
                    marginTop: "10px",
                    padding: "8px",
                    backgroundColor:
                      timeRemaining <= 30 ? "#ffebee" : "#e8f5e8",
                    borderRadius: "4px",
                    border:
                      timeRemaining <= 30
                        ? "1px solid #f44336"
                        : "1px solid #4caf50",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "bold",
                      color: timeRemaining <= 30 ? "#d32f2f" : "#2e7d32",
                    }}
                  >
                    Time Remaining: {formatTime(timeRemaining)}
                  </span>
                  {timeRemaining <= 30 && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#d32f2f",
                        marginTop: "4px",
                      }}
                    >
                      ⚠️ Slot will expire soon!
                    </div>
                  )}
                </div>
              )}

              {/* Hold Slot Button - Only show for logged-in users with available slots */}
              {isSlotHoldable && (
                <div style={{ marginTop: "15px" }}>
                  <button
                    onClick={handleHoldSlotClick}
                    disabled={loading}
                    style={{
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "4px",
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.6 : 1,
                    }}
                  >
                    Hold Slot
                  </button>
                </div>
              )}

              {/* End Occupancy Button - Only show for the user occupying the slot */}
              {isSlotEndable && (
                <div style={{ marginTop: "15px" }}>
                  <button
                    onClick={handleEndOccupancyClick}
                    disabled={loading}
                    style={{
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "4px",
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.6 : 1,
                    }}
                  >
                    End Occupancy & Pay
                  </button>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div
                  style={{
                    marginTop: "10px",
                    color: "red",
                    fontSize: "14px",
                  }}
                >
                  {error}
                </div>
              )}

              <div style={{ marginTop: "15px" }}>
                <button onClick={() => setSelectedParkingSlot(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p>Select a parking slot to view details.</p>
        )}
      </div>

      {/* Confirmation Popup */}
      {showConfirmHold && (
        <ConfirmHoldSlot
          parkingSlot={displaySlot}
          onConfirm={handleConfirmHold}
          onCancel={handleCancelHold}
          loading={loading}
        />
      )}

      {/* Transaction Modal */}
      {showTransactionModal && (
        <div className="modal__overlay" onClick={closeTransactionModal}>
          <div className="modal__content" onClick={(e) => e.stopPropagation()}>
            <button className="modal__close" onClick={closeTransactionModal}>
              ×
            </button>
            <ConfirmHoldTransaction
              parkingSlot={displaySlot}
              onTransactionComplete={closeTransactionModal}
            />
          </div>
        </div>
      )}

      {/* End Occupancy Modal */}
      {showEndOccupancyModal && (
        <div className="modal__overlay" onClick={closeModals}>
          <div className="modal__content" onClick={(e) => e.stopPropagation()}>
            <button className="modal__close" onClick={closeModals}>
              ×
            </button>
            <EndOccupancyPayment
              parkingSlot={displaySlot}
              parkingActivity={currentParkingActivity}
              onTransactionComplete={handleEndOccupancyComplete}
            />
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="modal__overlay" onClick={closeModals}>
          <div className="modal__content" onClick={(e) => e.stopPropagation()}>
            <button className="modal__close" onClick={closeModals}>
              ×
            </button>
            <Login
              onLoginSuccess={closeModals}
              onSwitchToRegister={openRegisterModal}
            />
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="modal__overlay" onClick={closeModals}>
          <div className="modal__content" onClick={(e) => e.stopPropagation()}>
            <button className="modal__close" onClick={closeModals}>
              ×
            </button>
            <Register
              onRegisterSuccess={closeModals}
              onSwitchToLogin={openLoginModal}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ParkingSlotCard;
