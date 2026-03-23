const db = require("../config/db");

// // Endpoint to check prerequisites
// app.post("/api/enroll/check-prerequisites", async (req, res) => {
//   try {
//     const { studentId, courseId } = req.body;
//     const result = await checkPrerequisites(studentId, courseId);
//     res.json(result);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });
