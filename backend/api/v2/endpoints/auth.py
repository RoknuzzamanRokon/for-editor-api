from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import case, func
from sqlalchemy.orm import Session

from core.deps import block_demo_write, get_current_user
from core.permissions import list_allowed_actions
from core.points import POINTS_COST_PER_REQUEST, get_user_balance
from core.rate_limit import enforce_login_rate_limit
from db.models import Conversion, PointsLedger, RoleEnum, User, UserConversionPermission
from db.session import get_db
from models.auth import (
    AccessTokenResponse,
    DemoRegisterRequest,
    EmailVerificationRequest,
    LoginRequest,
    MeResponse,
    ResendVerificationRequest,
    TokenPair,
    TokenRefreshRequest,
    UpdateRegistrationDataRequest,
    UserCreatorSummary,
    UserOut,
    UserPointSummary,
    VerificationPendingResponse,
)
from models.permissions import MyApiEntry
from models.settings import (
    AccountProfileUpdateRequest,
    AccountSettingsResponse,
    ChangePasswordRequest,
    ChangePasswordResponse,
    AccountPreferencesUpdateRequest,
)
from services import auth as auth_service
from services import settings as settings_service
from services import users as users_service
from services import verification as verification_service

router = APIRouter(prefix="/auth", tags=["auth"])

API_META: dict[str, dict[str, str]] = {
    "pdf_to_docs": {
        "route": "/api/v3/conversions/pdf-to-word",
        "method": "POST",
        "theme": "blue",
        "icon": "description",
        "description": "Convert PDF to Word document",
    },
    "pdf_to_excel": {
        "route": "/api/v3/conversions/pdf-to-excel",
        "method": "POST",
        "theme": "emerald",
        "icon": "table_chart",
        "description": "Convert PDF to Excel spreadsheet",
    },
    "docx_to_pdf": {
        "route": "/api/v3/conversions/docx-to-pdf",
        "method": "POST",
        "theme": "blue",
        "icon": "description",
        "description": "Convert Word to PDF",
    },
    "excel_to_pdf": {
        "route": "/api/v3/conversions/excel-to-pdf",
        "method": "POST",
        "theme": "green",
        "icon": "grid_on",
        "description": "Convert Excel to PDF",
    },
    "image_to_pdf": {
        "route": "/api/v3/conversions/image-to-pdf",
        "method": "POST",
        "theme": "amber",
        "icon": "image",
        "description": "Convert Image to PDF",
    },
    "remove_background": {
        "route": "/api/v3/conversions/remove-background",
        "method": "POST",
        "theme": "cyan",
        "icon": "auto_fix_high",
        "description": "Remove image background",
    },
    "pdf_page_remove": {
        "route": "/api/v3/conversions/remove-pages-from-pdf",
        "method": "POST",
        "theme": "slate",
        "icon": "delete_sweep",
        "description": "Remove selected pages from PDF",
    },
}

# Phase 2 forgot-password contract:
# - POST /auth/forgot-password to create a reset token and enqueue email delivery.
# - POST /auth/reset-password to validate the reset token and write the new password hash.
# - Add a reset-token persistence model with expiry/revocation support plus email integration.


@router.post(
    "/login",
    response_model=TokenPair,
    dependencies=[Depends(enforce_login_rate_limit)],
)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenPair:
    user = auth_service.authenticate_user(db, payload.email, payload.password)
    access_token, refresh_token = auth_service.create_token_pair(db, user)
    return TokenPair(
        access_token=access_token,
        refresh_token=refresh_token,
        role=user.role
    )


@router.post("/register", response_model=VerificationPendingResponse)
def register_demo_user(payload: DemoRegisterRequest, db: Session = Depends(get_db)) -> VerificationPendingResponse:
    # Check if user already exists — block before sending any email
    existing_user = users_service.get_user_by_email(db, payload.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please sign in instead."
        )

    try:
        verification_service.create_verification_session(
            db=db,
            email=payload.email,
            registration_data=payload
        )
        return VerificationPendingResponse(
            message="Verification code sent to your email",
            email=payload.email,
            expires_in_minutes=10
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create verification session: {str(e)}"
        )


