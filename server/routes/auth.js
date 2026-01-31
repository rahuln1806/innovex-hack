const express = require("express");
const jwt = require("jsonwebtoken");
const pool = require("../utils/db");

const router = express.Router();

const JWT_SECRET = "supersecretkey";

/* TEST DATABASE CONNECTION */
router.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ 
      message: "Database connection successful",
      timestamp: result.rows[0].now 
    });
  } catch (err) {
    console.error("Database connection test error:", err);
    res.status(500).json({ 
      message: "Database connection failed",
      error: err.message,
      code: err.code
    });
  }
});

/* LOGIN */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log("Login attempt for username:", username);

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // Query user from database (table: users, columns: id, username, password)
    let result;
    try {
      result = await pool.query(
        "SELECT id, username, password FROM users WHERE username = $1",
        [username]
      );
      console.log("Database query executed. Found rows:", result.rows.length);
    } catch (dbError) {
      console.error("Database query error:", dbError);
      // Check if it's a connection error or table doesn't exist
      if (dbError.code === "42P01") {
        return res.status(500).json({ 
          message: "Database table 'users' does not exist. Please create it first." 
        });
      }
      if (dbError.code === "28P01" || dbError.code === "3D000") {
        return res.status(500).json({ 
          message: "Database connection error. Please check your database credentials." 
        });
      }
      throw dbError; // Re-throw if it's a different error
    }

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const user = result.rows[0];

    // Check if password field exists and is not null
    if (!user.password) {
      console.error("User password is null or undefined");
      return res.status(500).json({ message: "User password not found in database" });
    }

    // Verify password directly (plain text comparison)
    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Return success response
    console.log("Login successful for user:", user.username);
    res.json({
      message: "Login successful",
      token,
      username: user.username,
      id: user.id,
    });
  } catch (err) {
    console.error("Login error:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({ 
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
});

module.exports = router;
