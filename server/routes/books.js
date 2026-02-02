const express = require("express");
const axios = require("axios");

const router = express.Router();

const AI_RECOMMENDER_URL = "http://localhost:5002/recommend";

router.post("/search", async (req, res) => {
  try {
    const { field, year, interests } = req.body || {};
    const response = await axios.post(AI_RECOMMENDER_URL, { field, year, interests });
    const books = Array.isArray(response.data?.books) ? response.data.books : [];

    if (books.length === 0) {
      return res.json({ message: "No books found", books: [] });
    }

    return res.json({ books });
  } catch (error) {
    if (error.response) {
      return res.status(200).json({
        message: "AI service error",
        books: [],
        details: error.response.data
      });
    }

    if (error.request) {
      return res.status(200).json({
        message: "AI service unreachable. Start python service on port 5002",
        books: [],
        details: "No response from http://localhost:5002/recommend"
      });
    }

    return res.status(200).json({ message: "AI service error", books: [], details: error.message });
  }
});

// Audio search endpoint - searches by book title or keywords
router.post("/audio-search", async (req, res) => {
  try {
    const { query } = req.body || {};
    if (!query || !String(query).trim()) {
      return res.json({ message: "Please provide a search query", books: [] });
    }

    const response = await axios.post(AI_RECOMMENDER_URL, { query });
    const books = Array.isArray(response.data?.books) ? response.data.books : [];

    if (books.length === 0) {
      return res.json({ message: "No books found", books: [] });
    }

    return res.json({ books: books.map((title) => ({ title })) });
  } catch (error) {
    if (error.response) {
      return res.status(200).json({
        message: "AI service error",
        books: [],
        details: error.response.data
      });
    }

    if (error.request) {
      return res.status(200).json({
        message: "AI service unreachable. Start python service on port 5002",
        books: [],
        details: "No response from http://localhost:5002/recommend"
      });
    }

    return res.status(200).json({ message: "AI service error", books: [], details: error.message });
  }
});

// Text search endpoint - searches by title, field, keywords, and file_name
router.post("/text-search", async (req, res) => {
  try {
    const { query } = req.body || {};
    if (!query || !String(query).trim()) {
      return res.json({ message: "Please provide a search query", books: [] });
    }

    const response = await axios.post(AI_RECOMMENDER_URL, { query });
    const books = Array.isArray(response.data?.books) ? response.data.books : [];

    if (books.length === 0) {
      return res.json({ message: "No books found", books: [] });
    }

    // Preserve the response shape expected by existing client code
    return res.json({ books: books.map((title) => ({ title })) });
  } catch (error) {
    if (error.response) {
      return res.status(200).json({
        message: "AI service error",
        books: [],
        details: error.response.data
      });
    }

    if (error.request) {
      return res.status(200).json({
        message: "AI service unreachable. Start python service on port 5002",
        books: [],
        details: "No response from http://localhost:5002/recommend"
      });
    }

    return res.status(200).json({ message: "AI service error", books: [], details: error.message });
  }
});

module.exports = router;
