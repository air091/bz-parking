import React from "react";
import { useAuth } from "../../context/AuthContext";

const Home = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => logout();
  return (
    <div>
      <header>
        <h1>Welcome to BZ Parking</h1>
      </header>
      {user && (
        <main>
          <p>Hello, {user.first_name}</p>
          <button onClick={handleLogout}>Logout</button>
        </main>
      )}
    </div>
  );
};

export default Home;
