import chromadb
import json
from chromadb.utils import embedding_functions
import os
from dotenv import load_dotenv


# ChromaDB에 meta data 추가

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# JSON 파일 불러오기
input_file_path = '/Users/kyong/Desktop/bkms2-term-project/backend/app/data/faq.json'
with open(input_file_path, 'r', encoding='utf-8') as json_file:
    meta_data = json.load(json_file)

embedding_function = embedding_functions.OpenAIEmbeddingFunction(
    api_key=OPENAI_API_KEY, 
    model_name='text-embedding-3-large'
)

# ChromaDB Client 초기화
db_path = "/Users/kyong/Desktop/bkms2-term-project/backend/app/data/faqdb"
client = chromadb.PersistentClient(path=db_path)
collection_name = "faq_db"
collection = client.get_or_create_collection(name=collection_name, embedding_function=embedding_function)

# 데이터를 벡터화하고 ChromaDB에 추가
for key, value in meta_data.items():

    # 텍스트 데이터 결합 (필요한 필드를 선택)
    text_data = " ".join([str(v) for k, v in value.items() if v])

    # ChromaDB에 데이터 추가
    collection.add(
        documents=[text_data],
        metadatas=[value], 
        ids=[key]
    )

# print(f"Data successfully added to ChromaDB collection '{collection_name}'.")
