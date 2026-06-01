import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_register_success(client: AsyncClient):
    response = await client.post(
        "/auth/register",
        json={
            "username": "newuser",
            "email": "new@example.com",
            "password": "securepassword"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "newuser"
    assert data["email"] == "new@example.com"
    assert "id" in data
    assert "hashed_password" not in data

@pytest.mark.asyncio
async def test_register_duplicate_username(client: AsyncClient):
    # First registration
    await client.post(
        "/auth/register",
        json={
            "username": "dupuser",
            "email": "dup1@example.com",
            "password": "password"
        }
    )
    # Second registration with same username
    response = await client.post(
        "/auth/register",
        json={
            "username": "dupuser",
            "email": "dup2@example.com",
            "password": "password"
        }
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Username already registered"

@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    # First registration
    await client.post(
        "/auth/register",
        json={
            "username": "user1",
            "email": "dupemail@example.com",
            "password": "password"
        }
    )
    # Second registration with same email
    response = await client.post(
        "/auth/register",
        json={
            "username": "user2",
            "email": "dupemail@example.com",
            "password": "password"
        }
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"

@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    # Register user
    await client.post(
        "/auth/register",
        json={
            "username": "loginuser",
            "email": "login@example.com",
            "password": "loginpassword"
        }
    )
    
    # Login
    response = await client.post(
        "/auth/login",
        json={
            "username": "loginuser",
            "password": "loginpassword"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

@pytest.mark.asyncio
async def test_login_invalid_credentials(client: AsyncClient):
    response = await client.post(
        "/auth/login",
        json={
            "username": "nonexistent",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid username or password"
