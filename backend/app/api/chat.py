from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Set

from app.core.database import get_db
from app.models.users import User
from app.models.chats import Message
from app.schemas.chat_schema import ChatRoomResponse, MessageResponse
from app.services.chat_service import ChatService
from app.core.security import get_current_user, verify_token_string

router = APIRouter(prefix="/chat", tags=["Private Chat"])


# ──────────────────────────────────────────────────────────────
# WebSocket Connection Manager — tracks which users are online
# per room so we can expose real presence status
# ──────────────────────────────────────────────────────────────
class ConnectionManager:
    def __init__(self):
        # room_id -> list of active WebSockets
        self.active_connections: Dict[int, List[WebSocket]] = {}
        # room_id -> set of user_ids currently connected
        self.online_users: Dict[int, Set[int]] = {}

    async def connect(self, room_id: int, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
            self.online_users[room_id] = set()
        self.active_connections[room_id].append(websocket)
        self.online_users[room_id].add(user_id)
        # Broadcast updated presence to everyone in the room
        await self.broadcast_presence(room_id)

    def disconnect(self, room_id: int, websocket: WebSocket, user_id: int):
        if room_id in self.active_connections:
            if websocket in self.active_connections[room_id]:
                self.active_connections[room_id].remove(websocket)
            self.online_users.get(room_id, set()).discard(user_id)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]
                self.online_users.pop(room_id, None)

    async def broadcast(self, room_id: int, message_data: dict):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                await connection.send_json(message_data)

    async def broadcast_presence(self, room_id: int):
        """Send a presence update to everyone in the room."""
        online = list(self.online_users.get(room_id, set()))
        await self.broadcast(room_id, {"type": "presence", "online_user_ids": online})

    def get_online_user_ids(self, room_id: int) -> List[int]:
        return list(self.online_users.get(room_id, set()))


manager = ConnectionManager()


# ──────────────────────────────────────────────────────────────
# HTTP: Get real-time online users for a room
# ──────────────────────────────────────────────────────────────
@router.get("/room/{room_id}/online", response_model=List[int])
def get_online_users(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns list of user_ids currently connected via WebSocket in this room."""
    ChatService.verify_room_access(db, room_id=room_id, user_id=current_user.id)
    return manager.get_online_user_ids(room_id)


# ──────────────────────────────────────────────────────────────
# HTTP: Initialize or fetch private chat room
# ──────────────────────────────────────────────────────────────
@router.post("/room/{target_user_id}", response_model=ChatRoomResponse)
def get_or_create_chat_room(
    target_user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ChatService.get_or_create_private_room(
        db=db,
        current_user_id=current_user.id,
        target_user_id=target_user_id,
    )


# ──────────────────────────────────────────────────────────────
# HTTP: Fetch private message history
# ──────────────────────────────────────────────────────────────
@router.get("/room/{room_id}/messages", response_model=List[MessageResponse])
def get_chat_history(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ChatService.verify_room_access(db, room_id=room_id, user_id=current_user.id)
    return (
        db.query(Message)
        .filter(Message.room_id == room_id)
        .order_by(Message.timestamp.asc())
        .all()
    )


# ──────────────────────────────────────────────────────────────
# WebSocket: Real-time 1-on-1 chat endpoint
# ──────────────────────────────────────────────────────────────
@router.websocket("/ws/{room_id}")
async def chat_websocket_endpoint(
    websocket: WebSocket,
    room_id: int,
    token: str,
    db: Session = Depends(get_db),
):
    # 1. Authenticate via JWT in URL query param
    try:
        user_email = verify_token_string(token)
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
    except Exception:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # 2. Verify room membership
    try:
        ChatService.verify_room_access(db, room_id=room_id, user_id=user.id)
    except HTTPException:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # 3. Connect — this will broadcast a presence update to both users
    await manager.connect(room_id, websocket, user.id)
    try:
        while True:
            data = await websocket.receive_text()
            saved_msg = ChatService.save_message(
                db=db, room_id=room_id, sender_id=user.id, content=data
            )
            await manager.broadcast(room_id, {
                "type": "message",
                "id": saved_msg.id,
                "room_id": room_id,
                "sender_id": user.id,
                "content": data,
                "timestamp": saved_msg.timestamp.isoformat(),
            })
    except WebSocketDisconnect:
        manager.disconnect(room_id, websocket, user.id)
        # Notify remaining participants that this user went offline
        await manager.broadcast_presence(room_id)