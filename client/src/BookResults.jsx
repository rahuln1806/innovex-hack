import "./Books.css";
import logo from "./assets/logo2.png";
import { useNavigate, useLocation } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { useState, useEffect } from "react";
import axios from "axios";
import ProfileDropdown from "./profiledropdown";


const BookResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [books, setBooks] = useState([]);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const addToCart = (book) => {
    const title = typeof book === "string" ? book : book?.title;
    if (!title) return;

    const cartRaw = localStorage.getItem("cart");
    const cart = cartRaw ? JSON.parse(cartRaw) : [];

    const id = typeof book === "object" && book?.id ? book.id : `book-${title}`;
    const nextItem = {
      id,
      title,
      author: typeof book === "object" && book?.author ? book.author : "Unknown",
      isbn: typeof book === "object" && book?.isbn ? book.isbn : "",
      available: typeof book === "object" && typeof book?.available === "boolean" ? book.available : true,
      qty: 1,
    };

    const existingIndex = cart.findIndex((it) => it?.id === id);
    let nextCart;
    if (existingIndex >= 0) {
      nextCart = cart.map((it, idx) => (idx === existingIndex ? { ...it, qty: (it.qty || 1) + 1 } : it));
    } else {
      nextCart = [...cart, nextItem];
    }

    localStorage.setItem("cart", JSON.stringify(nextCart));
    navigate("/cart");
  };

  const handleNavigateToResults = (bookTitles) => {
    setBooks(bookTitles);
    setMessage("");
  };

  const handleTextSearch = async (e) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!searchQuery.trim()) {
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.post("http://localhost:5000/books/text-search", {
        query: searchQuery
      });

      if (response.data.books && response.data.books.length > 0) {
        const bookTitles = response.data.books.map(book => book.title);
        setBooks(bookTitles);
        setMessage("");
      } else {
        setBooks([]);
        setMessage(response.data.message || "No books found");
      }
    } catch (error) {
      setBooks([]);
      setMessage("Server error. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    // Get books from navigation state only on initial load or when location state changes
    if (location.state) {
      if (location.state.books) {
        setBooks(location.state.books);
        setMessage("");
      } else if (location.state.message) {
        setMessage(location.state.message);
        setBooks([]);
      }
    }
    // Note: We don't redirect here to allow audio search to update books without navigation state
  }, [location]);

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
                if (e.key === 'Enter') {
                  handleTextSearch(e);
                }
              }}
            />
          </div>

          <ProfileDropdown userName={localStorage.getItem("username") || "User"} />
        </div>
      </header>

      {/* Navigation */}
      <nav className="nav">
        <span onClick={() => navigate("/dashboard")}>HOME</span>
        <span onClick={() => navigate("/books")} className="active">BOOKS</span>
        <span onClick={() => navigate("/cart")}>CART</span>
        <span onClick={() => navigate("/recommended")}>RECOMMENDED</span>
      </nav>

      {/* Content */}
      <div className="books-content">
        {/* Books List */}
        {books.length > 0 && (
          <div className="books-list-container">
            <h3 className="books-list-title">
              {books.length} {books.length === 1 ? 'book' : 'books'} found
            </h3>
            <div className="books-list">
              {books.map((book, index) => (
                <div key={index} className="book-item">
                  <div className="book-item-title">{typeof book === "string" ? book : book?.title}</div>
                  <div className="book-item-actions">
                    <button
                      type="button"
                      className="add-to-cart-btn"
                      onClick={() => addToCart(book)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {message && <p className="no-books">{message}</p>}
      </div>
    </div>
  );
};

export default BookResults;
