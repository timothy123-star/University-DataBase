const db = require("../config/db");

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
