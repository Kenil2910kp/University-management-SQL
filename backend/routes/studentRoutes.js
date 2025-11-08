const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

router.get("/dashboard",studentController.getdashboard);

// Dashboard: grades + attendance
router.get("/:student_id/dashboard", studentController.getstudent);

// Attendance history
router.get("/:student_id/attendance", studentController.getAttendance);

// Grades
router.get("/:student_id/grades", studentController.getGrades);

module.exports = router;
