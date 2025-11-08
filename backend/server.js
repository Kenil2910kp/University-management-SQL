const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const professorRoutes = require("./routes/professorRoutes");
const studentRoutes = require("./routes/studentRoutes");
const { checkAndSendAttendanceAlerts } = require("./emailService");
require("dotenv").config();


const app = express();
app.use(cors());
app.use(express.json()); // for JSON body parsing
app.use(express.urlencoded({ extended: false }));

// Routes
app.use("/professor", professorRoutes);
app.use("/student", studentRoutes);

// Default Route
app.get("/", (req, res) => {
  res.send("University Backend Running ✅");
});

app.get("/test", (req, res) => {
    res.send("Test route working!");
});
  
cron.schedule("0 11 * * *", () => {
  console.log("Running automatic attendance check...");
  checkAndSendAttendanceAlerts()
    .then(() => console.log("Attendance emails sent successfully."))
    .catch(err => console.error("Error sending attendance emails:", err));
});

//for manual trigger
app.get("/send-attendance-alerts/:course_id", async (req, res) => {
  const { course_id } = req.params;
  try {

    await checkAndSendAttendanceAlerts(course_id);
    res.send("Attendance alerts sent manually ✅");
  } catch (err) {
    console.error("Manual trigger error:", err);
    res.status(500).send("Error sending attendance alerts ❌");
  }
});


app.listen(8083,'127.0.0.1', () => {
  console.log("Server is running on port 8083");
});
