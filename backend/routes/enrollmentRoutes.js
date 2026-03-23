const express = require("express");
const router = express.Router();
const db = require("../config/db");
const enrollmentController = require("../controllers/enrollmentController");

router.post("/", enrollmentController.enrollStudent);
// PUT /api/v1/enroll/:enrollmentId/grade
router.put("/:enrollmentId/grade", enrollmentController.updateGrade);

module.exports = router;
