const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

router.get("/", studentController.getAllStudents);
// router.get("/:id", studentController.getStudentById);
// router.get("/:id/profile", studentController.getStudentProfile);
router.post("/", studentController.createStudent);

module.exports = router;
