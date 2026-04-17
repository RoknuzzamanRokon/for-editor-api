# Topup Requests API

Documentation for the topup request workflow added on API v3.

Base URL:

```text
http://localhost:8000/api/v3
```

Authentication:

- Bearer token required for every endpoint

---

## Overview

This flow lets a user request points from a specific admin.

Main behavior:

- Any authenticated user can create a topup request
- A normal user can only create a request for their own `user_id`
- The request must target a specific `admin_user` or `super_user`
- If the target is an `admin_user`, that admin must actually manage that user
- `super_user` can see and manage all requests
- `admin_user` can only see and manage requests assigned to them
- When an admin approves a request, points are transferred from that admin's own balance
- `super_user` can approve without balance limits
- Regular admins only see their own point-giving history

---

## Workflow

1. User submits a topup request to a chosen admin.
2. Assigned admin or super admin sees the pending request.
3. Assigned admin can approve only if they have enough points.
4. If approved:
   - points are added to the target user
   - admin balance is reduced when approver is `admin_user`
   - the request status becomes `approved`
   - the transfer appears in point-giving history
5. If rejected:
   - the request status becomes `rejected`
   - no points are transferred

---

## Role Rules

### `general_user`

- Can create a request for their own account
- Can view only their own submitted requests through `/points/topup-requests/mine`
- Cannot approve or reject requests

### `admin_user`

- Can receive requests assigned to them
- Can view only requests where `requested_admin_user_id == current_user.id`
- Can approve or reject only requests assigned to them
- Can only top up users they are allowed to manage
- Spends from their own points balance when approving
- Can view only their own point-giving history

### `super_user`

- Can create, see, approve, and reject any request
- Can inspect all request inboxes
- Can view all point-giving history
- Does not need to spend from a limited balance

---

## Endpoints

### 1. Create topup request

`POST /points/topup-requests`

Create a new topup request for a specific admin.

Request body:

```json
{
  "user_id": 12,
  "requested_admin_user_id": 4,
  "amount": 25,
  "note": "Need more points for document conversions"
}
```

Success response:

```json
{
  "id": 7,
  "user_id": 12,
  "requested_admin_user_id": 4,
  "amount": 25,
  "note": "Need more points for document conversions",
  "status": "pending",
  "created_by_user_id": 12,
  "resolved_by_user_id": null,
  "resolved_at": null,
  "created_at": "2026-04-17T10:30:00",
  "updated_at": "2026-04-17T10:30:00"
}
```

Rules:

- `requested_admin_user_id` must belong to `admin_user` or `super_user`
- If requester is not admin/super admin, `user_id` must equal the logged-in user
- If target is `admin_user`, that admin must own/manage the user

---

### 2. View my submitted requests

`GET /points/topup-requests/mine?limit=50&offset=0`

Returns requests created by the current user.

Success response:

