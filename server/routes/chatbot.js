const express = require("express");
const bookContent = require("../utils/bookContent");
const findAnswer = require("../utils/answerFinder");

const router = express.Router();

/**
 * GET available books (simulating purchased books)
 */
router.get("/books", (req, res) => {
  res.json({
    books: Object.keys(bookContent),
  });
});

/**
 * POST ask question
 * Body: { book: string, question: string }
 */
router.post("/ask", (req, res) => {
  const { book, question } = req.body;

  // Validate input
  if (!book || !question) {
    return res.json({
      answer: "Please select a book and ask a question.",
    });
  }

  const content = bookContent[book];

  // Validate book
  if (!content) {
    return res.json({
      answer: "Selected book is not available.",
    });
  }

  // Find answer from book content only
  const answer = findAnswer(content, question);

  if (!answer) {
    return res.json({
      answer: "This information is not available in the selected book.",
    });
  }

  res.json({ answer });
});

module.exports = router;
