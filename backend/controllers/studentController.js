const db = require("../db");
const queries = require("../queries");

exports.getdashboard=async(req,res)=>{
    try {
        const [rows] = await db.query(queries. getAllStudents);
        res.json(rows);
      } catch (err) {
        res.status(500).send("Error fetching dashboards");
      }
}

exports.getstudent = async (req, res) => {
  const { student_id } = req.params;
  console.log(student_id);

  try {
    const [rows] = await db.query(queries.studentDashboard, [student_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).send("Error fetching dashboard");
  }  
};

exports.getAttendance = async (req, res) => {
  const { student_id } = req.params;

  try {
    const [rows] = await db.query(queries.getAttendancePercentage, [student_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).send("Error fetching attendance");
  }
};

exports.getGrades = async (req, res) => {
  const { student_id } = req.params;

  try {
    const [rows] = await db.query(queries.getGradesByStudent, [student_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).send("Error fetching grades");
  }
};
