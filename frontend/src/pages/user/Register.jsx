import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Register = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [credentials, setCredentials] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNum: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleButton = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const registerResponse = await axios.post(
        "http://localhost:8000/api/user/register",
        {
          first_name: credentials.firstName,
          last_name: credentials.lastName,
          email: credentials.email,
          phone_num: credentials.phoneNum,
          password: credentials.password,
        }
      );

      if (registerResponse.data.status) {
        const loginResponse = await axios.post(
          "http://localhost:8000/api/user/login",
          { email: credentials.email, password: credentials.password }
        );
        if (loginResponse.data.status) {
          login(loginResponse.data.user);
          if (onRegisterSuccess) {
            onRegisterSuccess(); // Close modal if it's being used as modal
          } else {
            navigate("/home"); // Navigate if it's a standalone page
          }
        }
      } else {
        setError(registerResponse.data.message);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register__container">
      <header>
        <h1>Registration</h1>
      </header>
      {error && <div className="error__message">{error}</div>}
      <form>
        <div>
          <label htmlFor="first_name">First name</label>
          <input
            id="first_name"
            type="text"
            value={credentials.firstName}
            onChange={(e) =>
              setCredentials((prev) => ({ ...prev, firstName: e.target.value }))
            }
          />
        </div>
        <div>
          <label htmlFor="last_name">Last name</label>
          <input
            id="last_name"
            type="text"
            value={credentials.lastName}
            onChange={(e) =>
              setCredentials((prev) => ({ ...prev, lastName: e.target.value }))
            }
          />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={credentials.email}
            onChange={(e) =>
              setCredentials((prev) => ({ ...prev, email: e.target.value }))
            }
          />
        </div>
        <div>
          <label htmlFor="phone_num">Phone number</label>
          <input
            id="phone_num"
            type="text"
            value={credentials.phoneNum}
            onChange={(e) =>
              setCredentials((prev) => ({ ...prev, phoneNum: e.target.value }))
            }
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={credentials.password}
            onChange={(e) =>
              setCredentials((prev) => ({ ...prev, password: e.target.value }))
            }
          />
        </div>
        <button onClick={handleButton} disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      <p>
        Already have an account?{" "}
        {onSwitchToLogin ? (
          <span onClick={onSwitchToLogin} className="switch__link">
            Login here
          </span>
        ) : (
          <Link to="/login">Login here</Link>
        )}
      </p>
    </div>
  );
};

export default Register;
