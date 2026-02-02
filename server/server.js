require("dotenv").config();
const express = require("express");
const cors = require("cors");
const aiBooksRoute = require("./routes/aiBooks");
const authRoutes = require("./routes/auth");
const booksRoute = require("./routes/books");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/ai-books", aiBooksRoute);
app.use("/books", booksRoute);
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Backend running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
