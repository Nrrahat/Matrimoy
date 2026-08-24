from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.chats import ChatRoom, Message
from app.services.matching_service import MatchService  # Assumes MatchService exists

class ChatService:
    @staticmethod
    def get_or_create_private_room(db: Session, current_user_id: int, target_user_id: int) -> ChatRoom:
        if current_user_id == target_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot initiate a chat room with yourself."
            )

        # 1. Look for existing room pairing between these two specific users
        room = db.query(ChatRoom).filter(
            ((ChatRoom.user1_id == current_user_id) & (ChatRoom.user2_id == target_user_id)) |
            ((ChatRoom.user1_id == target_user_id) & (ChatRoom.user2_id == current_user_id))
        ).first()

        if room:
            return room

        # 2. Check 60% match threshold if room does not exist yet
        match_score = MatchService.calculate_match_percentage(db, current_user_id, target_user_id)
        if match_score < 60.0:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Messaging locked. Match score is {match_score:.1f}%, but at least 60.0% is required."
            )

        # 3. Create room if verified
        new_room = ChatRoom(
            user1_id=current_user_id,
            user2_id=target_user_id,
            match_score=match_score
        )
        db.add(new_room)
        db.commit()
        db.refresh(new_room)
        return new_room

    @staticmethod
    def verify_room_access(db: Session, room_id: int, user_id: int) -> ChatRoom:
        """Ensures that the requesting user is either user1 or user2 in the requested room."""
        room = db.query(ChatRoom).filter(ChatRoom.id == room_id).first()
        if not room:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat room not found")
        
        if room.user1_id != user_id and room.user2_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. You are not a participant in this conversation."
            )
        return room

    @staticmethod
    def save_message(db: Session, room_id: int, sender_id: int, content: str) -> Message:
        msg = Message(room_id=room_id, sender_id=sender_id, content=content)
        db.add(msg)
        db.commit()
        db.refresh(msg)
        return msg