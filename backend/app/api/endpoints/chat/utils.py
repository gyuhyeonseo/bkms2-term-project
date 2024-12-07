from sqlalchemy.orm import Session
from app.models.models import Chat, Message
import re



# chat ID 생성 - DB상 가장 마지막 chat-id + 1
def generate_chat_id(sessionId: str, db:Session):
    last_chat = (
        db.query(Chat)
        .filter(Chat.session_id == sessionId)
        .order_by(Chat.chat_id.desc())
        .first()
    )
    if last_chat:
        # Extract the ascending number and increment it
        last_number = int(last_chat.chat_id.split("-")[-1])
        new_number = str(last_number + 1).zfill(5)
    else:
        new_number = "00001"
    chat_id = f"{sessionId}-{new_number}"

    return chat_id

# message ID 생성 - DB상 가장 마지막 message-id + 1
def generate_message_id(sessionId: str, chatId:str, db:Session):
    last_message = (
        db.query(Message)
        .filter(Message.chat_id == chatId)
        .order_by(Message.message_id.desc())
        .first()
    )
    if last_message:
        last_message_number = int(last_message.message_id.split("-")[-1])
        new_message_number_for_user = str(last_message_number + 1).zfill(5)
    else:
        new_message_number_for_user = "00001"

    message_id = f"{chatId}-{new_message_number_for_user}"

    return message_id

# return clean markdown text
def clean_markdown_text(text: str) -> str:
    # 연속된 줄바꿈은 하나의 줄바꿈으로 축소
    text = re.sub(r'\n{2,}', '\n\n', text)

    # 줄바꿈 문자 `\n`을 JSON 직렬화에 적합하게 유지
    text = text.strip()
    return text

