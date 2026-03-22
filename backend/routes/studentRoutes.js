const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

router.get("/", studentController.getAllStudents);
router.get("/:id", studentController.getStudentById);
router.get("/:id/profile", studentController.getStudentProfile);
router.get(
  "/:studentId/eligible-sections",
  studentController.getStudentEligibleSections,
);
router.get("/:id/enrollments", studentController.getStudentEnrollments);

router.post("/", studentController.createStudent);

module.exports = router;
