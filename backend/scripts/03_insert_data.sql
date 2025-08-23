\echo "Inserting initial data into the database..."
-- USERS
INSERT INTO users (user_id, name, gender, birthday, phone_number, email, username, password) VALUES
  ('U001','Pham Ngoc Gia Bao','Male','2005-09-07','0901234567','bao@gmail.com','baobao','123'),
  ('U002','Vo Quoc Trieu','Male','2005-03-06','0912345678','trieu@gmail.com','trieu007','abcdef'),
  ('U003','Vo Le Huu Thang','Male','2005-11-11','0923456789','thang@gmail.com','thangne05','hihi123'),
  ('U004','Trinh Duc Thien','Male','2005-04-06','0923456783','thien@gmail.com','thienthien','123');

-- EMPLOYEES
INSERT INTO employees (employee_id, user_id, start_date, end_date, position, salary) VALUES
  ('S001','U001','2024-06-01',NULL,'Staff',8000000),
  ('S002','U002','2024-02-02',NULL,'Staff',8000000),
  ('S003','U003','2025-01-01',NULL,'Staff',8000000),
  ('M001','U004','2023-02-23',NULL,'Manager',15000000);

-- MANAGERS
INSERT INTO managers (user_id) VALUES ('U004');

-- STAFFS
INSERT INTO staffs (user_id, total_shifts, current_shift) VALUES
  ('U001', 10, NULL),
  ('U002',13,NULL),
  ('U003',15,NULL),
  ('U004',10,NULL);

-- RECIPE
INSERT INTO recipe (recipe_id, name, serving_size) VALUES
  ('R004','Ca phe den da',250),
  ('R005','Ca phe sua da',250),
  ('R006','Bac siu',250),
  ('R007','Americano',300);

-- DRINK  (chèn trước để thỏa FK menu_item.item_id → drink.drink_id)
INSERT INTO drink (drink_id, name, unit, price, recipe_id) VALUES
  ('D004','Ca phe den da','ly',20000,'R004'),
  ('D005','Ca phe sua da','ly',25000,'R005'),
  ('D006','Bac siu','ly',30000,'R006'),
  ('D007','Americano','ly',35000,'R007');

-- MENU ITEM
INSERT INTO menu_item (item_id, name, category, description, base_price, cost) VALUES
  ('D004','Ca phe den da','Coffee','Ca phe pha phin dam dac, da mat lanh, khong sua.',20000,5000),
  ('D005','Ca phe sua da','Coffee','Ca phe phin ket hop sua dac, da mat lanh.',25000,8000),
  ('D006','Bac siu','Coffee','Ca phe it, nhieu sua, vi ngot beo dac trung.',30000,10000),
  ('D007','Americano','Coffee','Espresso pha loang voi nuoc nong, vi nhe.',35000,12000);

INSERT INTO shifts (shift_id, start_time, end_time) VALUES
  ('SH001', '2024-06-01 07:00:00', '2024-06-01 15:00:00'),
  ('SH002', '2024-06-01 15:00:00', '2024-06-01 23:00:00');

UPDATE staffs SET current_shift = 'SH001' WHERE user_id = 'U002';
UPDATE staffs SET current_shift = 'SH002' WHERE user_id = 'U003';

INSERT INTO orders (order_id, staff_id, create_time, status) VALUES
  ('ORD001', 'U002', '2024-06-01 08:30:00', 'completed'),
  ('ORD002', 'U002', '2024-06-01 09:15:00', 'completed'),
  ('ORD003', 'U003', '2024-06-01 16:45:00', 'completed');

INSERT INTO payment (payment_id, order_id, method, amount) VALUES
  ('PAY001', 'ORD001', 'cash', 65000),
  ('PAY002', 'ORD002', 'momo', 90000),
  ('PAY003', 'ORD003', 'cash', 55000);

