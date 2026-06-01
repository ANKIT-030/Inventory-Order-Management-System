# InvenTrack - Test Cases

This document describes the automated test cases designed to verify the business rules and constraints of the Inventory & Order Management System.

---

## 🔑 Authentication Tests (`test_auth.py`)

### Test Case 1.1: Successful Registration
- **Objective**: Verify that a user can successfully register with unique details.
- **Input**:
  - `username`: `test_admin`
  - `email`: `admin@test.com`
  - `password`: `test_password_123`
- **Expected Outcome**: HTTP `200 OK`. Password is encrypted, user model is returned without the raw password.

### Test Case 1.2: Registration Duplicate Username
- **Objective**: Prevent two users from registering with the same username.
- **Input**: Duplicate username `test_admin`.
- **Expected Outcome**: HTTP `400 Bad Request`. Error message: `Username already registered`.

### Test Case 1.3: Registration Duplicate Email
- **Objective**: Prevent two users from registering with the same email.
- **Input**: Duplicate email `admin@test.com`.
- **Expected Outcome**: HTTP `400 Bad Request`. Error message: `Email already registered`.

### Test Case 1.4: Login with Valid Credentials
- **Objective**: Verify that an registered user can log in and receive a JWT.
- **Input**: Username `test_admin`, Password `test_password_123`.
- **Expected Outcome**: HTTP `200 OK`. Response contains `access_token` and `token_type: bearer`.

---

## 📦 Product Validation Tests (`test_products.py`)

### Test Case 2.1: Price Validation
- **Objective**: Ensure that a product cannot be created with a price of `0` or negative.
- **Input**: Product with price `-10` or `0`.
- **Expected Outcome**: HTTP `422 Unprocessable Entity` (Pydantic validation error).

### Test Case 2.2: Stock Quantity Validation
- **Objective**: Ensure that a product cannot be created with negative stock levels.
- **Input**: Product with stock `-5`.
- **Expected Outcome**: HTTP `422 Unprocessable Entity`.

### Test Case 2.3: Unique SKU Validation
- **Objective**: Ensure that SKU unique index constraints are enforced.
- **Input**: Creating two different products with SKU `PROD-SKU-100`.
- **Expected Outcome**: HTTP `400 Bad Request` on second product insertion. Error message: `Product with this SKU already exists`.

---

## 👥 Customer Validation Tests (`test_customers.py`)

### Test Case 3.1: Unique Email Validation
- **Objective**: Verify that no two customer profiles share an email.
- **Input**: Add customer B with the same email as customer A.
- **Expected Outcome**: HTTP `400 Bad Request`. Error message: `Customer with this email already exists`.

### Test Case 3.2: Email Format Validation
- **Objective**: Prevent invalid email formats from being saved.
- **Input**: Create customer with email `invalid-email-address`.
- **Expected Outcome**: HTTP `422 Unprocessable Entity` (Pydantic EmailStr validation error).

---

## 🛒 Order Business Logic Tests (`test_orders.py`)

### Test Case 4.1: Successful Order & Stock Reduction
- **Objective**: Place a valid order and verify stock quantity is automatically decremented.
- **Initial Setup**: Product A with Stock = `100`, Price = `$10.00`. Customer A exists.
- **Order Input**: Customer A buys `5` units of Product A.
- **Expected Outcome**:
  - HTTP `201 Created`.
  - Order grand total is calculated to `$50.00`.
  - Product A stock level is reduced to `95`.

### Test Case 4.2: Insufficient Stock Check
- **Objective**: Abort order if customer requests quantity higher than current stock.
- **Initial Setup**: Product B with Stock = `10`. Customer B exists.
- **Order Input**: Customer B buys `12` units of Product B.
- **Expected Outcome**:
  - HTTP `400 Bad Request`.
  - Error details: `Insufficient stock for product 'X' (available: 10, requested: 12)`.
  - No database order is created.
  - Product B stock remains at `10`.

### Test Case 4.3: Atomicity / Transaction Safety
- **Objective**: Verify that if one item in a multi-item order fails stock validation, the entire order is aborted (no partial orders).
- **Initial Setup**:
  - Product A: Stock = `50`
  - Product B: Stock = `5`
- **Order Input**: Request `10` of Product A (valid) and `10` of Product B (invalid).
- **Expected Outcome**:
  - HTTP `400 Bad Request` due to Product B.
  - The transaction rolls back.
  - No order is created.
  - Product A stock remains at `50` (not partially decremented to 40).

### Test Case 4.4: Stock Level Restored on Deletion
- **Objective**: Verify that deleting/cancelling an order returns the reserved inventory.
- **Initial Setup**: Product A has `95` stock. Active Order contains `5` of Product A.
- **Action**: Delete the active order.
- **Expected Outcome**:
  - HTTP `204 No Content`.
  - Product A stock is restored to `100`.
