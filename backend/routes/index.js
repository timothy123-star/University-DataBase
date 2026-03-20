const express = require("express");
const router = express.Router();

router.use("/students", require("./studentRoutes"));
// router.use("/enroll", require("./enrollmentRoutes"));
// router.use("/courses", require("./courseRoutes"));
// router.use("/analytics", require("./analyticsRoutes"));
// router.use("/programs", require("./programRoutes"));
// router.use("/faculty", require("./facultyRoutes"));
// router.use("/sections", require("./sectionRoutes"));

module.exports = router;
