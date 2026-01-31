import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Dashboard.css";
import logo from "./assets/logo2.png";
import {
  FaBook,
  FaList,
  FaRecycle,
  FaUsers,
  FaUser,
  FaTags,
  FaSearch,
  FaMicrophone
} from "react-icons/fa";

const stats = [
  { icon: <FaBook />, count: 2, label: "Books Listed", color: "green" },
  { icon: <FaList />, count: 6, label: "Times Books Issued", color: "blue" },
  { icon: <FaRecycle />, count: 3, label: "Times Books Returned", color: "brown" },
  { icon: <FaUsers />, count: 6, label: "Registered Users", color: "red" },
  { icon: <FaUser />, count: 2, label: "Authors Listed", color: "green" },
  { icon: <FaTags />, count: 6, label: "Listed Categories", color: "blue" }
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("HOME");
  const navigate = useNavigate();

  const menuItems = ["HOME", "BOOKS", "CART", "RECOMMENDED"];

  const handleMenuClick = (item) => {
    setActiveTab(item);

    if (item === "BOOKS") {
      navigate("/books");
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="header">
        <div className="logo-container">
          <img src={logo} alt="Librora Logo" className="logo-img" />
          <h1 className="logo-text">LIBRORA</h1>
        </div>

        <div className="header-right">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search books..."
              className="search-input"
            />
            <FaMicrophone className="audio-search-icon" />
          </div>

          <div className="profile-icon">
            <FaUser />
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="nav">
        {menuItems.map((item) => (
          <span
            key={item}
            className={`nav-item ${activeTab === item ? "active" : ""}`}
            onClick={() => handleMenuClick(item)}
          >
            {item}
          </span>
        ))}
      </nav>

      <h2 className="dashboard-title">STUDENT DASHBOARD</h2>
      <hr />

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((item, index) => (
          <div key={index} className={`stat-card ${item.color}`}>
            <div className="stat-icon">{item.icon}</div>
            <h3>{item.count}</h3>
            <p>{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