@router.post("/verify-email", response_model=TokenPair)
def verify_email(payload: EmailVerificationRequest, db: Session = Depends(get_db)) -> TokenPair:
    """
    Verify email address with verification code and complete registration.
    
    This endpoint:
    1. Validates the verification code
    2. Creates the user account
    3. Returns authentication tokens
    
    Args:
        payload: Email and verification code
        db: Database session
        
    Returns:
        TokenPair: Access and refresh tokens for the newly created user
        
    Raises:
        HTTPException: If verification fails or user creation fails
    """
    # Validate verification code
    is_valid, error_message, session = verification_service.validate_verification_code(
        db=db,
        email=payload.email,
        code=payload.code.upper()  # Normalize to uppercase
    )
    
    if not is_valid:
        # Increment failed attempts if session exists
        if session:
            verification_service.increment_failed_attempts(db, session)
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_message
        )
    
    # Complete registration and create user
    try:
        user = verification_service.complete_registration(db, session)
        
        # Generate tokens for the new user
        access_token, refresh_token = auth_service.create_token_pair(db, user)
        
        return TokenPair(
            access_token=access_token,
            refresh_token=refresh_token,
            role=user.role
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete registration: {str(e)}"
        )


@router.post("/update-registration-data", response_model=dict)
def update_registration_data(
    payload: UpdateRegistrationDataRequest,
    db: Session = Depends(get_db)
) -> dict:
    from db.models import EmailVerificationSession
    from datetime import datetime

    session = db.query(EmailVerificationSession).filter(
        EmailVerificationSession.email == payload.email,
        EmailVerificationSession.is_used == False,
        EmailVerificationSession.expires_at > datetime.utcnow()
    ).order_by(EmailVerificationSession.created_at.desc()).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No pending verification session found. Please restart registration."
        )

    # Overwrite stored registration data with the real values
    data = dict(session.registration_data_json)
    data["username"] = payload.username
    data["password"] = payload.password
    data["selected_actions"] = payload.selected_actions
    session.registration_data_json = data

    db.commit()

    return {"message": "Registration data updated successfully"}


@router.post("/resend-verification", response_model=VerificationPendingResponse)
def resend_verification(payload: ResendVerificationRequest, db: Session = Depends(get_db)) -> VerificationPendingResponse:
    """
    Resend verification code to email address.
    
    This endpoint:
    1. Checks if there's a pending verification session
    2. Creates a new verification session (invalidates old one)
    3. Sends new verification email
    
    Args:
        payload: Email address to resend verification to
        db: Database session
        
    Returns:
        VerificationPendingResponse: Confirmation that code was sent
        
    Raises:
        HTTPException: If email sending fails or user already exists
    """
    # Check if user already exists
    existing_user = users_service.get_user_by_email(db, payload.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Look for existing pending session to get registration data
    from db.models import EmailVerificationSession
    from datetime import datetime
    
    existing_session = db.query(EmailVerificationSession).filter(
        EmailVerificationSession.email == payload.email,
        EmailVerificationSession.expires_at > datetime.utcnow()
    ).order_by(EmailVerificationSession.created_at.desc()).first()
    
    if not existing_session:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No pending registration found for this email"
        )
    
    # Recreate registration data from stored JSON
    registration_data = DemoRegisterRequest(**existing_session.registration_data_json)
    
    # Create new verification session (this invalidates the old one)
    try:
        session = verification_service.create_verification_session(
            db=db,
            email=payload.email,
            registration_data=registration_data
        )
        
        return VerificationPendingResponse(
            message="New verification code sent to your email",
            email=payload.email,
            expires_in_minutes=10
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to resend verification code: {str(e)}"
        )


@router.post("/refresh", response_model=AccessTokenResponse)
def refresh(payload: TokenRefreshRequest, db: Session = Depends(get_db)) -> AccessTokenResponse:
    access_token = auth_service.refresh_access_token(db, payload.refresh_token)
    return AccessTokenResponse(access_token=access_token)