```json
{
  "items": [
    {
      "id": 7,
      "user_id": 12,
      "requested_admin_user_id": 4,
      "amount": 25,
      "note": "Need more points for document conversions",
      "status": "pending",
      "created_by_user_id": 12,
      "resolved_by_user_id": null,
      "resolved_at": null,
      "created_at": "2026-04-17T10:30:00",
      "updated_at": "2026-04-17T10:30:00"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

---

### 3. Admin inbox for incoming requests

`GET /admin/points/topup-requests?limit=50&offset=0`

Optional query:

- `status=pending|approved|rejected`

Behavior:

- `super_user` sees all requests
- `admin_user` sees only requests assigned to them

Success response:

```json
{
  "total": 1,
  "limit": 50,
  "offset": 0,
  "items": [
    {
      "id": 7,
      "user_id": 12,
      "user_email": "user@example.com",
      "user_username": "user12",
      "requested_admin_user_id": 4,
      "requested_admin_email": "admin@example.com",
      "requested_admin_username": "adminA",
      "amount": 25,
      "note": "Need more points for document conversions",
      "status": "pending",
      "created_by_user_id": 12,
      "created_by_email": "user@example.com",
      "created_by_username": "user12",
      "resolved_by_user_id": null,
      "resolved_by_email": null,
      "resolved_by_username": null,
      "resolved_at": null,
      "created_at": "2026-04-17T10:30:00",
      "updated_at": "2026-04-17T10:30:00"
    }
  ]
}
```

---

### 4. Approve a request

`POST /admin/points/topup-requests/{request_id}/approve`

Behavior:

- `super_user` can approve any request
- `admin_user` can approve only requests assigned to them
- request must still be `pending`
- if approver is `admin_user`, they must have enough balance

Success response:

```json
{
  "id": 7,
  "user_id": 12,
  "user_email": "user@example.com",
  "user_username": "user12",
  "requested_admin_user_id": 4,
  "requested_admin_email": "admin@example.com",
  "requested_admin_username": "adminA",
  "amount": 25,
  "note": "Need more points for document conversions",
  "status": "approved",
  "created_by_user_id": 12,
  "created_by_email": "user@example.com",
  "created_by_username": "user12",
  "resolved_by_user_id": 4,
  "resolved_by_email": "admin@example.com",
  "resolved_by_username": "adminA",
  "resolved_at": "2026-04-17T11:00:00",
  "created_at": "2026-04-17T10:30:00",
  "updated_at": "2026-04-17T11:00:00"
}
```

---

### 5. Reject a request

`POST /admin/points/topup-requests/{request_id}/reject`

Behavior:

- same permission rules as approve
- request must still be `pending`
- no points are transferred

Success response:

```json
{
  "id": 7,
  "user_id": 12,
  "user_email": "user@example.com",
  "user_username": "user12",
  "requested_admin_user_id": 4,
  "requested_admin_email": "admin@example.com",
  "requested_admin_username": "adminA",
  "amount": 25,
  "note": "Need more points for document conversions",
  "status": "rejected",
  "created_by_user_id": 12,
  "created_by_email": "user@example.com",
  "created_by_username": "user12",
  "resolved_by_user_id": 4,
  "resolved_by_email": "admin@example.com",
  "resolved_by_username": "adminA",
  "resolved_at": "2026-04-17T11:05:00",
  "created_at": "2026-04-17T10:30:00",
  "updated_at": "2026-04-17T11:05:00"
}
```

---

### 6. Point-giving history

`GET /admin/points/giving-history?limit=50&offset=0`

Important visibility:

- `super_user` sees all point transfers
- `admin_user` sees only transfers created by that admin

Optional filters:

- `user_id`
- `created_by_user_id`

For normal admins, `created_by_user_id` cannot be used to inspect another admin's transfers.

---

## Error Cases

### Requesting admin is invalid

```json
{
  "detail": "Requested user must be an admin or super user"
}
```

### Selected admin does not manage that user

```json
{
  "detail": "Selected admin is not allowed to manage this user"
}
```

### Admin tries to approve another admin's request

```json
{
  "detail": "Not permitted to manage this topup request"
}
```

### Admin does not have enough points

```json
{
  "detail": "Admin does not have enough points to transfer"
}
```

### Request already resolved

```json
{
  "detail": "Topup request is not pending"
}
```

---

## Python Examples

### Create request

```python
import requests

token = "<access_token>"

response = requests.post(
    "http://127.0.0.1:8000/api/v3/points/topup-requests",
    headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    },
    json={
        "user_id": 12,
        "requested_admin_user_id": 4,
        "amount": 25,
        "note": "Need more points"
    },
)

print(response.status_code)
print(response.json())
```

### View incoming admin requests

```python
import requests

token = "<admin_access_token>"

response = requests.get(
    "http://127.0.0.1:8000/api/v3/admin/points/topup-requests?status=pending",
    headers={"Authorization": f"Bearer {token}"},
)

print(response.status_code)
print(response.json())
```

### Approve request

```python
import requests

token = "<admin_access_token>"
request_id = 7

response = requests.post(
    f"http://127.0.0.1:8000/api/v3/admin/points/topup-requests/{request_id}/approve",
    headers={"Authorization": f"Bearer {token}"},
)

print(response.status_code)
print(response.json())
```

---

## Files Touched

- `backend/api/v3/endpoints/points.py`
- `backend/api/v3/endpoints/admin.py`
- `backend/models/points.py`
- `backend/models/admin.py`
- `backend/db/models.py`
- `backend/alembic/versions/e1b2c3d4f5a6_add_points_topup_requests_table.py`

---

## Last Updated

2026-04-17
