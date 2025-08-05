// app.js
const express = require('express');
const db = require('./db');

const app = express();
app.use(express.json());


// Kiểm tra kết nối cơ sở dữ liệu
db.getConnection()
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch(err => {                 
    console.error('Connection error:', err);
  });  
   

// Route lấy danh sách users từ bảng đã tạo trong init.sql
app.get('/', async (req, res) => {
  try {
    const [users] = await db.query('SELECT * FROM users');
    res.json(users);
    console.log('Danh sách users:', users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách users' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});