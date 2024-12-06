from sqlalchemy import Column, String, Text
from app.core.database import Base


class Session(Base):
    __tablename__ = "session"
    session_id = Column(String, primary_key=True, index=True)
    created_time = Column(String, nullable=False) # 필요시 DateTime으로 변경


class Chat(Base):
    __tablename__ = "chat"
    session_id = Column(String, nullable=False)
    chat_id = Column(String, primary_key=True)
    chat_title = Column(String, nullable=False)
    created_time = Column(String, nullable=False) 
    last_updated_time = Column(String, nullable=False)


class Message(Base):
    __tablename__ = "message"
    session_id = Column(String, nullable=False)
    chat_id = Column(String, nullable=False)
    chat_title = Column(String, nullable=False)
    message_id = Column(String, primary_key =True)
    sender_type = Column(String, nullable=False)
    # created_time = Column(DateTime, nullable=False) # 필요할지 확인
    message_content = Column(Text, nullable=False)
    message_source = Column(Text)

