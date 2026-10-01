def create_admin(client):
    response = client.post(
        "/auth/register",
        json={
            "name": "Admin",
            "email": "admin@example.com",
            "password": "secret123",
            "role": "ADMIN",
            "admin_registration_key": "admin-key-123",
        },
    )
    assert response.status_code == 201
    token = client.post("/auth/login", json={"email": "admin@example.com", "password": "secret123"}).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_list_hotels(client):
    headers = create_admin(client)
    hotel = client.post("/hotels", headers=headers, json={"name": "Grand Hotel", "location": "Mumbai", "description": "A nice hotel.", "rating": 4.8, "address": "123 Main St", "amenities": "WiFi, Pool"}).json()
    client.post(
        f"/hotels/{hotel['id']}/rooms",
        headers=headers,
        json={"room_number": "101", "room_type": "Deluxe", "price_per_night": 1250, "capacity": 2, "description": "A comfortable room."},
    )
    response = client.get("/hotels")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["starting_price"] == 1250


def test_search_hotels(client):
    headers = create_admin(client)
    client.post("/hotels", headers=headers, json={"name": "Grand Hotel", "location": "Mumbai", "description": "A nice hotel.", "rating": 4.8, "address": "123 Main St", "amenities": "WiFi, Pool"})
    response = client.get("/hotels?location=Mumbai&min_rating=4")
    assert response.status_code == 200
    assert response.json()[0]["name"] == "Grand Hotel"


def test_hotel_details(client):
    headers = create_admin(client)
    hotel = client.post("/hotels", headers=headers, json={"name": "Grand Hotel", "location": "Mumbai", "description": "A nice hotel.", "rating": 4.8, "address": "123 Main St", "amenities": "WiFi, Pool"}).json()
    response = client.get(f"/hotels/{hotel['id']}")
    assert response.status_code == 200
    assert response.json()["name"] == "Grand Hotel"


def test_admin_update_hotel(client):
    headers = create_admin(client)
    hotel = client.post("/hotels", headers=headers, json={"name": "Grand Hotel", "location": "Mumbai", "description": "A nice hotel.", "rating": 4.8, "address": "123 Main St", "amenities": "WiFi, Pool"}).json()
    response = client.put(f"/hotels/{hotel['id']}", headers=headers, json={"rating": 4.9, "description": "Updated description"})
    assert response.status_code == 200
    assert response.json()["rating"] == 4.9


def test_unauthorized_hotel_modification(client):
    admin_headers = create_admin(client)
    hotel = client.post("/hotels", headers=admin_headers, json={"name": "Grand Hotel", "location": "Mumbai", "description": "A nice hotel.", "rating": 4.8, "address": "123 Main St", "amenities": "WiFi, Pool"}).json()

    response = client.post(
        "/auth/register",
        json={"name": "User", "email": "user@example.com", "password": "secret123"},
    )
    token = client.post("/auth/login", json={"email": "user@example.com", "password": "secret123"}).json()["access_token"]
    user_headers = {"Authorization": f"Bearer {token}"}

    response = client.put(f"/hotels/{hotel['id']}", headers=user_headers, json={"rating": 1.0})
    assert response.status_code == 403
