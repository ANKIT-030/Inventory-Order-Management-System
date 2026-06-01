import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_order_success(client: AsyncClient, auth_headers: dict[str, str]):
    # 1. Create a customer
    cust_res = await client.post(
        "/customers/",
        headers=auth_headers,
        json={"full_name": "Buyer Bob", "email": "bob@buyer.com"}
    )
    customer_id = cust_res.json()["id"]

    # 2. Create a product
    prod_res = await client.post(
        "/products/",
        headers=auth_headers,
        json={"name": "Gaming Keyboard", "sku": "GM-KBD-01", "price": 49.99, "stock_quantity": 100}
    )
    product_id = prod_res.json()["id"]

    # 3. Create the order
    order_res = await client.post(
        "/orders/",
        headers=auth_headers,
        json={
            "customer_id": customer_id,
            "items": [
                {"product_id": product_id, "quantity": 3}
            ]
        }
    )
    assert order_res.status_code == 201
    order_data = order_res.json()
    assert order_data["customer_id"] == customer_id
    assert order_data["status"] == "pending"
    assert order_data["total_amount"] == "149.97"
    assert len(order_data["items"]) == 1
    assert order_data["items"][0]["quantity"] == 3
    assert order_data["items"][0]["unit_price"] == "49.99"
    assert order_data["items"][0]["product"]["id"] == product_id

    # 4. Verify product stock is decremented
    prod_get = await client.get(f"/products/{product_id}", headers=auth_headers)
    assert prod_get.json()["stock_quantity"] == 97

@pytest.mark.asyncio
async def test_create_order_insufficient_stock(client: AsyncClient, auth_headers: dict[str, str]):
    # 1. Create a customer
    cust_res = await client.post(
        "/customers/",
        headers=auth_headers,
        json={"full_name": "Buyer Alice", "email": "alice@buyer.com"}
    )
    customer_id = cust_res.json()["id"]

    # 2. Create a product with low stock
    prod_res = await client.post(
        "/products/",
        headers=auth_headers,
        json={"name": "Rare Console", "sku": "R-CON-01", "price": 499.99, "stock_quantity": 5}
    )
    product_id = prod_res.json()["id"]

    # 3. Create the order requesting more than stock (6 requested, 5 available)
    order_res = await client.post(
        "/orders/",
        headers=auth_headers,
        json={
            "customer_id": customer_id,
            "items": [
                {"product_id": product_id, "quantity": 6}
            ]
        }
    )
    assert order_res.status_code == 400
    assert "Insufficient inventory" in order_res.json()["detail"]

    # 4. Verify stock remains unchanged
    prod_get = await client.get(f"/products/{product_id}", headers=auth_headers)
    assert prod_get.json()["stock_quantity"] == 5

@pytest.mark.asyncio
async def test_delete_order_restores_stock(client: AsyncClient, auth_headers: dict[str, str]):
    # 1. Create customer and product
    cust_res = await client.post(
        "/customers/",
        headers=auth_headers,
        json={"full_name": "Buyer Charlie", "email": "charlie@buyer.com"}
    )
    customer_id = cust_res.json()["id"]

    prod_res = await client.post(
        "/products/",
        headers=auth_headers,
        json={"name": "Office Chair", "sku": "OF-CHR-01", "price": 99.00, "stock_quantity": 20}
    )
    product_id = prod_res.json()["id"]

    # 2. Place order for 5 chairs
    order_res = await client.post(
        "/orders/",
        headers=auth_headers,
        json={
            "customer_id": customer_id,
            "items": [
                {"product_id": product_id, "quantity": 5}
            ]
        }
    )
    order_id = order_res.json()["id"]

    # Verify stock decremented to 15
    prod_get = await client.get(f"/products/{product_id}", headers=auth_headers)
    assert prod_get.json()["stock_quantity"] == 15

    # 3. Delete/Cancel the order
    del_res = await client.delete(f"/orders/{order_id}", headers=auth_headers)
    assert del_res.status_code == 204

    # 4. Verify stock restored to 20
    prod_get_restored = await client.get(f"/products/{product_id}", headers=auth_headers)
    assert prod_get_restored.json()["stock_quantity"] == 20

@pytest.mark.asyncio
async def test_create_order_nonexistent_customer(client: AsyncClient, auth_headers: dict[str, str]):
    prod_res = await client.post(
        "/products/",
        headers=auth_headers,
        json={"name": "Office Chair 2", "sku": "OF-CHR-02", "price": 99.00, "stock_quantity": 20}
    )
    product_id = prod_res.json()["id"]

    response = await client.post(
        "/orders/",
        headers=auth_headers,
        json={
            "customer_id": 99999,
            "items": [
                {"product_id": product_id, "quantity": 1}
            ]
        }
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Customer not found"
