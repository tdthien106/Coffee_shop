\echo "----------------Creating database tables----------------"


-- Users
CREATE TABLE users (
  user_id        varchar(50) PRIMARY KEY,
  name           varchar(100),
  gender         varchar(10),
  birthday       date,
  phone_number   varchar(20),
  email          varchar(100),
  username       varchar(50),
  password       varchar(100)
);
\echo "Users table created."
-- Employees
CREATE TABLE employees (
  employee_id    varchar(50) PRIMARY KEY,
  user_id        varchar(50) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  start_date     date,
  end_date       date,
  position       varchar(50),
  salary         numeric(12,2) CHECK (salary >= 0)
);
\echo "Employees table created."

-- Shifts
CREATE TABLE shifts (
  shift_id       varchar(50) PRIMARY KEY,
  start_time     timestamp NOT NULL,
  end_time       timestamp NOT NULL,
  CHECK (end_time > start_time)
);
\echo "Shifts table created."

CREATE TABLE shift_employee (
  shift_id       varchar(50) REFERENCES shifts(shift_id) ON DELETE CASCADE,
  employee_id    varchar(50) REFERENCES employees(employee_id) ON DELETE CASCADE,
  PRIMARY KEY (shift_id, employee_id)
);
\echo "Shift_employee table created."
-- Managers / Staffs
CREATE TABLE managers (
  user_id        varchar(50) PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE
);
\echo "Managers table created."
CREATE TABLE staffs (
  user_id        varchar(50) PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  total_shifts   int DEFAULT 0,
  current_shift  varchar(50) REFERENCES shifts(shift_id)
);
\echo "Staffs table created."
-- System settings / Admins
CREATE TABLE system_settings (
  system_id      varchar(50) PRIMARY KEY,
  business_name  varchar(100) NOT NULL,
  tax_rate       numeric(5,2) DEFAULT 0 CHECK (tax_rate >= 0),
  service_charge numeric(5,2) DEFAULT 0 CHECK (service_charge >= 0),
  operating_hours varchar(100)
);
\echo "System settings table created."
CREATE TABLE admins (
  user_id        varchar(50) PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  admin_level    varchar(50),
  access_right   varchar(100)
);
\echo "Admins table created."
-- Logs
CREATE TABLE logs (
  log_id         varchar(50) PRIMARY KEY,
  action         varchar(255) NOT NULL,
  action_time    timestamp DEFAULT now(),
  effective_by   varchar(50) REFERENCES users(user_id)
);
\echo "Logs table created."
-- Recipe / Drink / Menu Item
CREATE TABLE recipe (
  recipe_id      varchar(50) PRIMARY KEY,
  name           varchar(100) NOT NULL,
  serving_size   numeric(10,2)
);
\echo "Recipe table created."
CREATE TABLE drink (
  drink_id       varchar(50) PRIMARY KEY,
  name           varchar(100) NOT NULL,
  unit           varchar(20),
  price          numeric(12,2) CHECK (price >= 0),
  recipe_id      varchar(50) REFERENCES recipe(recipe_id)
);
\echo "Drink table created."
CREATE TABLE menu_item (
  item_id        varchar(50) PRIMARY KEY,
  name           varchar(100) NOT NULL,
  category       varchar(50),
  description    text,
  base_price     numeric(12,2) CHECK (base_price >= 0),
  cost           numeric(12,2) CHECK (cost >= 0),
  CONSTRAINT fk_menuitem_drink
    FOREIGN KEY (item_id) REFERENCES drink(drink_id) ON DELETE RESTRICT
);
\echo "Menu item table created."
-- Orders / Payment (deferrable FKs để tránh vòng tham chiếu)
CREATE TABLE orders (
  order_id       varchar(50) PRIMARY KEY,
  staff_id       varchar(50) REFERENCES staffs(user_id),
  create_time    timestamp DEFAULT now(),
  status         varchar(50),
  payment_id     varchar(50)
);
\echo "Orders table created."
CREATE TABLE payment (
  payment_id     varchar(50) PRIMARY KEY,
  order_id       varchar(50),
  method         varchar(50),
  amount         numeric(12,2) CHECK (amount >= 0),
  payment_date   timestamp DEFAULT now()
);
\echo "Payment table created."
ALTER TABLE orders
  ADD CONSTRAINT fk_orders_payment
  FOREIGN KEY (payment_id) REFERENCES payment(payment_id)
  DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE payment
  ADD CONSTRAINT fk_payment_order
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
  DEFERRABLE INITIALLY DEFERRED;

