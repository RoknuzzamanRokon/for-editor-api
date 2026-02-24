#!/usr/bin/env python3
"""
Script to create a super user in the database.
Usage: python create_superuser.py
"""

from core.security import get_password_hash
from db.models import RoleEnum, User
from db.session import SessionLocal, init_db


def create_superuser(
    email: str,
    username: str,
    password: str,
    role: RoleEnum = RoleEnum.super_user
) -> User:
    """
    Create a super user in the database.
    
    Args:
        email: User email address
        username: Username
        password: Plain text password (will be hashed)
        role: User role (default: super_user)
    
    Returns:
        Created User object
    """
    db = SessionLocal()
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(
            (User.email == email) | (User.username == username)
        ).first()
        
        if existing_user:
            print(f"❌ User already exists:")
            print(f"   Email: {existing_user.email}")
            print(f"   Username: {existing_user.username}")
            print(f"   Role: {existing_user.role}")
            return existing_user
        
        # Hash the password
        hashed_password = get_password_hash(password)
        
        # Create new user
        new_user = User(
            email=email,
            username=username,
            hashed_password=hashed_password,
            role=role,
            is_active=True
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        print(f"✅ Super user created successfully!")
        print(f"   ID: {new_user.id}")
        print(f"   Email: {new_user.email}")
        print(f"   Username: {new_user.username}")
        print(f"   Role: {new_user.role}")
        print(f"   Created at: {new_user.created_at}")
        
        return new_user
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating super user: {e}")
        raise
    finally:
        db.close()


def main():
    """Main function to create super user."""
    print("=" * 50)
    print("Creating Super User")
    print("=" * 50)
    
    # Initialize database (create tables if they don't exist)
    print("\n📦 Initializing database...")
    init_db()
    print("✅ Database initialized")
    
    # Create super user with provided credentials
    print("\n👤 Creating super user...")
    create_superuser(
        email="rokon123rokon@gmail.com",
        username="rokon123rokon",
        password="rokon123rokon",
        role=RoleEnum.super_user
    )
    
    print("\n" + "=" * 50)
    print("Done!")
    print("=" * 50)


if __name__ == "__main__":
    main()
