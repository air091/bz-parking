import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../components/home_components/home-style.css";

const Home = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => logout();

  return (
    <div>
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
      </main>
    </div>
  );
};

export default Home;
