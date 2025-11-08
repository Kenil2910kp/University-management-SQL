
// module.exports = {
  
//     getAllStudents: `
//       SELECT * FROM Students;
//     `,
  
//     getStudentById: `
//       SELECT * FROM Students WHERE student_id = ?;
//     `,
  
//     searchStudentByName: `
//       SELECT * FROM Students
//       WHERE first_name LIKE ? OR last_name LIKE ?;
//     `,
  
//     insertStudent: `
//       INSERT INTO Students (student_id,first_name, last_name, email, department)
//       VALUES (?, ?, ?, ?, ?);
//     `,
  
//     updateStudent: `
//       UPDATE Students
//       SET first_name = ?, last_name = ?, email = ?, department = ?, year = ?
//       WHERE student_id = ?;
//     `,
  
//     deleteStudent: `
//       DELETE FROM Students WHERE student_id = ?;
//     `,

//     // PROFESSOR QUERIES

//     getAllProfessors: `
//       SELECT * FROM Professors;
//     `,
  
//     getProfessorCourses: `
//       SELECT c.course_id, c.name, c.credits
//       FROM Courses c
//       WHERE c.professor_id = ?;
//     `,
  
   
//     // COURSE QUERIES

//     getAllCourses: `
//       SELECT c.course_id, c.name, c.credits, p.first_name AS professor
//       FROM Courses c
//       JOIN Professors p ON c.professor_id = p.professor_id;
//     `,
  
//     getStudentsInCourse: `
//       SELECT s.student_id, s.first_name, s.last_name
//       FROM Enrollments e
//       JOIN Students s ON e.student_id = s.student_id
//       WHERE e.course_id = ?;
//     `,
  
//     // =======================
//     // ATTENDANCE QUERIES
//     // =======================
//     insertAttendance: `
//       INSERT INTO Attendance (student_id, course_id, date, status)
//       VALUES (?, ?, ?, ?);
//     `,
  
//     getAttendanceByStudentCourse: `
//       SELECT a.date, a.status
//       FROM Attendance a
//       WHERE a.student_id = ? AND a.course_id = ?
//       ORDER BY a.date;
//     `,
  
//     getAttendancePercentage: `
//       SELECT course_id,
//              SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS attendance_percent
//       FROM Attendance
//       WHERE student_id = ?
//       GROUP BY course_id;
//     `,
  
//     getLowAttendanceStudents: `
//       SELECT s.student_id, s.first_name, s.last_name, a.course_id,
//              SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS attendance_percent
//       FROM Attendance a
//       JOIN Students s ON a.student_id = s.student_id
//       GROUP BY s.student_id, a.course_id
//       HAVING attendance_percent < 80;
//     `,

//     // GRADE QUERIES

//     insertGrade: `
//       INSERT INTO Grades (student_id, course_id, mid_sem, internal, end_sem)
//       VALUES (?, ?, ?, ?, ?);
//     `,
  
//     updateGrade: `
//       UPDATE Grades
//       SET mid_sem = ?, internal = ?, end_sem = ?
//       WHERE student_id = ? AND course_id = ?;
//     `,
  
//     getGradesByStudent: `
//       SELECT c.name AS course, g.mid_sem, g.internal, g.end_sem
//       FROM Grades g
//       JOIN Courses c ON g.course_id = c.course_id
//       WHERE g.student_id = ?;
//     `,
  
//     getTotalMarksByStudent: `
//       SELECT c.name AS course,
//              g.mid_sem + g.internal + g.end_sem AS total_marks
//       FROM Grades g
//       JOIN Courses c ON g.course_id = c.course_id
//       WHERE g.student_id = ?;
//     `,
  
//     getGPAByStudent: `
//       SELECT s.student_id, s.first_name, s.last_name,
//              ROUND(AVG((g.mid_sem + g.internal + g.end_sem)/10), 2) AS GPA
//       FROM Students s
//       JOIN Grades g ON s.student_id = g.student_id
//       WHERE s.student_id = ?
//       GROUP BY s.student_id;
//     `,

//     // ANALYTICS / DASHBOARD

//     professorCoursePerformance: `
//       SELECT s.student_id, s.first_name, s.last_name, g.mid_sem, g.internal, g.end_sem
//       FROM Grades g
//       JOIN Students s ON g.student_id = s.student_id
//       JOIN Courses c ON g.course_id = c.course_id
//       WHERE c.professor_id = ?;
//     `,
  
//     topStudentsInCourse: `
//       SELECT s.student_id, s.first_name, s.last_name,
//              (g.mid_sem + g.internal + g.end_sem) AS total_marks
//       FROM Grades g
//       JOIN Students s ON g.student_id = s.student_id
//       WHERE g.course_id = ?
//       ORDER BY total_marks DESC
//       LIMIT 3;
//     `,
  
