#!/usr/bin/env python3
"""
Utility script to manage user conversion permissions from the command line.

Usage:
    python manage_permissions.py list-users
    python manage_permissions.py show <user_id>
    python manage_permissions.py grant <user_id> <action>
    python manage_permissions.py revoke <user_id> <action>
    python manage_permissions.py grant-all <user_id>
    python manage_permissions.py revoke-all <user_id>
"""

import sys
from sqlalchemy.orm import Session

from core.permissions import ALLOWED_ACTIONS
from db.models import User, UserConversionPermission
from db.session import SessionLocal


def list_users():
    """List all users with their roles."""
    db = SessionLocal()
    try:
        users = db.query(User).order_by(User.id).all()
        print("\n" + "="*80)
        print(f"{'ID':<5} {'Email':<30} {'Role':<15} {'Active':<8}")
        print("="*80)
        for user in users:
            active = "✓" if user.is_active else "✗"
            print(f"{user.id:<5} {user.email:<30} {user.role.value:<15} {active:<8}")
        print("="*80 + "\n")
    finally:
        db.close()


def show_permissions(user_id: int):
    """Show all permissions for a user."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            print(f"❌ User {user_id} not found")
            return

        print(f"\n{'='*80}")
        print(f"User: {user.email} (ID: {user.id})")
        print(f"Role: {user.role.value}")
        print(f"{'='*80}")

        if user.role.value == "super_user":
            print("\n✅ Super user - has access to ALL conversions (bypasses permission checks)")
            print(f"{'='*80}\n")
            return

        if user.role.value == "demo_user":
            print("\n❌ Demo user - READ-ONLY (cannot perform any conversions)")
            print(f"{'='*80}\n")
            return

        permissions = (
            db.query(UserConversionPermission)
            .filter(UserConversionPermission.user_id == user_id)
            .order_by(UserConversionPermission.action)
            .all()
        )

        print(f"\n{'Action':<20} {'Label':<30} {'Allowed':<10}")
        print("-"*80)

        for action, label in ALLOWED_ACTIONS.items():
            perm = next((p for p in permissions if p.action == action), None)
            if perm:
                status = "✅ YES" if perm.is_allowed else "❌ NO"
            else:
                status = "❌ NO (not set)"
            print(f"{action:<20} {label:<30} {status:<10}")

        print(f"{'='*80}\n")
    finally:
        db.close()


def grant_permission(user_id: int, action: str, admin_id: int = 1):
    """Grant a specific permission to a user."""
    if action not in ALLOWED_ACTIONS:
        print(f"❌ Invalid action: {action}")
        print(f"Valid actions: {', '.join(ALLOWED_ACTIONS.keys())}")
        return

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            print(f"❌ User {user_id} not found")
            return

        if user.role.value == "super_user":
            print(f"⚠️  User {user.email} is a super_user - they already have all permissions")
            return

        if user.role.value == "demo_user":
            print(f"⚠️  User {user.email} is a demo_user - they cannot perform conversions")
            return

        existing = (
            db.query(UserConversionPermission)
            .filter(
                UserConversionPermission.user_id == user_id,
                UserConversionPermission.action == action,
            )
            .first()
        )

        if existing:
            if existing.is_allowed:
                print(f"ℹ️  Permission already granted: {action} for {user.email}")
            else:
                existing.is_allowed = True
                existing.updated_by = admin_id
                db.commit()
                print(f"✅ Permission granted: {action} for {user.email}")
        else:
            perm = UserConversionPermission(
                user_id=user_id,
                action=action,
                is_allowed=True,
                created_by=admin_id,
                updated_by=admin_id,
            )
            db.add(perm)
            db.commit()
            print(f"✅ Permission granted: {action} for {user.email}")
    finally:
        db.close()


def revoke_permission(user_id: int, action: str, admin_id: int = 1):
    """Revoke a specific permission from a user."""
    if action not in ALLOWED_ACTIONS:
        print(f"❌ Invalid action: {action}")
        print(f"Valid actions: {', '.join(ALLOWED_ACTIONS.keys())}")
        return

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            print(f"❌ User {user_id} not found")
            return

        if user.role.value == "super_user":
            print(f"⚠️  Cannot revoke permissions from super_user: {user.email}")
            return

        existing = (
            db.query(UserConversionPermission)
            .filter(
                UserConversionPermission.user_id == user_id,
                UserConversionPermission.action == action,
            )
            .first()
        )

        if existing:
            if not existing.is_allowed:
                print(f"ℹ️  Permission already revoked: {action} for {user.email}")
            else:
                existing.is_allowed = False
                existing.updated_by = admin_id
                db.commit()
                print(f"✅ Permission revoked: {action} for {user.email}")
        else:
            perm = UserConversionPermission(
                user_id=user_id,
                action=action,
                is_allowed=False,
                created_by=admin_id,
                updated_by=admin_id,
            )
            db.add(perm)
            db.commit()
            print(f"✅ Permission revoked: {action} for {user.email}")
    finally:
        db.close()


def grant_all_permissions(user_id: int, admin_id: int = 1):
    """Grant all conversion permissions to a user."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            print(f"❌ User {user_id} not found")
            return

        if user.role.value == "super_user":
            print(f"ℹ️  User {user.email} is a super_user - they already have all permissions")
            return

        if user.role.value == "demo_user":
            print(f"⚠️  User {user.email} is a demo_user - they cannot perform conversions")
            return

        print(f"\nGranting all permissions to {user.email}...")
        for action in ALLOWED_ACTIONS.keys():
            existing = (
                db.query(UserConversionPermission)
                .filter(
                    UserConversionPermission.user_id == user_id,
                    UserConversionPermission.action == action,
                )
                .first()
            )

            if existing:
                existing.is_allowed = True
                existing.updated_by = admin_id
            else:
                perm = UserConversionPermission(
                    user_id=user_id,
                    action=action,
                    is_allowed=True,
                    created_by=admin_id,
                    updated_by=admin_id,
                )
                db.add(perm)

        db.commit()
        print(f"✅ All permissions granted to {user.email}\n")
    finally:
        db.close()


