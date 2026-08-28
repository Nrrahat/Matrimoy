from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.users import User
from app.schemas.match_schema import (
    MatchedUserProfileResponse,
    PreferenceCreate,
    PreferenceUpdate,
    PreferenceResponse,
)
from app.services.matching_service import MatchingService


router = APIRouter(prefix="/matches", tags=["Matches"])


@router.get(
    "/recommendations",
    response_model=List[MatchedUserProfileResponse],
    status_code=status.HTTP_200_OK
)
def get_match_recommendations(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    recommendations = MatchingService.find_matches_for_user(
        db=db,
        current_user_id=current_user.id,
        limit=limit
    )
    return recommendations


@router.get(
    "/preferences",
    response_model=PreferenceResponse,
    status_code=status.HTTP_200_OK
)
def get_user_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    preference = MatchingService.get_user_preferences(
        db=db,
        user_id=current_user.id
    )
    return preference


@router.post(
    "/preferences",
    response_model=PreferenceResponse,
    status_code=status.HTTP_201_CREATED
)
def create_user_preferences(
    preference_data: PreferenceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_preference = MatchingService.create_user_preferences(
        db=db,
        user_id=current_user.id,
        preference_data=preference_data
    )
    return new_preference


@router.patch(
    "/preferences",
    response_model=PreferenceResponse,
    status_code=status.HTTP_200_OK
)
def update_user_preferences(
    preference_data: PreferenceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    updated_preference = MatchingService.update_user_preferences(
        db=db,
        user_id=current_user.id,
        preference_data=preference_data
    )
    return updated_preference