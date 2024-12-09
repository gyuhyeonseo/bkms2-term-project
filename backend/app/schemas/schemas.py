from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class FileObject(BaseModel):
    file: str  # Base64 encoded string
    filename: Optional[str] = None  # Optional description of the file


class LinkObject(BaseModel):
    link: str  # A URL link

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
    messageFiles: Optional[List[FileObject]]# List of files (Optional)
    messageLinks: Optional[List[LinkObject]]   # List of links (Optional)
    createdTime: datetime  # Timestamp when the message was created

class ErrorResponse(BaseModel):
    error: str  # Error message
