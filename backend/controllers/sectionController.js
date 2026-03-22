const db = require("../config/db");

// ==================== SECTIONS ====================

// Get all sections (with course, Semester, instructor details)
app.get("/api/sections", async (req, res) => {
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
});

// Get sections for a specific course in a Semester
app.get("/api/courses/:courseId/sections", async (req, res) => {
  try {
    const { courseId } = req.params;
    const { SemesterId } = req.query; // optional Semester filter
    let query = `
      SELECT s.*, 
             t.SemesterName,
             CONCAT(f.FirstName, ' ', f.LastName) AS InstructorName,
             r.RoomNumber, r.Building
      FROM Section s
      JOIN Semester t ON s.SemesterID = t.SemesterID
      JOIN Faculty f ON s.InstructorID = f.FacultyID
      LEFT JOIN Room r ON s.RoomID = r.RoomID
      WHERE s.CourseID = ?
    `;
    const params = [courseId];
    if (SemesterId) {
      query += " AND s.SemesterID = ?";
      params.push(SemesterId);
    }
    const [rows] = await db.query(query, params);
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
});
