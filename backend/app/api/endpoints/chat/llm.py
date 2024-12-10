from fastapi import  HTTPException
from app.models.models import Chat, Message
from app.core.config import OPENAI_API_KEY, OPENAI_MODEL
from app.api.endpoints.chat import const
from app.core.rag import rag_pdf
from openai import OpenAI
import chromadb
from chromadb.utils import embedding_functions

import os
from dotenv import load_dotenv
from app.api.endpoints.chat import utils
import time


load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai_client = OpenAI(
    api_key=OPENAI_API_KEY,  
)

vectordb_client = chromadb.PersistentClient(path='app/data/faqdb')
openai_ef = embedding_functions.OpenAIEmbeddingFunction(
            api_key=OPENAI_API_KEY,
            model_name="text-embedding-3-large"
        )
collection_name = "faq_db"
vectordb_collection = vectordb_client.get_collection(
    name=collection_name,
    embedding_function=openai_ef,
)


# OpenAI 호출 함수
def call_openai(query: str, need_title:bool):
    chat_title = ""
    
    # meta-data에 대해서 distance가 1 미만인 경우에만 바로 retrieval
    cache_start_time = time.time()
    retrieved_data_from_faq = vectordb_collection.query(query_texts=[query], n_results=1) 
    
    # FAQ cache (semantic cache)
    for idx, distances in enumerate(retrieved_data_from_faq['distances']):

        for dist_idx, distance in enumerate(distances):
            if int(distance) <= 0.8: 
                data = retrieved_data_from_faq['metadatas'][idx][dist_idx]
                markdown_output = utils.generate_markdown(data)
                cache_end_time = time.time()
                print("CACHE EXECUTION TIME: ", cache_end_time - cache_start_time)
                return markdown_output, data['question'], [], []
    
                
    # rag 
    try:
        rag_start_time = time.time()
        # content_response = rag_pdf.execute_query(query)
        # print(content_response)
        # print("RAG")
        content_response = openai_client.chat.completions.create(
            model=OPENAI_MODEL, 
            messages=[
                {"role": "user", 
                 "content": const.content_prompt.format(query=query) 
                } 
            ]
        )
        rag_end_time = time.time()
        print("RAG EXECUTION TIME: ", rag_end_time - rag_start_time)
        
        # 응답에서 content 가져오기
        message_content = content_response.choices[0].message.content

        # 요약 생성
        if need_title:
            title_response = openai_client.chat.completions.create(
                model=OPENAI_MODEL, 
                messages=[
                    {"role": "user", "content": const.title_prompt.format(content=message_content)}
                ]
            )
            chat_title = title_response.choices[0].message.content
        
        
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OpenAI API error: {e}")
    return message_content, chat_title, [], [] #content_response.link_objects, content_response.file_objects


if __name__ == "__main__":
    pass
    # print("Running test...")
    # call_openai("MBL 디지털 무선 센서(검류계 센서)를 활용한 전자기 유도 탐구 수업 improvement가 아니라 어떻게 수업해야하는지 상세하게 알려줘", need_title=False)
    # print("Response:", response)

