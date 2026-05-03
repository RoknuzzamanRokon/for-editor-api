#!/usr/bin/env python3
"""
Script to delete a user so they can re-register with the correct password.
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from core.config import settings

def delete_user(email: str):
    """Delete a user by email along with all related records."""
    engine = create_engine(settings.database_url)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        # First, get the user ID
        result = db.execute(
            text("SELECT id FROM users WHERE email = :email"),
            {"email": email}
        )
        user = result.fetchone()
        
        if not user:
            print(f"❌ User with email '{email}' not found")
            return False
        
        user_id = user[0]
        print(f"Found user ID: {user_id}")
        
        # Delete related records in order
        tables_with_user_id = [
            "points_ledger",
            "user_conversion_permissions",
            "user_preferences",
            "user_points",
            "refresh_tokens",
            "points_topups",
        ]
        
        for table in tables_with_user_id:
            result = db.execute(
                text(f"DELETE FROM {table} WHERE user_id = :user_id"),
                {"user_id": user_id}
            )
            if result.rowcount > 0:
                print(f"   Deleted {result.rowcount} record(s) from {table}")
        
        # Delete conversions (uses owner_user_id)
        result = db.execute(
            text("DELETE FROM conversions WHERE owner_user_id = :user_id"),
            {"user_id": user_id}
        )
        if result.rowcount > 0:
            print(f"   Deleted {result.rowcount} record(s) from conversions")
        
        # Finally delete the user
        result = db.execute(
            text("DELETE FROM users WHERE id = :user_id"),
            {"user_id": user_id}
        )
        
        db.commit()
        
        print(f"\n✅ User '{email}' deleted successfully")
        print("\n📝 You can now register again with the correct password")
        return True
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error deleting user: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()


if __name__ == "__main__":
    # Delete the user that was created with temporary password
    email = "rokon.dev.work@gmail.com"
    
    print(f"Deleting user: {email}")
    print("-" * 50)
    
    success = delete_user(email)
    
    if success:
        print("\n✅ Next steps:")
        print("   1. Go to /register")
        print("   2. Enter your email: rokon.dev.work@gmail.com")
        print("   3. Verify with the code sent to your email")
        print("   4. Complete registration with your desired password")
        print("\n   The new registration flow will now save your actual password!")
    
    sys.exit(0 if success else 1)
