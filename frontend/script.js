// Helper functions
function showError(container, message) {
  container.innerHTML = `<div class="page-error" style="color: var(--notification-red); padding: 16px;">${message}</div>`;
}

function showLoading(container) {
  container.innerHTML = `<div style="padding: 16px;">Loading...</div>`;
}

// Global function to load all students data for a course
async function loadAllStudentsData(courseId) {
  const studentDataTableContainer = document.getElementById('studentDataTableContainer');
  if (!courseId || !studentDataTableContainer) return;
  showLoading(studentDataTableContainer);
  try {
    const students = await ProfessorAPI.getStudentsData(courseId);
    console.log('Students data loaded:', students);
    if (!students || students.length === 0) {
      studentDataTableContainer.innerHTML = '<div style="padding: 16px;">No students found for this course</div>';
      return;
    }
    studentDataTableContainer.innerHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>Student ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Mid Sem</th>
            <th>Internal</th>
            <th>End Sem</th>
            <th>Attendance %</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${students.map(s => {
            const midSem = s.mid_sem ?? s.mid ?? '';
            const internal = s.internal ?? s.internal_marks ?? '';
            const endSem = s.end_sem ?? s.end ?? '';
            const attPercent = s.attendance_percent ?? s.attendance_percentage ?? s.attendance ?? '';
            return `
            <tr>
              <td>${s.student_id || ''}</td>
              <td>${s.first_name || ''}</td>
              <td>${s.last_name || ''}</td>
              <td>${s.email || ''}</td>
              <td>${midSem}</td>
              <td>${internal}</td>
              <td>${endSem}</td>
              <td>${attPercent ? (typeof attPercent === 'number' ? attPercent.toFixed(2) : attPercent) + '%' : 'N/A'}</td>
              <td>
                <span style="cursor: pointer; font-size: 18px;" onclick="loadStudentForEdit('${s.student_id}', '${courseId}')" title="Edit">✏️</span>
              </td>
            </tr>
          `;
          }).join('')}
        </tbody>
      </table>
      <div style="margin-top: 16px; display:flex; justify-content:flex-end;">
        <button class="button" id="sendAttendanceAlertsStudentDataBtn" style="background: #10b981;">📧 Send Attendance Alerts</button>
      </div>
    `;
    
    // Add event handler for send alerts button in student data page
    const sendAlertsBtnStudentData = document.getElementById('sendAttendanceAlertsStudentDataBtn');
    if (sendAlertsBtnStudentData) {
      sendAlertsBtnStudentData.addEventListener('click', async () => {
        if (!courseId) {
          alert('Please select a course first');
          return;
        }
        if (!confirm('Send attendance alert emails to students with less than 80% attendance?')) {
          return;
        }
        try {
          sendAlertsBtnStudentData.disabled = true;
          sendAlertsBtnStudentData.textContent = 'Sending...';
          await ProfessorAPI.sendAttendanceAlerts(courseId);
          alert('Attendance alerts sent successfully!');
        } catch (e) {
          alert('Error sending alerts: ' + e.message);
        } finally {
          sendAlertsBtnStudentData.disabled = false;
          sendAlertsBtnStudentData.innerHTML = '📧 Send Attendance Alerts';
        }
      });
    }
  } catch (err) {
    console.error('Error loading students data:', err);
    showError(studentDataTableContainer, `Error: ${err.message}`);
  }
}

// Page Navigation
document.addEventListener('DOMContentLoaded', function() {
  const menuItems = document.querySelectorAll('.menu-item');
  const pages = {
    'dashboard': document.getElementById('dashboard-content'),
    'students-grade': document.getElementById('students-grade-content'),
    'attendance': document.getElementById('attendance-content'),
    'student-data': document.getElementById('student-data-content'),
    'messages': document.getElementById('messages-content')
  };

  menuItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      menuItems.forEach(i => i.classList.remove('active'));
      this.classList.add('active');

      const page = this.getAttribute('data-page');
      Object.values(pages).forEach(p => {
        if (p) p.style.display = 'none';
      });
      if (pages[page]) pages[page].style.display = 'block';

      // Auto-load when switching tabs if a course is already selected
      if (page === 'students-grade') {
        const select = document.getElementById('gradeCourseSelect');
        if (select && window.__selectedCourseId) {
          select.value = window.__selectedCourseId;
          document.getElementById('loadStudentsForGradeBtn')?.click();
        }
      }
      if (page === 'attendance') {
        const select = document.getElementById('attendanceCourseSelect');
        if (select && window.__selectedCourseId) {
          select.value = window.__selectedCourseId;
          document.getElementById('loadStudentsForAttendanceBtn')?.click();
        }
      }
      if (page === 'student-data') {
        const select = document.getElementById('studentDataCourseSelect');
        if (select && window.__selectedCourseId) {
          select.value = window.__selectedCourseId;
          // Auto-load students data
          loadAllStudentsData(window.__selectedCourseId);
        }
      }
    });
  });

  // Dashboard - Load Courses
  const loadCoursesBtn = document.getElementById('loadCoursesBtn');
  const coursesCards = document.getElementById('coursesCards');
  let selectedCourseId = window.__selectedCourseId || null;

  if (loadCoursesBtn) {
    loadCoursesBtn.addEventListener('click', async () => {
      const professorId = document.getElementById('professorId')?.value.trim();
      if (!professorId) {
        alert('Please enter Professor ID');
        return;
      }
      showLoading(coursesCards);
      try {
        const courses = await ProfessorAPI.getCourses(professorId);
        if (!courses || courses.length === 0) {
          coursesCards.innerHTML = '<div style="padding: 16px;">No courses found</div>';
          return;
        }
        coursesCards.innerHTML = courses.map(c => {
          // Use department from query result (e.g., "CSE")
          const department = c.department || 'N/A';
          // Format division as "DIV-1", "DIV-2", etc.
          const division = c.division ? `DIV-${c.division}` : 'N/A';
          return `
            <div class="card" data-course-id="${c.course_id}">
              <div class="card-overlay"></div>
              <div class="card-title">${department.toUpperCase()}</div>
              <div class="card-sub">${division}</div>
            </div>
          `;
        }).join('');
        
        // Populate course selects
        const courseSelectHTML = courses.map(c => {
          const dept = c.department || 'N/A';
          const div = c.division ? `DIV-${c.division}` : 'N/A';
          return `<option value="${c.course_id}">${dept} - ${div}</option>`;
        }).join('');
        document.getElementById('gradeCourseSelect').innerHTML = '<option value="">Select Course</option>' + courseSelectHTML;
        document.getElementById('attendanceCourseSelect').innerHTML = '<option value="">Select Course</option>' + courseSelectHTML;
        document.getElementById('studentDataCourseSelect').innerHTML = '<option value="">Select Course</option>' + courseSelectHTML;

        // If a course was already selected, apply it to all selects
        if (selectedCourseId) {
          const gSel = document.getElementById('gradeCourseSelect');
          const aSel = document.getElementById('attendanceCourseSelect');
          const sSel = document.getElementById('studentDataCourseSelect');
          if (gSel) gSel.value = selectedCourseId;
          if (aSel) aSel.value = selectedCourseId;
          if (sSel) sSel.value = selectedCourseId;
        }

        // Card click handlers
        document.querySelectorAll('.card').forEach(card => {
          card.addEventListener('click', function() {
            document.querySelectorAll('.card').forEach(c => c.classList.remove('card-active'));
            this.classList.add('card-active');
            selectedCourseId = this.dataset.courseId;
            window.__selectedCourseId = selectedCourseId;
          });
        });
      } catch (err) {
        showError(coursesCards, `Error: ${err.message}`);
      }
    });
  }

  // Students Grade Page
  const loadStudentsForGradeBtn = document.getElementById('loadStudentsForGradeBtn');
  const gradesTableContainer = document.getElementById('gradesTableContainer');

  if (loadStudentsForGradeBtn) {
    loadStudentsForGradeBtn.addEventListener('click', async () => {
      const courseId = document.getElementById('gradeCourseSelect')?.value || selectedCourseId;
      if (!courseId) {
        alert('Please select a course');
        return;
      }
      showLoading(gradesTableContainer);
      try {
        const students = await ProfessorAPI.getStudents(courseId);
        console.log('Students loaded:', students);
        if (!students || students.length === 0) {
          gradesTableContainer.innerHTML = '<div style="padding: 16px;">No students found for this course</div>';
          return;
        }
        // Fetch grades for each student using getGrades API
        const gradeMap = {};
        window.__gradePrefill = window.__gradePrefill || {};
        window.__gradePrefill[courseId] = window.__gradePrefill[courseId] || new Set();
        
        console.log('Fetching grades for', students.length, 'students...');
        await Promise.all(students.map(async (s) => {
          try {
            const g = await ProfessorAPI.getGrade(courseId, s.student_id);
            console.log(`getGrades for student ${s.student_id}:`, g);
            
            let rec = null;
            if (Array.isArray(g) && g.length > 0) {
              rec = g[0];
            } else if (g && typeof g === 'object' && !Array.isArray(g)) {
              rec = g;
            }
            
            if (rec) {
              // Normalize possible key variants
              const midSem = rec.mid_sem ?? rec.mid ?? rec.midSem ?? null;
              const internal = rec.internal ?? rec.internal_marks ?? rec.internalMarks ?? null;
              const endSem = rec.end_sem ?? rec.end ?? rec.endSem ?? null;
              
              // Store grades if record exists (even if values are 0 or null)
              // This means the grade record exists in database
              gradeMap[s.student_id] = {
                mid_sem: midSem,
                internal: internal,
                end_sem: endSem
              };
              window.__gradePrefill[courseId].add(String(s.student_id));
              console.log(`Grades found for student ${s.student_id}:`, gradeMap[s.student_id]);
            }
          } catch (e) {
            console.warn(`getGrades failed for student ${s.student_id}:`, e);
          }
        }));
        
        console.log('Final gradeMap:', gradeMap);
        console.log('Students with grades:', Array.from(window.__gradePrefill[courseId]));
        
        gradesTableContainer.innerHTML = `
          <table class="table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Mid Sem</th>
                <th>Internal</th>
                <th>End Sem</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${students.map(s => {
                // Use prefilled grades from getGrades API
                const pre = gradeMap[s.student_id] || {};
                const midSem = (pre.mid_sem !== null && pre.mid_sem !== undefined) ? pre.mid_sem : '';
                const internal = (pre.internal !== null && pre.internal !== undefined) ? pre.internal : '';
                const endSem = (pre.end_sem !== null && pre.end_sem !== undefined) ? pre.end_sem : '';
                console.log(`Student ${s.student_id} - midSem: ${midSem}, internal: ${internal}, endSem: ${endSem}`);
                return `
                <tr>
                  <td>${s.student_id || ''}</td>
                  <td>${(s.first_name || '')} ${(s.last_name || '')}</td>
                  <td>${s.email || ''}</td>
                  <td><input type="number" id="mid-${s.student_id}" value="${midSem}" class="select" style="width: 80px;" placeholder="0" /></td>
                  <td><input type="number" id="int-${s.student_id}" value="${internal}" class="select" style="width: 80px;" placeholder="0" /></td>
                  <td><input type="number" id="end-${s.student_id}" value="${endSem}" class="select" style="width: 80px;" placeholder="0" /></td>
                  <td><button class="button" onclick="updateGrade('${s.student_id}', '${courseId}')">Save</button></td>
                </tr>
              `;
              }).join('')}
            </tbody>
          </table>
        `;
      } catch (err) {
        console.error('Error loading students:', err);
        showError(gradesTableContainer, `Error loading students: ${err.message}`);
      }
    });
  }

  // Attendance Page
  const loadStudentsForAttendanceBtn = document.getElementById('loadStudentsForAttendanceBtn');
  const attendanceTableContainer = document.getElementById('attendanceTableContainer');

  if (loadStudentsForAttendanceBtn) {
    loadStudentsForAttendanceBtn.addEventListener('click', async () => {
      const courseId = document.getElementById('attendanceCourseSelect')?.value || selectedCourseId;
      if (!courseId) {
        alert('Please select a course');
        return;
      }
      showLoading(attendanceTableContainer);
      try {
        const attendance = await ProfessorAPI.getAttendance(courseId);
        console.log('Attendance loaded:', attendance);
        let students = [];
        try {
          students = await ProfessorAPI.getStudents(courseId);
          console.log('Students loaded for attendance:', students);
        } catch (studentsErr) {
          console.warn('Could not load students list:', studentsErr);
        }
        if (!attendance || attendance.length === 0) {
          attendanceTableContainer.innerHTML = '<div style="padding: 16px;">No attendance records found. You can mark new attendance below.</div>';
          // Still show the form to mark new attendance
          attendanceTableContainer.innerHTML += `
            <div style="margin-top: 16px;">
              <h3>Mark New Attendance</h3>
              <div class="toolbar">
                <input type="text" id="newAttStudentId" placeholder="Student ID" class="select" />
                <input type="date" id="newAttDate" class="select" />
                <select id="newAttStatus" class="select">
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                </select>
                <button class="button" onclick="insertAttendance('${courseId}')">Insert</button>
              </div>
            </div>
          `;
          return;
        }
        // Pivot last up to 3 attendance entries into columns with date headers
        const formatDM = (d) => {
          try {
            const dt = new Date(d);
            const dd = String(dt.getDate()).padStart(2,'0');
            const mm = String(dt.getMonth()+1).padStart(2,'0');
            return `${dd}-${mm}`;
          } catch { return d; }
        };
        // Get today's date in local timezone (not UTC)
        const today = new Date();
        const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const parseDate = (d) => new Date(d);
        const rows = attendance.map(a => ({
          student_id: a.student_id,
          name: (() => {
            const s = students.find(x => x.student_id === a.student_id);
            return s ? `${s.first_name || ''} ${s.last_name || ''}`.trim() : '';
          })(),
          date: a.date || a.attendance_date,
          status: a.status
        }));

        // Determine the latest up to 3 dates across dataset
        const uniqueDates = Array.from(new Set(rows.map(r => r.date))).sort((a,b)=>parseDate(b)-parseDate(a));
        const latestDates = uniqueDates.slice(0,2); // last two historical

        // Group by student
        const byStudent = {};
        for (const r of rows) {
          if (!byStudent[r.student_id]) byStudent[r.student_id] = { name: r.name, map: {} };
          byStudent[r.student_id].map[r.date] = r.status;
        }

        const studentIds = Object.keys(byStudent);
        
        // Format date as "day month year" (e.g., "15 January 2024")
        const formatDateFull = (dateStr) => {
          try {
            const date = new Date(dateStr);
            const day = date.getDate();
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
            const month = months[date.getMonth()];
            const year = date.getFullYear();
            return `${day} ${month} ${year}`;
          } catch {
            return dateStr;
          }
        };
        
        attendanceTableContainer.innerHTML = `
          <table class="table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                ${latestDates.map(d=>`<th>${formatDM(d)}</th>`).join('')}
                <th>Today (${formatDM(todayISO)})</th>
                <th>History</th>
              </tr>
            </thead>
            <tbody>
              ${studentIds.map(id => {
                const s = byStudent[id];
                const cells = latestDates.map(d => {
                  const st = s.map[d];
                  if (!st) return `<td></td>`; // leave blank if no record for that date
                  const cls = st === 'Present' ? 'present' : 'absent';
                  return `<td><span class="badge ${cls}">${st}</span></td>`;
                }).join('');
                const existingToday = s.map[todayISO];
                let todayCell = '';
                if (existingToday) {
                  const clsT = existingToday === 'Present' ? 'present' : 'absent';
                  todayCell = `<td id="today-cell-${id}">
                    <span class="badge ${clsT}">${existingToday}</span>
                    <button class="button" style="margin-left:8px;padding:0 10px;height:32px" onclick="enableTodayEdit('${id}')">✎</button>
                  </td>`;
                } else {
                  todayCell = `<td id="today-cell-${id}">
                    <select class="select" id="today-att-${id}">
                      <option value="">--</option>
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                    </select>
                  </td>`;
                }
                return `<tr id="att-row-${id}">
                  <td>${id}</td>
                  <td>${s.name}</td>
                  ${cells}
                  ${todayCell}
                  <td style="text-align: center;">
                    <button style="background: transparent; border: none; color: #151D48; cursor: pointer; padding: 4px 8px; font-size: 18px; font-weight: bold;" onclick="toggleAttendanceHistory('${id}', '${courseId}')" id="history-btn-${id}" title="View attendance history">▼</button>
                  </td>
                </tr>
                <tr id="history-row-${id}" style="display: none;">
                  <td colspan="${4 + latestDates.length}" id="history-content-${id}" style="padding: 16px;">
                    <div style="text-align: center; color: #666;">Loading attendance history...</div>
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
          <div style="margin-top: 16px; display:flex; justify-content:flex-end;">
            <button class="button" id="saveAllTodayAttendance">Save Today</button>
          </div>
        `;
        
        // Function to toggle attendance history
        window.toggleAttendanceHistory = async function(studentId, courseId) {
          const historyRow = document.getElementById(`history-row-${studentId}`);
          const historyContent = document.getElementById(`history-content-${studentId}`);
          const historyBtn = document.getElementById(`history-btn-${studentId}`);
          
          if (!historyRow || !historyContent) return;
          
          if (historyRow.style.display === 'none') {
            // Show and load history
            historyRow.style.display = 'table-row';
            historyBtn.textContent = '▲';
            historyContent.innerHTML = '<div style="text-align: center; color: #666;">Loading attendance history...</div>';
            
            try {
              const history = await ProfessorAPI.getAttendanceByStudent(studentId, courseId);
              console.log('Attendance history for student', studentId, ':', history);
              
              if (!history || history.length === 0) {
                historyContent.innerHTML = '<div style="text-align: center; color: #999; padding: 16px;">No attendance records found</div>';
                return;
              }
              
              // Display history
              const historyHTML = `
                <div style="max-height: 300px; overflow-y: auto;">
                  <table class="table" style="margin: 0;">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${history.map(h => {
                        const date = h.date || h.attendance_date;
                        const status = h.status;
                        const cls = status === 'Present' ? 'present' : 'absent';
                        return `
                          <tr>
                            <td>${formatDateFull(date)}</td>
                            <td><span class="badge ${cls}">${status}</span></td>
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                </div>
              `;
              historyContent.innerHTML = historyHTML;
            } catch (err) {
              console.error('Error loading attendance history:', err);
              historyContent.innerHTML = `<div style="text-align: center; color: var(--notification-red); padding: 16px;">Error loading history: ${err.message}</div>`;
            }
          } else {
            // Hide history
            historyRow.style.display = 'none';
            historyBtn.textContent = '▼';
          }
        };

        // Inline edit for today's attendance (update only)
        window.enableTodayEdit = async function(studentId){
          const cell = document.getElementById(`today-cell-${studentId}`);
          if (!cell) return;
          const current = (cell.querySelector('.badge')?.textContent || '').trim();
          cell.innerHTML = `
            <select class="select" id="edit-today-sel-${studentId}">
              <option value="Present" ${current==='Present'?'selected':''}>Present</option>
              <option value="Absent" ${current==='Absent'?'selected':''}>Absent</option>
            </select>
            <button class="button" style="margin-left:8px;padding:0 10px;height:32px" id="save-today-${studentId}">Save</button>
            <button class="button" style="margin-left:8px;padding:0 10px;height:32px" id="cancel-today-${studentId}">Cancel</button>
          `;
          const save = document.getElementById(`save-today-${studentId}`);
          const cancel = document.getElementById(`cancel-today-${studentId}`);
          if (save) {
            save.addEventListener('click', async ()=>{
              const sel = document.getElementById(`edit-today-sel-${studentId}`);
              const val = sel && sel.value;
              try {
                await ProfessorAPI.updateAttendance({ student_id: studentId, course_id: courseId, date: todayISO, status: val });
                const clsT = val === 'Present' ? 'present' : 'absent';
                cell.innerHTML = `<span class=\"badge ${clsT}\">${val}</span>
                  <button class=\"button\" style=\"margin-left:8px;padding:0 10px;height:32px\" onclick=\"enableTodayEdit('${studentId}')\">✎</button>`;
              } catch(e){
                alert('Error updating: '+e.message);
              }
            });
          }
          if (cancel) {
            cancel.addEventListener('click', ()=>{
              const clsT = current === 'Present' ? 'present' : 'absent';
              cell.innerHTML = `<span class=\"badge ${clsT}\">${current}</span>
                <button class=\"button\" style=\"margin-left:8px;padding:0 10px;height:32px\" onclick=\"enableTodayEdit('${studentId}')\">✎</button>`;
            });
          }
        };

        // Save all handler
        const saveBtn = document.getElementById('saveAllTodayAttendance');
        if (saveBtn) {
          saveBtn.addEventListener('click', async () => {
            const selects = Array.from(document.querySelectorAll(`[id^="today-att-"]`));
            if (selects.length === 0) { alert('Nothing to save'); return; }
            try {
              await Promise.all(selects.map(sel => {
                const id = sel.id.replace('today-att-','');
                const val = sel.value;
                if (!val) return Promise.resolve();
                return ProfessorAPI.insertAttendance({ student_id: id, course_id: courseId, status: val })
                  .then(() => {
                    const cell = document.getElementById(`today-cell-${id}`);
                    if (cell) {
                      const clsT = val === 'Present' ? 'present' : 'absent';
                      cell.innerHTML = `<span class=\"badge ${clsT}\">${val}</span>
                        <button class=\"button\" style=\"margin-left:8px;padding:0 10px;height:32px\" onclick=\"enableTodayEdit('${id}')\">✎</button>`;
                    }
                  });
              }));
              alert('Today\'s attendance saved');
            } catch (e) {
              alert('Error saving attendance: ' + e.message);
            }
          });
        }
      } catch (err) {
        console.error('Error loading attendance:', err);
        showError(attendanceTableContainer, `Error loading attendance: ${err.message}. Please check the console for details.`);
      }
    });
  }

  // Student Data Page
  const searchStudentBtn = document.getElementById('searchStudentBtn');
  const loadStudentDataBtn = document.getElementById('loadStudentDataBtn');
  const studentDataTableContainer = document.getElementById('studentDataTableContainer');
  const updateStudentBtn = document.getElementById('updateStudentBtn');


  if (loadStudentDataBtn) {
    loadStudentDataBtn.addEventListener('click', async () => {
      const courseId = document.getElementById('studentDataCourseSelect')?.value || selectedCourseId;
      if (!courseId) {
        alert('Please select a course');
        return;
      }
      await loadAllStudentsData(courseId);
    });
  }

  // Auto-load when course is selected
  const studentDataCourseSelect = document.getElementById('studentDataCourseSelect');
  if (studentDataCourseSelect) {
    studentDataCourseSelect.addEventListener('change', async () => {
      const courseId = studentDataCourseSelect.value;
      if (courseId) {
        await loadAllStudentsData(courseId);
      } else {
        studentDataTableContainer.innerHTML = '';
      }
    });
  }

  if (searchStudentBtn) {
    searchStudentBtn.addEventListener('click', async () => {
      const studentId = document.getElementById('searchStudentInput')?.value.trim();
      const courseId = document.getElementById('studentDataCourseSelect')?.value || selectedCourseId;
      if (!studentId) {
        alert('Please enter Student ID');
        return;
      }
      if (!courseId) {
        alert('Please select a course first');
        return;
      }
      // Use getStudentDataById API for search
      await loadStudentForEdit(studentId, courseId);
    });
  }

  if (updateStudentBtn) {
    updateStudentBtn.addEventListener('click', async () => {
      const payload = {
        student_id: document.getElementById('newStudentId')?.value.trim(),
        first_name: document.getElementById('newFirstName')?.value.trim(),
        last_name: document.getElementById('newLastName')?.value.trim(),
        email: document.getElementById('newEmail')?.value.trim()
      };
      if (!payload.student_id) {
        alert('Student ID is required');
        return;
      }
      if (!payload.first_name && !payload.last_name && !payload.email) {
        alert('Please fill at least one field to update');
        return;
      }
      try {
        const result = await ProfessorAPI.updateStudent(payload);
        alert('Student updated successfully');
        // Reload all students data to show updated info
        const courseId = document.getElementById('studentDataCourseSelect')?.value || selectedCourseId;
        if (courseId) {
          await loadAllStudentsData(courseId);
        }
      } catch (err) {
        alert(`Error: ${err.message}`);
      }
    });
  }

  // Sign out handler
  const signOut = document.querySelector('.signout');
  if (signOut) {
    signOut.addEventListener('click', function() {
      if (confirm('Are you sure you want to sign out?')) {
        console.log('Sign out clicked');
      }
    });
  }

  // Search input handler
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      const searchTerm = e.target.value.toLowerCase();
      const activePage = document.querySelector('.menu-item.active')?.getAttribute('data-page');
      if (activePage === 'dashboard') {
        document.querySelectorAll('.card').forEach(card => {
          const title = card.querySelector('.card-title')?.textContent.toLowerCase() || '';
          const sub = card.querySelector('.card-sub')?.textContent.toLowerCase() || '';
          if (title.includes(searchTerm) || sub.includes(searchTerm) || !searchTerm) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        });
      }
    });
  }

  // Mobile menu toggle
  const createMenuToggle = () => {
    if (window.innerWidth <= 768) {
      const topbar = document.querySelector('.topbar-root');
      const sidebar = document.querySelector('.sidebar');
      
      if (!document.querySelector('.menu-toggle')) {
        const menuToggle = document.createElement('button');
        menuToggle.className = 'menu-toggle';
        menuToggle.innerHTML = '☰';
        menuToggle.style.cssText = 'font-size: 24px; color: var(--grey-900); padding: 8px; background: none; border: none; cursor: pointer;';
        
        menuToggle.addEventListener('click', () => {
          sidebar.classList.toggle('open');
        });
        
        const topbarLeft = document.querySelector('.topbar-left');
        if (topbarLeft) {
          topbarLeft.insertBefore(menuToggle, topbarLeft.firstChild);
        }
      }
    }
  };

  createMenuToggle();
  window.addEventListener('resize', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    if (window.innerWidth > 768 && menuToggle) {
      menuToggle.remove();
      document.querySelector('.sidebar').classList.remove('open');
    } else if (window.innerWidth <= 768) {
      createMenuToggle();
    }
  });

  document.addEventListener('click', (e) => {
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = document.querySelector('.menu-toggle');
    
    if (window.innerWidth <= 768 && 
        sidebar && 
        sidebar.classList.contains('open') && 
        !sidebar.contains(e.target) && 
        !(menuToggle && menuToggle.contains(e.target))) {
      sidebar.classList.remove('open');
    }
  });
});

