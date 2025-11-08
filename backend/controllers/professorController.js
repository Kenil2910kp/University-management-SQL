const db = require("../db");
const queries = require("../queries");



exports.getProfessorDivisions = async (req, res) => {
  const { professor_id } = req.params;

  try {
    const [rows] = await db.query(queries.getProfessorDivisions, [professor_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).send("Error fetching courses");
  }
};

exports.getStudentsData = async (req, res) => {
  const{ course_id}=req.params;
  try {
    const [rows] = await db.query(queries.getStudentsData, [course_id,course_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).send("Error fetching students data");
  }

};

exports.getStudentsDataById = async (req, res) => {
  const{ course_id,student_id}=req.params;
  try {
    const [rows] = await db.query(queries.getStudentsDataById, [course_id,course_id,student_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).send("Error fetching student data");
  }
};

exports.getStudentsByCourseId = async (req, res) => {
  const { course_id } = req.params;

  try {
    const [rows] = await db.query(queries.getStudentsByCourseId, [course_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).send("Error fetching students");
  }
};



exports.insertStudent=async(req,res)=>{
    const {student_id, first_name,last_name, email, department,division} = req.body;
    try {
        await db.query(queries.insertStudent, [student_id,first_name,last_name, email,department,division]);
        res.send("Student inserted");
      } catch (err) {
        res.status(500).send("Error inserting student");
      }
    
};

exports.searchStudent=async(req,res)=>{
 const {id}=req.params;
  try {
      const [rows] = await db.query(queries.searchStudent, [id]);
      res.json(rows);
    } catch (err) {
      res.status(500).send("Error searching student");
    }
};

exports.updateStudent=async(req,res)=>{
    const {student_id, first_name,last_name, email, department,division} = req.body;
    try {
        await db.query(queries.updateStudent, [first_name,last_name, email, department,division,student_id]);
        res.send("Student updated");
      } catch (err) {
        res.status(500).send("Error updating student");
      }
}


exports.getStudentsByCourseId = async (req, res) => {
  const { course_id } = req.params;

  try {
    const [rows] = await db.query(queries.getStudentsByCourseId, [course_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).send("Error fetching students");
  }
};

exports.insertAttendance = async (req, res) => {
    const { student_id, course_id,status } = req.body;
    try {
      await db.query(queries.insertAttendance, [ student_id, course_id, status ]);
      res.send("Attendance inserted");
    } catch (err) {
      res.status(500).send("Error inserting attendance");
    }
 
};

exports.updateAttendance = async (req, res) => {
  const { student_id, course_id, date, status } = req.body;

  try {
    await db.query(queries.insertAttendance, [
      student_id,
      course_id,
      date,
      status
    ]);
    res.send("Attendance updated");
  } catch (err) {
    res.status(500).send("Error updating attendance");
  }
};

exports.getAttendance = async (req, res) => {
  const { course_id } = req.params;

  try {
    const [rows] = await db.query(queries.getAttendance, [course_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).send("Error fetching attendance");
  }

}

exports.getAttendanceByStudentCourse = async (req, res) => {
  const { student_id, course_id } = req.params;

  try {
    const [rows] = await db.query(queries.getAttendanceByStudentCourse, [
      student_id,
      course_id
    ]);
    res.json(rows);
  } catch (err) {
    res.status(500).send("Error fetching attendance");
  }
}
 exports.getGrades = async (req, res) => {
  const { course_id, student_id } = req.params;

  try {
    const [rows] = await db.query(queries.getGrades, [student_id, course_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).send("Error fetching grades");
  }
 };


exports.insertGrade = async (req, res) => {
  const { student_id, course_id, mid_sem, internal, end_sem } = req.body;

  try {
    await db.query(queries.insertGrade, [
      student_id,
      course_id,
      mid_sem,
      internal,
      end_sem 
    ]);
    res.send("Grades updated");
  } catch (err) {
    res.status(500).send("Error updating grades");
  }
};


exports.updateGrades = async (req, res) => {
  const { student_id, course_id, mid_sem, internal, end_sem } = req.body;

  try {
    await db.query(queries.updateGrade, [
      mid_sem,
      internal,
      end_sem,
      student_id,
      course_id
    ]);
    res.send("Grades updated");
  } catch (err) {
    res.status(500).send("Error updating grades");
  }
};

exports.getCoursePerformance = async (req, res) => {
  const { course_id } = req.params;

  try {
    const [rows] = await db.query(queries.topStudentsInCourse, [course_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).send("Error fetching performance");
  }
};
