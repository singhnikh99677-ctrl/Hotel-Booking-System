def create_admin_headers(client):
    client.post(
        "/auth/register",
        json={"name": "Admin", "email": "admin@example.com", "password": "secret123", "role": "ADMIN", "admin_registration_key": "admin-key-123"},
    )
    token = client.post("/auth/login", json={"email": "admin@example.com", "password": "secret123"}).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def create_hotel(client, headers):
    return client.post(
        "/hotels",
        headers=headers,
        json={"name": "Grand Hotel", "location": "Mumbai", "description": "A nice hotel.", "rating": 4.8, "address": "123 Main St", "amenities": "WiFi, Pool"},
    ).json()


def test_create_and_list_rooms(client):
    headers = create_admin_headers(client)
    hotel = create_hotel(client, headers)
    room = client.post(f"/hotels/{hotel['id']}/rooms", headers=headers, json={"room_number": "101", "room_type": "Deluxe", "price_per_night": 2000.0, "capacity": 2, "description": "Deluxe room", "is_available": True})
    assert room.status_code == 201
    response = client.get(f"/hotels/{hotel['id']}/rooms")
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_room_details(client):
    headers = create_admin_headers(client)
    hotel = create_hotel(client, headers)
    room = client.post(f"/hotels/{hotel['id']}/rooms", headers=headers, json={"room_number": "201", "room_type": "Suite", "price_per_night": 2500.0, "capacity": 4, "description": "Suite room", "is_available": True}).json()
    response = client.get(f"/rooms/{room['id']}")
    assert response.status_code == 200
    assert response.json()["room_type"] == "Suite"


def test_invalid_hotel_for_room_creation(client):
    headers = create_admin_headers(client)
    response = client.post("/hotels/999/rooms", headers=headers, json={"room_number": "999", "room_type": "Classic", "price_per_night": 1200.0, "capacity": 2, "description": "Classic room"})
    assert response.status_code == 404


def test_room_availability(client):
    headers = create_admin_headers(client)
    hotel = create_hotel(client, headers)
    room = client.post(f"/hotels/{hotel['id']}/rooms", headers=headers, json={"room_number": "301", "room_type": "Classic", "price_per_night": 1500.0, "capacity": 2, "description": "Classic room", "is_available": True}).json()
    response = client.get(f"/rooms/{room['id']}/availability?check_in=2026-10-01&check_out=2026-10-05")
    assert response.status_code == 200
    assert response.json()["available"] is True


def test_non_admin_cannot_create_room(client):
    admin_headers = create_admin_headers(client)
    hotel = create_hotel(client, admin_headers)
    client.post("/auth/register", json={"name": "User", "email": "user@example.com", "password": "secret123"})
    token = client.post("/auth/login", json={"email": "user@example.com", "password": "secret123"}).json()["access_token"]
    user_headers = {"Authorization": f"Bearer {token}"}
    response = client.post(f"/hotels/{hotel['id']}/rooms", headers=user_headers, json={"room_number": "401", "room_type": "Premium", "price_per_night": 1800.0, "capacity": 2, "description": "Premium room"})
    assert response.status_code == 403
