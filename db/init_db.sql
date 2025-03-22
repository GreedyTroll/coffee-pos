-- Customers table
CREATE TABLE Parties (
    PartyID SERIAL PRIMARY KEY,
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
    ProductName VARCHAR(100) NOT NULL,
    MenuOrder INT,
    Description TEXT,
    Price DECIMAL(10, 2) NOT NULL,
    CategoryID INT,
    RemainingStock INT CHECK (RemainingStock >= 0),
    IsHidden Boolean DEFAULT FALSE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID) ON DELETE CASCADE
);

CREATE TABLE Tags (
    TagID SERIAL PRIMARY KEY,
    TagName VARCHAR(20) UNIQUE NOT NULL,
    TagColor VARCHAR(7) DEFAULT '#000000'
);

CREATE TABLE ItemTags (
    ItemID INT,
    TagID INT,
    FOREIGN KEY (ItemID) REFERENCES Items(ProductID) ON DELETE CASCADE,
    FOREIGN KEY (TagID) REFERENCES Tags(TagID) ON DELETE CASCADE,
    PRIMARY KEY (ItemID, TagID)
);

CREATE TABLE AddOnGroups (
    GroupID SERIAL PRIMARY KEY,
    GroupName VARCHAR(100),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE AddOns (
    AddOnGroup INT,
    AddOnID SERIAL PRIMARY KEY,
    AddOnName VARCHAR(100),
    Price DECIMAL(10, 2),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (AddOnGroup) REFERENCES AddOnGroups(GroupID) ON DELETE CASCADE
);

CREATE TABLE AvailableAddOns(
    ItemID INT,
    AddOnID INT,
    FOREIGN KEY (ItemID) REFERENCES Items(ProductID) ON DELETE CASCADE,
    FOREIGN KEY (AddOnID) REFERENCES AddOns(AddOnID) ON DELETE CASCADE,
    PRIMARY KEY (ItemID, AddOnID)
);

-- Payment methods table
CREATE TABLE PaymentMethods (
    MethodName VARCHAR(20) PRIMARY KEY
);

-- Orders table
CREATE TABLE Orders (
    OrderID SERIAL PRIMARY KEY,
    PartyID INT,
    EmployeeID INT,
    OrderDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    TotalAmount DECIMAL(10, 2),
    PaymentMethod VARCHAR(20),
    PaidTime TIMESTAMP,
    OrderType VARCHAR(20),
    Notes TEXT,
    FOREIGN KEY (PartyID) REFERENCES Parties(PartyID),
    FOREIGN KEY (EmployeeID) REFERENCES Employees(EmployeeID),
    FOREIGN KEY (PaymentMethod) REFERENCES PaymentMethods(MethodName)
);

-- OrderItems table
CREATE TABLE OrderItems (
    OrderItemID SERIAL PRIMARY KEY,
    OrderID INT,
    ProductID INT,
    ProductName VARCHAR(100),
    AddOns JSONB,
    Quantity INT,
    UnitPrice DECIMAL(10, 2),
    Delivered Boolean DEFAULT FALSE,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE,
    FOREIGN KEY (ProductID) REFERENCES Items(ProductID) ON DELETE SET NULL
);

-- OrderDetail view
CREATE VIEW OrderDetails AS
SELECT 
    o.OrderID,
    o.PartyID,
    o.EmployeeID,
    o.OrderDate,
    o.TotalAmount,
    o.PaymentMethod,
    o.PaidTime,
    o.OrderType,
    JSON_AGG(
        JSON_BUILD_OBJECT(
            'OrderItemID', oi.OrderItemID,
            'ProductName', oi.ProductName,
            'AddOns', oi.AddOns,
            'UnitPrice', oi.UnitPrice,
            'Quantity', oi.Quantity,
            'Delivered', oi.Delivered
        )
    ) AS Items,
    BOOL_OR(NOT oi.Delivered) AS Preparing
FROM 
    Orders o
JOIN 
    OrderItems oi ON o.OrderID = oi.OrderID
GROUP BY 
    o.OrderID;