INSERT INTO order_detail (order_detail_id, order_id, drink_id, quantity, total) VALUES
  ('OD001', 'ORD001', 'D004', 1, 20000), -- Ca phe den da
  ('OD002', 'ORD001', 'D005', 2, 50000), -- Ca phe sua da
  ('OD003', 'ORD002', 'D006', 3, 90000), -- Bac siu
  ('OD004', 'ORD003', 'D004', 1, 20000), -- Ca phe den da
  ('OD005', 'ORD003', 'D007', 1, 35000); -- Americano

INSERT INTO ingredient (ingredient_id, name, unit, unit_price, current_stock) VALUES
  ('ING001', 'Ca phe Nguyen chat', 'kg', 200000, 5.5),
  ('ING002', 'Sua dac', 'hop', 30000, 20),
  ('ING003', 'Duong', 'kg', 25000, 10),
  ('ING004', 'Da vien', 'kg', 5000, 15);

INSERT INTO recipe_ingredient (recipe_id, ingredient_id, quantity) VALUES
  ('R004', 'ING001', 0.02), -- Ca phe den da: 20g ca phe
  ('R004', 'ING004', 0.1),  -- 100g da
  ('R005', 'ING001', 0.02), -- Ca phe sua da
  ('R005', 'ING002', 0.05), -- 50ml sua
  ('R005', 'ING003', 0.01), -- 10g duong
  ('R005', 'ING004', 0.1),
  ('R006', 'ING001', 0.01), -- Bac siu
  ('R006', 'ING002', 0.1),
  ('R006', 'ING003', 0.02),
  ('R006', 'ING004', 0.1),
  ('R007', 'ING001', 0.03); -- Americano


INSERT INTO revenue_statistics (statistic_id, start_date, end_date, total_revenue, total_orders) VALUES
  ('REV001', '2024-05-26', '2024-06-01', 4200000, 35),
  ('REV002', '2024-05-19', '2024-05-25', 3800000, 30),
  ('REV003', '2024-05-12', '2024-05-18', 3500000, 28);

INSERT INTO logs (log_id, action, effective_by) VALUES
  ('LOG001', 'Tao don hang ORD001', 'U002'),
  ('LOG002', 'Tao don hang ORD002', 'U002'),
  ('LOG003', 'Tao don hang ORD003', 'U003'),
  ('LOG004', 'Cap nhat menu', 'U004');

  UPDATE drink
  SET image_url = 'http://localhost:3000/static/images/D004.jpg'
  WHERE drink_id = 'D004';

UPDATE drink
  SET image_url = 'http://localhost:3000/static/images/D005.jpg'
  WHERE drink_id = 'D005';


  UPDATE drink
  SET image_url = 'http://localhost:3000/static/images/D004.jpg'
  WHERE drink_id = 'D006';


  UPDATE drink
  SET image_url = 'http://localhost:3000/static/images/D004.jpg'
  WHERE drink_id = 'D007';


UPDATE orders SET create_time = '2025-08-16 08:30:00' WHERE order_id = 'ORD001';
UPDATE orders SET create_time = '2025-08-16 09:15:00' WHERE order_id = 'ORD002';
UPDATE orders SET create_time = '2025-08-17 16:45:00' WHERE order_id = 'ORD003';

-- Update existing orders to recent dates
UPDATE orders SET create_time = '2025-08-16 08:30:00' WHERE order_id = 'ORD001';
UPDATE orders SET create_time = '2025-08-16 09:15:00' WHERE order_id = 'ORD002';
UPDATE orders SET create_time = '2025-08-17 16:45:00' WHERE order_id = 'ORD003';

-- Update payment dates to match
UPDATE payment SET payment_date = '2025-08-16 08:30:00' WHERE payment_id = 'PAY001';
UPDATE payment SET payment_date = '2025-08-16 09:15:00' WHERE payment_id = 'PAY002';
UPDATE payment SET payment_date = '2025-08-17 16:45:00' WHERE payment_id = 'PAY003';

