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
