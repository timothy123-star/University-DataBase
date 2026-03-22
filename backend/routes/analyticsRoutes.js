const express = require("express");
const router = express.Router();

const analyticController = require("../controllers/analyticsController");

router.get("/department-gpa", analyticController.analyticsDepartmentGpa);

router.get(
  "/program-enrollment",
  analyticController.analyticsProgramEnrollment,
);

module.exports = router;
