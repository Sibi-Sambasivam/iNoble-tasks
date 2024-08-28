const mysql = require('mysql2');

const db = mysql.createConnection({
    host: "localhost",
    user: "Sibi",
    password: "",
    database: "Machinetest"
});

db.connect((err) => {
  if (err) {
    console.error('Failed to connect:', err.message);
    return;
  }
  console.log('Connected');
});

module.exports = db;
