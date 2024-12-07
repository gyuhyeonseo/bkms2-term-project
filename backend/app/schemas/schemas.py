from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ChatObject(BaseModel):
    chatId: str
    chatTitle: str
    createdTime: datetime
    lastUpdatedTime: datetime

class MessageObject(BaseModel):
    sessionId: str
    chatId: str
    chatTitle: str #sidebar preview
    messageId: str
    messageTitle: str # user query
    messageContent: str # assistant answer
    sources: Optional[List[dict]]
    createdTime: datetime

class SourceObject(BaseModel):
    url: str
    file: str

class ErrorResponse(BaseModel):
    error: str
