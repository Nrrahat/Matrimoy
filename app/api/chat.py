from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict

from app.core.database import get_db
from app.models.users import User
from app.models.chats import Message
from app.schemas.chat_schema import ChatRoomResponse, MessageResponse
from app.services.chat_service import ChatService
from app.core.security import get_current_user, verify_token_string  # Adjust imports based on your security module

router = APIRouter(prefix="/chat", tags=["Private Chat"])

# WebSocket Connection Manager scoped per room
class ConnectionManager:
    def __init__(self):
        # Maps room_id -> list of active WebSockets
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, room_id: int, websocket: WebSocket):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)

    def disconnect(self, room_id: int, websocket: WebSocket):
        if room_id in self.active_connections:
            if websocket in self.active_connections[room_id]:
                self.active_connections[room_id].remove(websocket)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    async def broadcast(self, room_id: int, message_data: dict):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                await connection.send_json(message_data)

manager = ConnectionManager()


# HTTP: Initialize or fetch private chat room
@router.post("/room/{target_user_id}", response_model=ChatRoomResponse)
def get_or_create_chat_room(
    target_user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ChatService.get_or_create_private_room(
        db=db,
        current_user_id=current_user.id,
        target_user_id=target_user_id
    )


# HTTP: Fetch private message history
@router.get("/room/{room_id}/messages", response_model=List[MessageResponse])
def get_chat_history(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ChatService.verify_room_access(db, room_id=room_id, user_id=current_user.id)
    return (
        db.query(Message)
        .filter(Message.room_id == room_id)
        .order_by(Message.timestamp.asc())
        .all()
    )


# WebSocket: Real-time 1-on-1 chat endpoint
@router.websocket("/ws/{room_id}")
async def chat_websocket_endpoint(
    websocket: WebSocket,
    room_id: int,
    token: str,
    db: Session = Depends(get_db)
):
    # 1. Authenticate user via JWT token string passed in URL
    try:
        user_email = verify_token_string(token)
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
    except Exception:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # 2. Verify user permission for room
    try:
        ChatService.verify_room_access(db, room_id=room_id, user_id=user.id)
    except HTTPException:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # 3. Handle live communication
    await manager.connect(room_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            saved_msg = ChatService.save_message(
                db=db, room_id=room_id, sender_id=user.id, content=data
            )
            await manager.broadcast(room_id, {
                "id": saved_msg.id,
                "room_id": room_id,
                "sender_id": user.id,
                "content": data,
                "timestamp": saved_msg.timestamp.isoformat()
            })
    except WebSocketDisconnect:
        manager.disconnect(room_id, websocket)