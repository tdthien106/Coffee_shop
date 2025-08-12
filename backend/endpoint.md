# User Management - Triệu

## Create a new user

### Endpoint: POST /users

- Description: Create a new user account.

- Request Body: User details (name, email, password, etc.)

- Response: Created user object.

## Get all users

### Endpoint: GET /users

- Description: Retrieve a list of all users.

- Response: Array of user objects.

## Get user by ID

### Endpoint: GET /users/:id

- Description: Get detailed information about a specific user.

- Parameters: id (User ID)

- Response: User object.

## Update user

### Endpoint: PUT /users/:id

- Description: Update information of an existing user.

- Parameters: id (User ID)

- Request Body: Updated user details.

- Response: Updated user object.

## Delete user

### Endpoint: DELETE /users/:id

- Description: Delete a user account.

- Parameters: id (User ID)

- Response: Success message.

# Employee Management - Win

## Create a new employee

### Endpoint: POST /employees

- Description: Add a new employee to the system.

- Request Body: Employee details (name, position, contact info, etc.)

- Response: Created employee object.

## Get all employees

### Endpoint: GET /employees

- Description: Retrieve a list of all employees.

- Response: Array of employee objects.

## Get employee by ID

### Endpoint: GET /employees/:id

- Description: Get detailed information about a specific employee.

- Parameters: id (Employee ID)

- Response: Employee object.

## Update employee

### Endpoint: PUT /employees/:id

- Description: Update information of an existing employee.

- Parameters: id (Employee ID)

- Request Body: Updated employee details.

- Response: Updated employee object.

## Delete employee

### Endpoint: DELETE /employees/:id

- Description: Remove an employee from the system.

- Parameters: id (Employee ID)

- Response: Success message.

# Order Management - Sky

## Create a new order

### Endpoint: POST /orders

- Description: Create a new order.

- Request Body: Order details (items, customer info, etc.)

- Response: Created order object.

## Get all orders

### Endpoint: GET /orders

- Description: Retrieve a list of all orders.

- Response: Array of order objects.

## Get order by ID

### Endpoint: GET /orders/:id

- Description: Get detailed information about a specific order.

- Parameters: id (Order ID)

- Response: Order object with details.

## Update order status

### Endpoint: PUT /orders/:id

- Description: Update the status of an order.

- Parameters: id (Order ID)

- Request Body: New status information.

- Response: Updated order object.

## Cancel order

### Endpoint: DELETE /orders/:id

- Description: Cancel an existing order.

- Parameters: id (Order ID)

- Response: Success message.

# Menu & Drink Management - Storm

## Add menu item

### Endpoint: POST /menu/items

- Description: Add a new item to the menu.

- Request Body: Item details (name, description, price, etc.)

- Response: Created menu item object.

## Get all menu items

### Endpoint: GET /menu/items

- Description: Retrieve the complete menu.

- Response: Array of menu item objects.

## Get menu item by ID

### Endpoint: GET /menu/items/:id

- Description: Get detailed information about a specific menu item.

- Parameters: id (Menu item ID)

- Response: Menu item object.

## Update menu item

### Endpoint: PUT /menu/items/:id

- Description: Update information of a menu item.

- Parameters: id (Menu item ID)

- Request Body: Updated item details.

- Response: Updated menu item object.

## Delete menu item

### Endpoint: DELETE /menu/items/:id

- Description: Remove an item from the menu.

- Parameters: id (Menu item ID)

- Response: Success message.

# Payment Management - Storm

## Process payment

### Endpoint: POST /payments

- Description: Process payment for an order.

- Request Body: Payment details (order ID, payment method, amount, etc.)

- Response: Payment confirmation object.

## Get payment by order ID

### Endpoint: GET /payments/:orderId

- Description: Retrieve payment information for a specific order.

- Parameters: orderId (Order ID)

- Response: Payment details object.
