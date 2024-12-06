from fastapi import  HTTPException
from app.models.models import Chat, Message
from app.core.config import OPENAI_API_KEY, OPENAI_MODEL
from app.api.endpoints.chat import const
from openai import OpenAI

client = OpenAI(
    api_key=OPENAI_API_KEY,  
)

# OpenAI 호출 함수
def call_openai(query: str):
    
    try:
        content_response = client.chat.completions.create(
            model=OPENAI_MODEL, 
            messages=[
                {"role": "user", "content": const.content_prompt.format(query=query)}
            ]
        )
        # 응답에서 content 가져오기
        message_content = content_response.choices[0].message.content

        # 요약 생성
        title_response = client.chat.completions.create(
            model=OPENAI_MODEL, 
            messages=[
                {"role": "user", "content": const.title_prompt.format(content=message_content)}
            ]
        )
        message_title = title_response.choices[0].message.content
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OpenAI API error: {e}")
    return message_content, message_title





