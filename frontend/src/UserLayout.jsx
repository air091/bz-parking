import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, Outlet } from "react-router-dom";
import { FaCircleUser } from "react-icons/fa6";
import "./userLayout.css";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/user/Login";
import Register from "./pages/user/Register";

const UserLayout = () => {
  const [profileClicked, setProfileClicked] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileClicked(false);
      }
    };

    if (profileClicked) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileClicked]);

  const handleLogoClick = () => navigate("/home");

  const openLoginModal = () => {
    setShowLoginModal(true);
    setShowRegisterModal(false);
    setProfileClicked(false);
  };

  const openRegisterModal = () => {
    setShowRegisterModal(true);
    setShowLoginModal(false);
    setProfileClicked(false);
  };

  const closeModals = () => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
  };

  return (
    <div className="user__layout">
      <nav className="sidebar">
        <header>
          <div className="logo__wrapper" onClick={handleLogoClick}>
            <img
              className="bz-logo"
              src="../public/images/BzParkingLogo.jpg"
              alt="BZ Logo"
            />
          </div>
        </header>
        <ul>
          <li>Home</li>
          <li>Blogs</li>
        </ul>
        <footer>
          <div ref={profileRef} className="profile__container">
            {profileClicked && (
              <ProfileManagement onLoginClick={openLoginModal} />
            )}
            <FaCircleUser
              onClick={() => setProfileClicked(!profileClicked)}
              className="profile__icon"
              size={36}
            />
          </div>
        </footer>
      </nav>
      <Outlet />

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
    </div>
  );
};

function ProfileManagement({ onLoginClick }) {
  const { user, logout } = useAuth();
  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="profile_management__wrapper">
      {user ? (
        <ul>
          <li>My Profile</li>
          <li>Audit & Activity Logs</li>
          <li>Report a problem</li>
          <li onClick={handleLogout}>Log out</li>
        </ul>
      ) : (
        <ul>
          <li onClick={onLoginClick}>Log in</li>
        </ul>
      )}
    </nav>
  );
}

export default UserLayout;
