const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   AUTH APIs
========================= */

app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  await pool.query(
    "INSERT INTO users(username, password) VALUES($1,$2)",
    [username, hashedPassword]
  );

  res.send("User created");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const result = await pool.query(
    "SELECT * FROM users WHERE username=$1",
    [username]
  );

  if (result.rows.length === 0) {
    return res.send("Invalid credentials");
  }

  const user = result.rows[0];
  const match = await bcrypt.compare(password, user.password);

  if (match) {
    res.send("Login successful");
  } else {
    res.send("Invalid credentials");
  }
});

/* =========================
   STUDENTS CRUD
========================= */

app.post("/students", async (req, res) => {
  const { name, email, course } = req.body;

  await pool.query(
    "INSERT INTO students(name,email,course) VALUES($1,$2,$3)",
    [name, email, course]
  );

  res.send("Student added");
});

app.get("/students", async (req, res) => {
  const result = await pool.query("SELECT * FROM students");
  res.json(result.rows);
});

app.put("/students/:id", async (req, res) => {
  const { name, email, course } = req.body;
  const id = req.params.id;

  await pool.query(
    "UPDATE students SET name=$1,email=$2,course=$3 WHERE id=$4",
    [name, email, course, id]
  );

  res.send("Student updated");
});

app.delete("/students/:id", async (req, res) => {
  const id = req.params.id;

  await pool.query("DELETE FROM students WHERE id=$1", [id]);

  res.send("Student deleted");
});

/* ========================= */

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
