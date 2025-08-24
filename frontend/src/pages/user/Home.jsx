import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../components/home_components/home-style.css";
import Map from "../../components/home_components/Map";
import ParkingSlotCard from "../../components/home_components/ParkingSlotCard";

const Home = () => {
  const { user, logout } = useAuth();
  const [selectedParkingSlot, setSelectedParkingSlot] = useState(null);

  const handleLogout = () => logout();

  const handleParkingSlotSelect = (slot) => {
    setSelectedParkingSlot(slot);
  };

  return (
    <div className="home__container">
      <header>
        <h1>Welcome to BZ Parking</h1>
      </header>
      <main>
        {user ? (
          // Authenticated user content
          <div>
            <p>Hello, {user.first_name}!</p>
            <p>Welcome back to your parking management dashboard.</p>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          // Guest content
          <div>
            <p>Welcome, Guest!</p>
            <p>
              Please log in to access your parking account and manage your
              parking needs.
            </p>
          </div>
        )}
        <div>
          <Map onParkingSlotSelect={handleParkingSlotSelect} />
        </div>
      </main>

      {/* Parking Slot Card */}
      {selectedParkingSlot ? (
        <div>
          <ParkingSlotCard
            selectedParkingSlot={selectedParkingSlot}
            setSelectedParkingSlot={setSelectedParkingSlot}
          />
        </div>
      ) : (
        <div>
          <p>Select a parking slot</p>
        </div>
      )}
    </div>
  );
};

export default Home;
