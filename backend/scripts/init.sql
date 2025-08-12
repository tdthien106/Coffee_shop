-- Create database and use it
CREATE DATABASE Coffee_Shop4;
GO
USE Coffee_Shop4;
GO

-- Step 1: Create all tables (no foreign keys yet)
CREATE TABLE USER (
    userID VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    gender VARCHAR(10),
    birthday DATE,
    phoneNumber VARCHAR(20),
    email VARCHAR(100),
    username VARCHAR(50) UNIQUE,
    password VARCHAR(100)
);

CREATE TABLE Employee (
    employeeID VARCHAR(50) PRIMARY KEY,
    userID VARCHAR(50),
    startDate DATE,
    endDate DATE,
    position VARCHAR(50),
    salary  real  

 );

CREATE TABLE "Shift" (
    shiftID VARCHAR(50) PRIMARY KEY,
    startTime DATETIME,
    endTime DATETIME
);

CREATE TABLE Shift_Employee (
    shiftID VARCHAR(50),
    employeeID VARCHAR(50),
    PRIMARY KEY (shiftID, employeeID)
);

CREATE TABLE Manager (
    userID VARCHAR(50) PRIMARY KEY
);

CREATE TABLE Staff (
    userID VARCHAR(50) PRIMARY KEY,
    totalShifts INT,
    currentShift VARCHAR(50)
);

CREATE TABLE SystemSettings (
    systemID VARCHAR(50) PRIMARY KEY,
    businessName VARCHAR(100),
    taxRate real,
    serviceCharge real,
    operatingHours VARCHAR(100)
);

CREATE TABLE "Admin" (
    userID VARCHAR(50) PRIMARY KEY,
    adminLevel VARCHAR(50),
    accessRight VARCHAR(100)
);

CREATE TABLE "Log" (
    logID VARCHAR(50) PRIMARY KEY,
    action VARCHAR(255),
    timestamp DATETIME,
    effectiveBy VARCHAR(50)
);

CREATE TABLE MenuItem (
    itemID VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    category VARCHAR(50),
    description TEXT,
    basePrice real,
    cost real
);

CREATE TABLE Payment (
    paymentID VARCHAR(50) PRIMARY KEY,
    orderID VARCHAR(50),
    method VARCHAR(50),
    amount real,
    paymentDate DATETIME,
);

CREATE TABLE "Order" (
    orderID VARCHAR(50) PRIMARY KEY,
    staffID VARCHAR(50),
    createTime DATETIME,
    status VARCHAR(50),
    paymentID VARCHAR(50)
);

CREATE TABLE Recipe (
    recipeID VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    servingSize real
);

CREATE TABLE Drink (
    drinkID VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    unit VARCHAR(20),
    price real,
    recipeID VARCHAR(50)
);

CREATE TABLE OrderDetail (
    orderDetailID VARCHAR(50) PRIMARY KEY,
    orderID VARCHAR(50),
    drinkID VARCHAR(50),
    quantity INT,
    discount real,
    total real
);

CREATE TABLE Ingredient (
    ingredientID VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    unit VARCHAR(20),
    unitPrice real,
    minStock real,
    currentStock real
);

CREATE TABLE Recipe_Ingredient (
    recipeID VARCHAR(50),
    ingredientID VARCHAR(50),
    quantity real,
    PRIMARY KEY (recipeID, ingredientID)
);

CREATE TABLE Stock (
    stockID VARCHAR(50) PRIMARY KEY,
    ingredientID VARCHAR(50),
    quantity real,
    unit VARCHAR(20),
    lastUpdate DATE
);

CREATE TABLE Salary (
    employeeID VARCHAR(50),
    shiftID VARCHAR(50),
    baseSalary real,
    PRIMARY KEY (employeeID, shiftID)
);

CREATE TABLE Report (
    reportID VARCHAR(50) PRIMARY KEY,
    type VARCHAR(50),
    content TEXT,
    createdBy VARCHAR(50),
    reportDate DATE,
    generateDate DATE
);

CREATE TABLE RevenueStatistics (
    statisticID VARCHAR(50) PRIMARY KEY,
    startDate DATE,
    endDate DATE,
    totalRevenue real,
    totalOrders INT
);

