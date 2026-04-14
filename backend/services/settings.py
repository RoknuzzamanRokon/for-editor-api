from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from core.security import get_password_hash, verify_password
from db.models import User, UserPreference
from models.settings import (
    AccountPreferences,
    AccountPreferencesUpdateRequest,
    AccountSettingsResponse,
    VALID_AVATARS,
    VALID_THEMES,
)


def _normalize_preference_values(db: Session, preference: UserPreference) -> UserPreference:
    changed = False

    if preference.theme not in VALID_THEMES:
        preference.theme = "light"
        changed = True

    if preference.avatar_key not in VALID_AVATARS:
        preference.avatar_key = "avatar_1"
        changed = True

    if changed:
        db.commit()
        db.refresh(preference)

    return preference


def get_or_create_user_preferences(db: Session, user: User) -> UserPreference:
    preference = (
        db.query(UserPreference)
        .filter(UserPreference.user_id == user.id)
        .first()
    )
    if preference:
        return _normalize_preference_values(db, preference)

    preference = UserPreference(user_id=user.id)
    db.add(preference)
    db.commit()
    db.refresh(preference)
    return _normalize_preference_values(db, preference)


def build_account_settings_response(db: Session, user: User) -> AccountSettingsResponse:
    preference = _normalize_preference_values(db, get_or_create_user_preferences(db, user))
    return AccountSettingsResponse(
        identity=user,
        preferences=AccountPreferences(
            theme=preference.theme,
            avatar_key=preference.avatar_key,
            security_alerts_enabled=preference.security_alerts_enabled,
            login_notifications_enabled=preference.login_notifications_enabled,
            profile_private=preference.profile_private,
        ),
    )


def update_username(db: Session, user: User, username: str | None) -> User:
    normalized = username.strip() if username else None
    if normalized == "":
        normalized = None

    if normalized is not None and len(normalized) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username must be at least 3 characters long",
        )

    existing = None
    if normalized:
        existing = db.query(User).filter(User.username == normalized, User.id != user.id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken")

    user.username = normalized
    db.commit()
    db.refresh(user)
    return user


def update_preferences(
    db: Session,
    user: User,
    payload: AccountPreferencesUpdateRequest,
) -> UserPreference:
    preference = _normalize_preference_values(db, get_or_create_user_preferences(db, user))

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(preference, field, value)

    db.commit()
    db.refresh(preference)
    return _normalize_preference_values(db, preference)


def change_password(db: Session, user: User, current_password: str, new_password: str) -> None:
    if not verify_password(current_password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")

    if current_password == new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from current password",
        )

    user.hashed_password = get_password_hash(new_password)
    db.commit()
