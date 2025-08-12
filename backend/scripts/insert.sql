

-- Insert data into the User table

INSERT INTO "User"
    (userID, NAME, gender, birthday, phoneNumber, email, username, password)
VALUES
    ('U001', 'Pham Ngoc Gia Bao', 'Male', '2005-09-07', '0901234567', 'bao@gmail.com', 'baobao05', '123456'),
    ('U002', 'Vo Quoc Trieu', 'Male', '2005-03-06', '0912345678', 'trieu@gmail.com', 'trieu007', 'abcdef'),
    ('U003', 'Vo Le Huu Thang', 'Male', '2005-11-11', '0923456789', 'thang@gmail.com', 'thangne05', 'hihi123'),
    ('U004', 'Trinh Duc Thien', 'Male', '2005-04-06', '0923456783', 'thien@gmail.com', 'thien12', 'hehe2203');


-- Insert data into the Employee table

INSERT INTO Employee
    (employeeID, userID, startDate, endDate, position, salary)
VALUES
    ('S001', 'U001', '2024-06-01', NULL, 'Staff', 8000000),
    ('S002', 'U002', '2024-02-02', NULL, 'Staff', 8000000),
    ('S003', 'U003', '2025-01-01', NULL, 'Staff', 8000000),
    ('M001', 'U004', '2023-02-23', NULL, 'Manager', 15000000);


-- Insert data into the Manager table

INSERT INTO Manager
    (userID)
VALUES
    ('U004')



-- Insert data into the Staff table

INSERT INTO Staff
    (userID, totalShifts, currentShift)
VALUES
    ('U002', 13, null),
    ('U003', 15, null),
    ('U004', 10, null);


INSERT INTO Recipe
    (recipeID, name, servingSize)
VALUES
    ('R004', 'Ca phe den da', 250),
    ('R005', 'Ca phe sua da', 250),
    ('R006', 'Bac siu', 250),
    ('R007', 'Americano', 300);

INSERT INTO Drink
    (drinkID, name, unit, price, recipeID)
VALUES
    ('D004', 'Ca phe den da', 'ly', 20000, 'R004'),
    ('D005', 'Ca phe sua da', 'ly', 25000, 'R005'),
    ('D006', 'Bac siu', 'ly', 30000, 'R006'),
    ('D007', 'Americano', 'ly', 35000, 'R007');

INSERT INTO MenuItem
    (itemID, name, category, description, basePrice, cost)
VALUES
    ('D004', 'Ca phe den da', 'Coffee', 'Ca phe pha phin dam dac, da mat lanh, khong sua.', 20000, 5000),
    ('D005', 'Ca phe sua da', 'Coffee', 'Ca phe phin ket hop sua dac, da mat lanh.', 25000, 8000),
    ('D006', 'Bac siu', 'Coffee', 'Ca phe it, nhieu sua, vi ngot beo dac trung.', 30000, 10000),
    ('D007', 'Americano', 'Coffee', 'Espresso pha loang voi nuoc nong, vi nhe.', 35000, 12000);