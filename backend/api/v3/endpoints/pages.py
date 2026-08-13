"""Per-user page (navigation) access control.

Companion to ``permissions.py``: that router governs which conversion APIs a
user may call, this one governs which pages they may open.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.deps import ensure_can_manage_user, get_current_user, require_role
from core.pages import (
    PAGE_REGISTRY,
    is_locked,
    list_pages,
    resolve_page_access,
    validate_page,
)
from db.models import RoleEnum, User, UserPagePermission
from db.session import get_db
from models.pages import (
    PageAccessEntry,
    PageAccessListResponse,
    PageDefinition,
    PagePatchRequest,
    PageUpdateRequest,
)
from services.users import get_user_by_id

router = APIRouter(prefix="/pages", tags=["pages"])


def _load_target(db: Session, current_user: User, user_id: int) -> User:
    target_user = get_user_by_id(db, user_id)
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    ensure_can_manage_user(current_user, target_user)
    return target_user


def _ensure_page_in_scope(target_user: User, page_key: str) -> None:
    """Reject pages the target's role could never reach, and locked pages."""
    validate_page(page_key)

    if target_user.role not in PAGE_REGISTRY[page_key]["roles"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Page '{page_key}' does not apply to role {target_user.role.value}",
        )

    if is_locked(page_key):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Page '{page_key}' is always available and cannot be changed",
        )


def _build_response(db: Session, target_user: User) -> PageAccessListResponse:
    access = resolve_page_access(db, target_user)
    return PageAccessListResponse(
        user_id=target_user.id,
        role=target_user.role.value,
        pages=[
            PageAccessEntry(**page, allowed=access.get(page["page_key"], True))
            for page in list_pages(target_user.role)
        ],
    )


@router.get("/registry", response_model=list[PageDefinition])
def get_page_registry(
    current_user: User = Depends(require_role(RoleEnum.super_user, RoleEnum.admin_user)),
) -> list[PageDefinition]:
    return [PageDefinition(**page) for page in list_pages()]


@router.get("/my-pages", response_model=PageAccessListResponse)
def get_my_pages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PageAccessListResponse:
    """Drives sidebar filtering and the client-side route guard."""
    return _build_response(db, current_user)


@router.get("/users/{user_id}/pages", response_model=PageAccessListResponse)
def get_user_pages(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleEnum.super_user, RoleEnum.admin_user)),
) -> PageAccessListResponse:
    return _build_response(db, _load_target(db, current_user, user_id))


@router.put("/users/{user_id}/pages", response_model=PageAccessListResponse)
def upsert_user_pages(
    user_id: int,
    payload: PageUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleEnum.super_user, RoleEnum.admin_user)),
) -> PageAccessListResponse:
    target_user = _load_target(db, current_user, user_id)

    for item in payload.pages:
        _ensure_page_in_scope(target_user, item.page_key)
        _write_page(db, user_id, item.page_key, item.is_allowed, current_user.id)

    db.commit()
    return _build_response(db, target_user)


@router.patch("/users/{user_id}/pages/{page_key}", response_model=PageAccessListResponse)
def set_user_page(
    user_id: int,
    page_key: str,
    payload: PagePatchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleEnum.super_user, RoleEnum.admin_user)),
) -> PageAccessListResponse:
    target_user = _load_target(db, current_user, user_id)
    _ensure_page_in_scope(target_user, page_key)

    _write_page(db, user_id, page_key, payload.is_allowed, current_user.id)
    db.commit()
    return _build_response(db, target_user)


def _write_page(db: Session, user_id: int, page_key: str, is_allowed: bool, actor_id: int) -> None:
    existing = (
        db.query(UserPagePermission)
        .filter(
            UserPagePermission.user_id == user_id,
            UserPagePermission.page_key == page_key,
        )
        .first()
    )
    if existing:
        existing.is_allowed = is_allowed
        existing.updated_by = actor_id
    else:
        db.add(
            UserPagePermission(
                user_id=user_id,
                page_key=page_key,
                is_allowed=is_allowed,
                created_by=actor_id,
                updated_by=actor_id,
            )
        )
