const db = require("../config/db");
const generateMatricNo = require("../utils/generateMatricNo");

exports.getAllStudents = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Student");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get student by ID
exports.getStudentById = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Student WHERE StudentID = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.createStudent = async (req, res) => {
  const { FirstName, LastName, Email, EnrollmentDate, ProgramID, AdvisorID } =
    req.body;
  try {
    const MatricNo = await generateMatricNo();

    // If EnrollmentDate is not provided, we'll pass NULL so MySQL's COALESCE uses CURDATE()
    const enrollmentDate = EnrollmentDate || null;

    const [result] = await db.query(
      `INSERT INTO Student 
        (MatricNo, FirstName, LastName, Email, EnrollmentDate, ProgramID, AdvisorID, GPA)
       VALUES (?, ?, ?, ?, COALESCE(?, CURDATE()), ?, ?, 0.00)`,
      [
        MatricNo,
        FirstName,
        LastName,
        Email,
        enrollmentDate,
        ProgramID || null,
        AdvisorID || null,
      ],
    );

    res.status(201).json({ StudentID: result.insertId, MatricNo });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ error: "Email or MatricNo already exists" });
    }
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/students/:id/profile - returns student details + enrollments
exports.getStudentProfile = async (req, res) => {
  try {
    const studentId = req.params.id;

    // 1. Get student personal info
    const [studentRows] = await db.query(
      "SELECT StudentID, FirstName, LastName, Email, GPA FROM Student WHERE StudentID = ?",
      [studentId],
    );
    if (studentRows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
    const student = studentRows[0];

    // 2. Get enrollments with course and section details
    const [enrollments] = await db.query(
      `SELECT 
         e.EnrollmentID,
         e.Grade,
         e.EnrollmentStatus,
         c.CourseCode,
         c.CourseName,
         c.CreditHours,
         s.SectionNumber,
         t.SemesterName,
         CONCAT(f.FirstName, ' ', f.LastName) AS InstructorName
       FROM Enrollment e
       JOIN Section s ON e.SectionID = s.SectionID
       JOIN Course c ON s.CourseID = c.CourseID
       JOIN Semester t ON s.SemesterID = t.SemesterID
       JOIN Faculty f ON s.InstructorID = f.FacultyID
       WHERE e.StudentID = ?
       ORDER BY t.StartDate DESC, c.CourseCode`,
      [studentId],
    );

    // 3. Combine and send
    res.json({
      student,
      enrollments,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
