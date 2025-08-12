import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Register = () => {
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
          navigate("/home");
        }
      } else {
        setError(registerResponse.data.message);
      }
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <header>Registration</header>
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
        <button onClick={handleButton}>Register</button>
      </form>
    </div>
  );
};

export default Register;
