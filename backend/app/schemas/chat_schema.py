from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000, description="Chat message body")

class MessageResponse(BaseModel):
    id: int
    room_id: int
    sender_id: int
    content: str
    timestamp: datetime

    class Config:
        from_attributes = True

class ChatRoomResponse(BaseModel):
    id: int
    user1_id: int
    user2_id: int
    match_score: float
    created_at: datetime

    class Config:
        from_attributes = True