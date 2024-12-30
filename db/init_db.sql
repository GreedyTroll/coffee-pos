-- Seats table
CREATE TABLE Seats (
    SeatID VARCHAR(5) PRIMARY KEY,
    Floor INT,
    PosX INT,
    PosY INT
);

-- Customers table
CREATE TABLE Parties (
    PartyID SERIAL PRIMARY KEY,
    Note TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seats assignment table
CREATE TABLE SeatAssignments (
    AssignmentID SERIAL PRIMARY KEY,
    PartyID INT NOT NULL,
    SeatID VARCHAR(5) NOT NULL,
    AssignedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    LeftAt TIMESTAMP,
    FOREIGN KEY(PartyID) REFERENCES Parties(PartyID),
    FOREIGN KEY(SeatID) REFERENCES Seats(SeatID)
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
    CategoryName VARCHAR(100),
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
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
    FOREIGN KEY (ProductID) REFERENCES Items(ProductID)
);
