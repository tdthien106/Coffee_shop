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
  ('U001', 10, NULL)
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
