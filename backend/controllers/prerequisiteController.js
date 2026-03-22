const db = require("../config/db");

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
