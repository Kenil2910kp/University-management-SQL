# 🎓 University Management System

A full-stack **Node.js + MySQL** project for managing students, professors, courses, grades, and attendance — with automation like **auto-enrollment** and **attendance-based email alerts**.

---

## Features
- Student, Professor & Course **CRUD**
- Attendance tracking with % calculation
- **Auto email alert** for students below 80% attendance (via Nodemailer)
- Grade management (mid-sem, internal, end-sem)
- Auto student enrollment using SQL trigger
- Student query & notification system

---

## Tech Stack
**Backend:** Node.js, Express  
**Database:** MySQL  
**Email Service:** Nodemailer  
**Frontend (Current):** HTML, CSS, JavaScript  
**Testing:** Postman 

---

## Future Scope

- A Student-side portal will also be added soon — where students can log in, view attendance, grades, and receive alerts directly.
- React-based frontend for both student and professor dashboards.
- Analytics and visual insights for performance tracking. 


## Frontend for professor

<img width="1465" height="827" alt="Screenshot 2025-11-09 at 6 05 26 AM" src="https://github.com/user-attachments/assets/4ad5f09e-c460-4bf9-8055-e7fda9699253" />
<img width="1460" height="822" alt="Screenshot 2025-11-09 at 6 05 37 AM" src="https://github.com/user-attachments/assets/ac67a7f8-a733-4c85-aade-9beffabb78d3" />
<img width="1458" height="825" alt="Screenshot 2025-11-09 at 6 05 58 AM" src="https://github.com/user-attachments/assets/67ffeec8-e92e-4f67-b62b-4a09dc78172f" />
<img width="1459" height="821" alt="Screenshot 2025-11-09 at 6 06 11 AM" src="https://github.com/user-attachments/assets/5989d317-8567-4261-bbfc-3e10555871c5" />



## Setup

git clone https://github.com/your-username/university-management.git
cd university-management
npm install

## Add a .env file

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

## Database creation

create a schema of name **University_Management2**  And run the below code


USE University_Management2;


CREATE TABLE Admins (
    admin_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);


CREATE TABLE Professors (
    professor_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    department VARCHAR(50)
);


CREATE TABLE Students (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    department VARCHAR(50),
    division VARCHAR(20) NOT NULL
);


CREATE TABLE Courses (
    course_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    credits INT,
    professor_id INT,
    department VARCHAR(50),
    division VARCHAR(20),
    FOREIGN KEY (professor_id) REFERENCES Professors(professor_id)
);

CREATE TABLE Enrollments (
    enrollment_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    course_id INT,
	Division varchar(5),
    FOREIGN KEY (student_id) REFERENCES Students(student_id),
    FOREIGN KEY (course_id) REFERENCES Courses(course_id)
);

CREATE TABLE Attendance (
    attendance_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    course_id INT,
    date DATE,
    status ENUM('Present', 'Absent'),
    FOREIGN KEY (student_id) REFERENCES Students(student_id),
    FOREIGN KEY (course_id) REFERENCES Courses(course_id)
);

CREATE TABLE Grades (
    grade_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    course_id INT,
    mid_sem INT,
    internal INT,
    end_sem INT,
    FOREIGN KEY (student_id) REFERENCES Students(student_id),
    FOREIGN KEY (course_id) REFERENCES Courses(course_id)
);

CREATE TABLE Queries (
    query_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    course_id INT,
    lecture_date DATE,
    message TEXT,
    status ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
    FOREIGN KEY (student_id) REFERENCES Students(student_id),
    FOREIGN KEY (course_id) REFERENCES Courses(course_id)
);

CREATE TABLE Notifications (
    notif_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    course_id INT,
    message TEXT,
    sent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES Students(student_id),
    FOREIGN KEY (course_id) REFERENCES Courses(course_id)
);



INSERT INTO Admins (name, email, password_hash) VALUES
('System Admin', 'admin@university.com', 'hashed_admin_pass');

INSERT INTO Professors (first_name, last_name, email, password_hash, department) VALUES
('Rajesh', 'Kumar', 'rajesh.kumar@example.com', 'hashed_pass1', 'CSE'),
('Neha', 'Reddy', 'neha.reddy@example.com', 'hashed_pass2', 'ECE'),
('Sanjay', 'Mehta', 'sanjay.mehta@example.com', 'hashed_pass3', 'EEE'),
('Priya', 'Iyer', 'priya.iyer@example.com', 'hashed_pass4', 'ME');



INSERT INTO Students (first_name, last_name, email, password_hash, department, division) VALUES
('Aarav', 'Sharma', 'aarav.sharma@example.com', 'hashed_s1', 'CSE', 'A'),
('Isha', 'Patel', 'isha.patel@example.com', 'hashed_s2', 'CSE', 'B'),
('Rohan', 'Verma', 'rohan.verma@example.com', 'hashed_s3', 'ECE', 'A'),
('Meera', 'Nair', 'meera.nair@example.com', 'hashed_s4', 'EEE', 'A'),
('Karan', 'Gupta', 'karan.gupta@example.com', 'hashed_s5', 'CSE', 'A'),
('Simran', 'Kaur', 'simran.kaur@example.com', 'hashed_s6', 'ECE', 'A'),
('Vikram', 'Rao', 'vikram.rao@example.com', 'hashed_s7', 'ME', 'A'),
('Ananya', 'Menon', 'ananya.menon@example.com', 'hashed_s8', 'EEE', 'A'),
('Dev', 'Joshi', 'dev.joshi@example.com', 'hashed_s9', 'ME', 'A'),
('Pooja', 'Deshmukh', 'pooja.deshmukh@example.com', 'hashed_s10', 'CSE', 'B');

INSERT INTO Courses (name, credits, professor_id, department, division) VALUES
('Database Systems', 4, 1, 'CSE', 'A'),
('Database Systems', 4, 1, 'CSE', 'B'),
('Computer Networks', 3, 2, 'ECE', 'A'),
('Digital Electronics', 3, 3, 'EEE', 'A'),
('Thermodynamics', 4, 4, 'ME', 'A');

INSERT INTO Enrollments (student_id, course_id, Division) VALUES
(1, '1', 'A'),
(2, '2', 'B'),
(3, '3', 'A'),
(3, '4', 'A')
;


INSERT INTO Attendance (student_id, course_id, status) VALUES
(1, 1, 'Present'),
(2, 2, 'Absent'),
(3, 3, 'Present');


INSERT INTO Grades (student_id, course_id, mid_sem, internal, end_sem) VALUES
(1, 1, 25, 18, 40),
(2, 2, 20, 15, 35),
(3, 3, 22, 17, 38);

# #for auto enroll a student according to all subjects for the department he have register 

DELIMITER //

CREATE TRIGGER after_student_insert
AFTER INSERT ON Students
FOR EACH ROW
BEGIN
  INSERT INTO Enrollments (student_id, course_id, division)
  SELECT NEW.student_id, c.course_id, c.semester, c.division
  FROM Courses c
  WHERE c.department = NEW.department
    AND c.division = NEW.division;
END //

 DELIMITER ;
 
 



