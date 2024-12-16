from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_chroma import Chroma

from langchain_text_splitters import RecursiveCharacterTextSplitter

from langchain_core.prompts import PromptTemplate

from langchain_community.document_loaders import PyPDFLoader
import chromadb
from chromadb.utils import embedding_functions

import os, json
from dotenv import load_dotenv
import unicodedata
import base64
import re

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# 비표준 유니코드 문자 제거
def clean_text(text): 
    return ''.join(ch for ch in text if unicodedata.category(ch) != 'Cs')

def get_file_bytes(file_path):
    with open(file_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")  # Base64 인코딩 후 문자열로 변환
    

# 메타 데이터 불러오기
with open("app/data/meta_pdf.json", 'r', encoding='utf-8') as file:
    meta = json.load(file)

# TextSplitter 설정
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=2000,  # 최대 청크 크기
    chunk_overlap=100,  # 겹치는 크기
    separators=["\n\n", "\n", ".", "!", "?"]  # 문장 단위로 분리
)

folder_path = "app/core/rag/data/pdf"



def execute_query(query:str):
    # vector DB Connection
    vectordb_client = chromadb.PersistentClient(path='app/data/ragdb')
    openai_ef = embedding_functions.OpenAIEmbeddingFunction(
                api_key=OPENAI_API_KEY,
                model_name="text-embedding-3-large"
            )
    collection_name = "rag_db"
    vectordb_collection = vectordb_client.get_collection(
        name=collection_name,
        embedding_function=openai_ef,
    )

    retrieved_docs = vectordb_collection.query(query_texts=[query], n_results=3) 
    passages = ""
    doc_files = []
    # passages = "\n".join([f"Passage {i} (data_source: {doc.metadata['source']}):\n{doc.page_content}\n" for i, doc in enumerate(retrieved_docs)])
    for i, (doc, metadata) in enumerate(zip(retrieved_docs["documents"][0], retrieved_docs["metadatas"][0])):
        # print("****I****",i)
        # print("****DOC*****", doc)
        # print("*******metadata*****", metadata)
        passages += f"Passage {i} (data_source: {os.path.basename(metadata['source'])}):\n{doc}\n\n"
        doc_files.append(metadata['file_name'])

    prompt_template = f"""다음은 과학교사 수업과 관련된 질문이다.
답변은 한국어로, markdown형식으로 출력해라.
    
[질문]
{query}

[관련있는 내용]
{passages} 

# Based on the context and passages above, generate an answer to the question. 
만약 관련도가 적다면, 해당 내용을 참고하지 말고 질문에만 답을 하도록 해라.
Explicitly mention the 'data_source'. data_source 값이 절대로 틀리지 않도록 해라.

[답변]
"""

    try:
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0, openai_api_key=OPENAI_API_KEY)
        prompt = PromptTemplate(template=prompt_template, input_variables=["query", "passages"])
        doc_files = list(set(doc_files))
        chain = prompt | llm
        response = chain.invoke({"query": query, "passages": passages})
        
        # 답변에서 파일 이름 추출
        # source_files = re.findall(r"\data_source: ([^)]+)\)", response.content)
        file_objects = []
        link_objects = []

        for source_file in doc_files: 
            file_name, _ = source_file.split('.')
            print("SOURCE FILEL ", file_name)
            print("META", meta)
            if file_name in meta.keys():
                # 파일 경로 생성
                # file_path = os.path.join(folder_path, source_file)
                
                # # 파일 데이터를 Base64로 인코딩
                # file_bytes = get_file_bytes(file_path)
                # file_objects.append({
                #     "file": file_bytes,
                #     "filename": source_file
                # })
                
                # 메타 데이터에서 링크 가져오기
                link = meta[file_name].get('link', None) 
                if link and link != 'nan':  
                    link_objects.append({"link": link})

        # 결과 저장
        qas = {
            "query": query,
            "response": response.content,
            "messageFiles": file_objects,
            "messageLinks": link_objects
        }
        print(qas)

    except Exception as e:
        print("Error during query execution:", e)
    
    return qas
    
# qas = execute_query("Hi")
