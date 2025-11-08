const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "kenil2910",
  database: "University_Management2",
  port: 3306
});

module.exports = db;
