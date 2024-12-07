from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import session
from app.api.endpoints.chat import create_chat, delete_chat, get_chat
from app.core.database import Base, engine

# 데이터베이스 테이블 생성
Base.metadata.create_all(bind=engine)

# FastAPI 앱 초기화
app = FastAPI(
    title="Chat Application API",
    description="API for a chat-based inquiry system",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 도메인 허용 (프로덕션에서는 특정 도메인만 허용)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 추가
app.include_router(session.router, prefix="/session", tags=["Session"])
app.include_router(create_chat.router, prefix="/session/{sessionId}/chats", tags=["Chat"])
app.include_router(delete_chat.router, prefix="/session/{sessionId}/chats", tags=["Chat"])
app.include_router(get_chat.router, prefix="/session/{sessionId}/chats", tags=["Chat"])
