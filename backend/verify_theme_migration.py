#!/usr/bin/env python3
"""
Verification script for light theme migration.
Checks that no user_preferences records have theme='light'.
"""
from sqlalchemy import create_engine, text
from core.config import settings

def verify_no_light_theme():
    """Verify that no user preferences have theme='light'."""
    engine = create_engine(settings.database_url)
    
    with engine.connect() as conn:
        # Check for any records with theme='light'
        result = conn.execute(
            text("SELECT COUNT(*) as count FROM user_preferences WHERE theme = 'light'")
        )
        count = result.fetchone()[0]
        
        if count > 0:
            print(f"❌ FAILED: Found {count} user_preferences records with theme='light'")
            # Show the records
            result = conn.execute(
                text("SELECT user_id, theme FROM user_preferences WHERE theme = 'light'")
            )
            print("\nRecords with theme='light':")
            for row in result:
                print(f"  user_id: {row[0]}, theme: {row[1]}")
            return False
        else:
            print("✅ PASSED: No user_preferences records have theme='light'")
            
        # Show distribution of themes
        result = conn.execute(
            text("SELECT theme, COUNT(*) as count FROM user_preferences GROUP BY theme")
        )
        print("\nTheme distribution:")
        for row in result:
            print(f"  {row[0]}: {row[1]} users")
            
        return True

if __name__ == "__main__":
    success = verify_no_light_theme()
    exit(0 if success else 1)
