-- Create database and use it
CREATE DATABASE Coffee_Shop4;
GO
USE Coffee_Shop4;
GO

-- Step 1: Create all tables (no foreign keys yet)
CREATE TABLE USERS (
    userID VARCHAR(50) PRIMARY KEY,
    fullName VARCHAR(100),
    gender VARCHAR(10),
    birthday DATE,
    phoneNumber VARCHAR(20),
    email VARCHAR(100),
    username VARCHAR(50) UNIQUE,
    passwordHash VARCHAR(100)
);

CREATE TABLE EMPLOYEES (
    employeeID VARCHAR(50) PRIMARY KEY,
    userID VARCHAR(50),
    startDate DATE,
    endDate DATE,
    position VARCHAR(50),
    salary REAL
);

CREATE TABLE SHIFTS (
    shiftID VARCHAR(50) PRIMARY KEY,
    startTime DATETIME,
    endTime DATETIME
);

CREATE TABLE SHIFT_EMPLOYEE (
    shiftID VARCHAR(50),
    employeeID VARCHAR(50),
    PRIMARY KEY (shiftID, employeeID)
);

CREATE TABLE MANAGERS (
    userID VARCHAR(50) PRIMARY KEY
);

CREATE TABLE STAFFS (
    userID VARCHAR(50) PRIMARY KEY,
    totalShifts INT,
    currentShift VARCHAR(50)
);

CREATE TABLE SYSTEMSETTINGS (
    systemID VARCHAR(50) PRIMARY KEY,
    businessName VARCHAR(100),
    taxRate REAL,
    serviceCharge REAL,
    operatingHours VARCHAR(100)
);

CREATE TABLE ADMINS (
    userID VARCHAR(50) PRIMARY KEY,
    adminLevel VARCHAR(50),
    accessRight VARCHAR(100)
);

CREATE TABLE LOG (
    logID VARCHAR(50) PRIMARY KEY,
    action VARCHAR(255),
    actionTime DATETIME,
    effectiveBy VARCHAR(50)
);

CREATE TABLE MENUITEM (
    itemID VARCHAR(50) PRIMARY KEY,
    itemName VARCHAR(100),
    category VARCHAR(50),
    description TEXT,
    basePrice REAL,
    cost REAL
);

CREATE TABLE PAYMENT (
    paymentID VARCHAR(50) PRIMARY KEY,
    orderID VARCHAR(50),
    method VARCHAR(50),
    amount REAL,
    paymentDate DATETIME
);

CREATE TABLE [ORDER] (
    orderID VARCHAR(50) PRIMARY KEY,
    staffID VARCHAR(50),
    createTime DATETIME,
    orderStatus VARCHAR(50),
    paymentID VARCHAR(50)
);

CREATE TABLE RECIPE (
    recipeID VARCHAR(50) PRIMARY KEY,
    recipeName VARCHAR(100),
    servingSize REAL
);

CREATE TABLE DRINK (
    drinkID VARCHAR(50) PRIMARY KEY,
    drinkName VARCHAR(100),
    unitName VARCHAR(20),
    price REAL,
    recipeID VARCHAR(50)
);

CREATE TABLE ORDERDETAIL (
    orderDetailID VARCHAR(50) PRIMARY KEY,
    orderID VARCHAR(50),
    drinkID VARCHAR(50),
    quantity INT,
    discount REAL,
    total REAL
);

CREATE TABLE INGREDIENT (
    ingredientID VARCHAR(50) PRIMARY KEY,
    ingredientName VARCHAR(100),
    unitName VARCHAR(20),
    unitPrice REAL,
    minStock REAL,
    currentStock REAL
);

CREATE TABLE RECIPE_INGREDIENT (
    recipeID VARCHAR(50),
    ingredientID VARCHAR(50),
    quantity REAL,
    PRIMARY KEY (recipeID, ingredientID)
);

CREATE TABLE STOCK (
    stockID VARCHAR(50) PRIMARY KEY,
    ingredientID VARCHAR(50),
    quantity REAL,
    unitName VARCHAR(20),
    lastUpdate DATE
);

CREATE TABLE SALARY (
    employeeID VARCHAR(50),
    shiftID VARCHAR(50),
    baseSalary REAL,
    PRIMARY KEY (employeeID, shiftID)
);

CREATE TABLE REPORT (
    reportID VARCHAR(50) PRIMARY KEY,
    reportType VARCHAR(50),
    reportContent TEXT,
    createdBy VARCHAR(50),
    reportDate DATE,
    generateDate DATE
);

CREATE TABLE REVENUESTATISTICS(
    statisticID VARCHAR(50) PRIMARY KEY,
    startDate DATE,
    endDate DATE,
    totalRevenue REAL,
    totalOrders INT
);

