"""Page-level access control.

Mirrors ``core.permissions`` (which governs conversion API actions), but for
front-end pages/navigation entries.

Two rules differ deliberately from conversion permissions:

* **Default allow.** A user with no stored row for a page can still see it.
  Conversion actions default to denied, but pages did not exist before this
  feature, so defaulting to denied would lock every existing user out of the
  whole app on deploy. A row is written only when an admin toggles a page.
* **Locked pages.** Landing pages (and the admin screen that manages these
  permissions) cannot be revoked, so nobody can strand a user on a redirect
  loop or lock themselves out of the control that would undo it.
"""
from __future__ import annotations

from typing import Dict, List, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from db.models import RoleEnum, User, UserPagePermission


DASHBOARD_ROLES = frozenset({RoleEnum.general_user, RoleEnum.demo_user})
ADMIN_ROLES = frozenset({RoleEnum.super_user, RoleEnum.admin_user})


PAGE_REGISTRY: Dict[str, dict] = {
    # --- End-user workspace -------------------------------------------------
    "dashboard_home": {
        "label": "Dashboard",
        "path": "/user/dashboard",
        "area": "dashboard",
        "icon": "dashboard",
        "roles": DASHBOARD_ROLES,
        "locked": True,
        "description": "Workspace landing page",
    },
    "dashboard_app_center": {
        "label": "App Center",
        "path": "/user/app-center",
        "area": "dashboard",
        "icon": "apps",
        "roles": DASHBOARD_ROLES,
        "locked": False,
        "description": "Browse and run conversion tools",
    },
    "dashboard_profile": {
        "label": "Profile",
        "path": "/user/profile",
        "area": "dashboard",
        "icon": "person",
        "roles": DASHBOARD_ROLES,
        "locked": False,
        "description": "Personal account details",
    },
    "dashboard_points": {
        "label": "Points",
        "path": "/user/points",
        "area": "dashboard",
        "icon": "toll",
        "roles": DASHBOARD_ROLES,
        "locked": False,
        "description": "Points balance and history",
    },
    "dashboard_billing": {
        "label": "Billing",
        "path": "/user/billing",
        "area": "dashboard",
        "icon": "credit_card",
        "roles": DASHBOARD_ROLES,
        "locked": False,
        "description": "Plans and invoices",
    },
    "dashboard_notifications": {
        "label": "Notifications",
        "path": "/user/notifications",
        "area": "dashboard",
        "icon": "notifications",
        "roles": DASHBOARD_ROLES,
        "locked": False,
        "description": "Messages from your administrator",
    },
    "dashboard_settings": {
        "label": "Settings",
        "path": "/user/settings",
        "area": "dashboard",
        "icon": "settings",
        "roles": DASHBOARD_ROLES,
        "locked": False,
        "description": "Workspace preferences",
    },
    # --- Admin workspace ----------------------------------------------------
    "admin_home": {
        "label": "Dashboard",
        "path": "/admin/dashboard",
        "area": "admin",
        "icon": "dashboard",
        "roles": ADMIN_ROLES,
        "locked": True,
        "description": "Admin landing page",
    },
    "admin_profile": {
        "label": "Profile",
        "path": "/admin/profile",
        "area": "admin",
        "icon": "manage_accounts",
        "roles": ADMIN_ROLES,
        "locked": False,
        "description": "Admin account details",
    },
    "admin_app_center": {
        "label": "App Center",
        "path": "/admin/app-center",
        "area": "admin",
        "icon": "apps",
        "roles": ADMIN_ROLES,
        "locked": False,
        "description": "Manage published conversion tools",
    },
    "admin_billing": {
        "label": "Billing",
        "path": "/admin/billing",
        "area": "admin",
        "icon": "credit_card",
        "roles": ADMIN_ROLES,
        "locked": False,
        "description": "Billing administration",
    },
    "admin_users": {
        "label": "Users",
        "path": "/admin/users",
        "area": "admin",
        "icon": "group",
        "roles": ADMIN_ROLES,
        "locked": False,
        "description": "Create and manage user accounts",
    },
    "admin_points": {
        "label": "Points",
        "path": "/admin/point",
        "area": "admin",
        "icon": "toll",
        "roles": ADMIN_ROLES,
        "locked": False,
        "description": "Grant points and review top-up requests",
    },
    "admin_notifications": {
        "label": "Notifications",
        "path": "/admin/notifications",
        "area": "admin",
        "icon": "notifications",
        "roles": ADMIN_ROLES,
        "locked": False,
        "description": "Send and review notifications",
    },
    "admin_api_permissions": {
        "label": "API Permissions",
        "path": "/admin/api-permissions",
        "area": "admin",
        "icon": "vpn_key",
        "roles": ADMIN_ROLES,
        "locked": True,
        "description": "Role, page, and API access control",
    },
    "admin_settings": {
        "label": "Settings",
        "path": "/admin/settings",
        "area": "admin",
        "icon": "settings",
        "roles": ADMIN_ROLES,
        "locked": False,
        "description": "Admin preferences",
    },
}


class PageNotPermittedError(Exception):
    def __init__(self, page_key: str) -> None:
        self.page_key = page_key


def _serialize(page_key: str, definition: dict) -> dict:
    return {
        "page_key": page_key,
        "label": definition["label"],
        "path": definition["path"],
        "area": definition["area"],
        "icon": definition["icon"],
        "locked": bool(definition["locked"]),
        "description": definition["description"],
    }


def list_pages(role: Optional[RoleEnum] = None) -> List[dict]:
    """Every page in the registry, optionally narrowed to one role's areas."""
    return [
        _serialize(page_key, definition)
        for page_key, definition in PAGE_REGISTRY.items()
        if role is None or role in definition["roles"]
    ]


def validate_page(page_key: str) -> None:
    if page_key not in PAGE_REGISTRY:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid page")


def is_locked(page_key: str) -> bool:
    definition = PAGE_REGISTRY.get(page_key)
    return bool(definition and definition["locked"])


def stored_page_map(db: Session, user_id: int) -> Dict[str, bool]:
    """Explicit rows only — absent keys mean 'never toggled', not 'denied'."""
    rows = (
        db.query(UserPagePermission.page_key, UserPagePermission.is_allowed)
        .filter(UserPagePermission.user_id == user_id)
        .all()
    )
    return {row.page_key: bool(row.is_allowed) for row in rows}


def resolve_page_access(db: Session, user: User) -> Dict[str, bool]:
    """Effective allow/deny for every page this user's role can reach."""
    pages = list_pages(user.role)

    if user.role == RoleEnum.super_user:
        return {page["page_key"]: True for page in pages}

    stored = stored_page_map(db, user.id)
    return {
        page["page_key"]: True if page["locked"] else stored.get(page["page_key"], True)
        for page in pages
    }


def ensure_page_allowed(db: Session, user: User, page_key: str) -> None:
    validate_page(page_key)
    access = resolve_page_access(db, user)
    if not access.get(page_key, False):
        raise PageNotPermittedError(page_key)
