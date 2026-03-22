const db = require("../config/db");

exports.getAllFaculty = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT f.FacultyID, f.FirstName, f.LastName, f.Email, d.DepartmentID, d.DepartmentName
      FROM Faculty f
      JOIN Department d ON f.DepartmentID = d.DepartmentID
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
