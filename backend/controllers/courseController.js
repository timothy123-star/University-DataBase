// ==================== COURSES ====================
// Get all courses
app.get("/api/courses", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Course");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get a single course by ID
app.get("/api/courses/:id", async (req, res) => {
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
});
