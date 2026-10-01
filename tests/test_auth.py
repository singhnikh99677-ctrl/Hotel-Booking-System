def test_register_user(client):
    response = client.post(
        "/auth/register",
        json={
            "name": "Alice",
            "email": "alice@example.com",
            "password": "secret123",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "alice@example.com"
    assert data["role"] == "USER"


def test_duplicate_email(client):
    client.post("/auth/register", json={"name": "Alice", "email": "alice@example.com", "password": "secret123"})
    response = client.post("/auth/register", json={"name": "Alice 2", "email": "alice@example.com", "password": "secret456"})
    assert response.status_code == 409


def test_login_user(client):
    client.post("/auth/register", json={"name": "Alice", "email": "alice@example.com", "password": "secret123"})
    response = client.post("/auth/login", json={"email": "alice@example.com", "password": "secret123"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_invalid_login(client):
    client.post("/auth/register", json={"name": "Alice", "email": "alice@example.com", "password": "secret123"})
    response = client.post("/auth/login", json={"email": "alice@example.com", "password": "wrongpassword"})
    assert response.status_code == 401


def test_auth_me(client):
    response = client.post(
        "/auth/register",
        json={"name": "Alice", "email": "alice@example.com", "password": "secret123"},
    )
    token = client.post("/auth/login", json={"email": "alice@example.com", "password": "secret123"}).json()["access_token"]
    me = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["email"] == "alice@example.com"


def test_admin_registration_requires_key(client):
    response = client.post(
        "/auth/register",
        json={"name": "Admin", "email": "admin@example.com", "password": "secret123", "role": "ADMIN"},
    )
    assert response.status_code == 403


def test_update_profile(client):
    response = client.post(
        "/auth/register",
        json={"name": "Alice", "email": "alice@example.com", "password": "secret123"},
    )
    token = client.post("/auth/login", json={"email": "alice@example.com", "password": "secret123"}).json()["access_token"]

    updated = client.patch(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"},
        json={"name": "Alice Updated", "email": "alice.updated@example.com"},
    )
    assert updated.status_code == 200
    assert updated.json()["name"] == "Alice Updated"
    assert updated.json()["email"] == "alice.updated@example.com"
