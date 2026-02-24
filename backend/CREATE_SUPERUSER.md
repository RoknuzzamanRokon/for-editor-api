# Create Super User

This guide explains how to create a super user for the PDF Converter API.

## Quick Start

Run the Python script to create the super user:

```bash
cd backend
python create_superuser.py
```

## Super User Credentials

The script creates a super user with the following credentials:

- **Username:** rokon123rokon
- **Email:** rokon123rokon@example.com
- **Password:** rokon123rokon
- **Role:** super_user

## What the Script Does

1. Initializes the database (creates tables if they don't exist)
2. Checks if the user already exists
3. Hashes the password using bcrypt
4. Creates the super user in the database
5. Displays confirmation with user details

## Manual Creation (Alternative)

If you prefer to create the user manually, you can use the Python shell:

```bash
cd backend
python
```

Then run:

```python
from core.security import get_password_hash
from db.models import RoleEnum, User
from db.session import SessionLocal, init_db

# Initialize database
init_db()

# Create session
db = SessionLocal()

# Hash password
hashed_password = get_password_hash("rokon123rokon")

# Create user
user = User(
    email="rokon123rokon@example.com",
    username="rokon123rokon",
    hashed_password=hashed_password,
    role=RoleEnum.super_user,
    is_active=True
)

db.add(user)
db.commit()
print(f"Super user created: {user.email}")
db.close()
```

## Testing the Super User

After creating the super user, test the login:

```bash
curl -X POST "http://localhost:8000/api/v2/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rokon123rokon@example.com",
    "password": "rokon123rokon"
  }'
```

You should receive an access token and refresh token in the response.

## Security Notes

⚠️ **Important:** Change the default password after first login in production environments!

The super user has full access to:
- All API endpoints
- User management
- System configuration
- All conversion features

## Troubleshooting

### Database Connection Error

If you get a database connection error, check:
1. Database is running
2. `.env` file has correct database credentials
3. Database exists and is accessible

### User Already Exists

If the user already exists, the script will display the existing user details and exit without creating a duplicate.

### Import Errors

Make sure you're running the script from the `backend` directory and all dependencies are installed:

```bash
cd backend
pipenv install
pipenv shell
python create_superuser.py
```
