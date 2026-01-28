const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  waitForConnections: true,
  connectionLimit: 10,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err);
    return;
  }
  console.log("✅ Connected to Railway MySQL successfully!");
  connection.release();
});

const promisePool = pool.promise();

module.exports = {
  query: (sql, params) => promisePool.query(sql, params).then(([rows]) => rows),
  execute: (sql, params) => promisePool.execute(sql, params).then(([rows]) => rows),
};