-- Order detail
CREATE TABLE order_detail (
  order_detail_id varchar(50) PRIMARY KEY,
  order_id        varchar(50) REFERENCES orders(order_id) ON DELETE CASCADE,
  drink_id        varchar(50) REFERENCES drink(drink_id),
  quantity        int CHECK (quantity > 0),
  discount        numeric(5,2) DEFAULT 0,
  total           numeric(12,2) CHECK (total >= 0)
);
\echo "Order detail table created."
-- Ingredient / Recipe ingredient / Stock
CREATE TABLE ingredient (
  ingredient_id  varchar(50) PRIMARY KEY,
  name           varchar(100) NOT NULL,
  unit           varchar(20),
  unit_price     numeric(12,2) CHECK (unit_price >= 0),
  min_stock      numeric(12,2) DEFAULT 0,
  current_stock  numeric(12,2) DEFAULT 0
);
\echo "Ingredient table created."
CREATE TABLE recipe_ingredient (
  recipe_id      varchar(50) REFERENCES recipe(recipe_id) ON DELETE CASCADE,
  ingredient_id  varchar(50) REFERENCES ingredient(ingredient_id) ON DELETE RESTRICT,
  quantity       numeric(12,2) CHECK (quantity >= 0),
  PRIMARY KEY (recipe_id, ingredient_id)
);
\echo "Recipe ingredient table created."
CREATE TABLE stock (
  stock_id       varchar(50) PRIMARY KEY,
  ingredient_id  varchar(50) REFERENCES ingredient(ingredient_id) ON DELETE RESTRICT,
  quantity       numeric(12,2) CHECK (quantity >= 0),
  unit           varchar(20),
  last_update    date
);
\echo "Stock table created."
-- Salary
CREATE TABLE salary (
  employee_id    varchar(50) REFERENCES employees(employee_id) ON DELETE CASCADE,
  shift_id       varchar(50) REFERENCES shifts(shift_id) ON DELETE CASCADE,
  base_salary    numeric(12,2) CHECK (base_salary >= 0),
  PRIMARY KEY (employee_id, shift_id)
);
\echo "Salary table created."
-- Report / Revenue statistics
CREATE TABLE report (
  report_id      varchar(50) PRIMARY KEY,
  type           varchar(50),
  content        text,
  created_by     varchar(50) REFERENCES managers(user_id),
  report_date    date,
  generate_date  date
);
\echo "Report table created."
CREATE TABLE revenue_statistics (
  statistic_id   varchar(50) PRIMARY KEY,
  start_date     date,
  end_date       date,
  total_revenue  numeric(12,2) DEFAULT 0,
  total_orders   int DEFAULT 0
);
\echo "Revenue statistics table created."
CREATE TABLE revenue_statistics_report (
  statistic_id   varchar(50) REFERENCES revenue_statistics(statistic_id) ON DELETE CASCADE,
  report_id      varchar(50) REFERENCES report(report_id) ON DELETE CASCADE,
  PRIMARY KEY (statistic_id, report_id)
);
\echo "Revenue statistics report table created."
CREATE TABLE system_settings_admin (
  user_id        varchar(50) REFERENCES admins(user_id) ON DELETE CASCADE,
  system_id      varchar(50) REFERENCES system_settings(system_id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, system_id)
);
\echo "System settings admin table created."
-- Helpful indexes
CREATE INDEX idx_orders_staff_id           ON orders(staff_id);
CREATE INDEX idx_payment_order_id          ON payment(order_id);
CREATE INDEX idx_order_detail_order_id     ON order_detail(order_id);
CREATE INDEX idx_menu_item_category        ON menu_item(category);
CREATE INDEX idx_drink_name                ON drink(name);


ALTER TABLE drink ADD COLUMN image_url text; 


ALTER TABLE order_detail ADD COLUMN IF NOT EXISTS note text;
