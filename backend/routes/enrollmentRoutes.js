const express = require("express");
const router = express.Router();
const db = require("../config/db");

// PUT /api/v1/enroll/:enrollmentId/grade
router.put("/:enrollmentId/grade", async (req, res) => {
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
});

module.exports = router;
