# InvenTrack - API Documentation

The InvenTrack backend exposing endpoints for Products, Customers, Orders, Dashboard, and Authentication.

## General Information

- **Base URL**: `http://localhost:8000` (Local) / Custom production domain
- **Content Type**: `application/json`
- **Authentication**: JWT Authorization. Pass token in HTTP header:
  `Authorization: Bearer <JWT_TOKEN>`

---

## 🔑 Authentication Endpoints

### 1. Register a User
- **Method**: `POST`
- **Path**: `/auth/register`
- **RequestBody**:
  ```json
  {
    "username": "admin",
    "email": "admin@inventrack.com",
    "password": "securepassword123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "id": 1,
    "username": "admin",
    "email": "admin@inventrack.com",
    "created_at": "2026-06-01T12:00:00Z"
  }
  ```

### 2. Login
- **Method**: `POST`
- **Path**: `/auth/login`
- **RequestBody**: URL encoded form data (OAuth2PasswordRequestForm standard)
  - `username`: `admin`
  - `password`: `securepassword123`
- **Response (200 OK)**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
    "token_type": "bearer"
  }
  ```

---

## 📦 Product Endpoints

### 1. Get Paginated Products
- **Method**: `GET`
- **Path**: `/products`
- **Query Parameters**:
  - `page`: `1` (Integer, optional)
  - `page_size`: `10` (Integer, optional)
  - `search`: `string` (Optional. Checks name and SKU using case-insensitive search)
- **Response (200 OK)**:
  ```json
  {
    "items": [
      {
        "id": 1,
        "name": "Wireless Mouse",
        "sku": "WRLS-MSE-01",
        "description": "Ergonomic 2.4G wireless mouse",
        "price": 25.99,
        "stock_quantity": 120,
        "created_at": "2026-06-01T12:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "page_size": 10,
    "pages": 1
  }
  ```

### 2. Get Product by ID
- **Method**: `GET`
- **Path**: `/products/{id}`
- **Response (200 OK)**:
  ```json
  {
    "id": 1,
    "name": "Wireless Mouse",
    "sku": "WRLS-MSE-01",
    "description": "Ergonomic 2.4G wireless mouse",
    "price": 25.99,
    "stock_quantity": 120,
    "created_at": "2026-06-01T12:00:00Z"
  }
  ```

### 3. Create Product
- **Method**: `POST`
- **Path**: `/products`
- **RequestBody**:
  ```json
  {
    "name": "Wireless Keyboard",
    "sku": "WRLS-KBD-02",
    "description": "Mechanical wireless keyboard with RGB backlights",
    "price": 59.99,
    "stock_quantity": 45
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "id": 2,
    "name": "Wireless Keyboard",
    "sku": "WRLS-KBD-02",
    "description": "Mechanical wireless keyboard with RGB backlights",
    "price": 59.99,
    "stock_quantity": 45,
    "created_at": "2026-06-01T12:05:00Z"
  }
  ```

### 4. Update Product
- **Method**: `PUT`
- **Path**: `/products/{id}`
- **RequestBody**: Contains updated attributes. All fields are optional.
- **Response (200 OK)**: Updated product model.

### 5. Delete Product
- **Method**: `DELETE`
- **Path**: `/products/{id}`
- **Response (204 No Content)**: Product successfully deleted.

---

## 👥 Customer Endpoints

### 1. Get Paginated Customers
- **Method**: `GET`
- **Path**: `/customers`
- **Query Parameters**:
  - `page`: `1`
  - `page_size`: `10`
  - `search`: `string` (Optional. Search by full name or email address)
- **Response (200 OK)**: Paginated customer wrapper list.

### 2. Create Customer
- **Method**: `POST`
- **Path**: `/customers`
- **RequestBody**:
  ```json
  {
    "full_name": "Jane Doe",
    "email": "jane.doe@example.com",
    "phone": "+1234567890",
    "address": "123 Main Street, Suite 4B\nNew York, NY 10001"
  }
  ```
- **Response (201 Created)**: Created customer model.

### 3. Update / Delete Customer
- **Method**: `PUT` / `DELETE`
- **Path**: `/customers/{id}`

---

## 🛒 Order Endpoints

### 1. Place Order
- **Method**: `POST`
- **Path**: `/orders`
- **RequestBody**:
  ```json
  {
    "customer_id": 1,
    "items": [
      {
        "product_id": 1,
        "quantity": 2
      },
      {
        "product_id": 2,
        "quantity": 1
      }
    ]
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "id": 5,
    "customer_id": 1,
    "order_date": "2026-06-01T12:10:00Z",
    "total_amount": 111.97,
    "status": "pending",
    "created_at": "2026-06-01T12:10:00Z",
    "customer": {
      "id": 1,
      "full_name": "Jane Doe",
      "email": "jane.doe@example.com",
      "phone": "+1234567890",
      "address": "123 Main St..."
    },
    "items": [
      {
        "id": 8,
        "order_id": 5,
        "product_id": 1,
        "quantity": 2,
        "unit_price": 25.99,
        "product": { ... }
      },
      {
        "id": 9,
        "order_id": 5,
        "product_id": 2,
        "quantity": 1,
        "unit_price": 59.99,
        "product": { ... }
      }
    ]
  }
  ```
- **Validation Errors (400 Bad Request)**:
  - If customer does not exist: `Customer not found`
  - If a product does not exist: `Product with ID X not found`
  - If stock levels are insufficient:
    `Insufficient stock for product 'Wireless Keyboard' (available: 45, requested: 100)`

### 2. Update Order Status
- **Method**: `PUT`
- **Path**: `/orders/{id}`
- **RequestBody**:
  ```json
  {
    "status": "shipped"
  }
  ```
- **Response (200 OK)**: Updated order structure.

### 3. Cancel / Delete Order
- **Method**: `DELETE`
- **Path**: `/orders/{id}`
- **Note**: Deleting an order will automatically restore stock levels of all products in that order.

---

## 📊 Dashboard Endpoints

### 1. Get Dashboard Analytics
- **Method**: `GET`
- **Path**: `/dashboard`
- **Response (200 OK)**:
  ```json
  {
    "total_products": 2,
    "total_customers": 1,
    "total_orders": 5,
    "total_revenue": 559.85,
    "low_stock_products": [
      {
        "id": 2,
        "name": "Wireless Keyboard",
        "sku": "WRLS-KBD-02",
        "stock_quantity": 5
      }
    ]
  }
  ```
