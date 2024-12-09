from fastapi import APIRouter, HTTPException, Path, Body, Depends
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.core.database import SessionLocal
import app.api.endpoints.chat.llm as llm
from datetime import datetime

from app.models.models import Session, Chat, Message                   # table
from app.schemas.schemas import MessageObject, ChatObject, ErrorResponse # response
from app.api.endpoints.chat import llm, utils

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
#                      /session/{sessionId}/chats                          #
############################################################################

# 1. Create a new chat and send a query (no chat history)
@router.post("/", response_model=MessageObject)
async def create_chat(
    sessionId: str = Path(..., description="Session ID"),
    query: str = Body(..., description="User's Query"),
    db: Session = Depends(get_db)
):
    
    chat_id = utils.generate_chat_id(sessionId, db) #{session_id}-{ascending number}
    curr_time = datetime.now().isoformat()
    message_id = utils.generate_message_id(sessionId, chat_id, db) #{session_id}-{chat_id}-{ascending number} 형식
    message_content, chat_title, link_list, byte_file_list = llm.call_openai(query, True) 
    message_content = utils.clean_markdown_text(message_content)
    
    # 트랜잭션 처리
    try:
        new_chat = Chat (
            session_id = sessionId,
            chat_id = chat_id,
            chat_title = chat_title, # openai 응답 받은후에 정해짐. 
            created_time = curr_time,
            last_updated_time = curr_time
        )
        db.add(new_chat)

        new_user_message = Message(
            session_id=sessionId,
            chat_id=chat_id,
            chat_title=chat_title,
            message_id=message_id, 
            message_title=query, 
            message_content=message_content,
            message_links=link_list,  # Link list 추가
            message_files=byte_file_list  # Byte file list 추가
        )
        db.add(new_user_message)

        db.commit()

        # 성공한 경우 반환
        return {
            "sessionId": sessionId,
            "chatId": chat_id,
            "chatTitle": chat_title,
            "messageId": message_id,
            "messageTitle": query,
            "messageContent": message_content,
            "messageLinks": link_list,
            "messageFiles": byte_file_list,
            "createdTime": curr_time
        }

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

# 2. Submit a follow-up query to an existing chat
@router.post("/{chatId}", response_model=MessageObject)
async def submit_followup_query(
    sessionId: str = Path(..., description="Session ID"),
    chatId: str = Path(..., description="Chat ID"),
    query: str = Body(..., description="The user's follow-up query."),
    db: Session = Depends(get_db)
):
    # Verify chat exists
    chat = db.query(Chat).filter(Chat.chat_id == chatId, Chat.session_id == sessionId).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found.")

    curr_time = datetime.now().isoformat()
    chat_title = chat.chat_title
    message_id = utils.generate_message_id(sessionId, chatId, db) #{session_id}-{chat_id}-{ascending number} 형식
    message_content, _ , link_list, byte_file_list= llm.call_openai(query, False) 
    message_content = utils.clean_markdown_text(message_content)
    

    try:
        new_user_message = Message(
            session_id=sessionId,
            chat_id=chatId,
            chat_title=chat_title,
            message_id=message_id, 
            message_title=query,
            message_content=message_content,
            message_links=link_list,  # Link list 추가
            message_files=byte_file_list  # Byte file list 추가
        )
        db.add(new_user_message)

        # 성공한 경우 message 반환
        return {
            "sessionId": sessionId,
            "chatId": chatId,
            "chatTitle": chat_title,
            "messageId": message_id,
            "messageTitle": query,
            "messageContent": message_content,
            "messageLinks": link_list,
            "messageFiles": byte_file_list,
            "createdTime": curr_time
        }

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

