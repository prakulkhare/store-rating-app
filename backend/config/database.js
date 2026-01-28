const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQLPORT || 3306,
  waitForConnections: true,
  connectionLimit: 10
});


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

const promisePool = pool.promise();

module.exports = {
  query: (sql, params) => {
    return promisePool.query(sql, params).then(([results]) => results);
  },
  execute: (sql, params) => {
    return promisePool.execute(sql, params).then(([results]) => results);
  }
};