const db = require("../config/db");

// GET /api/analytics/department-gpa - returns average GPA per department
exports.analyticsDepartmentGpa = async (req, res) => {
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
};

// GET /api/analytics/program-enrollment - students per program
exports.analyticsProgramEnrollment = async (req, res) => {
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
};
