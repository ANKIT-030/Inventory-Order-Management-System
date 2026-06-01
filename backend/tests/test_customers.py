import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_customer_success(client: AsyncClient, auth_headers: dict[str, str]):
    response = await client.post(
        "/customers/",
        headers=auth_headers,
        json={
            "full_name": "Alice Smith",
            "email": "alice@example.com",
            "phone": "+1234567890",
            "address": "123 Test Lane"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["full_name"] == "Alice Smith"
    assert data["email"] == "alice@example.com"
    assert "id" in data

@pytest.mark.asyncio
async def test_create_customer_invalid_email(client: AsyncClient, auth_headers: dict[str, str]):
    # Invalid email format (missing domain/suffix)
    response = await client.post(
        "/customers/",
        headers=auth_headers,
        json={
            "full_name": "Bad Email",
            "email": "invalidemail",
            "phone": "555-1234",
            "address": "Address"
        }
    )
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_create_customer_duplicate_email(client: AsyncClient, auth_headers: dict[str, str]):
    # Create customer 1
    await client.post(
        "/customers/",
        headers=auth_headers,
        json={
            "full_name": "Original Customer",
            "email": "sameemail@test.com",
            "phone": "123"
        }
    )
    # Create customer 2 with same email
    response = await client.post(
        "/customers/",
        headers=auth_headers,
        json={
            "full_name": "Duplicate Customer",
            "email": "sameemail@test.com",
            "phone": "456"
        }
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Customer with this email already exists"

@pytest.mark.asyncio
async def test_get_customer(client: AsyncClient, auth_headers: dict[str, str]):
    # Create
    create_res = await client.post(
        "/customers/",
        headers=auth_headers,
        json={"full_name": "Get Customer Test", "email": "getcust@test.com"}
    )
    customer_id = create_res.json()["id"]

    # Get
    response = await client.get(f"/customers/{customer_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["full_name"] == "Get Customer Test"

    # Get 404
    response_404 = await client.get("/customers/99999", headers=auth_headers)
    assert response_404.status_code == 404

@pytest.mark.asyncio
async def test_list_customers_and_search(client: AsyncClient, auth_headers: dict[str, str]):
    # Create customers
    await client.post(
        "/customers/",
        headers=auth_headers,
        json={"full_name": "John Doe", "email": "johndoe@example.com"}
    )
    await client.post(
        "/customers/",
        headers=auth_headers,
        json={"full_name": "Jane Miller", "email": "jane@example.com"}
    )

    # Search for "Doe"
    res = await client.get("/customers/?search=Doe", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 1
    assert data["items"][0]["full_name"] == "John Doe"

    # Search for "johndoe" (unique email substring)
    res = await client.get("/customers/?search=johndoe", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["total"] == 1
