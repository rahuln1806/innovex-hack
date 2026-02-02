import { useEffect, useState } from "react";
import axios from "axios";
import { FaRobot, FaTimes } from "react-icons/fa";
import "./FloatingChatbot.css";

const FloatingChatbot = () => {
  const [open, setOpen] = useState(false);
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/chatbot/books")
      .then(res => setBooks(res.data.books))
      .catch(() => {});
  }, []);

  const askBruno = async () => {
    if (!selectedBook || !question) return;

    const res = await axios.post(
      "http://localhost:5000/chatbot/ask",
      { book: selectedBook, question }
    );

    setAnswer(res.data.answer);
  };

  return (
    <>
      {/* Floating Icon */}
      <div className="bruno-icon" onClick={() => setOpen(!open)}>
        {open ? <FaTimes /> : <FaRobot />}
      </div>

      {/* Chat Window */}
      {open && (
        <div className="bruno-window">
          <div className="bruno-header">
            <h3>Bruno 🤖</h3>
            <p>Your Study Companion</p>
          </div>

          <div className="bruno-body">
            <select
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
            >
              <option value="">Select a Book</option>
              {books.map(book => (
                <option key={book} value={book}>
                  {book}
                </option>
              ))}
            </select>
            <p style={{ color: "green" }}>
  Selected Book: {selectedBook || "None"}
</p>


            <input
              type="text"
              placeholder="What are you looking for?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />

            <button onClick={askBruno}>Ask Bruno</button>

            {answer && (
              <div className="bruno-answer">
                <strong>Bruno:</strong>
                <p>{answer}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatbot;
