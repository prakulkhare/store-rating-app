const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '2003',
  multipleStatements: true
});

console.log('Attempting to create database and tables...');

const fs = require('fs');
const path = require('path');
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

connection.query(schema, (err, results) => {
  if (err) {
    console.error('Error setting up database:', err);
    console.log('\nTroubleshooting tips:');
    console.log('1. Make sure MySQL is running');
    console.log('2. Check your MySQL credentials in .env file');
    console.log('3. Try creating the database manually:');
    console.log('   mysql -u root -p');
    console.log('   CREATE DATABASE store_rating_app;');
    console.log('   USE store_rating_app;');
    console.log('   Then run the SQL commands from database/schema.sql');
  } else {
    console.log('Database and tables created successfully!');
  }
  
  connection.end();
});