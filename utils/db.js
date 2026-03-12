import mysql from "mysql2";

// Create MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "konpekiplaza",
});

export default db;
