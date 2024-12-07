from fastapi import APIRouter, HTTPException, Path, Depends
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.models import Chat, Message

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/{chatId}", response_model=dict)
async def get_chat_history(
    sessionId: str = Path(..., description="Session ID"),
    chatId: str = Path(..., description="Chat ID"),
    db: Session = Depends(get_db)
):
    # Verify chat exists
    chat = db.query(Chat).filter(Chat.chat_id == chatId, Chat.session_id == sessionId).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found.")

    # Fetch chat history
    messages = db.query(Message).filter(Message.chat_id == chatId, Message.session_id == sessionId).all()
    if not messages:
        raise HTTPException(status_code=404, detail="No messages found for the given chat.")

    message_history = [
        {
            "sessionId": msg.session_id,
            "chatId": msg.chat_id,
            "chatTitle": msg.chat_title,
            "messageId": msg.message_id,
            "messageTitle":msg.message_title, # user query
            "messageContent": msg.message_content, # assistant answer
            "sources": msg.message_source
        }
        for msg in messages
    ]
    return {"messageHistory": message_history}
