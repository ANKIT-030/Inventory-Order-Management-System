$ErrorActionPreference = "Continue"
$base = "http://localhost:8000/api/v1"
$results = @()

function Test-Endpoint {
    param($Name, $Method, $Uri, $Body, $Token, $ExpectedStatus)
    
    $headers = @{ "Content-Type" = "application/json" }
    if ($Token) { $headers["Authorization"] = "Bearer $Token" }
    
    try {
        $params = @{
            Uri = $Uri
            Method = $Method
            Headers = $headers
            ErrorAction = "Stop"
        }
        if ($Body) { $params["Body"] = ($Body | ConvertTo-Json -Depth 5) }
        
        $response = Invoke-WebRequest @params
        $status = $response.StatusCode
        $data = $response.Content | ConvertFrom-Json
        $pass = if ($ExpectedStatus) { $status -eq $ExpectedStatus } else { $status -ge 200 -and $status -lt 300 }
        
        Write-Host "$( if($pass){'PASS'} else {'FAIL'} ) [$status] $Name" -ForegroundColor $(if($pass){'Green'}else{'Red'})
        if (-not $pass) { Write-Host "  Expected: $ExpectedStatus, Got: $status" -ForegroundColor Yellow }
        return $data
    }
    catch {
        $status = $_.Exception.Response.StatusCode.Value__
        if (-not $status) { $status = "ERROR" }
        $pass = if ($ExpectedStatus) { $status -eq $ExpectedStatus } else { $false }
        
        $errorBody = ""
        try { 
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $errorBody = $reader.ReadToEnd()
        } catch {}
        
        Write-Host "$( if($pass){'PASS'} else {'FAIL'} ) [$status] $Name" -ForegroundColor $(if($pass){'Green'}else{'Red'})
        if (-not $pass) { 
            Write-Host "  Error: $_" -ForegroundColor Yellow 
            if ($errorBody) { Write-Host "  Body: $errorBody" -ForegroundColor Yellow }
        }
        return $null
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  COMPREHENSIVE API TEST SUITE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# --- 1. HEALTH CHECK ---
Write-Host "--- Health Check ---" -ForegroundColor Magenta
Test-Endpoint -Name "GET /health" -Method GET -Uri "http://localhost:8000/health" -ExpectedStatus 200

# --- 2. REGISTRATION ---
Write-Host "`n--- Registration ---" -ForegroundColor Magenta
$testUser = "testuser_$(Get-Random -Maximum 9999)"
$testEmail = "$testUser@test.com"
$regResult = Test-Endpoint -Name "POST /auth/register (new user)" -Method POST -Uri "$base/auth/register" -Body @{
    username = $testUser
    email = $testEmail
    password = "Test@123"
} -ExpectedStatus 201

# Duplicate username
Test-Endpoint -Name "POST /auth/register (duplicate username)" -Method POST -Uri "$base/auth/register" -Body @{
    username = $testUser
    email = "other@test.com"
    password = "Test@123"
} -ExpectedStatus 400

# Duplicate email
Test-Endpoint -Name "POST /auth/register (duplicate email)" -Method POST -Uri "$base/auth/register" -Body @{
    username = "otheruser_$(Get-Random -Maximum 9999)"
    email = $testEmail
    password = "Test@123"
} -ExpectedStatus 400

# --- 3. LOGIN ---
Write-Host "`n--- Login ---" -ForegroundColor Magenta

# Login with username
$loginResult = Test-Endpoint -Name "POST /auth/login (by username)" -Method POST -Uri "$base/auth/login" -Body @{
    username = $testUser
    password = "Test@123"
} -ExpectedStatus 200
$token = $loginResult.access_token

# Login with email
$loginResult2 = Test-Endpoint -Name "POST /auth/login (by email)" -Method POST -Uri "$base/auth/login" -Body @{
    username = $testEmail
    password = "Test@123"
} -ExpectedStatus 200

# Login case-insensitive
$loginResult3 = Test-Endpoint -Name "POST /auth/login (case-insensitive)" -Method POST -Uri "$base/auth/login" -Body @{
    username = $testUser.ToUpper()
    password = "Test@123"
} -ExpectedStatus 200

# Wrong password
Test-Endpoint -Name "POST /auth/login (wrong password)" -Method POST -Uri "$base/auth/login" -Body @{
    username = $testUser
    password = "wrongpassword"
} -ExpectedStatus 401

# Non-existent user
Test-Endpoint -Name "POST /auth/login (non-existent user)" -Method POST -Uri "$base/auth/login" -Body @{
    username = "doesnotexist999"
    password = "Test@123"
} -ExpectedStatus 401

# --- 4. PROFILE ---
Write-Host "`n--- Profile ---" -ForegroundColor Magenta
Test-Endpoint -Name "GET /auth/me" -Method GET -Uri "$base/auth/me" -Token $token -ExpectedStatus 200

# Unauthorized access
Test-Endpoint -Name "GET /auth/me (no token)" -Method GET -Uri "$base/auth/me" -ExpectedStatus 403

# --- 5. FORGOT PASSWORD ---
Write-Host "`n--- Forgot Password ---" -ForegroundColor Magenta
Test-Endpoint -Name "POST /auth/forgot-password" -Method POST -Uri "$base/auth/forgot-password" -Body @{
    email = $testEmail
} -ExpectedStatus 200

# --- 6. PRODUCTS CRUD ---
Write-Host "`n--- Products ---" -ForegroundColor Magenta
$sku = "TEST-SKU-$(Get-Random -Maximum 9999)"
$product = Test-Endpoint -Name "POST /products (create)" -Method POST -Uri "$base/products" -Token $token -Body @{
    name = "Test Product"
    sku = $sku
    description = "A test product"
    price = 299.99
    stock_quantity = 50
} -ExpectedStatus 201

$productId = $product.id

Test-Endpoint -Name "GET /products (list)" -Method GET -Uri "$base/products?page=1&page_size=10" -Token $token -ExpectedStatus 200

Test-Endpoint -Name "GET /products/$productId (single)" -Method GET -Uri "$base/products/$productId" -Token $token -ExpectedStatus 200

Test-Endpoint -Name "GET /products?search=Test (search)" -Method GET -Uri "$base/products?search=Test&page=1&page_size=10" -Token $token -ExpectedStatus 200

$updatedProduct = Test-Endpoint -Name "PUT /products/$productId (update)" -Method PUT -Uri "$base/products/$productId" -Token $token -Body @{
    name = "Updated Test Product"
    price = 399.99
} -ExpectedStatus 200

# Duplicate SKU
$sku2 = "TEST-SKU2-$(Get-Random -Maximum 9999)"
$product2 = Test-Endpoint -Name "POST /products (create 2nd)" -Method POST -Uri "$base/products" -Token $token -Body @{
    name = "Test Product 2"
    sku = $sku2
    description = "Second test product"
    price = 149.99
    stock_quantity = 5
} -ExpectedStatus 201

$product2Id = $product2.id

# --- 7. CUSTOMERS CRUD ---
Write-Host "`n--- Customers ---" -ForegroundColor Magenta
$custEmail = "customer_$(Get-Random -Maximum 9999)@test.com"
$customer = Test-Endpoint -Name "POST /customers (create)" -Method POST -Uri "$base/customers" -Token $token -Body @{
    full_name = "Rajesh Kumar"
    email = $custEmail
    phone = "+91-9876543210"
    address = "123 MG Road, Bangalore, Karnataka 560001"
} -ExpectedStatus 201

$customerId = $customer.id

Test-Endpoint -Name "GET /customers (list)" -Method GET -Uri "$base/customers?page=1&page_size=10" -Token $token -ExpectedStatus 200

Test-Endpoint -Name "GET /customers/$customerId (single)" -Method GET -Uri "$base/customers/$customerId" -Token $token -ExpectedStatus 200

Test-Endpoint -Name "GET /customers?search=Rajesh (search)" -Method GET -Uri "$base/customers?search=Rajesh&page=1&page_size=10" -Token $token -ExpectedStatus 200

Test-Endpoint -Name "PUT /customers/$customerId (update)" -Method PUT -Uri "$base/customers/$customerId" -Token $token -Body @{
    full_name = "Rajesh Kumar Sharma"
    phone = "+91-9876543211"
} -ExpectedStatus 200

# --- 8. ORDERS CRUD ---
Write-Host "`n--- Orders ---" -ForegroundColor Magenta
$order = Test-Endpoint -Name "POST /orders (create)" -Method POST -Uri "$base/orders" -Token $token -Body @{
    customer_id = $customerId
    items = @(
        @{ product_id = $productId; quantity = 2 },
        @{ product_id = $product2Id; quantity = 1 }
    )
} -ExpectedStatus 201

$orderId = $order.id

Test-Endpoint -Name "GET /orders (list)" -Method GET -Uri "$base/orders?page=1&page_size=10" -Token $token -ExpectedStatus 200

Test-Endpoint -Name "GET /orders/$orderId (detail)" -Method GET -Uri "$base/orders/$orderId" -Token $token -ExpectedStatus 200

Test-Endpoint -Name "PUT /orders/$orderId (update status)" -Method PUT -Uri "$base/orders/$orderId" -Token $token -Body @{
    status = "confirmed"
} -ExpectedStatus 200

# Verify stock was decremented
$productAfterOrder = Test-Endpoint -Name "GET /products/$productId (verify stock decrement)" -Method GET -Uri "$base/products/$productId" -Token $token -ExpectedStatus 200
if ($productAfterOrder.stock_quantity -eq 48) {
    Write-Host "PASS Stock correctly decremented: 50 -> 48" -ForegroundColor Green
} else {
    Write-Host "FAIL Stock should be 48, got: $($productAfterOrder.stock_quantity)" -ForegroundColor Red
}

# Insufficient stock order
Test-Endpoint -Name "POST /orders (insufficient stock)" -Method POST -Uri "$base/orders" -Token $token -Body @{
    customer_id = $customerId
    items = @( @{ product_id = $product2Id; quantity = 9999 } )
} -ExpectedStatus 400

# --- 9. DASHBOARD ---
Write-Host "`n--- Dashboard ---" -ForegroundColor Magenta
$dashboard = Test-Endpoint -Name "GET /dashboard" -Method GET -Uri "$base/dashboard" -Token $token -ExpectedStatus 200
if ($dashboard) {
    Write-Host "  Products: $($dashboard.total_products), Customers: $($dashboard.total_customers), Orders: $($dashboard.total_orders), Revenue: $($dashboard.total_revenue)" -ForegroundColor Gray
    Write-Host "  Low stock items: $($dashboard.low_stock_products.Count)" -ForegroundColor Gray
}

# --- 10. CLEANUP: Delete order (restores stock) ---
Write-Host "`n--- Cleanup & Delete Tests ---" -ForegroundColor Magenta
Test-Endpoint -Name "DELETE /orders/$orderId (delete)" -Method DELETE -Uri "$base/orders/$orderId" -Token $token -ExpectedStatus 204

# Verify stock restored
$productAfterDelete = Test-Endpoint -Name "GET /products/$productId (verify stock restored)" -Method GET -Uri "$base/products/$productId" -Token $token -ExpectedStatus 200
if ($productAfterDelete.stock_quantity -eq 50) {
    Write-Host "PASS Stock correctly restored: 48 -> 50" -ForegroundColor Green
} else {
    Write-Host "FAIL Stock should be 50, got: $($productAfterDelete.stock_quantity)" -ForegroundColor Red
}

Test-Endpoint -Name "DELETE /products/$productId" -Method DELETE -Uri "$base/products/$productId" -Token $token -ExpectedStatus 204
Test-Endpoint -Name "DELETE /products/$product2Id" -Method DELETE -Uri "$base/products/$product2Id" -Token $token -ExpectedStatus 204
Test-Endpoint -Name "DELETE /customers/$customerId" -Method DELETE -Uri "$base/customers/$customerId" -Token $token -ExpectedStatus 204

# 404 on deleted resources
Test-Endpoint -Name "GET /products/$productId (404 after delete)" -Method GET -Uri "$base/products/$productId" -Token $token -ExpectedStatus 404
Test-Endpoint -Name "GET /customers/$customerId (404 after delete)" -Method GET -Uri "$base/customers/$customerId" -Token $token -ExpectedStatus 404

# --- 11. FRONTEND ---
Write-Host "`n--- Frontend ---" -ForegroundColor Magenta
try {
    $frontendResp = Invoke-WebRequest -Uri "http://localhost:80" -Method GET -ErrorAction Stop
    if ($frontendResp.StatusCode -eq 200 -and $frontendResp.Content -match "InvenTrack") {
        Write-Host "PASS [200] Frontend serves index.html with InvenTrack" -ForegroundColor Green
    } else {
        Write-Host "FAIL Frontend response unexpected" -ForegroundColor Red
    }
} catch {
    Write-Host "FAIL Frontend unreachable: $_" -ForegroundColor Red
}

# SPA routing - non-root paths should also return index.html
try {
    $spaResp = Invoke-WebRequest -Uri "http://localhost:80/dashboard" -Method GET -ErrorAction Stop
    if ($spaResp.StatusCode -eq 200 -and $spaResp.Content -match "InvenTrack") {
        Write-Host "PASS [200] SPA routing works (/dashboard -> index.html)" -ForegroundColor Green
    } else {
        Write-Host "FAIL SPA routing broken" -ForegroundColor Red
    }
} catch {
    Write-Host "FAIL SPA routing unreachable: $_" -ForegroundColor Red
}

# API proxy through nginx
try {
    $proxyResp = Invoke-WebRequest -Uri "http://localhost:80/api/v1/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"username":"fake","password":"fake"}' -ErrorAction Stop
} catch {
    $proxyStatus = $_.Exception.Response.StatusCode.Value__
    if ($proxyStatus -eq 401) {
        Write-Host "PASS [401] Nginx API proxy working correctly" -ForegroundColor Green
    } else {
        Write-Host "FAIL Nginx API proxy issue, status: $proxyStatus" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST SUITE COMPLETE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