-- Add more recent orders with different times and menu items
INSERT INTO orders (order_id, staff_id, create_time, status) VALUES
  ('ORD004', 'U001', '2025-08-17 10:30:00', 'completed'),
  ('ORD005', 'U002', '2025-08-17 11:45:00', 'completed'),
  ('ORD006', 'U003', '2025-08-17 14:15:00', 'completed'),
  ('ORD007', 'U001', '2025-08-17 18:30:00', 'completed'),
  ('ORD008', 'U002', '2025-08-16 12:00:00', 'completed'),
  ('ORD009', 'U003', '2025-08-16 15:30:00', 'completed');

-- Add corresponding payments
INSERT INTO payment (payment_id, order_id, method, amount) VALUES
  ('PAY004', 'ORD004', 'cash', 45000),
  ('PAY005', 'ORD005', 'momo', 60000),
  ('PAY006', 'ORD006', 'cash', 35000),
  ('PAY007', 'ORD007', 'cash', 70000),
  ('PAY008', 'ORD008', 'momo', 55000),
  ('PAY009', 'ORD009', 'cash', 90000);

-- Add order details with variety
INSERT INTO order_detail (order_detail_id, order_id, drink_id, quantity, total) VALUES
  ('OD006', 'ORD004', 'D005', 1, 25000), -- Ca phe sua da
  ('OD007', 'ORD004', 'D007', 1, 35000), -- Americano
  ('OD008', 'ORD005', 'D006', 2, 60000), -- Bac siu
  ('OD009', 'ORD006', 'D004', 1, 20000), -- Ca phe den da
  ('OD010', 'ORD006', 'D005', 1, 25000), -- Ca phe sua da
  ('OD011', 'ORD007', 'D007', 2, 70000), -- Americano
  ('OD012', 'ORD008', 'D005', 1, 25000), -- Ca phe sua da
  ('OD013', 'ORD008', 'D006', 1, 30000), -- Bac siu
  ('OD014', 'ORD009', 'D004', 3, 60000); -- Ca phe den da (3 cups)

-- Add more recent revenue statistics
INSERT INTO revenue_statistics (statistic_id, start_date, end_date, total_revenue, total_orders) VALUES
  ('REV004', '2025-08-09', '2025-08-15', 4500000, 42),
  ('REV005', '2025-08-02', '2025-08-08', 3800000, 35);

-- Add more recipes
INSERT INTO recipe (recipe_id, name, serving_size) VALUES
  ('R008', 'Tra sua', 350),
  ('R009', 'Tra dao', 300),
  ('R010', 'Sinh to', 400);

-- Add more drinks
INSERT INTO drink (drink_id, name, unit, price, recipe_id, image_url) VALUES
  ('D008', 'Tra sua tran chau', 'ly', 40000, 'R008', 'http://localhost:3000/static/images/D008.jpg'),
  ('D009', 'Tra dao cam sa', 'ly', 35000, 'R009', 'http://localhost:3000/static/images/D009.jpg'),
  ('D010', 'Sinh to bo', 'ly', 45000, 'R010', 'http://localhost:3000/static/images/D010.jpg');

-- Add more menu items
INSERT INTO menu_item (item_id, name, category, description, base_price, cost) VALUES
  ('D008', 'Tra sua tran chau', 'Tea', 'Tra sua kem tran chau dai, ngot vua phai.', 40000, 15000),
  ('D009', 'Tra dao cam sa', 'Tea', 'Tra dao tuoi kem cam sa, vi thanh mat.', 35000, 12000),
  ('D010', 'Sinh to bo', 'Smoothie', 'Sinh to bo nguyen chat, beo ngay.', 45000, 18000);

-- Update some orders to include new drinks
INSERT INTO order_detail (order_detail_id, order_id, drink_id, quantity, total) VALUES
  ('OD015', 'ORD001', 'D008', 1, 40000), -- Tra sua tran chau
  ('OD016', 'ORD003', 'D009', 1, 35000), -- Tra dao cam sa
  ('OD017', 'ORD005', 'D010', 1, 45000); -- Sinh to bo

