from fastapi import APIRouter, HTTPException, Path, Depends
from sqlalchemy import and_
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.models import Chat, Message
from app.api.endpoints.chat import utils


############################################################################
#                              Initialization                              #
############################################################################

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

############################################################################
#                      /session/{sessionId}/chats                          #
############################################################################
# 1. Delete all chats
@router.delete("/", response_model=dict)
async def delete_all_chats(
    sessionId: str = Path(..., description="Session ID"),
    db: Session = Depends(get_db)
):
    try:
        # session에 해당하는 chat tuple과 message tuple을 한번에 지우기
        session = db.query(Chat).filter(Chat.session_id == sessionId).first()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found.")
        
        # Delete all chats
        db.query(Message).filter(Message.session_id == sessionId).delete()
        db.query(Chat).filter(Chat.session_id == sessionId).delete()
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred while deleting chats: {str(e)}")

    return {"message": "All chats and messages deleted successfully."}

# 2. Delete specific chat
@router.delete("/{chatId}", response_model=dict)
async def delete_chat(
    sessionId: str = Path(..., description="Session ID"),
    chatId: str = Path(..., description="Chat ID"),
    db: Session = Depends(get_db)
):
    try:
        # Verify chat exists
        chat = db.query(Chat).filter(and_(Chat.chat_id == chatId, Chat.session_id == sessionId)).first()
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found.")

        # Delete chat
        db.query(Message).filter(Message.chat_id == chatId).delete()
        db.delete(chat)
        db.commit()

        return {"message": "Chat {chatId} deleted successfully."}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred while deleting chat: {str(e)}")
