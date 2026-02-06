const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json());

// DB connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "quiz_app"
});

// Fetch questions from OpenTDB and save to DB
app.get("/api/questions", async (req, res) => {
  try {
    const response = await fetch("https://opentdb.com/api.php?amount=5&type=multiple");
    const data = await response.json();

    // Clear old questions
    db.query("DELETE FROM questions");

    // Insert new questions
    data.results.forEach(q => {
      db.query(
        "INSERT INTO questions (question, correct_answer, incorrect_answers) VALUES (?, ?, ?)",
        [q.question, q.correct_answer, JSON.stringify(q.incorrect_answers)]
      );
    });

    res.json(data.results);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// Save score to DB
app.post("/api/score", (req, res) => {
  const { score } = req.body;
  db.query("INSERT INTO scores (score) VALUES (?)", [score]);
  res.json({ message: "Score saved" });
});

app.listen(3000, () => {
  console.log("Backend running at http://localhost:3000");
});
