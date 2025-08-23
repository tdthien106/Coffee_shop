-- 04_insert_revenue_data.sql
\echo "Inserting enhanced revenue data for dashboard..."

-- Clear existing data for fresh start - use CASCADE to handle foreign key constraints
TRUNCATE TABLE revenue_statistics, orders, payment, order_detail, revenue_statistics_report RESTART IDENTITY CASCADE;

-- Insert more comprehensive revenue statistics (converted to VND)
INSERT INTO revenue_statistics (statistic_id, start_date, end_date, total_revenue, total_orders) VALUES
  ('REV001', '2025-08-09', '2025-08-15', 1020000, 85),    -- ~42.5 USD = ~1,020,000 VND
  ('REV002', '2025-08-02', '2025-08-08', 916800, 72),     -- ~38.2 USD = ~916,800 VND
  ('REV003', '2025-07-26', '2025-08-01', 856800, 68),     -- ~35.7 USD = ~856,800 VND
  ('REV004', '2025-07-19', '2025-07-25', 962400, 78),     -- ~40.1 USD = ~962,400 VND
  ('REV005', '2025-07-12', '2025-07-18', 883200, 70);     -- ~36.8 USD = ~883,200 VND

-- Insert orders for the current week (Aug 16-22, 2025)
INSERT INTO orders (order_id, staff_id, create_time, status) VALUES
  -- August 16, 2025 (Monday)
  ('ORD101', 'U002', '2025-08-16 07:30:00', 'completed'),
  ('ORD102', 'U002', '2025-08-16 08:15:00', 'completed'),
  ('ORD103', 'U002', '2025-08-16 09:45:00', 'completed'),
  ('ORD104', 'U002', '2025-08-16 11:20:00', 'completed'),
  ('ORD105', 'U002', '2025-08-16 13:10:00', 'completed'),
  ('ORD106', 'U003', '2025-08-16 14:30:00', 'completed'),
  ('ORD107', 'U003', '2025-08-16 16:45:00', 'completed'),
  ('ORD108', 'U003', '2025-08-16 18:20:00', 'completed'),
  ('ORD109', 'U003', '2025-08-16 20:15:00', 'completed'),
  
  -- August 17, 2025 (Tuesday)
  ('ORD110', 'U001', '2025-08-17 07:45:00', 'completed'),
  ('ORD111', 'U001', '2025-08-17 09:10:00', 'completed'),
  ('ORD112', 'U001', '2025-08-17 10:30:00', 'completed'),
  ('ORD113', 'U001', '2025-08-17 12:15:00', 'completed'),
  ('ORD114', 'U002', '2025-08-17 14:05:00', 'completed'),
  ('ORD115', 'U002', '2025-08-17 15:40:00', 'completed'),
  ('ORD116', 'U002', '2025-08-17 17:20:00', 'completed'),
  ('ORD117', 'U003', '2025-08-17 19:10:00', 'completed'),
  ('ORD118', 'U003', '2025-08-17 20:45:00', 'completed'),
  
  -- August 18, 2025 (Wednesday)
  ('ORD119', 'U001', '2025-08-18 08:00:00', 'completed'),
  ('ORD120', 'U001', '2025-08-18 09:30:00', 'completed'),
  ('ORD121', 'U001', '2025-08-18 11:15:00', 'completed'),
  ('ORD122', 'U002', '2025-08-18 13:20:00', 'completed'),
  ('ORD123', 'U002', '2025-08-18 15:00:00', 'completed'),
  ('ORD124', 'U002', '2025-08-18 16:45:00', 'completed'),
  ('ORD125', 'U003', '2025-08-18 18:30:00', 'completed'),
  ('ORD126', 'U003', '2025-08-18 20:15:00', 'completed'),
  
  -- August 19, 2025 (Thursday)
  ('ORD127', 'U001', '2025-08-19 07:50:00', 'completed'),
  ('ORD128', 'U001', '2025-08-19 09:25:00', 'completed'),
  ('ORD129', 'U001', '2025-08-19 11:10:00', 'completed'),
  ('ORD130', 'U002', '2025-08-19 13:05:00', 'completed'),
  ('ORD131', 'U002', '2025-08-19 14:50:00', 'completed'),
  ('ORD132', 'U002', '2025-08-19 16:35:00', 'completed'),
  ('ORD133', 'U003', '2025-08-19 18:20:00', 'completed'),
  ('ORD134', 'U003', '2025-08-19 20:05:00', 'completed'),
  
  -- August 20, 2025 (Friday)
  ('ORD135', 'U001', '2025-08-20 08:15:00', 'completed'),
  ('ORD136', 'U001', '2025-08-20 09:50:00', 'completed'),
  ('ORD137', 'U001', '2025-08-20 11:35:00', 'completed'),
  ('ORD138', 'U002', '2025-08-20 13:30:00', 'completed'),
  ('ORD139', 'U002', '2025-08-20 15:15:00', 'completed'),
  ('ORD140', 'U002', '2025-08-20 17:00:00', 'completed'),
  ('ORD141', 'U003', '2025-08-20 18:45:00', 'completed'),
  ('ORD142', 'U003', '2025-08-20 20:30:00', 'completed'),
  
  -- August 21, 2025 (Saturday)
  ('ORD143', 'U001', '2025-08-21 08:30:00', 'completed'),
  ('ORD144', 'U001', '2025-08-21 10:15:00', 'completed'),
  ('ORD145', 'U001', '2025-08-21 12:00:00', 'completed'),
  ('ORD146', 'U002', '2025-08-21 13:45:00', 'completed'),
  ('ORD147', 'U002', '2025-08-21 15:30:00', 'completed'),
  ('ORD148', 'U002', '2025-08-21 17:15:00', 'completed'),
  ('ORD149', 'U003', '2025-08-21 19:00:00', 'completed'),
  ('ORD150', 'U003', '2025-08-21 20:45:00', 'completed'),
  
  -- August 22, 2025 (Sunday)
  ('ORD151', 'U001', '2025-08-22 09:00:00', 'completed'),
  ('ORD152', 'U001', '2025-08-22 10:45:00', 'completed'),
  ('ORD153', 'U001', '2025-08-22 12:30:00', 'completed'),
  ('ORD154', 'U002', '2025-08-22 14:15:00', 'completed'),
  ('ORD155', 'U002', '2025-08-22 16:00:00', 'completed'),
  ('ORD156', 'U003', '2025-08-22 17:45:00', 'completed'),
  ('ORD157', 'U003', '2025-08-22 19:30:00', 'completed');