// Global function to load student for editing (using getStudentDataById)
async function loadStudentForEdit(studentId, courseId) {
  const studentDataTableContainer = document.getElementById('studentDataTableContainer');
  showLoading(studentDataTableContainer);
  try {
    const student = await ProfessorAPI.getStudentDataById(courseId, studentId);
    console.log('Student data loaded via getStudentDataById:', student);
    if (!student || (Array.isArray(student) && student.length === 0)) {
      studentDataTableContainer.innerHTML = '<div style="padding: 16px; color: var(--notification-red);">Student not found</div>';
      return;
    }
    const s = Array.isArray(student) ? student[0] : student;
    
    // Populate form fields for editing
    document.getElementById('newStudentId').value = s.student_id || '';
    document.getElementById('newFirstName').value = s.first_name || '';
    document.getElementById('newLastName').value = s.last_name || '';
    document.getElementById('newEmail').value = s.email || '';
    
    // Display complete student information including marks and attendance
    const midSem = s.mid_sem ?? s.mid ?? '';
    const internal = s.internal ?? s.internal_marks ?? '';
    const endSem = s.end_sem ?? s.end ?? '';
    const attPercent = s.attendance_percent ?? s.attendance_percentage ?? s.attendance ?? '';
    
    studentDataTableContainer.innerHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>Student ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Mid Sem</th>
            <th>Internal</th>
            <th>End Sem</th>
            <th>Attendance %</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${s.student_id || ''}</td>
            <td>${s.first_name || ''}</td>
            <td>${s.last_name || ''}</td>
            <td>${s.email || ''}</td>
            <td>${midSem}</td>
            <td>${internal}</td>
            <td>${endSem}</td>
            <td>${attPercent ? (typeof attPercent === 'number' ? attPercent.toFixed(2) : attPercent) + '%' : 'N/A'}</td>
          </tr>
        </tbody>
      </table>
    `;
  } catch (err) {
    console.error('Error loading student data:', err);
    showError(studentDataTableContainer, `Error: ${err.message}. Please check the console for details.`);
  }
}

// Global functions for inline handlers
async function updateGrade(studentId, courseId) {
  const midSem = document.getElementById(`mid-${studentId}`)?.value;
  const internal = document.getElementById(`int-${studentId}`)?.value;
  const endSem = document.getElementById(`end-${studentId}`)?.value;
  try {
    const prefilled = !!(window.__gradePrefill && window.__gradePrefill[courseId] && window.__gradePrefill[courseId].has(String(studentId)));
    const payload = {
      student_id: studentId,
      course_id: courseId,
      mid_sem: midSem ? Number(midSem) : null,
      internal: internal ? Number(internal) : null,
      end_sem: endSem ? Number(endSem) : null
    };
    if (prefilled) {
      await ProfessorAPI.updateGrade(payload);
    } else {
      await ProfessorAPI.insertGrade(payload);
      // Mark as existing so next save does update
      window.__gradePrefill = window.__gradePrefill || {};
      window.__gradePrefill[courseId] = window.__gradePrefill[courseId] || new Set();
      window.__gradePrefill[courseId].add(String(studentId));
    }
    alert('Grades saved');
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

async function insertAttendance(courseId) {
  const studentId = document.getElementById('newAttStudentId')?.value.trim();
  const date = document.getElementById('newAttDate')?.value;
  const status = document.getElementById('newAttStatus')?.value;
  if (!studentId || !date) {
    alert('Student ID and Date are required');
    return;
  }
  try {
    await ProfessorAPI.insertAttendance({
      student_id: studentId,
      course_id: courseId,
      status: status
    });
    alert('Attendance inserted successfully');
    document.getElementById('newAttStudentId').value = '';
    document.getElementById('newAttDate').value = '';
    // Reload attendance
    document.getElementById('loadStudentsForAttendanceBtn')?.click();
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}

async function updateAttendanceRecord(studentId, courseId, date) {
  const status = document.getElementById(`att-status-${studentId}-${date}`)?.value;
  try {
    await ProfessorAPI.updateAttendance({
      student_id: studentId,
      course_id: courseId,
      date: date,
      status: status
    });
    alert('Attendance updated successfully');
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
}
