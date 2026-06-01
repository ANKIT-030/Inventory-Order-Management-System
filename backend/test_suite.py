import httpx
import json
import random

BASE_URL = "http://localhost:8000/api/v1"
client = httpx.Client(timeout=10.0)

def print_result(name, status, expected_status=None):
    if expected_status is not None:
        passed = status == expected_status
    else:
        passed = 200 <= status < 300
    
    print(f"{'PASS' if passed else 'FAIL'} [{status}] {name}")
    if not passed:
        print(f"  Expected: {expected_status}, Got: {status}")
    return passed

print("\n========================================")
print("  COMPREHENSIVE API TEST SUITE")
print("========================================\n")

# 1. Health Check
r = client.get("http://localhost:8000/health")
print_result("GET /health", r.status_code, 200)

# 2. Registration
test_user = f"testuser_{random.randint(1000, 9999)}"
test_email = f"{test_user}@test.com"

r = client.post(f"{BASE_URL}/auth/register", json={
    "username": test_user,
    "email": test_email,
    "password": "Test@123"
})
print_result("POST /auth/register (new user)", r.status_code, 201)

r = client.post(f"{BASE_URL}/auth/register", json={
    "username": test_user,
    "email": "other@test.com",
    "password": "Test@123"
})
print_result("POST /auth/register (duplicate username)", r.status_code, 400)

r = client.post(f"{BASE_URL}/auth/register", json={
    "username": f"otheruser_{random.randint(1000, 9999)}",
    "email": test_email,
    "password": "Test@123"
})
print_result("POST /auth/register (duplicate email)", r.status_code, 400)

# 3. Login
r = client.post(f"{BASE_URL}/auth/login", json={
    "username": test_user,
    "password": "Test@123"
})
print_result("POST /auth/login (by username)", r.status_code, 200)
token = r.json().get("access_token")

r = client.post(f"{BASE_URL}/auth/login", json={
    "username": test_email,
    "password": "Test@123"
})
print_result("POST /auth/login (by email)", r.status_code, 200)

r = client.post(f"{BASE_URL}/auth/login", json={
    "username": test_user.upper(),
    "password": "Test@123"
})
print_result("POST /auth/login (case-insensitive)", r.status_code, 200)

r = client.post(f"{BASE_URL}/auth/login", json={
    "username": test_user,
    "password": "wrongpassword"
})
print_result("POST /auth/login (wrong password)", r.status_code, 401)

# 4. Profile
headers = {"Authorization": f"Bearer {token}"}
r = client.get(f"{BASE_URL}/auth/me", headers=headers)
print_result("GET /auth/me", r.status_code, 200)

r = client.get(f"{BASE_URL}/auth/me")
print_result("GET /auth/me (no token)", r.status_code, 403)

# 5. Forgot Password
r = client.post(f"{BASE_URL}/auth/forgot-password", json={"email": test_email})
print_result("POST /auth/forgot-password", r.status_code, 200)

# 6. Products
sku = f"TEST-SKU-{random.randint(1000, 9999)}"
r = client.post(f"{BASE_URL}/products", headers=headers, json={
    "name": "Test Product",
    "sku": sku,
    "description": "A test product",
    "price": 299.99,
    "stock_quantity": 50
})
print_result("POST /products (create)", r.status_code, 201)
product_id = r.json().get("id")

r = client.get(f"{BASE_URL}/products?page=1&page_size=10", headers=headers)
print_result("GET /products (list)", r.status_code, 200)

r = client.get(f"{BASE_URL}/products/{product_id}", headers=headers)
print_result("GET /products/{id} (single)", r.status_code, 200)

r = client.get(f"{BASE_URL}/products?search=Test", headers=headers)
print_result("GET /products?search=Test (search)", r.status_code, 200)

r = client.put(f"{BASE_URL}/products/{product_id}", headers=headers, json={
    "name": "Updated Test Product",
    "price": 399.99
})
print_result("PUT /products/{id} (update)", r.status_code, 200)

# Second product
sku2 = f"TEST-SKU2-{random.randint(1000, 9999)}"
r = client.post(f"{BASE_URL}/products", headers=headers, json={
    "name": "Test Product 2",
    "sku": sku2,
    "price": 149.99,
    "stock_quantity": 5
})
product2_id = r.json().get("id")

# 7. Customers
cust_email = f"customer_{random.randint(1000, 9999)}@test.com"
r = client.post(f"{BASE_URL}/customers", headers=headers, json={
    "full_name": "Rajesh Kumar",
    "email": cust_email,
    "phone": "+91-9876543210",
    "address": "123 MG Road, Bangalore"
})
print_result("POST /customers (create)", r.status_code, 201)
customer_id = r.json().get("id")

r = client.get(f"{BASE_URL}/customers?page=1&page_size=10", headers=headers)
print_result("GET /customers (list)", r.status_code, 200)

# 8. Orders
r = client.post(f"{BASE_URL}/orders", headers=headers, json={
    "customer_id": customer_id,
    "items": [
        {"product_id": product_id, "quantity": 2},
        {"product_id": product2_id, "quantity": 1}
    ]
})
print_result("POST /orders (create)", r.status_code, 201)
order_id = r.json().get("id")

r = client.get(f"{BASE_URL}/orders?page=1&page_size=10", headers=headers)
print_result("GET /orders (list)", r.status_code, 200)

r = client.get(f"{BASE_URL}/orders/{order_id}", headers=headers)
print_result("GET /orders/{id} (detail)", r.status_code, 200)

r = client.put(f"{BASE_URL}/orders/{order_id}", headers=headers, json={
    "status": "confirmed"
})
print_result("PUT /orders/{id} (update status)", r.status_code, 200)

# Verify stock decremented
r = client.get(f"{BASE_URL}/products/{product_id}", headers=headers)
product_after = r.json()
if product_after.get("stock_quantity") == 48:
    print("PASS [200] Verify stock decrement")
else:
    print(f"FAIL [200] Verify stock decrement (Expected 48, got {product_after.get('stock_quantity')})")

# 9. Dashboard
r = client.get(f"{BASE_URL}/dashboard", headers=headers)
print_result("GET /dashboard", r.status_code, 200)

# 10. Cleanup
r = client.delete(f"{BASE_URL}/orders/{order_id}", headers=headers)
print_result("DELETE /orders/{id}", r.status_code, 204)

r = client.get(f"{BASE_URL}/products/{product_id}", headers=headers)
product_after_delete = r.json()
if product_after_delete.get("stock_quantity") == 50:
    print("PASS [200] Verify stock restored")
else:
    print(f"FAIL [200] Verify stock restored (Expected 50, got {product_after_delete.get('stock_quantity')})")

client.delete(f"{BASE_URL}/products/{product_id}", headers=headers)
client.delete(f"{BASE_URL}/products/{product2_id}", headers=headers)
client.delete(f"{BASE_URL}/customers/{customer_id}", headers=headers)

print("\n========================================")
print("  TEST SUITE COMPLETE")
print("========================================\n")
