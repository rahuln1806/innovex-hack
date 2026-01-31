import "./Books.css";
import logo from "./assets/logo2.png";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaUser } from "react-icons/fa";

const Books = () => {
  const navigate = useNavigate();

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
            />
          </div>

          <div className="profile-icon">
            <FaUser />
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="nav">
        <span onClick={() => navigate("/dashboard")}>HOME</span>
        <span onClick={() => navigate("/dashboard")}className="active">BOOKS</span>
        <span onClick={() => navigate("/cart")}>CART</span>
        <span onClick={() => navigate("/recommended")}>RECOMMENDED</span>
      </nav>

      {/* Content */}
      <div className="books-content">
        <h2>WELCOME USER!!</h2>
        <p>ENTER YOUR DETAILS</p>

        <input placeholder="ENTER YOUR FIELD OF STUDY" />
        <input placeholder="YEAR OF STUDY" />
        <input placeholder="OTHER INTERESTS (OPTIONAL)" />

        <button className="next-btn">→</button>
      </div>
    </div>
  );
};

export default Books;