def revoke_all_permissions(user_id: int, admin_id: int = 1):
    """Revoke all conversion permissions from a user."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            print(f"❌ User {user_id} not found")
            return

        if user.role.value == "super_user":
            print(f"⚠️  Cannot revoke permissions from super_user: {user.email}")
            return

        print(f"\nRevoking all permissions from {user.email}...")
        for action in ALLOWED_ACTIONS.keys():
            existing = (
                db.query(UserConversionPermission)
                .filter(
                    UserConversionPermission.user_id == user_id,
                    UserConversionPermission.action == action,
                )
                .first()
            )

            if existing:
                existing.is_allowed = False
                existing.updated_by = admin_id
            else:
                perm = UserConversionPermission(
                    user_id=user_id,
                    action=action,
                    is_allowed=False,
                    created_by=admin_id,
                    updated_by=admin_id,
                )
                db.add(perm)

        db.commit()
        print(f"✅ All permissions revoked from {user.email}\n")
    finally:
        db.close()


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    command = sys.argv[1]

    if command == "list-users":
        list_users()
    elif command == "show":
        if len(sys.argv) < 3:
            print("Usage: python manage_permissions.py show <user_id>")
            sys.exit(1)
        show_permissions(int(sys.argv[2]))
    elif command == "grant":
        if len(sys.argv) < 4:
            print("Usage: python manage_permissions.py grant <user_id> <action>")
            sys.exit(1)
        grant_permission(int(sys.argv[2]), sys.argv[3])
    elif command == "revoke":
        if len(sys.argv) < 4:
            print("Usage: python manage_permissions.py revoke <user_id> <action>")
            sys.exit(1)
        revoke_permission(int(sys.argv[2]), sys.argv[3])
    elif command == "grant-all":
        if len(sys.argv) < 3:
            print("Usage: python manage_permissions.py grant-all <user_id>")
            sys.exit(1)
        grant_all_permissions(int(sys.argv[2]))
    elif command == "revoke-all":
        if len(sys.argv) < 3:
            print("Usage: python manage_permissions.py revoke-all <user_id>")
            sys.exit(1)
        revoke_all_permissions(int(sys.argv[2]))
    else:
        print(f"Unknown command: {command}")
        print(__doc__)
        sys.exit(1)


if __name__ == "__main__":
    main()