-- Add more ingredients
INSERT INTO ingredient (ingredient_id, name, unit, unit_price, current_stock) VALUES
  ('ING005', 'Tra sua', 'kg', 150000, 8.0),
  ('ING006', 'Tran chau', 'kg', 80000, 5.0),
  ('ING007', 'Dao tuoi', 'kg', 120000, 3.0),
  ('ING008', 'Cam sa', 'kg', 90000, 2.0),
  ('ING009', 'Bo', 'kg', 180000, 6.0),
  ('ING010', 'Sua tuoi', 'l', 30000, 15.0);

-- Add recipe ingredients for new drinks
INSERT INTO recipe_ingredient (recipe_id, ingredient_id, quantity) VALUES
  ('R008', 'ING005', 0.03), -- Tra sua
  ('R008', 'ING006', 0.05), -- Tran chau
  ('R008', 'ING003', 0.02), -- Duong
  ('R009', 'ING007', 0.04), -- Dao tuoi
  ('R009', 'ING008', 0.01), -- Cam sa
  ('R010', 'ING009', 0.10), -- Bo
  ('R010', 'ING010', 0.15); -- Sua tuoi


-- Tuần 18/08/2025 - 24/08/2025
INSERT INTO shifts (shift_id, start_time, end_time) VALUES
-- 18/08/2025 (Thứ 2)
('SH_20250818_C1', '2025-08-18 06:00:00', '2025-08-18 12:00:00'),
('SH_20250818_C2', '2025-08-18 12:00:00', '2025-08-18 18:00:00'),
('SH_20250818_C3', '2025-08-18 18:00:00', '2025-08-18 23:59:59'),

-- 19/08/2025 (Thứ 3)
('SH_20250819_C1', '2025-08-19 06:00:00', '2025-08-19 12:00:00'),
('SH_20250819_C2', '2025-08-19 12:00:00', '2025-08-19 18:00:00'),
('SH_20250819_C3', '2025-08-19 18:00:00', '2025-08-19 23:59:59'),

-- 20/08/2025 (Thứ 4)
('SH_20250820_C1', '2025-08-20 06:00:00', '2025-08-20 12:00:00'),
('SH_20250820_C2', '2025-08-20 12:00:00', '2025-08-20 18:00:00'),
('SH_20250820_C3', '2025-08-20 18:00:00', '2025-08-20 23:59:59'),

-- 21/08/2025 (Thứ 5)
('SH_20250821_C1', '2025-08-21 06:00:00', '2025-08-21 12:00:00'),
('SH_20250821_C2', '2025-08-21 12:00:00', '2025-08-21 18:00:00'),
('SH_20250821_C3', '2025-08-21 18:00:00', '2025-08-21 23:59:59'),

-- 22/08/2025 (Thứ 6)
('SH_20250822_C1', '2025-08-22 06:00:00', '2025-08-22 12:00:00'),
('SH_20250822_C2', '2025-08-22 12:00:00', '2025-08-22 18:00:00'),
('SH_20250822_C3', '2025-08-22 18:00:00', '2025-08-22 23:59:59'),

-- 23/08/2025 (Thứ 7)
('SH_20250823_C1', '2025-08-23 06:00:00', '2025-08-23 12:00:00'),
('SH_20250823_C2', '2025-08-23 12:00:00', '2025-08-23 18:00:00'),
('SH_20250823_C3', '2025-08-23 18:00:00', '2025-08-23 23:59:59'),

-- 24/08/2025 (CN)
('SH_20250824_C1', '2025-08-24 06:00:00', '2025-08-24 12:00:00'),
('SH_20250824_C2', '2025-08-24 12:00:00', '2025-08-24 18:00:00'),
('SH_20250824_C3', '2025-08-24 18:00:00', '2025-08-24 23:59:59');


