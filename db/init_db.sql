-- Customers table
CREATE TABLE Parties (
    PartyID SERIAL PRIMARY KEY,
    Notes TEXT,
    PartySize INT DEFAULT 1,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    LeftAt TIMESTAMP
);

-- Seats table
CREATE TABLE Seats (
    SeatID VARCHAR(10) PRIMARY KEY,
    Floor INT NOT NULL,
    PosX INT NOT NULL,
    PosY INT NOT NULL,
    PartyID INT,
    FOREIGN KEY(PartyID) REFERENCES Parties(PartyID)
);

-- Employees table
CREATE TABLE Employees (
    EmployeeID SERIAL PRIMARY KEY,
    Name VARCHAR(50),
    Position VARCHAR(50),
    Phone VARCHAR(20),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product catagory table
CREATE TABLE Categories (
    CategoryID SERIAL PRIMARY KEY,
    MenuOrder INT,
    CategoryName VARCHAR(100) UNIQUE,
    Description TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE Items (
    ProductID SERIAL PRIMARY KEY,
    ProductName VARCHAR(100),
    MenuOrder INT,
    Description TEXT,
    Price DECIMAL(10, 2),
    CategoryID INT,
    IsDeleted Boolean DEFAULT FALSE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID) ON DELETE SET NULL
);

-- Discount table
CREATE TABLE Discounts(
    DiscountID SERIAL PRIMARY KEY,
    DiscountName VARCHAR(20) UNIQUE NOT NULL,
    Amount DECIMAL(10, 2)
);

-- Discount Combination table
CREATE TABLE DiscountCombinations(
    CombinationID SERIAL PRIMARY KEY,
    DiscountID INT,
    CategoryID INT,
    Quantity INT,
    FOREIGN KEY (DiscountID) REFERENCES Discounts(DiscountID) ON DELETE CASCADE,
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
);

-- Orders table
CREATE TABLE Orders (
    OrderID SERIAL PRIMARY KEY,
    PartyID INT,
    EmployeeID INT,
    OrderDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    TotalAmount DECIMAL(10, 2),
    FOREIGN KEY (PartyID) REFERENCES Parties(PartyID),
    FOREIGN KEY (EmployeeID) REFERENCES Employees(EmployeeID)
);

-- OrderItems table
CREATE TABLE OrderItems (
    OrderItemID SERIAL PRIMARY KEY,
    OrderID INT,
    ProductID INT,
    Quantity INT,
    Price DECIMAL(10, 2),
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE,
    FOREIGN KEY (ProductID) REFERENCES Items(ProductID)
);
