const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();

const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL, // set this on Render as your Vercel frontend URL
];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// Create MySQL connection pool
const db = mysql
  .createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
      rejectUnauthorized: true, // TiDB Cloud requires SSL [citation:3]
    },
  })
  .promise();

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

// Helper function to check prerequisites
async function checkPrerequisites(studentId, courseId) {
  // Get all prerequisites for this course
  const [prereqs] = await db.query(
    "SELECT PrerequisiteCourseID FROM Prerequisite WHERE CourseID = ?",
    [courseId],
  );

  if (prereqs.length === 0) {
    return { eligible: true, message: "No prerequisites" };
  }

  // Get courses the student has passed (grade C or better)
  // Assuming grades like A, B, C, etc. (not C- etc.)
  const passedGrades = ["A", "B", "C"]; // adjust as needed
  const placeholders = passedGrades.map(() => "?").join(",");
  const [completed] = await db.query(
    `SELECT DISTINCT c.CourseID
     FROM Enrollment e
     JOIN Section s ON e.SectionID = s.SectionID
     JOIN Course c ON s.CourseID = c.CourseID
     WHERE e.StudentID = ? 
       AND e.Grade IN (${placeholders})
       AND e.Grade IS NOT NULL`,
    [studentId, ...passedGrades],
  );

  const completedIds = completed.map((row) => row.CourseID);
  const missingPrereqs = prereqs
    .map((p) => p.PrerequisiteCourseID)
    .filter((pid) => !completedIds.includes(pid));

  if (missingPrereqs.length === 0) {
    return { eligible: true, message: "All prerequisites satisfied" };
  } else {
    // Get course names for missing prerequisites
    const [missingCourses] = await db.query(
      "SELECT CourseCode, CourseName FROM Course WHERE CourseID IN (?)",
      [missingPrereqs],
    );
    return {
      eligible: false,
      message: "Missing prerequisites",
      missing: missingCourses,
    };
  }
}

