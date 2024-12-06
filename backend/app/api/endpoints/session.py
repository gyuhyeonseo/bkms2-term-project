from fastapi import APIRouter, HTTPException, Path, Body, Depends
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from datetime import datetime

from app.models.models import Session, Chat, Message  # table
from app.schemas.schemas import ChatObject              # response



############################################################################
#                              Initialization                              #
############################################################################

router = APIRouter()

# Dependency: Get a DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


############################################################################
#                           /session/{sessionId}                           #
############################################################################
@router.put("/{sessionId}")
async def signin_session(
    sessionId: str = Path(..., description="Session ID"),
    db: Session = Depends(get_db)
):
    
    session = db.query(Session).filter(Session.session_id == sessionId).first()

    if session: # session 정보가 있으면 chat list를 반환
        # session 정보  - session 테이블 
        created_time = session.created_time
        
        # chat list - chat 테이블 
        chats = db.query(Chat).filter(Chat.session_id == sessionId).order_by(Chat.chat_id.desc()).all()

        chat_list = [
            ChatObject(
                chatId=chat.chat_id,
                chatTitle=chat.chat_title,
                createdTime=datetime.fromisoformat(chat.created_time),
                lastUpdatedTime=datetime.fromisoformat(chat.last_updated_time)
            )
            for chat in chats
        ]

    else: # session 정보가 없으면 session db에 추가, return은 빈 배열 []
        # session 정보 생성 / db 삽입
        created_time = datetime.now().isoformat()
        new_session = Session(
            session_id = sessionId,
            created_time = created_time
        )
        db.add(new_session)
        db.commit()

        # chatlist
        chat_list = []

    return  {
        "sessionId": sessionId,
        "createdTime": created_time,
        "chatList": chat_list
    }
        


