const db= require("./db"); // we’ll create db.js next
const nodemailer = require("nodemailer");
require("dotenv").config();
console.log("MAIL_USER from env:", process.env.MAIL_USER);
console.log("MAIL_PASS from env:", process.env.MAIL_PASS ? "✅ Loaded" : "❌ Not Loaded");


// Step 1: Configure email
console.log(process.env.MAIL_USER);
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER, 
    pass: process.env.MAIL_PASS
  }
});

// Step 2: Function to send email
async function sendEmail(to, subject, body) {
  try {
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to,
      subject,
      text: body,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// Step 3: Main function to check attendance & send alerts
async function checkAndSendAttendanceAlerts(course_id) {
  try {

    // Query to calculate attendance %
    console.log("Checking attendance percentages...");
    const [rows] = await db.query(`
    SELECT s.student_id, s.email, c.course_id, c.name AS course_name,
             ROUND(SUM(CASE WHEN a.status='Present' THEN 1 ELSE 0 END) * 100.0 / COUNT(a.attendance_id), 2) AS percent
      FROM Attendance a
      JOIN Students s ON a.student_id = s.student_id
      JOIN Courses c ON a.course_id = c.course_id
      GROUP BY s.student_id, c.course_id
      HAVING percent < 80
      And c.course_id=?;
    `, [course_id]);

    console.log("Students with low attendance:", rows);
    console.log("Number of students found:", rows.length);

    // Group courses per student
    const students = {};
    rows.forEach(r => {
      if (!students[r.student_id]) {
        students[r.student_id] = { email: r.email, courses: [] };
      }
      students[r.student_id].courses.push(`${r.course_name} (${r.percent}%)`);
    });

    // Send emails & log notifications
    console.log("Processing students for email sending...");
    for (const student_id in students) {
      const info = students[student_id];
      console.log(`Processing student ${student_id} with email ${info.email}`);
      
      const message = `Dear student,
Your attendance is below 80% in:
- ${info.courses.join("\n- ")}
Please attend upcoming classes to improve.`;

      console.log(`Sending email to ${info.email}...`);
      // Send email
      await sendEmail(info.email, "Attendance Shortage Notice", message);

      // Insert into Notifications table
      console.log(`Inserting notification for student ${student_id}...`);
      for (const course_name of info.courses) {
        await db.query(
          `INSERT INTO Notifications (student_id, message) VALUES (?, ?)`,
          [student_id, message]
        );
      }
    }

    console.log("Attendance alerts sent successfully!");
  } catch (err) {
    console.error("Error in checkAndSendAttendanceAlerts:", err);
  }
}

module.exports = { checkAndSendAttendanceAlerts };