// Endpoint to check prerequisites
app.post("/api/enroll/check-prerequisites", async (req, res) => {
  try {
    const { studentId, courseId } = req.body;
    const result = await checkPrerequisites(studentId, courseId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get all students (using async/await)
app.get("/api/students", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Student");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get student by ID
app.get("/api/students/:id", async (req, res) => {
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
});

// Add new student
app.post("/api/students", async (req, res) => {
  try {
    const { FirstName, LastName, Email, EnrollmentDate, MajorID, AdvisorID } =
      req.body;
    const [result] = await db.query(
      `INSERT INTO Student (FirstName, LastName, Email, EnrollmentDate, MajorID, AdvisorID, GPA)
       VALUES (?, ?, ?, ?, ?, ?, 0.00)`,
      [
        FirstName,
        LastName,
        Email,
        EnrollmentDate,
        MajorID || null,
        AdvisorID || null,
      ],
    );
    res.status(201).json({ StudentID: result.insertId, ...req.body });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Email already exists" });
    }
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
// Get all courses
app.get("/api/courses", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Course");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Enroll a student in a section (with simplified prerequisite check)
app.post("/api/enroll", async (req, res) => {
  try {
    const { studentId, sectionId } = req.body;

    // First, get the course ID for this section
    const [sectionRows] = await db.query(
      "SELECT CourseID FROM Section WHERE SectionID = ?",
      [sectionId],
    );
    if (sectionRows.length === 0) {
      return res.status(404).json({ error: "Section not found" });
    }
    const courseId = sectionRows[0].CourseID;

    // Check prerequisites
    const prereqCheck = await checkPrerequisites(studentId, courseId);
    if (!prereqCheck.eligible) {
      return res.status(400).json({
        error: "Prerequisites not satisfied",
        details: prereqCheck.missing,
      });
    }

    // Also check if section has capacity
    const [capacityRows] = await db.query(
      "SELECT Capacity, EnrolledCount FROM Section WHERE SectionID = ?",
      [sectionId],
    );
    if (capacityRows.length === 0) {
      return res.status(404).json({ error: "Section not found" });
    }
    const { Capacity, EnrolledCount } = capacityRows[0];
    if (EnrolledCount >= Capacity) {
      return res.status(400).json({ error: "Section is full" });
    }

    // Proceed with enrollment
    const [result] = await db.query(
      `INSERT INTO Enrollment (StudentID, SectionID, EnrollmentDate, EnrollmentStatus)
       VALUES (?, ?, CURDATE(), "Enrolled")`,
      [studentId, sectionId],
    );

    // Update EnrolledCount in Section (denormalized field)
    await db.query(
      "UPDATE Section SET EnrolledCount = EnrolledCount + 1 WHERE SectionID = ?",
      [sectionId],
    );

    res.json({ success: true, enrollmentId: result.insertId });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ error: "Student already enrolled in this section" });
    }
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
// ==================== COURSES ====================

// Get all courses (already exists, but we'll keep it)
// GET /api/courses

// Get a single course by ID
app.get("/api/courses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT c.*, d.DepartmentName 
       FROM Course c
       JOIN Department d ON c.DepartmentID = d.DepartmentID
       WHERE c.CourseID = ?`,
      [id],
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== SECTIONS ====================

// Get all sections (with course, term, instructor details)
app.get("/api/sections", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, 
             c.CourseCode, c.CourseName,
             t.TermName,
             CONCAT(f.FirstName, ' ', f.LastName) AS InstructorName,
             r.RoomNumber, r.Building
      FROM Section s
      JOIN Course c ON s.CourseID = c.CourseID
      JOIN Term t ON s.TermID = t.TermID
      JOIN Faculty f ON s.InstructorID = f.FacultyID
      LEFT JOIN Room r ON s.RoomID = r.RoomID
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get sections for a specific course in a term
app.get("/api/courses/:courseId/sections", async (req, res) => {
  try {
    const { courseId } = req.params;
    const { termId } = req.query; // optional term filter
    let query = `
      SELECT s.*, 
             t.TermName,
             CONCAT(f.FirstName, ' ', f.LastName) AS InstructorName,
             r.RoomNumber, r.Building
      FROM Section s
      JOIN Term t ON s.TermID = t.TermID
      JOIN Faculty f ON s.InstructorID = f.FacultyID
      LEFT JOIN Room r ON s.RoomID = r.RoomID
      WHERE s.CourseID = ?
    `;
    const params = [courseId];
    if (termId) {
      query += " AND s.TermID = ?";
      params.push(termId);
    }
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== ENROLLMENTS ====================

// Get all enrollments for a student
app.get("/api/students/:studentId/enrollments", async (req, res) => {
  try {
    const { studentId } = req.params;
    const [rows] = await db.query(
      `
      SELECT e.*, 
             s.SectionNumber,
             c.CourseCode, c.CourseName,
             t.TermName,
             CONCAT(f.FirstName, ' ', f.LastName) AS InstructorName
      FROM Enrollment e
      JOIN Section sec ON e.SectionID = sec.SectionID
      JOIN Course c ON sec.CourseID = c.CourseID
      JOIN Term t ON sec.TermID = t.TermID
      JOIN Faculty f ON sec.InstructorID = f.FacultyID
      WHERE e.StudentID = ?
      ORDER BY t.StartDate DESC
    `,
      [studentId],
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== FACULTY ====================

// Get all faculty
app.get("/api/faculty", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT f.*, d.DepartmentName
      FROM Faculty f
      JOIN Department d ON f.DepartmentID = d.DepartmentID
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== PROGRAMS ====================

// Get all programs
app.get("/api/programs", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, d.DepartmentName
      FROM Program p
      JOIN Department d ON p.DepartmentID = d.DepartmentID
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/students/:id/profile - returns student details + enrollments
app.get("/api/students/:id/profile", async (req, res) => {
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
         t.TermName,
         CONCAT(f.FirstName, ' ', f.LastName) AS InstructorName
       FROM Enrollment e
       JOIN Section s ON e.SectionID = s.SectionID
       JOIN Course c ON s.CourseID = c.CourseID
       JOIN Term t ON s.TermID = t.TermID
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
});

// GET /api/analytics/department-gpa - returns average GPA per department
app.get("/api/analytics/department-gpa", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        d.DepartmentName,
        AVG(s.GPA) AS AvgGPA,
        COUNT(s.StudentID) AS StudentCount
      FROM Department d
      LEFT JOIN Program p ON d.DepartmentID = p.DepartmentID
      LEFT JOIN Student s ON s.MajorID = p.ProgramID
      GROUP BY d.DepartmentID
      ORDER BY AvgGPA DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/program-enrollment - students per program
app.get("/api/analytics/program-enrollment", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.ProgramName,
        COUNT(s.StudentID) AS StudentCount
      FROM Program p
      LEFT JOIN Student s ON p.ProgramID = s.MajorID
      GROUP BY p.ProgramID
      ORDER BY StudentCount DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/students/:studentId/eligible-sections
app.get("/api/students/:studentId/eligible-sections", async (req, res) => {
  try {
    const studentId = req.params.studentId;

    // 1. Get all sections with details
    const [allSections] = await db.query(`
      SELECT 
        s.SectionID,
        s.SectionNumber,
        s.Capacity,
        s.EnrolledCount,
        c.CourseID,
        c.CourseCode,
        c.CourseName,
        c.CreditHours,
        t.TermID,
        t.TermName,
        CONCAT(f.FirstName, ' ', f.LastName) AS InstructorName,
        r.RoomNumber,
        r.Building,
        s.Schedule
      FROM Section s
      JOIN Course c ON s.CourseID = c.CourseID
      JOIN Term t ON s.TermID = t.TermID
      JOIN Faculty f ON s.InstructorID = f.FacultyID
      LEFT JOIN Room r ON s.RoomID = r.RoomID
      WHERE t.EndDate >= CURDATE()  -- only current/future terms
    `);

    // 2. Get student's completed courses (with grade A, B, C)
    const [completedCourses] = await db.query(
      `
      SELECT DISTINCT c.CourseID
      FROM Enrollment e
      JOIN Section s ON e.SectionID = s.SectionID
      JOIN Course c ON s.CourseID = c.CourseID
      WHERE e.StudentID = ? AND e.Grade IN ('A','B','C')
    `,
      [studentId],
    );
    const completedIds = completedCourses.map((row) => row.CourseID);

    // 3. Get student's current enrollments (to exclude)
    const [enrolledSections] = await db.query(
      "SELECT SectionID FROM Enrollment WHERE StudentID = ?",
      [studentId],
    );
    const enrolledSectionIds = enrolledSections.map((row) => row.SectionID);

    // 4. For each section, check prerequisites and availability
    const eligibleSections = [];

    for (const sec of allSections) {
      // Skip if already enrolled
      if (enrolledSectionIds.includes(sec.SectionID)) continue;

      // Skip if no seats
      if (sec.EnrolledCount >= sec.Capacity) continue;

      // Check prerequisites
      const [prereqs] = await db.query(
        "SELECT PrerequisiteCourseID FROM Prerequisite WHERE CourseID = ?",
        [sec.CourseID],
      );
      const prereqIds = prereqs.map((p) => p.PrerequisiteCourseID);

      // If there are prerequisites, all must be in completedIds
      const missingPrereqs = prereqIds.filter(
        (pid) => !completedIds.includes(pid),
      );
      if (missingPrereqs.length > 0) {
        // Optionally store missing names for display
        continue; // skip this section
      }

      // All checks passed – include this section
      eligibleSections.push({
        ...sec,
        AvailableSeats: sec.Capacity - sec.EnrolledCount,
      });
    }

    res.json(eligibleSections);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
