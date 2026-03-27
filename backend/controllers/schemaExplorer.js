const db = require("../config/db");

// In your server.js (or appropriate route file)

// GET /api/db/tables – list all tables in the database
exports.getAllTables = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'university_db'",
    );
    res.json(rows.map((row) => row.table_name));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/db/table/:tableName – get all data from a specific table
exports.getAllDataFromTable = async (req, res) => {
  const { tableName } = req.params;
  // Basic security: allow only existing table names (avoid SQL injection)
  const allowedTables = [
    "School",
    "Department",
    "Program",
    "Faculty",
    "Student",
    "Course",
    "Semester",
    "Room",
    "Section",
    "Enrollment",
    "Prerequisite",
  ];
  if (!allowedTables.includes(tableName)) {
    return res.status(400).json({ error: "Invalid table name" });
  }
  try {
    const [rows] = await db.query(`SELECT * FROM ${tableName}`);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
