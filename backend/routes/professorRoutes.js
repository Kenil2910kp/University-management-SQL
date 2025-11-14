const express = require("express");
const router = express.Router();
const professorController = require("../controllers/professorController");


// get courses taught by a professor
router.get("/:professor_id/courses", professorController.getProfessorDivisions);


// Get students of a course
router.get("/course/:course_id/students", professorController.getStudentsByCourseId);

router.post("/insertstudent",professorController.insertStudent);

router.get("/searchstudent/:id",professorController.searchStudent);

router.post("/updatestudent",professorController.updateStudent);

router.post("/insertAttendance",professorController.insertAttendance);

// Update attendance
router.post("/attendance/update", professorController.updateAttendance);

router.get("/getAttendance/:course_id", professorController.getAttendance);

router.get("/getAttendanceByStudent/:student_id/:course_id", professorController.getAttendanceByStudentCourse);

router.get("/studentsData/:course_id",professorController.getStudentsData);

router.get("/getGrades/:course_id/:student_id", professorController.getGrades);

router.post("/insertGrades",professorController.insertGrade);

// Update grades
router.post("/grades/update", professorController.updateGrades);

// Performance analytics
router.get("/course/:course_id/performance", professorController.getCoursePerformance);

module.exports = router;