@router.get("/me", response_model=MeResponse)
def me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MeResponse:
    from sqlalchemy.orm import joinedload
    
    # Eager load creator in one query
    creator = None
    if current_user.created_by_user_id is not None:
        creator_user = db.query(User).filter(User.id == current_user.created_by_user_id).first()
        if creator_user:
            creator = UserCreatorSummary(
                id=creator_user.id,
                email=creator_user.email,
                username=creator_user.username,
                role=creator_user.role,
            )

    # Get points summary
    points_summary_row = (
        db.query(
            func.sum(case((PointsLedger.status == "topup", PointsLedger.amount), else_=0)).label("total_topup"),
            func.sum(case((PointsLedger.status == "spent", -PointsLedger.amount), else_=0)).label("total_spent"),
            func.sum(case((PointsLedger.status == "refunded", PointsLedger.amount), else_=0)).label("total_refunded"),
            func.max(PointsLedger.created_at).label("last_activity_at"),
        )
        .filter(PointsLedger.user_id == current_user.id)
        .first()
    )

    action_rows = list_allowed_actions()
    
    # Get permissions
    permission_rows = (
        db.query(UserConversionPermission.action, UserConversionPermission.is_allowed)
        .filter(UserConversionPermission.user_id == current_user.id)
        .all()
    )
    permission_map = {row.action: bool(row.is_allowed) for row in permission_rows}
    if current_user.role == RoleEnum.super_user:
        permission_map = {item["action"]: True for item in action_rows}

    # Get conversion stats - only for allowed actions to reduce query size
    allowed_actions = [action for action, allowed in permission_map.items() if allowed]
    stats_map = {}
    
    if allowed_actions:
        stats_rows = (
            db.query(
                Conversion.action.label("action"),
                func.max(Conversion.updated_at).label("last_used_at"),
                func.count(Conversion.id).label("total_count"),
                func.sum(case((Conversion.status == "success", 1), else_=0)).label("success_count"),
            )
            .filter(
                Conversion.owner_user_id == current_user.id,
                Conversion.action.in_(allowed_actions)
            )
            .group_by(Conversion.action)
            .all()
        )
        stats_map = {row.action: row for row in stats_rows}

    active_apis: list[MyApiEntry] = []
    for item in action_rows:
        action = item["action"]
        if not permission_map.get(action, False):
            continue

        meta = API_META.get(action, {})
        stat = stats_map.get(action)
        total_count = int(stat.total_count) if stat and stat.total_count is not None else 0
        success_count = int(stat.success_count) if stat and stat.success_count is not None else 0
        success_rate = round((success_count / total_count) * 100, 1) if total_count else 0.0
        last_used_at = stat.last_used_at.isoformat() if stat and stat.last_used_at is not None else None

        active_apis.append(
            MyApiEntry(
                action=action,
                label=item["label"],
                route=meta.get("route", ""),
                method=meta.get("method", "POST"),
                allowed=True,
                points=POINTS_COST_PER_REQUEST,
                theme=meta.get("theme", "blue"),
                icon=meta.get("icon", "api"),
                last_used_at=last_used_at,
                success_rate=success_rate,
                description=meta.get("description", item["label"]),
            )
        )

    settings = settings_service.build_account_settings_response(db, current_user)

    return MeResponse(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        demo_expires_at=current_user.demo_expires_at,
        last_login=current_user.last_login,
        created_by=creator,
        points=UserPointSummary(
            balance=get_user_balance(db, current_user.id),
            total_topup=int(points_summary_row.total_topup or 0),
            total_spent=int(points_summary_row.total_spent or 0),
            total_refunded=int(points_summary_row.total_refunded or 0),
            last_activity_at=points_summary_row.last_activity_at,
        ),
        active_api_count=len(active_apis),
        active_apis=active_apis,
        preferences=settings.preferences,
    )


@router.get("/settings", response_model=AccountSettingsResponse)
def get_account_settings(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> AccountSettingsResponse:
    return settings_service.build_account_settings_response(db, current_user)


@router.patch(
    "/settings/profile",
    response_model=AccountSettingsResponse,
    dependencies=[Depends(block_demo_write)],
)
def update_account_profile(
    payload: AccountProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> AccountSettingsResponse:
    settings_service.update_username(db, current_user, payload.username)
    return settings_service.build_account_settings_response(db, current_user)


@router.patch(
    "/settings/preferences",
    response_model=AccountSettingsResponse,
    dependencies=[Depends(block_demo_write)],
)
def update_account_preferences(
    payload: AccountPreferencesUpdateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> AccountSettingsResponse:
    settings_service.update_preferences(db, current_user, payload)
    return settings_service.build_account_settings_response(db, current_user)


@router.post(
    "/settings/change-password",
    response_model=ChangePasswordResponse,
    dependencies=[Depends(block_demo_write)],
)
def change_account_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> ChangePasswordResponse:
    settings_service.change_password(db, current_user, payload.current_password, payload.new_password)
    return ChangePasswordResponse(message="Password updated successfully")