-- Phân công nhân viên tuần 19/08/2025 – 24/08/2025
INSERT INTO shift_employee (shift_id, employee_id) VALUES
('SH_20250819_C1','S001'),('SH_20250819_C2','S002'),('SH_20250819_C3','S003'),
('SH_20250820_C1','S002'),('SH_20250820_C2','S003'),('SH_20250820_C3','S001'),
('SH_20250821_C1','S003'),('SH_20250821_C2','S001'),('SH_20250821_C3','S002'),
('SH_20250822_C1','S001'),('SH_20250822_C2','S002'),('SH_20250822_C3','S003'),
('SH_20250823_C1','S002'),('SH_20250823_C2','S003'),('SH_20250823_C3','S001'),
('SH_20250824_C1','S003'),('SH_20250824_C2','S001'),('SH_20250824_C3','S002');


-- Shifts tuần 25/08/2025 – 31/08/2025
INSERT INTO shifts (shift_id, start_time, end_time) VALUES
('SH_20250825_C1', '2025-08-25 06:00:00', '2025-08-25 12:00:00'),
('SH_20250825_C2', '2025-08-25 12:00:00', '2025-08-25 18:00:00'),
('SH_20250825_C3', '2025-08-25 18:00:00', '2025-08-25 23:59:59'),

('SH_20250826_C1', '2025-08-26 06:00:00', '2025-08-26 12:00:00'),
('SH_20250826_C2', '2025-08-26 12:00:00', '2025-08-26 18:00:00'),
('SH_20250826_C3', '2025-08-26 18:00:00', '2025-08-26 23:59:59'),

('SH_20250827_C1', '2025-08-27 06:00:00', '2025-08-27 12:00:00'),
('SH_20250827_C2', '2025-08-27 12:00:00', '2025-08-27 18:00:00'),
('SH_20250827_C3', '2025-08-27 18:00:00', '2025-08-27 23:59:59'),

('SH_20250828_C1', '2025-08-28 06:00:00', '2025-08-28 12:00:00'),
('SH_20250828_C2', '2025-08-28 12:00:00', '2025-08-28 18:00:00'),
('SH_20250828_C3', '2025-08-28 18:00:00', '2025-08-28 23:59:59'),

('SH_20250829_C1', '2025-08-29 06:00:00', '2025-08-29 12:00:00'),
('SH_20250829_C2', '2025-08-29 12:00:00', '2025-08-29 18:00:00'),
('SH_20250829_C3', '2025-08-29 18:00:00', '2025-08-29 23:59:59'),

('SH_20250830_C1', '2025-08-30 06:00:00', '2025-08-30 12:00:00'),
('SH_20250830_C2', '2025-08-30 12:00:00', '2025-08-30 18:00:00'),
('SH_20250830_C3', '2025-08-30 18:00:00', '2025-08-30 23:59:59'),

('SH_20250831_C1', '2025-08-31 06:00:00', '2025-08-31 12:00:00'),
('SH_20250831_C2', '2025-08-31 12:00:00', '2025-08-31 18:00:00'),
('SH_20250831_C3', '2025-08-31 18:00:00', '2025-08-31 23:59:59');


-- Phân công nhân viên tuần 25/08/2025 – 31/08/2025
INSERT INTO shift_employee (shift_id, employee_id) VALUES
('SH_20250825_C1','S001'),('SH_20250825_C2','S002'),('SH_20250825_C3','S003'),
('SH_20250826_C1','S002'),('SH_20250826_C2','S003'),('SH_20250826_C3','S001'),
('SH_20250827_C1','S003'),('SH_20250827_C2','S001'),('SH_20250827_C3','S002'),
('SH_20250828_C1','S001'),('SH_20250828_C2','S002'),('SH_20250828_C3','S003'),
('SH_20250829_C1','S002'),('SH_20250829_C2','S003'),('SH_20250829_C3','S001'),
('SH_20250830_C1','S003'),('SH_20250830_C2','S001'),('SH_20250830_C3','S002'),
('SH_20250831_C1','S001'),('SH_20250831_C2','S002'),('SH_20250831_C3','S003');
