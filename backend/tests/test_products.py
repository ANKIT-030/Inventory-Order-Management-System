import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_product_success(client: AsyncClient, auth_headers: dict[str, str]):
    response = await client.post(
        "/products/",
        headers=auth_headers,
        json={
            "name": "Widget A",
            "sku": "WIDGET-A-123",
            "description": "Premium Widget A",
            "price": 19.99,
            "stock_quantity": 50
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Widget A"
    assert data["sku"] == "WIDGET-A-123"
    assert data["price"] == "19.99"
    assert data["stock_quantity"] == 50
    assert "id" in data

@pytest.mark.asyncio
async def test_create_product_invalid_price(client: AsyncClient, auth_headers: dict[str, str]):
    # Price <= 0 is invalid
    response = await client.post(
        "/products/",
        headers=auth_headers,
        json={
            "name": "Widget Price Test",
            "sku": "WIDGET-PR-0",
            "price": 0.00,
            "stock_quantity": 10
        }
    )
    assert response.status_code == 422

    response2 = await client.post(
        "/products/",
        headers=auth_headers,
        json={
            "name": "Widget Price Test 2",
            "sku": "WIDGET-PR-NEG",
            "price": -5.99,
            "stock_quantity": 10
        }
    )
    assert response2.status_code == 422

@pytest.mark.asyncio
async def test_create_product_invalid_stock(client: AsyncClient, auth_headers: dict[str, str]):
    # Stock < 0 is invalid
    response = await client.post(
        "/products/",
        headers=auth_headers,
        json={
            "name": "Widget Stock Test",
            "sku": "WIDGET-ST-NEG",
            "price": 5.99,
            "stock_quantity": -1
        }
    )
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_create_product_duplicate_sku(client: AsyncClient, auth_headers: dict[str, str]):
    # Create product 1
    await client.post(
        "/products/",
        headers=auth_headers,
        json={
            "name": "Widget Original",
            "sku": "SAME-SKU",
            "price": 10.00,
            "stock_quantity": 5
        }
    )
    # Create product 2 with same SKU
    response = await client.post(
        "/products/",
        headers=auth_headers,
        json={
            "name": "Widget Duplicate",
            "sku": "SAME-SKU",
            "price": 15.00,
            "stock_quantity": 2
        }
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Product with this SKU already exists"

@pytest.mark.asyncio
async def test_get_product(client: AsyncClient, auth_headers: dict[str, str]):
    # Create
    create_res = await client.post(
        "/products/",
        headers=auth_headers,
        json={
            "name": "Search Target",
            "sku": "TARGET-SKU",
            "price": 20.00,
            "stock_quantity": 8
        }
    )
    product_id = create_res.json()["id"]

    # Get
    response = await client.get(f"/products/{product_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["name"] == "Search Target"

    # Get 404
    response_404 = await client.get("/products/99999", headers=auth_headers)
    assert response_404.status_code == 404

@pytest.mark.asyncio
async def test_list_products_and_search(client: AsyncClient, auth_headers: dict[str, str]):
    # Create matching and non-matching products
    await client.post(
        "/products/",
        headers=auth_headers,
        json={"name": "Apple", "sku": "FRUIT-01", "price": 1.50, "stock_quantity": 100}
    )
    await client.post(
        "/products/",
        headers=auth_headers,
        json={"name": "Banana", "sku": "FRUIT-02", "price": 0.80, "stock_quantity": 200}
    )

    # Search for "Apple"
    res = await client.get("/products/?search=Apple", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 1
    assert data["items"][0]["name"] == "Apple"

    # Search for "FRUIT"
    res = await client.get("/products/?search=FRUIT", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["total"] == 2

@pytest.mark.asyncio
async def test_update_product(client: AsyncClient, auth_headers: dict[str, str]):
    # Create product
    create_res = await client.post(
        "/products/",
        headers=auth_headers,
        json={"name": "Original Name", "sku": "SKU-UP-1", "price": 5.00, "stock_quantity": 10}
    )
    product_id = create_res.json()["id"]

    # Update Name and SKU
    response = await client.put(
        f"/products/{product_id}",
        headers=auth_headers,
        json={"name": "Updated Name", "sku": "SKU-UP-2"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["sku"] == "SKU-UP-2"
    assert data["price"] == "5.00"  # Unchanged

@pytest.mark.asyncio
async def test_delete_product(client: AsyncClient, auth_headers: dict[str, str]):
    # Create product
    create_res = await client.post(
        "/products/",
        headers=auth_headers,
        json={"name": "Delete Me", "sku": "SKU-DEL", "price": 1.00, "stock_quantity": 1}
    )
    product_id = create_res.json()["id"]

    # Delete
    del_res = await client.delete(f"/products/{product_id}", headers=auth_headers)
    assert del_res.status_code == 204

    # Verify deleted
    get_res = await client.get(f"/products/{product_id}", headers=auth_headers)
    assert get_res.status_code == 404
