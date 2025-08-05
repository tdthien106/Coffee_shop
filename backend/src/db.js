const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'myuser',
  password: '123456',
  database: 'mydb',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Tăng thời gian timeout
  connectTimeout: 10000,
  // Tùy chọn kết nối lại
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});

pool.on('connection', (connection) => {
  console.log('New connection established');
});

pool.on('error', (err) => {
  console.error('Database error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Database connection was closed.');
  } else if (err.code === 'ER_CON_COUNT_ERROR') {
    console.error('Database has too many connections.');
  } else if (err.code === 'ECONNREFUSED') {
    console.error('Database connection was refused.');
  }
  // Handle other errors as needed  
});


module.exports = pool;