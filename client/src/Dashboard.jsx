import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FloatingChatbot from "./components/Floatingchatbot";
import ProfileDropdown from "./profiledropdown";

import "./Dashboard.css";
import logo from "./assets/logo2.png";
import {
  FaBook,
  FaList,
  FaUsers,
  FaUser,
  FaTags,
  FaSearch,
  FaMicrophone,
  FaBell,
  FaDownload,
  FaFire,
  FaTrophy,
  FaClock
} from "react-icons/fa";

const stats = [
  { icon: <FaBook />, count: 2, label: "Books Listed", color: "green" },
  { icon: <FaList />, count: 6, label: "Times Books Issued", color: "blue" },
  { icon: <FaUsers />, count: 6, label: "Registered Users", color: "red" },
  { icon: <FaUser />, count: 2, label: "Authors Listed", color: "green" },
  { icon: <FaTags />, count: 6, label: "Listed Categories", color: "blue" }
];

const recentActivities = [
  { id: 1, action: "You issued", book: "The Great Gatsby", time: "Yesterday" },
  { id: 2, action: "You returned", book: "To Kill a Mockingbird", time: "2 days ago" },
  { id: 3, action: "Book due in", book: "1984", time: "3 days" },
  { id: 4, action: "New arrival", book: "Atomic Habits", time: "Today" },
  { id: 5, action: "You issued", book: "Dune", time: "5 days ago" }
];

const notifications = [
  { id: 1, type: "due", message: "Book '1984' due in 3 days", icon: <FaClock /> },
  { id: 2, type: "arrival", message: "New book 'Atomic Habits' arrived", icon: <FaFire /> },
  { id: 3, type: "offer", message: "Special offer: 20% on new arrivals", icon: <FaTags /> }
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("HOME");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [userName] = useState(() => localStorage.getItem("username") || "User");
  const [booksReadThisMonth, setBooksReadThisMonth] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount] = useState(3);
  const navigate = useNavigate();

  const persistSearchQuery = (source, query) => {
    const q = (query || "").toString().trim();
    if (!q) return;
    try {
      const raw = localStorage.getItem("search_history");
      const prev = raw ? JSON.parse(raw) : [];
      const next = [
        { q, source, ts: Date.now() },
        ...prev.filter((it) => (it?.q || "").toString().toLowerCase() !== q.toLowerCase())
      ].slice(0, 25);
      localStorage.setItem("search_history", JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const computePurchasedCount = () => {
      try {
        const stored = JSON.parse(localStorage.getItem("cart")) || [];
        const total = stored.reduce((sum, item) => sum + (Number(item?.qty) || 0), 0);
        setBooksReadThisMonth(total);
      } catch {
        setBooksReadThisMonth(0);
      }
    };

    computePurchasedCount();
    window.addEventListener("storage", computePurchasedCount);
    return () => window.removeEventListener("storage", computePurchasedCount);
  }, []);

  const menuItems = ["HOME", "BOOKS", "CART", "RECOMMENDED"];

  const handleNavigateToResults = (bookTitles) => {
    navigate("/books/results", {
      state: { books: bookTitles }
    });
  };

  const handleTextSearch = async (e) => {
    if (e) {
      e.preventDefault();
    }

    if (!searchQuery.trim()) {
      return;
    }

    persistSearchQuery("dashboard", searchQuery);

    setIsSearching(true);
    try {
      const response = await axios.post("http://localhost:5000/books/text-search", {
        query: searchQuery
      });

      if (response.data.books && response.data.books.length > 0) {
        const bookTitles = response.data.books.map(book => book.title);
        navigate("/books/results", {
          state: { books: bookTitles }
        });
      } else {
        navigate("/books/results", {
          state: { message: response.data.message || "No books found" }
        });
      }
    } catch (error) {
      navigate("/books/results", {
        state: { message: "Server error. Please try again." }
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleMenuClick = (item) => {
    try {
      setActiveTab(item);

      if (item === "BOOKS") {
        navigate("/books");
      } else if (item === "CART") {
        navigate("/cart");
      } else if (item === "HOME") {
        // Already on dashboard, just update active tab
        setActiveTab("HOME");
      } else if (item === "RECOMMENDED") {
        navigate("/recommended");
      }
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  const handleIssueBook = () => {
    navigate("/books");
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleTextSearch(e);
                }
              }}
            />
            <FaMicrophone className="audio-search-icon" />
          </div>

          <div
            className="notification-bell"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <FaBell className="bell-icon" />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}

            {showNotifications && (
              <div className="notification-dropdown">
                <h4>Notifications</h4>
                {notifications.map((notif) => (
                  <div key={notif.id} className="notification-item">
                    <span className="notif-icon">{notif.icon}</span>
                    <p className="notif-message">{notif.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <ProfileDropdown userName={localStorage.getItem("username") || userName} />
        </div>
      </header>

      {/* Navigation */}
      <nav className="nav">
        {menuItems.map((item) => (
          <span
            key={item}
            className={`nav-item ${activeTab === item ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              handleMenuClick(item);
            }}
            style={{ cursor: 'pointer' }}
          >
            {item}
          </span>
        ))}
      </nav>

      <div className="welcome-section">
        <h2 className="welcome-title">
          Welcome back, <span className="user-name">{userName}</span>!
        </h2>
        <p className="welcome-subtitle">
          Here's your reading progress and library activities
        </p>
      </div>

      <div className="quick-actions-row">
        <div className="progress-tracker">
          <div className="progress-header">
            <FaTrophy className="progress-icon" />
            <h3>Reading Progress</h3>
          </div>
          <div className="progress-content">
            <p className="progress-stat">
              {booksReadThisMonth} <span>books read this month</span>
            </p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(booksReadThisMonth / 10) * 100}%` }}
              ></div>
            </div>
            <p className="progress-target">Goal: 10 books/month</p>
          </div>
        </div>

        <div className="action-buttons">
          <button className="action-btn issue-btn" onClick={handleIssueBook}>
            <FaDownload className="btn-icon" />
            <span>Issue Book</span>
          </button>
        </div>
      </div>

      <div className="dashboard-main">
        <div className="stats-section">
          <h3 className="section-title">Library Statistics</h3>
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

        <div className="activity-feed">
          <h3 className="section-title">Recent Activity</h3>
          <ul className="activity-list">
            {recentActivities.map((activity, index) => (
              <li
                key={activity.id}
                className="activity-item"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="activity-avatar">
                  <FaBook />
                </div>
                <div className="activity-content">
                  <p className="activity-text">
                    <strong>{activity.action}</strong> <em>{activity.book}</em>
                  </p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Floating chatbot (keeps import used) */}
      <FloatingChatbot />
    </div>
  );
};

export default Dashboard;