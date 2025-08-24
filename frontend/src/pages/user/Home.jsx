import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useParkingSlots } from "../../hooks/useParkingSlots";
import "../../components/home_components/home-style.css";
import Map from "../../components/home_components/Map";

const Home = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => logout();

  const handleParkingSlotSelect = (slot) => {
    // This callback is now optional since Map.jsx handles the modal internally
    // We can use it for any additional logic if needed in the future
    console.log("Parking slot selected:", slot);
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
    </div>
  );
};

export default Home;
