const express = require("express");
const app = express();
const cors = require("cors");

const studentRoutes = require("./routes/studentRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const courseRoutes = require("./routes/courseRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const programRoutes = require("./routes/programRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const sectionRoutes = require("./routes/sectionRoutes");

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL, // set this on Render as your Vercel frontend URL
];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// Test route
app.get("/api/v1/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

app.use("/api/v1/students", studentRoutes);
// app.use("/api/v1/enroll", enrollmentRoutes);
// app.use("/api/v1/courses", courseRoutes);
// app.use("/api/v1/analytics", analyticsRoutes);
// app.use("/api/v1/programs", programRoutes);
// app.use("/api/v1/faculty", facultyRoutes);
// app.use("/api/v1/sections", sectionRoutes);

module.exports = app;
