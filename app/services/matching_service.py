from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.users import User
from app.models.profiles import Profile
from app.models.preference import Preference
from app.schemas.match_schema import (
    MatchedUserProfileResponse,
    PreferenceCreate,
    PreferenceUpdate,
)


class MatchingService:

    @staticmethod
    def calculate_one_way_score(profile: Profile, pref: Preference) -> float:
        if not profile or not pref:
            return 0.0

        score = 0.0

        # Religion Match (35 Points)
        if pref.preferred_religions and profile.religion in pref.preferred_religions:
            score += 35.0

        # Education Match (30 Points)
        if pref.preferred_education and profile.education in pref.preferred_education:
            score += 30.0

        # Occupation Match (20 Points)
        if pref.preferred_occupations and profile.occupation in pref.preferred_occupations:
            score += 20.0

        # Location Match (15 Points)
        if pref.preferred_cities and profile.address in pref.preferred_cities:
            score += 15.0

        return score

    @staticmethod
    def calculate_reciprocal_score(user_a: User, user_b: User) -> float:
        score_a_to_b = MatchingService.calculate_one_way_score(
            user_b.profile, user_a.preference
        )
        score_b_to_a = MatchingService.calculate_one_way_score(
            user_a.profile, user_b.preference
        )

        # Geometric Mean
        return (score_a_to_b * score_b_to_a) ** 0.5

    @staticmethod
    def find_matches_for_user(db: Session, current_user_id: int, limit: int = 20):
        current_user = db.query(User).filter(User.id == current_user_id).first()
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_444_NOT_FOUND if hasattr(status, 'HTTP_444_NOT_FOUND') else status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        if not current_user.preference:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please set your match preferences before requesting matches"
            )

        user_pref = current_user.preference

        # Step 1: Query potential candidates excluding current user
        candidates = db.query(User).filter(User.id != current_user_id).all()

        # Step 2: Score candidates behind the scenes
        ranked_candidates = []
        for candidate in candidates:
            if not candidate.profile:
                continue

            # Hard age checks
            if user_pref.min_age and candidate.age < user_pref.min_age:
                continue
            if user_pref.max_age and candidate.age > user_pref.max_age:
                continue

            # Hard gender check
            if user_pref.gender_preference and candidate.gender != user_pref.gender_preference:
                continue

            reciprocal_score = MatchingService.calculate_reciprocal_score(
                current_user, candidate
            )
            ranked_candidates.append((candidate, reciprocal_score))

        # Step 3: Sort by compatibility score
        ranked_candidates.sort(key=lambda item: item[1], reverse=True)

        # Step 4: Map sorted results directly into MatchedUserProfileResponse schemas
        matched_profiles = []
        for candidate, _ in ranked_candidates[:limit]:
            profile = candidate.profile
            matched_profiles.append(
                MatchedUserProfileResponse(
                    user_id=candidate.id,
                    email=candidate.email,
                    age=candidate.age,
                    gender=candidate.gender,
                    bio=profile.bio if profile else None,
                    religion=profile.religion if profile else None,
                    education=profile.education if profile else None,
                    address=profile.address if profile else None,
                    income=profile.income if profile else None,
                    occupation=profile.occupation if profile else None,
                )
            )

        return matched_profiles

    @staticmethod
    def get_user_preferences(db: Session, user_id: int):
        preference = db.query(Preference).filter(Preference.user_id == user_id).first()
        if not preference:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Preferences not found for this user"
            )
        return preference

    @staticmethod
    def create_user_preferences(db: Session, user_id: int, preference_data: PreferenceCreate):
        existing_pref = db.query(Preference).filter(Preference.user_id == user_id).first()
        if existing_pref:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Preference profile already exists for this user"
            )

        new_preference = Preference(
            user_id=user_id,
            min_age=preference_data.min_age,
            max_age=preference_data.max_age,
            gender_preference=preference_data.gender_preference,
            preferred_religions=preference_data.preferred_religions,
            preferred_education=preference_data.preferred_education,
            preferred_occupations=preference_data.preferred_occupations,
            preferred_cities=preference_data.preferred_cities,
            min_income=preference_data.min_income
        )

        db.add(new_preference)
        db.commit()
        db.refresh(new_preference)

        return new_preference

    @staticmethod
    def update_user_preferences(db: Session, user_id: int, preference_data: PreferenceUpdate):
        preference = db.query(Preference).filter(Preference.user_id == user_id).first()
        if not preference:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Preferences not found"
            )

        update_dict = preference_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(preference, key, value)

        db.commit()
        db.refresh(preference)

        return preference