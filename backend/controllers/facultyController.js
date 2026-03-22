const db = require("../config/db");

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
