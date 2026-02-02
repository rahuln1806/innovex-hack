import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./profiledropdown.css";
import { FaUser, FaSignOutAlt, FaHistory, FaTachometerAlt } from "react-icons/fa";

const ProfileDropdown = ({ userName = "James Aldrino", onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const defaultLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("userId");
        window.location.assign("/");
    };

    const handleMenuClick = (action) => {
        switch (action) {
            case "profile":
                navigate("/profile");
                break;
            case "dashboard":
                navigate("/dashboard");
                break;
            case "history":
                navigate("/history");
                break;
            case "logout":
                setIsOpen(false);
                if (typeof onLogout === "function") {
                    onLogout();
                } else {
                    defaultLogout();
                }
                break;
            default:
                break;
        }
        setIsOpen(false);
    };

    return (
        <div className="profile-dropdown-container" ref={dropdownRef}>
            {/* Profile Icon Button */}
            <button className="profile-button" onClick={toggleDropdown}>
                <div className="profile-avatar">
                    <FaUser />
                </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="dropdown-menu">
                    {/* User Info */}
                    <div className="dropdown-header">
                        <div className="user-avatar">
                            <FaUser />
                        </div>
                        <span className="user-name">{userName}</span>
                    </div>

                    <hr className="dropdown-divider" />

                    {/* Menu Items */}
                    <div className="dropdown-items">
                        <button
                            className="dropdown-item"
                            onClick={() => handleMenuClick("profile")}
                        >
                            <FaUser className="item-icon" />
                            <span>Edit Profile</span>
                        </button>

                        <button
                            className="dropdown-item"
                            onClick={() => handleMenuClick("dashboard")}
                        >
                            <FaTachometerAlt className="item-icon" />
                            <span>Dashboard</span>
                        </button>

                        <button
                            className="dropdown-item"
                            onClick={() => handleMenuClick("history")}
                        >
                            <FaHistory className="item-icon" />
                            <span>History</span>
                        </button>
                    </div>

                    <hr className="dropdown-divider" />

                    {/* Logout */}
                    <button
                        className="dropdown-item logout-item"
                        onClick={() => handleMenuClick("logout")}
                    >
                        <FaSignOutAlt className="item-icon" />
                        <span>Logout</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;