//     studentDashboard: `
//    SELECT 
//     s.student_id, 
//     s.first_name, 
//     c.name AS course,
//     g.mid_sem, 
//     g.internal, 
//     g.end_sem,
//     ROUND(
//         SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) * 100.0 /
//         NULLIF(COUNT(a.attendance_id), 0),
//         2
//     ) AS attendance_percent
// FROM Students s
// LEFT JOIN Grades g ON s.student_id = g.student_id
// LEFT JOIN Courses c ON g.course_id = c.course_id
// LEFT JOIN Attendance a ON s.student_id = a.student_id AND c.course_id = a.course_id
// WHERE s.student_id = ?
// GROUP BY 
//     s.student_id,
//     s.first_name,
//     c.name,
//     g.mid_sem,
//     g.internal,
//     g.end_sem;

//     `
//   };
  

module.exports = {

  // =======================
  // STUDENT QUERIES
  // =======================
  getAllStudents: `
    SELECT s.*, d.name AS division_name, d.department
    FROM Students s
    JOIN Divisions d ON s.division_id = d.division_id;
  `,

  getStudentById: `
    SELECT s.*, d.name AS division_name, d.department
    FROM Students s
    JOIN Divisions d ON s.division_id = d.division_id
    WHERE s.student_id = ?;
  `,

  getStudentsByCourseId:`
      SELECT 
      s.student_id, 
      s.first_name, 
      s.last_name,
      s.email,
      g.mid_sem, 
      g.internal, 
      g.end_sem,
      ROUND(
          SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) * 100.0 /
          NULLIF(COUNT(a.attendance_id), 0),
          2
      ) AS attendance_percent
  FROM Enrollments e
  JOIN Students s ON e.student_id = s.student_id
  LEFT JOIN Grades g ON s.student_id = g.student_id AND g.course_id = ?
  LEFT JOIN Courses c ON g.course_id = c.course_id
  LEFT JOIN Attendance a ON s.student_id = a.student_id AND c.course_id = a.course_id
  WHERE e.course_id = ?
  GROUP BY 
    s.student_id,
    s.first_name,
    s.last_name,
    g.mid_sem,
    g.internal,
    g.end_sem;
  `,
  
  
  searchStudent: `
  SELECT 
  s.*, 
  d.name AS division_name, 
  d.department
FROM Students s
JOIN Divisions d ON s.division_id = d.division_id
WHERE s.student_id = ?;

  `,

  insertStudent: `
    INSERT INTO Students ( student_id, first_name, last_name, email, department, division_id )
    VALUES (?, ?, ?, ?, ?);
  `,

  updateStudent: `
    UPDATE Students
    SET first_name = ?, last_name = ?, email = ?, department=?, division= ?
    WHERE student_id = ?;
  `,

  deleteStudent: `
    DELETE FROM Students WHERE student_id = ?;
  `,


  // =======================
  // PROFESSOR QUERIES (for admin)
  // =======================
  // getAllProfessors: `
  //   SELECT p.*, d.name AS division_name, d.department
  //   FROM Professors p
  //   JOIN Divisions d ON p.division_id = d.division_id;
  // `,

  // getProfessorCourses: `
  //   SELECT c.course_id, c.name, c.credits, d.name AS division_name
  //   FROM Courses c
  //   JOIN Divisions d ON c.division_id = d.division_id
  //   WHERE c.professor_id = ?;
  // `,


  // =======================
  // COURSE QUERIES
  // =======================


// 2️⃣ Get all divisions/classes taught by a professor
getProfessorDivisions: `
SELECT DISTINCT 
  c.course_id, 
  c.department, 
  c.division
FROM Courses c
WHERE c.professor_id = ?;
`,


  getAllCourses: `
    SELECT 
      c.course_id, 
      c.name, 
      c.credits, 
      p.first_name AS professor, 
      d.name AS division_name, 
      d.department
    FROM Courses c
    JOIN Professors p ON c.professor_id = p.professor_id
    JOIN Divisions d ON c.division_id = d.division_id;
  `,

  getStudentsByCourseId: `
    SELECT s.student_id, s.first_name, s.last_name
    FROM Enrollments e
    JOIN Students s ON e.student_id = s.student_id
    WHERE e.course_id = ?;
  `,


  // =======================
  // ATTENDANCE QUERIES
  // =======================
  insertAttendance: `
    INSERT INTO Attendance (student_id, course_id, status)
    VALUES (?, ?, ?);
  `,

  getAttendance:`
    SELECT *
FROM (
  SELECT 
    a.student_id,
    s.first_name,
    s.last_name,
    a.course_id,
    a.date,
    a.status,
    ROW_NUMBER() OVER (
      PARTITION BY a.student_id 
      ORDER BY a.date DESC
    ) AS rn
  FROM Attendance a
  JOIN Students s ON a.student_id = s.student_id
  WHERE a.course_id = ?
) sub
WHERE rn <= 3
ORDER BY student_id, date DESC;

  `,

  getStudentAttendance:`
  SELECT 
  a.attendance_id,
  a.student_id,
  s.first_name,
  s.last_name,
  c.course_id,
  c.name AS course_name,
  a.date,
  a.status
FROM Attendance a
JOIN Students s ON a.student_id = s.student_id
JOIN Courses c ON a.course_id = c.course_id
WHERE a.student_id = ?     
  AND c.course_id = ?      
ORDER BY a.date DESC;
  `,

  getAttendanceByStudentCourse: `
    SELECT a.date, a.status
    FROM Attendance a
    WHERE a.student_id = ? AND a.course_id = ?
    ORDER BY a.date DESC;
  `,

  getAttendancePercentage: `
    SELECT course_id,
           SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS attendance_percent
    FROM Attendance
    WHERE student_id = ?
    GROUP BY course_id;
  `,

  getLowAttendanceStudents: `
    SELECT s.student_id, s.first_name, s.last_name, a.course_id,
           SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS attendance_percent
    FROM Attendance a
    JOIN Students s ON a.student_id = s.student_id
    GROUP BY s.student_id, a.course_id
    HAVING attendance_percent < 80;
  `,


  // =======================
  // GRADE QUERIES
  // =======================
  insertGrade: `
    INSERT INTO Grades (student_id, course_id, mid_sem, internal, end_sem)
    VALUES (?, ?, ?, ?, ?);
  `,

  updateGrades: `
    UPDATE Grades
    SET mid_sem = ?, internal = ?, end_sem = ?
    WHERE student_id = ? AND course_id = ?;
  `,

  getGrades: `
SELECT 
    g.mid_sem , g.internal , g.end_sem 
FROM Grades g
WHERE g.student_id = ? AND g.course_id = ?;
  `, 

  getGPAByCourseId: `SELECT 
  s.student_id,
  s.first_name,
  s.last_name,
  c.name AS course_name,
  g.mid_sem,
  g.internal,
  g.end_sem,
  (g.mid_sem + g.internal + g.end_sem) AS total_marks
FROM Grades g
JOIN Students s ON g.student_id = s.student_id
JOIN Courses c ON g.course_id = c.course_id
WHERE g.course_id = ?;`
,

  // =======================
  // ANALYTICS / DASHBOARD
  // =======================
  professorCoursePerformance: `
    SELECT s.student_id, s.first_name, s.last_name, g.mid_sem, g.internal, g.end_sem, d.name AS division
    FROM Grades g
    JOIN Students s ON g.student_id = s.student_id
    JOIN Courses c ON g.course_id = c.course_id
    JOIN Divisions d ON c.division_id = d.division_id
    WHERE c.professor_id = ?;
  `,

  topStudentsInCourse: `
    SELECT s.student_id, s.first_name, s.last_name,
           (g.mid_sem + g.internal + g.end_sem) AS total_marks
    FROM Grades g
    JOIN Students s ON g.student_id = s.student_id
    WHERE g.course_id = ?
    ORDER BY total_marks DESC
    LIMIT 3;
  `,

  getStudentsData: `
SELECT 
  s.student_id, 
  s.first_name, 
  s.last_name,
  s.email,
  g.mid_sem, 
  g.internal, 
  g.end_sem,
  ROUND(
      SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) * 100.0 /
      NULLIF(COUNT(a.attendance_id), 0),
      2
  ) AS attendance_percent
FROM Students s
LEFT JOIN Grades g ON s.student_id = g.student_id AND g.course_id = ?
LEFT JOIN Courses c ON g.course_id = c.course_id
LEFT JOIN Attendance a ON s.student_id = a.student_id AND c.course_id = a.course_id
WHERE c.course_id = ?
GROUP BY 
  s.student_id,
  s.first_name,
  s.last_name,
  s.email,
  g.mid_sem,
  g.internal,
  g.end_sem;

  `,

  getStudentsDataById : `
SELECT 
  s.student_id, 
  s.first_name, 
  s.last_name,
  s.email,
  g.mid_sem, 
  g.internal, 
  g.end_sem,
  ROUND(
      SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) * 100.0 /
      NULLIF(COUNT(a.attendance_id), 0),
      2
  ) AS attendance_percent
FROM Students s
LEFT JOIN Grades g 
  ON s.student_id = g.student_id 
  AND g.course_id = ?
LEFT JOIN Courses c 
  ON g.course_id = c.course_id
LEFT JOIN Attendance a 
  ON s.student_id = a.student_id 
  AND c.course_id = a.course_id
WHERE c.course_id = ? 
  AND s.student_id = ?   -- ✅ added condition for single student
GROUP BY 
  s.student_id,
  s.first_name,
  s.last_name,
  s.email,
  g.mid_sem,
  g.internal,
  g.end_sem;
`,
getStudentsByProfessorId: `
  SELECT DISTINCT 
    s.student_id, 
    s.first_name, 
    s.last_name, 
    s.email, 
    s.department, 
    e.division, 
    c.name AS course_name
  FROM Students s
  JOIN Enrollments e ON s.student_id = e.student_id
  JOIN Courses c ON e.course_id = c.course_id
  WHERE c.professor_id = ?;
`
};


// For auto enrollment of students into courses based on their department and division

// DELIMITER //

// CREATE TRIGGER after_student_insert
// AFTER INSERT ON Students
// FOR EACH ROW
// BEGIN
//   INSERT INTO Enrollments (student_id, course_id, division)
//   SELECT NEW.student_id, c.course_id, c.semester, c.division
//   FROM Courses c
//   WHERE c.department = NEW.department
//     AND c.division = NEW.division;
// END //

// DELIMITER ;