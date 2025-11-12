// Professor API - Maps to backend routes
const BASE_URL = 'http://127.0.0.1:8083/professor';

async function http(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

const ProfessorAPI = {
  // GET /:professor_id/courses
  getCourses: (professorId) => http(`/${encodeURIComponent(professorId)}/courses`),

  // GET /course/:course_id/students
  getStudents: (courseId) => http(`/course/${encodeURIComponent(courseId)}/students`),

  // POST /insertstudent
  insertStudent: (payload) => http(`/insertstudent`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // GET /searchstudent/:id
  searchStudent: (studentId) => http(`/searchstudent/${encodeURIComponent(studentId)}`),

  // GET /studentsData/:course_id
  getStudentsData: (courseId) => http(`/studentsData/${encodeURIComponent(courseId)}`),

  // GET /getStudentData/:course_id/:student_id
  getStudentDataById: (courseId, studentId) => http(`/getStudentData/${encodeURIComponent(courseId)}/${encodeURIComponent(studentId)}`),

  // POST /updatestudent
  updateStudent: (payload) => http(`/updatestudent`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // POST /insertAttendance
  insertAttendance: (payload) => http(`/insertAttendance`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // POST /attendance/update
  updateAttendance: (payload) => http(`/attendance/update`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // GET /getAttendance/:course_id
  getAttendance: (courseId) => http(`/getAttendance/${encodeURIComponent(courseId)}`),

  // GET /getAttendanceByStudent/:student_id/:course_id
  getAttendanceByStudent: (studentId, courseId) => 
    http(`/getAttendanceByStudent/${encodeURIComponent(studentId)}/${encodeURIComponent(courseId)}`),

  // GET grades for a student in a course
  getGrade: (courseId, studentId) => http(`/getGrades/${encodeURIComponent(courseId)}/${encodeURIComponent(studentId)}`),

  // Insert grade
  insertGrade: (payload) => http(`/grades/insert`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // Save grade: always UPDATE (since record exists when prefilled)
  updateGrade: (payload) => http(`/grades/update`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // GET /course/:course_id/performance
  getCoursePerformance: (courseId) => http(`/course/${encodeURIComponent(courseId)}/performance`),

    // GET /send-attendance-alerts/:course_id 
    sendAttendanceAlerts: (courseId) => fetch(`http://127.0.0.1:8083/send-attendance-alerts/${encodeURIComponent(courseId)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }).then(async res => {
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
      }
      // backend returns plain text; return that text or JSON if you change backend
      const ct = res.headers.get('content-type') || '';
      return ct.includes('application/json') ? res.json() : res.text();
    }),
  
};

