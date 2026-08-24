from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List


# ==========================================
# 1. MATCHED USER PROFILE RESPONSE SCHEMA
# ==========================================

class MatchedUserProfileResponse(BaseModel):
    """Schema representing the candidate profile sent directly to the client."""
    user_id: int
    email: str
    
    # Personal & Profile Details
    bio: Optional[str] = None
    religion: Optional[str] = None
    education: Optional[str] = None
    address: Optional[str] = None
    income: Optional[str] = None
    occupation: Optional[str] = None
    
    # Additional Profile Fields
    age: Optional[int] = None
    gender: Optional[str] = None
    city: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 2. PREFERENCE SCHEMAS (INPUT / OUTPUT)
# ==========================================

class PreferenceBase(BaseModel):
    """Base preference schema containing all shared fields and validations."""
    min_age: Optional[int] = Field(None, ge=18, le=100)
    max_age: Optional[int] = Field(None, ge=18, le=100)
    gender_preference: Optional[str] = None
    preferred_religions: Optional[List[str]] = None
    preferred_education: Optional[List[str]] = None
    preferred_occupations: Optional[List[str]] = None
    preferred_cities: Optional[List[str]] = None
    min_income: Optional[int] = None


class PreferenceCreate(PreferenceBase):
    """Schema used when creating preferences for the first time.
    Provide default values for arrays if none are passed.
    """
    preferred_religions: Optional[List[str]] = Field(default_factory=list)
    preferred_education: Optional[List[str]] = Field(default_factory=list)
    preferred_occupations: Optional[List[str]] = Field(default_factory=list)
    preferred_cities: Optional[List[str]] = Field(default_factory=list)


class PreferenceUpdate(BaseModel):
    """Schema used for PATCH/PUT updates.
    Allows partial updates where the user can send only the fields they want to change.
    """
    min_age: Optional[int] = Field(None, ge=18, le=100)
    max_age: Optional[int] = Field(None, ge=18, le=100)
    gender_preference: Optional[str] = None
    preferred_religions: Optional[List[str]] = None
    preferred_education: Optional[List[str]] = None
    preferred_occupations: Optional[List[str]] = None
    preferred_cities: Optional[List[str]] = None
    min_income: Optional[int] = None


class PreferenceResponse(PreferenceBase):
    """Schema used when returning user preferences back from the API."""
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)