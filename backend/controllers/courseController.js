// ==================== COURSES ====================
// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Course");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get a single course by ID
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT c.*, d.DepartmentName 
       FROM Course c
       JOIN Department d ON c.DepartmentID = d.DepartmentID
       WHERE c.CourseID = ?`,
      [id],
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get sections for a specific course in a Semester
exports.getCourseSections = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { SemesterId } = req.query; // optional Semester filter
    let query = `
      SELECT s.*, 
             t.SemesterName,
             CONCAT(f.FirstName, ' ', f.LastName) AS InstructorName,
             r.RoomNumber, r.Building
      FROM Section s
      JOIN Semester t ON s.SemesterID = t.SemesterID
      JOIN Faculty f ON s.InstructorID = f.FacultyID
      LEFT JOIN Room r ON s.RoomID = r.RoomID
      WHERE s.CourseID = ?
    `;
    const params = [courseId];
    if (SemesterId) {
      query += " AND s.SemesterID = ?";
      params.push(SemesterId);
    }
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
