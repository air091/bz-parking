import React from "react";

const ParkingSlotCard = ({ selectedParkingSlot, setSelectedParkingSlot }) => {
  return (
    <div className="parking-slot-card">
      {selectedParkingSlot ? (
        <div>
          <header>
            <h2>Parking Slot Details</h2>
          </header>
          <div>
            <div>
              <span>Slot ID: {selectedParkingSlot.slot_id}</span>
            </div>
            <div>
              <span>Status: {selectedParkingSlot.status}</span>
            </div>
            <div>
              <span>
                Type: {selectedParkingSlot.vehicle_type || "Not specified"}
              </span>
            </div>
            <div>
              <span>Location: {selectedParkingSlot.location}</span>
            </div>
            <div>
              <span>
                Updated:{" "}
                {selectedParkingSlot.updated_at
                  ? new Date(selectedParkingSlot.updated_at).toLocaleString()
                  : "—"}
              </span>
            </div>
          </div>

          <div>
            <button onClick={() => setSelectedParkingSlot(null)}>Close</button>
          </div>
        </div>
      ) : (
        <p>Select a parking slot to view details.</p>
      )}
    </div>
  );
};

export default ParkingSlotCard;