CREATE TABLE REVENUESTATISTICS_REPORT(
    statisticID VARCHAR(50),
    reportID VARCHAR(50),
    PRIMARY KEY (statisticID, reportID)
);

CREATE TABLE SYSTEMSETTINGS_ADMIN(
     userID VARCHAR(50),
     systemID VARCHAR(50),
     PRIMARY KEY (userID, systemID)
);

-- Step 2: Add FOREIGN KEY constraints (fixed table & column names)
ALTER TABLE EMPLOYEES
ADD CONSTRAINT FK_Employee_User FOREIGN KEY (userID) REFERENCES USERS(userID);

ALTER TABLE SHIFT_EMPLOYEE
ADD CONSTRAINT FK_ShiftEmployee_Shift FOREIGN KEY (shiftID) REFERENCES SHIFTS(shiftID),
    CONSTRAINT FK_ShiftEmployee_Employee FOREIGN KEY (employeeID) REFERENCES EMPLOYEES(employeeID);

ALTER TABLE MANAGERS
ADD CONSTRAINT FK_Manager_User FOREIGN KEY (userID) REFERENCES USERS(userID);

ALTER TABLE STAFFS
ADD CONSTRAINT FK_Staff_User FOREIGN KEY (userID) REFERENCES USERS(userID),
    CONSTRAINT FK_Staff_CurrentShift FOREIGN KEY (currentShift) REFERENCES SHIFTS(shiftID);

ALTER TABLE ADMINS
ADD CONSTRAINT FK_Admin_User FOREIGN KEY (userID) REFERENCES USERS(userID);

ALTER TABLE LOG
ADD CONSTRAINT FK_Log_User FOREIGN KEY (effectiveBy) REFERENCES USERS(userID);

ALTER TABLE [ORDER]
ADD CONSTRAINT FK_Order_Staff FOREIGN KEY (staffID) REFERENCES STAFFS(userID),
    CONSTRAINT FK_Order_Payment FOREIGN KEY (paymentID) REFERENCES PAYMENT(paymentID);

ALTER TABLE PAYMENT
ADD CONSTRAINT FK_Payment_Order FOREIGN KEY (orderID) REFERENCES [ORDER](orderID);

ALTER TABLE DRINK
ADD CONSTRAINT FK_Drink_Recipe FOREIGN KEY (recipeID) REFERENCES RECIPE(recipeID);

ALTER TABLE ORDERDETAIL
ADD CONSTRAINT FK_OrderDetail_Order FOREIGN KEY (orderID) REFERENCES [ORDER](orderID),
    CONSTRAINT FK_OrderDetail_Drink FOREIGN KEY (drinkID) REFERENCES DRINK(drinkID);

ALTER TABLE RECIPE_INGREDIENT
ADD CONSTRAINT FK_RecipeIngredient_Recipe FOREIGN KEY (recipeID) REFERENCES RECIPE(recipeID),
    CONSTRAINT FK_RecipeIngredient_Ingredient FOREIGN KEY (ingredientID) REFERENCES INGREDIENT(ingredientID);

ALTER TABLE STOCK
ADD CONSTRAINT FK_Stock_Ingredient FOREIGN KEY (ingredientID) REFERENCES INGREDIENT(ingredientID);

ALTER TABLE SALARY
ADD CONSTRAINT FK_Salary_Employee FOREIGN KEY (employeeID) REFERENCES EMPLOYEES(employeeID),
    CONSTRAINT FK_Salary_Shift FOREIGN KEY (shiftID) REFERENCES SHIFTS(shiftID);

ALTER TABLE REPORT
ADD CONSTRAINT FK_Report_Manager FOREIGN KEY (createdBy) REFERENCES MANAGERS(userID);

ALTER TABLE MENUITEM
ADD CONSTRAINT FK_MenuItem_Drink FOREIGN KEY (itemID) REFERENCES DRINK(drinkID);

ALTER TABLE REVENUESTATISTICS_REPORT
ADD CONSTRAINT FK_RevenueReport_Statistic FOREIGN KEY (statisticID) REFERENCES REVENUESTATISTICS(statisticID),
    CONSTRAINT FK_RevenueReport_Report FOREIGN KEY (reportID) REFERENCES REPORT(reportID);

ALTER TABLE SYSTEMSETTINGS_ADMIN
ADD CONSTRAINT FK_SystemAdmin_Settings FOREIGN KEY (systemID) REFERENCES SYSTEMSETTINGS(systemID),
    CONSTRAINT FK_SystemAdmin_Admin FOREIGN KEY (userID) REFERENCES ADMINS(userID);
