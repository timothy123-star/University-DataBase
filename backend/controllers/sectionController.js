const db = require("../config/db");

// ==================== SECTIONS ====================

// Get all sections (with course, Semester, instructor details)
exports.getAllSections = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, 
             c.CourseCode, c.CourseName,
             t.SemesterName,
             CONCAT(f.FirstName, ' ', f.LastName) AS InstructorName,
             r.RoomNumber, r.Building
      FROM Section s
      JOIN Course c ON s.CourseID = c.CourseID
      JOIN Semester t ON s.SemesterID = t.SemesterID
      JOIN Faculty f ON s.InstructorID = f.FacultyID
      LEFT JOIN Room r ON s.RoomID = r.RoomID
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
