const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Get all PDF files from /server/ai/books directory
router.get("/all-books", (req, res) => {
  try {
    const booksDir = path.join(__dirname, "../ai/books");
    
    if (!fs.existsSync(booksDir)) {
      return res.status(200).json({
        books: [],
        message: "Books directory not found"
      });
    }

    const files = fs.readdirSync(booksDir);
    const pdfFiles = files
      .filter(file => file.toLowerCase().endsWith('.pdf'))
      .map(file => ({
        title: file.replace(/\.pdf$/i, ''),
        filename: file
      }));

    return res.json({ books: pdfFiles });
  } catch (error) {
    return res.status(200).json({
      books: [],
      message: "Error reading books directory",
      error: error.message
    });
  }
});

router.get("/search", async (req, res) => {
  try {
    const response = await axios.post("http://localhost:5002/recommend", req.query);
    const rawBooks = Array.isArray(response.data?.books) ? response.data.books : [];
    const books = rawBooks.map((b) => (typeof b === "string" ? { title: b } : { title: b?.title || String(b) }));
    return res.json({ books });
  } catch (error) {
    if (error.response) {
      return res.status(200).json({
        books: [],
        message: "AI service error",
        details: error.response.data
      });
    }

    if (error.request) {
      return res.status(200).json({
        books: [],
        message: "AI service unreachable. Start python service on port 5002",
        details: "No response from http://localhost:5002/recommend"
      });
    }

    return res.status(200).json({
      books: [],
      message: "AI service error",
      details: error.message
    });
  }
});

module.exports = router;
