const db = require("../config/db");
const generateMatricNo = require("../utils/generateMatricNo");

exports.getAllStudents = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Student");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get student by ID
// app.get("/api/students/:id", async (req, res) => {
//   try {
//     const [rows] = await db.query("SELECT * FROM Student WHERE StudentID = ?", [
//       req.params.id,
//     ]);
//     if (rows.length === 0) {
//       return res.status(404).json({ error: "Student not found" });
//     }
//     res.json(rows[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

exports.createStudent = async (req, res) => {
  const { FirstName, LastName, Email, EnrollmentDate, ProgramID, AdvisorID } =
    req.body;
  try {
    const MatricNo = await generateMatricNo();
    const [result] = await db.query(
      `INSERT INTO Student (MatricNo, FirstName, LastName, Email, EnrollmentDate, ProgramID, AdvisorID, GPA)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0.00)`,
      [
        MatricNo,
        FirstName,
        LastName,
        Email,
        EnrollmentDate,
        ProgramID || null,
        AdvisorID || null,
      ],
    );
    res.status(201).json({ StudentID: result.insertId, MatricNo });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ error: "Email or MatricNo already exists" });
    }
    res.status(500).json({ error: err.message });
  }
};
