const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Create MySQL connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

// Get all students
app.get("/api/students", (req, res) => {
  db.query("SELECT * FROM Student", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get a single student by ID
app.get("/api/students/:id", (req, res) => {
  const { id } = req.params;
  db.query(
    "SELECT * FROM Student WHERE StudentID = ?",
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0)
        return res.status(404).json({ error: "Student not found" });
      res.json(results[0]);
    },
  );
});

// Get all courses
app.get("/api/courses", (req, res) => {
  db.query("SELECT * FROM Course", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Enroll a student in a section (with prerequisite check - simplified)
app.post("/api/enroll", (req, res) => {
  const { studentId, sectionId } = req.body;
  // Basic check: ensure student exists and section exists, then insert
  // For now, simple insert; you can add prerequisite logic later
  db.query(
    'INSERT INTO Enrollment (StudentID, SectionID, EnrollmentDate, EnrollmentStatus) VALUES (?, ?, CURDATE(), "Enrolled")',
    [studentId, sectionId],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res
            .status(400)
            .json({ error: "Student already enrolled in this section" });
        }
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, enrollmentId: result.insertId });
    },
  );
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
