import React, { useState } from "react";
import "./App.css";
import logo from "./assets/logo.png";
import { authAPI } from "./services/api";

const Login = ({ setIsLoggedIn }) => {
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

      // ✅ Login success - store token and user info
      if (response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("username", response.username);
        if (response.id) {
          localStorage.setItem("userId", response.id);
        }
      }

      // Update login state
      setIsLoggedIn(true);

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
    <div className="login-container">
      <div className="login-box">
        <div className="logo">
          <img src={logo} alt="Librora Logo" className="logo-img" />
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="USERNAME"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-field"
          />

          <input
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
          />

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? "LOGGING IN..." : "LOGIN"}
          </button>
        </form>

        <p className="forgot-password"></p>
      </div>
    </div>
  );
};

export default Login;