create table RevenueStatistics_Report(
    statisticID VARCHAR(50),
    reportID VARCHAR(50) ,
    primary key(statisticID, reportID)
)

create table SystemSettings_Admin(
     userID VARCHAR(50) ,
     systemID VARCHAR(50)
     primary key(userID, systemID)

)

-- Step 2: Add FOREIGN KEY constraints
ALTER TABLE Employee
ADD CONSTRAINT FK_Employee_User FOREIGN KEY (userID) REFERENCES "User"(userID);

ALTER TABLE Shift_Employee
ADD CONSTRAINT FK_ShiftEmployee_Shift FOREIGN KEY (shiftID) REFERENCES "Shift" (shiftID),
    CONSTRAINT FK_ShiftEmployee_Employee FOREIGN KEY (employeeID) REFERENCES Employee(employeeID);

ALTER TABLE Manager
ADD CONSTRAINT FK_Manager_User FOREIGN KEY (userID) REFERENCES "User" (userID);

ALTER TABLE Staff
ADD CONSTRAINT FK_Staff_User FOREIGN KEY (userID) REFERENCES "User" (userID),
 CONSTRAINT FK_Staff_CurrentShift FOREIGN KEY (currentShift) REFERENCES "Shift" (shiftID);

ALTER TABLE Admin
ADD CONSTRAINT FK_Admin_User FOREIGN KEY (userID) REFERENCES "User" (userID);

ALTER TABLE "Log"
ADD CONSTRAINT FK_Log_User FOREIGN KEY (effectiveBy) REFERENCES "User" (userID);

ALTER TABLE "Order"
ADD CONSTRAINT FK_Order_Staff FOREIGN KEY (staffID) REFERENCES Staff(userID),
 CONSTRAINT FK_Order_Payment FOREIGN KEY (paymentID) REFERENCES Payment(paymentID);

ALTER TABLE Payment
ADD CONSTRAINT FK_Payment_Order FOREIGN KEY (orderID) REFERENCES "Order"(orderID);

ALTER TABLE Drink
ADD CONSTRAINT FK_Drink_Recipe FOREIGN KEY (recipeID) REFERENCES Recipe(recipeID);

ALTER TABLE OrderDetail
ADD CONSTRAINT FK_OrderDetail_Order FOREIGN KEY (orderID) REFERENCES "Order"(orderID),
 CONSTRAINT FK_OrderDetail_Drink FOREIGN KEY (drinkID) REFERENCES Drink(drinkID);

ALTER TABLE Recipe_Ingredient
ADD CONSTRAINT FK_RecipeIngredient_Recipe FOREIGN KEY (recipeID) REFERENCES Recipe(recipeID),
 CONSTRAINT FK_RecipeIngredient_Ingredient FOREIGN KEY (ingredientID) REFERENCES Ingredient(ingredientID);

ALTER TABLE Stock
ADD CONSTRAINT FK_Stock_Ingredient FOREIGN KEY (ingredientID) REFERENCES Ingredient(ingredientID);

ALTER TABLE Salary
ADD CONSTRAINT FK_Salary_Employee FOREIGN KEY (employeeID) REFERENCES Employee(employeeID),
 CONSTRAINT FK_Salary_Shift FOREIGN KEY (shiftID) REFERENCES "Shift" (shiftID);

ALTER TABLE Report
ADD CONSTRAINT FK_Report_Manager FOREIGN KEY (createdBy) REFERENCES Manager(userID);

ALTER TABLE MenuItem
ADD CONSTRAINT FK_MenuItem_Drink FOREIGN KEY (itemID) REFERENCES Drink(drinkID) 


alter table RevenueStatistics_Report
add constraint fk_revenuereport_statistic foreign key(statisticID) references RevenueStatistics(statisticID),
    constraint fk_revenuereport_report foreign key (reportID) references Report(reportID)

alter table SystemSettings_Admin
add constraint fk_systemadmin_settings foreign key (systemID) references SystemSettings(systemID),
    constraint fk_systemadmin_admin foreign key (userID) references "Admin"(userID)