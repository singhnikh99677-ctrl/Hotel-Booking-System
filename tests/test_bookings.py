def create_admin_headers(client):
    client.post(
        "/auth/register",
        json={"name": "Admin", "email": "admin@example.com", "password": "secret123", "role": "ADMIN", "admin_registration_key": "admin-key-123"},
    )
    token = client.post("/auth/login", json={"email": "admin@example.com", "password": "secret123"}).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def create_user(client, email="user@example.com"):
    client.post("/auth/register", json={"name": "User", "email": email, "password": "secret123"})
    token = client.post("/auth/login", json={"email": email, "password": "secret123"}).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def setup_hotel_and_room(client):
    admin_headers = create_admin_headers(client)
    hotel = client.post(
        "/hotels",
        headers=admin_headers,
        json={"name": "Grand Hotel", "location": "Mumbai", "description": "A nice hotel.", "rating": 4.8, "address": "123 Main St", "amenities": "WiFi, Pool"},
    ).json()
    room = client.post(
        f"/hotels/{hotel['id']}/rooms",
        headers=admin_headers,
        json={"room_number": "101", "room_type": "Deluxe", "price_per_night": 2000.0, "capacity": 2, "description": "Deluxe room", "is_available": True},
    ).json()
    return hotel, room, admin_headers


def test_create_booking(client):
    hotel, room, _ = setup_hotel_and_room(client)
    user_headers = create_user(client)
    response = client.post(
        "/bookings",
        headers=user_headers,
        json={"room_id": room["id"], "check_in": "2026-10-01", "check_out": "2026-10-03", "guests": 2},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["total_amount"] == 4000.0


def test_invalid_booking_dates(client):
    _, room, _ = setup_hotel_and_room(client)
    user_headers = create_user(client, "user2@example.com")
    response = client.post(
        "/bookings",
        headers=user_headers,
        json={"room_id": room["id"], "check_in": "2026-10-05", "check_out": "2026-10-05", "guests": 2},
    )
    assert response.status_code == 400


def test_overlapping_booking_prevention(client):
    _, room, _ = setup_hotel_and_room(client)
    user_headers = create_user(client, "user1@example.com")
    response = client.post(
        "/bookings",
        headers=user_headers,
        json={"room_id": room["id"], "check_in": "2026-10-01", "check_out": "2026-10-05", "guests": 2},
    )
    assert response.status_code == 201

    user_headers_two = create_user(client, "user2@example.com")
    response = client.post(
        "/bookings",
        headers=user_headers_two,
        json={"room_id": room["id"], "check_in": "2026-10-03", "check_out": "2026-10-06", "guests": 2},
    )
    assert response.status_code == 409


def test_guest_capacity_validation(client):
    _, room, _ = setup_hotel_and_room(client)
    user_headers = create_user(client, "user3@example.com")
    response = client.post(
        "/bookings",
        headers=user_headers,
        json={"room_id": room["id"], "check_in": "2026-11-01", "check_out": "2026-11-03", "guests": 3},
    )
    assert response.status_code == 400


def test_booking_total_amount(client):
    _, room, _ = setup_hotel_and_room(client)
    user_headers = create_user(client, "user4@example.com")
    response = client.post(
        "/bookings",
        headers=user_headers,
        json={"room_id": room["id"], "check_in": "2026-12-01", "check_out": "2026-12-04", "guests": 1},
    )
    assert response.status_code == 201
    assert response.json()["total_amount"] == 6000.0


def test_user_booking_history(client):
    _, room, _ = setup_hotel_and_room(client)
    user_headers = create_user(client, "user5@example.com")
    client.post(
        "/bookings",
        headers=user_headers,
        json={"room_id": room["id"], "check_in": "2026-10-10", "check_out": "2026-10-12", "guests": 1},
    )
    response = client.get("/bookings/me", headers=user_headers)
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_cancel_own_booking(client):
    _, room, _ = setup_hotel_and_room(client)
    user_headers = create_user(client, "user6@example.com")
    booking = client.post(
        "/bookings",
        headers=user_headers,
        json={"room_id": room["id"], "check_in": "2026-10-14", "check_out": "2026-10-16", "guests": 1},
    ).json()
    response = client.patch(f"/bookings/{booking['id']}/cancel", headers=user_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "CANCELLED"


def test_admin_can_view_all_bookings(client):
    _, room, admin_headers = setup_hotel_and_room(client)
    user_headers = create_user(client, "user7@example.com")
    client.post(
        "/bookings",
        headers=user_headers,
        json={"room_id": room["id"], "check_in": "2026-10-20", "check_out": "2026-10-22", "guests": 1},
    )
    response = client.get("/bookings", headers=admin_headers)
    assert response.status_code == 200
    assert len(response.json()) >= 1


def test_admin_can_update_booking_status(client):
    _, room, admin_headers = setup_hotel_and_room(client)
    user_headers = create_user(client, "user8@example.com")
    booking = client.post(
        "/bookings",
        headers=user_headers,
        json={"room_id": room["id"], "check_in": "2026-10-24", "check_out": "2026-10-26", "guests": 1},
    ).json()
    response = client.patch(f"/bookings/{booking['id']}/status", headers=admin_headers, json={"status": "COMPLETED"})
    assert response.status_code == 200
    assert response.json()["status"] == "COMPLETED"


def test_admin_dashboard_stats(client):
    hotel, room, admin_headers = setup_hotel_and_room(client)
    user_headers = create_user(client, "user8@example.com")
    client.post(
        "/bookings",
        headers=user_headers,
        json={"room_id": room["id"], "check_in": "2026-10-24", "check_out": "2026-10-26", "guests": 1},
    )
    response = client.get("/admin/stats", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total_hotels"] >= 1
    assert data["total_rooms"] >= 1
    assert data["total_bookings"] >= 1


def test_user_cannot_access_another_booking(client):
    _, room, _ = setup_hotel_and_room(client)
    user_headers = create_user(client, "user9@example.com")
    booking = client.post(
        "/bookings",
        headers=user_headers,
        json={"room_id": room["id"], "check_in": "2026-11-01", "check_out": "2026-11-03", "guests": 1},
    ).json()

    second_user = create_user(client, "user10@example.com")
    response = client.get(f"/bookings/{booking['id']}", headers=second_user)
    assert response.status_code == 403