-- Insert payments for all orders (converted to VND)
INSERT INTO payment (payment_id, order_id, method, amount, payment_date) VALUES
  -- Monday payments (converted to VND: 1 USD = 24,000 VND)
  ('PAY101', 'ORD101', 'cash', 1560, '2025-08-16 07:30:00'),    -- 0.065 USD = 1,560 VND
  ('PAY102', 'ORD102', 'momo', 2160, '2025-08-16 08:15:00'),    -- 0.090 USD = 2,160 VND
  ('PAY103', 'ORD103', 'cash', 1320, '2025-08-16 09:45:00'),    -- 0.055 USD = 1,320 VND
  ('PAY104', 'ORD104', 'cash', 2880, '2025-08-16 11:20:00'),    -- 0.120 USD = 2,880 VND
  ('PAY105', 'ORD105', 'momo', 2040, '2025-08-16 13:10:00'),    -- 0.085 USD = 2,040 VND
  ('PAY106', 'ORD106', 'cash', 1680, '2025-08-16 14:30:00'),    -- 0.070 USD = 1,680 VND
  ('PAY107', 'ORD107', 'cash', 2280, '2025-08-16 16:45:00'),    -- 0.095 USD = 2,280 VND
  ('PAY108', 'ORD108', 'momo', 2640, '2025-08-16 18:20:00'),    -- 0.110 USD = 2,640 VND
  ('PAY109', 'ORD109', 'cash', 1920, '2025-08-16 20:15:00'),    -- 0.080 USD = 1,920 VND
  
  -- Tuesday payments
  ('PAY110', 'ORD110', 'cash', 1800, '2025-08-17 07:45:00'),    -- 0.075 USD = 1,800 VND
  ('PAY111', 'ORD111', 'momo', 2400, '2025-08-17 09:10:00'),    -- 0.100 USD = 2,400 VND
  ('PAY112', 'ORD112', 'cash', 1560, '2025-08-17 10:30:00'),    -- 0.065 USD = 1,560 VND
  ('PAY113', 'ORD113', 'cash', 3120, '2025-08-17 12:15:00'),    -- 0.130 USD = 3,120 VND
  ('PAY114', 'ORD114', 'momo', 2160, '2025-08-17 14:05:00'),    -- 0.090 USD = 2,160 VND
  ('PAY115', 'ORD115', 'cash', 1680, '2025-08-17 15:40:00'),    -- 0.070 USD = 1,680 VND
  ('PAY116', 'ORD116', 'cash', 2520, '2025-08-17 17:20:00'),    -- 0.105 USD = 2,520 VND
  ('PAY117', 'ORD117', 'momo', 2760, '2025-08-17 19:10:00'),    -- 0.115 USD = 2,760 VND
  ('PAY118', 'ORD118', 'cash', 2040, '2025-08-17 20:45:00'),    -- 0.085 USD = 2,040 VND
  
  -- Wednesday payments
  ('PAY119', 'ORD119', 'cash', 1920, '2025-08-18 08:00:00'),    -- 0.080 USD = 1,920 VND
  ('PAY120', 'ORD120', 'momo', 2280, '2025-08-18 09:30:00'),    -- 0.095 USD = 2,280 VND
  ('PAY121', 'ORD121', 'cash', 1440, '2025-08-18 11:15:00'),    -- 0.060 USD = 1,440 VND
  ('PAY122', 'ORD122', 'cash', 3000, '2025-08-18 13:20:00'),    -- 0.125 USD = 3,000 VND
  ('PAY123', 'ORD123', 'momo', 2040, '2025-08-18 15:00:00'),    -- 0.085 USD = 2,040 VND
  ('PAY124', 'ORD124', 'cash', 1800, '2025-08-18 16:45:00'),    -- 0.075 USD = 1,800 VND
  ('PAY125', 'ORD125', 'cash', 2640, '2025-08-18 18:30:00'),    -- 0.110 USD = 2,640 VND
  ('PAY126', 'ORD126', 'momo', 2880, '2025-08-18 20:15:00'),    -- 0.120 USD = 2,880 VND
  
  -- Thursday payments
  ('PAY127', 'ORD127', 'cash', 1680, '2025-08-19 07:50:00'),    -- 0.070 USD = 1,680 VND
  ('PAY128', 'ORD128', 'momo', 2160, '2025-08-19 09:25:00'),    -- 0.090 USD = 2,160 VND
  ('PAY129', 'ORD129', 'cash', 1320, '2025-08-19 11:10:00'),    -- 0.055 USD = 1,320 VND
  ('PAY130', 'ORD130', 'cash', 2760, '2025-08-19 13:05:00'),    -- 0.115 USD = 2,760 VND
  ('PAY131', 'ORD131', 'momo', 1920, '2025-08-19 14:50:00'),    -- 0.080 USD = 1,920 VND
  ('PAY132', 'ORD132', 'cash', 1680, '2025-08-19 16:35:00'),    -- 0.070 USD = 1,680 VND
  ('PAY133', 'ORD133', 'cash', 2400, '2025-08-19 18:20:00'),    -- 0.100 USD = 2,400 VND
  ('PAY134', 'ORD134', 'momo', 2520, '2025-08-19 20:05:00'),    -- 0.105 USD = 2,520 VND
  
  -- Friday payments
  ('PAY135', 'ORD135', 'cash', 2040, '2025-08-20 08:15:00'),    -- 0.085 USD = 2,040 VND
  ('PAY136', 'ORD136', 'momo', 2280, '2025-08-20 09:50:00'),    -- 0.095 USD = 2,280 VND
  ('PAY137', 'ORD137', 'cash', 1560, '2025-08-20 11:35:00'),    -- 0.065 USD = 1,560 VND
  ('PAY138', 'ORD138', 'cash', 3120, '2025-08-20 13:30:00'),    -- 0.130 USD = 3,120 VND
  ('PAY139', 'ORD139', 'momo', 2160, '2025-08-20 15:15:00'),    -- 0.090 USD = 2,160 VND
  ('PAY140', 'ORD140', 'cash', 1800, '2025-08-20 17:00:00'),    -- 0.075 USD = 1,800 VND
  ('PAY141', 'ORD141', 'cash', 2760, '2025-08-20 18:45:00'),    -- 0.115 USD = 2,760 VND
  ('PAY142', 'ORD142', 'momo', 3000, '2025-08-20 20:30:00'),    -- 0.125 USD = 3,000 VND
  
  -- Saturday payments
  ('PAY143', 'ORD143', 'cash', 2160, '2025-08-21 08:30:00'),    -- 0.090 USD = 2,160 VND
  ('PAY144', 'ORD144', 'momo', 2640, '2025-08-21 10:15:00'),    -- 0.110 USD = 2,640 VND
  ('PAY145', 'ORD145', 'cash', 1680, '2025-08-21 12:00:00'),    -- 0.070 USD = 1,680 VND
  ('PAY146', 'ORD146', 'cash', 3360, '2025-08-21 13:45:00'),    -- 0.140 USD = 3,360 VND
  ('PAY147', 'ORD147', 'momo', 2280, '2025-08-21 15:30:00'),    -- 0.095 USD = 2,280 VND
  ('PAY148', 'ORD148', 'cash', 1920, '2025-08-21 17:15:00'),    -- 0.080 USD = 1,920 VND
  ('PAY149', 'ORD149', 'cash', 2880, '2025-08-21 19:00:00'),    -- 0.120 USD = 2,880 VND
  ('PAY150', 'ORD150', 'momo', 3120, '2025-08-21 20:45:00'),    -- 0.130 USD = 3,120 VND
  
  -- Sunday payments
  ('PAY151', 'ORD151', 'cash', 1920, '2025-08-22 09:00:00'),    -- 0.080 USD = 1,920 VND
  ('PAY152', 'ORD152', 'momo', 2400, '2025-08-22 10:45:00'),    -- 0.100 USD = 2,400 VND
  ('PAY153', 'ORD153', 'cash', 1560, '2025-08-22 12:30:00'),    -- 0.065 USD = 1,560 VND
  ('PAY154', 'ORD154', 'cash', 3000, '2025-08-22 14:15:00'),    -- 0.125 USD = 3,000 VND
  ('PAY155', 'ORD155', 'momo', 2040, '2025-08-22 16:00:00'),    -- 0.085 USD = 2,040 VND
  ('PAY156', 'ORD156', 'cash', 2640, '2025-08-22 17:45:00'),    -- 0.110 USD = 2,640 VND
  ('PAY157', 'ORD157', 'momo', 2880, '2025-08-22 19:30:00');    -- 0.120 USD = 2,880 VND

