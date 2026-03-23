const db = require("../config/db");
const checkPrerequisites = require("../utils/checkPrerequisites");

// Enroll a student in a section (with simplified prerequisite check)
exports.enrollStudent = async (req, res) => {
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
};

exports.updateGrade = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { grade } = req.body;
    // Ensure grade is valid (optional: check against allowed grades)
    const [result] = await db.query(
      "UPDATE Enrollment SET Grade = ? WHERE EnrollmentID = ?",
      [grade, enrollmentId],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Enrollment not found" });
    }
    res.json({
      success: true,
      message: "Grade updated. GPA trigger will fire automatically.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ==================== ENROLLMENTS ====================
