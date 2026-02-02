import "./Books.css";
import logo from "./assets/logo2.png";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { useState } from "react";
import axios from "axios";
import ProfileDropdown from "./profiledropdown";

const Books = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const userName = localStorage.getItem("username") || "User";

  const [field, setField] = useState("");
  const [year, setYear] = useState("");
  const [interests, setInterests] = useState("");

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

  const persistUserPrefs = (nextPrefs) => {
    try {
      localStorage.setItem(
        "user_prefs",
        JSON.stringify({
          ...(nextPrefs || {}),
          ts: Date.now(),
        })
      );
    } catch {
      // ignore
    }
  };

  /* 🔍 TEXT SEARCH (UNCHANGED) */
  const handleTextSearch = async (e) => {
    if (e) e.preventDefault();

    if (!searchQuery.trim()) return;

    persistSearchQuery("books", searchQuery);

    setIsSearching(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/books/text-search",
        { query: searchQuery }
      );

      if (response.data.books && response.data.books.length > 0) {
        const bookTitles = response.data.books.map((book) => book.title);
        navigate("/books/results", {
          state: { books: bookTitles },
        });
      } else {
        navigate("/books/results", {
          state: { message: response.data.message || "No books found" },
        });
      }
    } catch (error) {
      navigate("/books/results", {
        state: {
          message: "Server error. Please try again.",
          error: error.message,
        },
      });
    } finally {
      setIsSearching(false);
    }
  };

  /* 🤖 AI SEARCH (STEP 5 IMPLEMENTATION) */
  const handleNext = async () => {
    persistUserPrefs({ field, year, interests });
    try {
      const response = await axios.get(
        "http://localhost:5000/ai-books/all-books"
      );

      if (response.data.books && response.data.books.length > 0) {
        navigate("/books/results", {
          state: { books: response.data.books },
        });
      } else {
        navigate("/books/results", {
          state: { message: "No books found" },
        });
      }
    } catch (error) {
      navigate("/books/results", {
        state: {
          message: "Error loading books. Try again.",
          error: error.message,
        },
      });
    }
  };

  return (
    <div className="books-container">
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
                if (e.key === "Enter") handleTextSearch(e);
              }}
            />
          </div>

          <ProfileDropdown userName={userName} />
        </div>
      </header>

      {/* Navigation */}
      <nav className="nav">
        <span onClick={() => navigate("/dashboard")}>HOME</span>
        <span className="active">BOOKS</span>
        <span onClick={() => navigate("/cart")}>CART</span>
        <span onClick={() => navigate("/recommended")}>RECOMMENDED</span>
      </nav>

      {/* Content */}
      <div className="books-content">
        <div className="books-hero">
          <h2 className="books-title">Find the right books for you</h2>
          <p className="books-subtitle">
            Welcome, {userName}. Enter your details to get personalized results.
          </p>
        </div>

        <div className="books-form-box">
          <input
            placeholder="ENTER YOUR FIELD OF STUDY"
            value={field}
            onChange={(e) => setField(e.target.value)}
          />

          <input
            placeholder="YEAR OF STUDY"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />

          <input
            placeholder="OTHER INTERESTS (OPTIONAL)"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
          />
        </div>

        <button className="next-btn" onClick={handleNext}>
          →
        </button>
      </div>
    </div>
  );
};

export default Books;
