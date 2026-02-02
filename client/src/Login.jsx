import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import logo from "./assets/logo.png";
import { authAPI } from "./services/api";

const Login = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!username.trim() || !password.trim()) {
      alert("Please enter both username and password");
      return;
    }

    setIsLoading(true);

    try {
      // Call the auth API service
      const response = await authAPI.login(
        username.trim(),
        password.trim()
      );

      // Login success - store token and user info
      if (response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("username", response.username || username.trim());
        if (response.id) {
          localStorage.setItem("userId", response.id);
        }
      }

      // Update login state
      setIsLoggedIn(true);

      // Ensure redirect happens immediately after successful login
      navigate("/dashboard", { replace: true });

    } catch (error) {
      if (error.response) {
        // Backend responded with error
        const errorMessage = error.response.data?.message || "Invalid username or password";
        alert(errorMessage);
      } else if (error.request) {
        // Request was made but no response received
        alert("Server not reachable. Please check if the server is running on port 5000.");
      } else {
        // Something else happened
        alert("An error occurred. Please try again.");
      }
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background"></div>
      <div className="login-container">
        <div className="login-box">
          <div className="logo-section">
            <div className="logo-circle">
              <img src={logo} alt="Librora Logo" className="logo-img" />
            </div>
            <h1 className="logo-title">LIBRORA</h1>
            <p className="subtitle">Smart College Library Management</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
              />
            </div>

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner"></span> LOGGING IN...
                </>
              ) : (
                "LOGIN"
              )}
            </button>
          </form>

          <p className="demo-hint"></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
