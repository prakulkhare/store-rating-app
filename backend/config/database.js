const mysql = require('mysql2');
require('dotenv').config();

// Create a connection pool instead of a single connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '2003',
  database: process.env.DB_NAME || 'store_rating_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    console.log('Please check your MySQL configuration:');
    console.log('- Is MySQL running?');
    console.log('- Are the credentials in .env file correct?');
    console.log('- Does the database exist?');
    return;
  }
  console.log('Connected to MySQL database successfully!');
  connection.release();
});

// Promisify for async/await
const promisePool = pool.promise();

module.exports = {
  query: (sql, params) => {
    return promisePool.query(sql, params).then(([results]) => results);
  },
  execute: (sql, params) => {
    return promisePool.execute(sql, params).then(([results]) => results);
  }
};