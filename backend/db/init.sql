-- Tạo database nếu chưa tồn tại
CREATE DATABASE IF NOT EXISTS mydb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tạo user và cấp quyền (sử dụng mysql_native_password để tương thích tốt)
CREATE USER IF NOT EXISTS 'myuser'@'%' IDENTIFIED WITH mysql_native_password BY 'mypass';
CREATE USER IF NOT EXISTS 'myuser'@'localhost' IDENTIFIED WITH mysql_native_password BY 'mypass';

-- Cấp tất cả quyền trên database cho user
GRANT ALL PRIVILEGES ON mydb.* TO 'myuser'@'%';
GRANT ALL PRIVILEGES ON mydb.* TO 'myuser'@'localhost';

-- Đảm bảo các thay đổi quyền được áp dụng
FLUSH PRIVILEGES;

-- Sử dụng database
USE mydb;

-- Tạo bảng users nếu chưa tồn tại
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thêm dữ liệu mẫu (chỉ thêm nếu chưa tồn tại)
INSERT IGNORE INTO users (name, email) VALUES 
('John Doe', 'john@example.com'),
('Jane Smith', 'jane@example.com');

-- Hiển thị thông tin xác nhận
SELECT 'Database setup completed successfully!' AS message;
SELECT * FROM users;