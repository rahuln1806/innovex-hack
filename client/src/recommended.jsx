import "./recommended.css";
import logo from "./assets/logo2.png";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";
import ProfileDropdown from "./profiledropdown";
import axios from "axios";

const Recommended = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("RECOMMENDED");
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const menuItems = ["HOME", "BOOKS", "CART", "RECOMMENDED"];

  const buildRecommendationQuery = () => {
    let prefs = {};
    let searchHistory = [];
    let borrowHistory = [];

    try {
      const raw = localStorage.getItem("user_prefs");
      prefs = raw ? JSON.parse(raw) : {};
    } catch {
      prefs = {};
    }

    try {
      const raw = localStorage.getItem("search_history");
      searchHistory = raw ? JSON.parse(raw) : [];
    } catch {
      searchHistory = [];
    }

    try {
      const raw = localStorage.getItem("borrow_history");
      borrowHistory = raw ? JSON.parse(raw) : [];
    } catch {
      borrowHistory = [];
    }

    const tokens = [];

    if (prefs?.field) tokens.push(prefs.field);
    if (prefs?.interests) tokens.push(prefs.interests);
    if (prefs?.year) tokens.push(`year ${prefs.year}`);

    const recentSearches = (Array.isArray(searchHistory) ? searchHistory : [])
      .slice(0, 5)
      .map((it) => it?.q)
      .filter(Boolean);
    tokens.push(...recentSearches);

    const recentBorrowed = (Array.isArray(borrowHistory) ? borrowHistory : [])
      .slice(0, 5)
      .map((it) => it?.title)
      .filter(Boolean);
    tokens.push(...recentBorrowed);

    const combined = tokens
      .map((t) => t.toString().trim())
      .filter(Boolean)
      .join(" ")
      .trim();

    return combined;
  };

  const derivedQuery = useMemo(() => buildRecommendationQuery(), []);

  const fetchRecommendations = async (query) => {
    const q = (query || "").toString().trim();
    if (!q) {
      setRecommendedBooks([]);
      setMessage("No activity yet. Search books or fill your preferences to see recommendations.");
      return;
    }

    setIsLoading(true);
    setMessage("");
    try {
      const res = await axios.post("http://localhost:5000/books/text-search", { query: q });
      const books = res?.data?.books || [];
      if (!books.length) {
        setRecommendedBooks([]);
        setMessage(res?.data?.message || "No recommendations found.");
        return;
      }

      setRecommendedBooks(
        books.map((b, idx) => ({
          id: b?.title ? `rec-${b.title}` : `rec-${idx}`,
          title: b?.title || b,
          author: b?.author || "Recommended",
          image: "https://via.placeholder.com/150",
        }))
      );
    } catch {
      setRecommendedBooks([]);
      setMessage("Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (book) => {
    const title = book?.title;
    if (!title) return;
    try {
      const cartRaw = localStorage.getItem("cart");
      const cart = cartRaw ? JSON.parse(cartRaw) : [];
      const id = book?.id || `book-${title}`;
      const nextItem = {
        id,
        title,
        author: book?.author || "Unknown",
        isbn: book?.isbn || "",
        available: true,
        qty: 1,
      };

      const existingIndex = cart.findIndex((it) => it?.id === id);
      const nextCart =
        existingIndex >= 0
          ? cart.map((it, i) => (i === existingIndex ? { ...it, qty: (it.qty || 1) + 1 } : it))
          : [...cart, nextItem];

      localStorage.setItem("cart", JSON.stringify(nextCart));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchRecommendations(derivedQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMenuClick = (item) => {
    setActiveTab(item);

    if (item === "HOME") {
      navigate("/dashboard");
    } else if (item === "BOOKS") {
      navigate("/books");
    } else if (item === "CART") {
      navigate("/cart");
    } else if (item === "RECOMMENDED") {
      navigate("/recommended");
    }
  };

  return (
    <div className="recommended-container">
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
                if (e.key === "Enter") {
                  fetchRecommendations(searchQuery);
                }
              }}
            />
          </div>

          <ProfileDropdown userName={localStorage.getItem("username") || "User"} />
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

      <div className="recommended-content">
        <h2 className="section-title">Recommended For You</h2>

        {isLoading && <p className="muted">Loading recommendations...</p>}
        {!isLoading && message && <p className="muted">{message}</p>}

        <div className="book-grid">
          {recommendedBooks.map((book) => (
            <div key={book.id} className="book-card">
              <div className="book-image">
                <img src={book.image} alt={book.title} />
              </div>
              <div className="book-info">
                <h3>{book.title}</h3>
                <p className="author">{book.author}</p>
                <button className="add-btn" onClick={() => addToCart(book)}>Add to Cart</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Recommended;