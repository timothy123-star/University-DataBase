const db = require("../config/db");

exports.getAllPrograms = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.ProgramID, p.ProgramName, p.ProgramCode, d.DepartmentID, d.DepartmentName
      FROM Program p
      JOIN Department d ON p.DepartmentID = d.DepartmentID
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