-- Insert order details for all orders (converted to VND)
INSERT INTO order_detail (order_detail_id, order_id, drink_id, quantity, total) VALUES
  -- Sample order details (converted to VND)
  ('OD101', 'ORD101', 'D004', 2, 48000),    -- 2 Ca phe den da (20,000 VND each)
  ('OD102', 'ORD101', 'D005', 1, 25000),    -- 1 Ca phe sua da (25,000 VND each)
  ('OD103', 'ORD102', 'D006', 3, 90000),    -- 3 Bac siu (30,000 VND each)
  ('OD104', 'ORD103', 'D007', 1, 35000),    -- 1 Americano (35,000 VND each)
  ('OD105', 'ORD103', 'D005', 1, 25000),    -- 1 Ca phe sua da (25,000 VND each)
  ('OD106', 'ORD104', 'D008', 2, 80000),    -- 2 Tra sua tran chau (40,000 VND each)
  ('OD107', 'ORD104', 'D009', 1, 35000),    -- 1 Tra dao cam sa (35,000 VND each)
  ('OD108', 'ORD105', 'D010', 1, 45000),    -- 1 Sinh to bo (45,000 VND each)
  ('OD109', 'ORD105', 'D004', 2, 40000),    -- 2 Ca phe den da (20,000 VND each)
  ('OD110', 'ORD106', 'D005', 3, 75000);    -- 3 Ca phe sua da (25,000 VND each)

-- Add more order details as needed for the dashboard to show realistic data

\echo "Revenue data insertion complete with VND currency!"