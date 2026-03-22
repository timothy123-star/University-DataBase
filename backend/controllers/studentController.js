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

// GET /api/students/:studentId/eligible-sections
exports.getStudentEligibleSections = async (req, res) => {
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
        t.SemesterID,
        t.SemesterName,
        CONCAT(f.FirstName, ' ', f.LastName) AS InstructorName,
        r.RoomNumber,
        r.Building,
        s.Schedule
      FROM Section s
      JOIN Course c ON s.CourseID = c.CourseID
      JOIN Semester t ON s.SemesterID = t.SemesterID
      JOIN Faculty f ON s.InstructorID = f.FacultyID
      LEFT JOIN Room r ON s.RoomID = r.RoomID
      WHERE t.EndDate >= CURDATE()  -- only current/future Semesters
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
};

// Get all enrollments for a student
exports.getStudentEnrollments = async (req, res) => {
  try {
    const studentId = req.params.id;
    const [rows] = await db.query(
      `SELECT 
          e.EnrollmentID,
          e.Grade,
          e.EnrollmentStatus,
          c.CourseCode,
          c.CourseName,
          c.CreditHours,
          s.SectionNumber,
          t.SemesterName AS TermName,   -- assuming the column is SemesterName
          CONCAT(f.FirstName, ' ', f.LastName) AS InstructorName
        FROM Enrollment e
        JOIN Section s ON e.SectionID = s.SectionID
        JOIN Course c ON s.CourseID = c.CourseID
        JOIN Semester t ON s.SemesterID = t.SemesterID   -- ✅ note: no comment inside string
        JOIN Faculty f ON s.InstructorID = f.FacultyID
        WHERE e.StudentID = ?
        ORDER BY t.StartDate DESC, c.CourseCode`,
      [studentId],
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
