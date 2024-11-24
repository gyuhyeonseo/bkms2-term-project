import os
import json
import unicodedata
from dotenv import load_dotenv
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAIEmbeddings, ChatOpenAI

# 환경 변수 로드
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

from RAGchain.preprocess.loader import Win32HwpLoader

# 비표준 유니코드 문자 제거 함수
def clean_text(text):
    return ''.join(ch for ch in text if unicodedata.category(ch) != 'Cs')

# 메타 데이터 로드
with open("./data/meta_hwp.json", 'r', encoding='utf-8') as file:
    meta = json.load(file)

# TextSplitter 설정
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=2000,  # 최대 청크 크기
    chunk_overlap=0,  # 겹치는 크기 (0으로 설정)
    separators=["\n\n", "\n", ".", "!", "?"]  # 문장 단위로 분리
)

folder_path = "./data/hwp"
vector_store = None 

for filename in os.listdir(folder_path): 
    if filename.endswith(".hwpx"):
        path = os.path.join(folder_path, filename)
        name = str(filename.split('.')[0]).strip()
        
        # HWP, HWPX 파일 로드
        documents = Win32HwpLoader(path).load()
        processed_docs = []

        # 페이지 단위로 처리
        for i, document in enumerate(documents):
            current_page = clean_text(document.page_content.replace("\ufffd", " "))
            current_page_metadata = {
                "name": meta.get(name, {}).get('name', 'N/A')
            }

            document.page_content = current_page
            document.metadata.update(current_page_metadata)
            processed_docs.append(document)
            
        # 메타데이터에 있던 성찰일지 추가
        reflection_text = f"\n교사 성찰일지: {meta.get(name, {}).get('teacher', 'N/A')}\n학생 성찰일지: {meta.get(name, {}).get('student', 'N/A')}\n발생한 문제 및 해결 과정: {meta.get(name, {}).get('problem', 'N/A')}\n수업 개선 방안: {meta.get(name, {}).get('improve', 'N/A')}"
        reflection_document = documents[0].__class__(
            page_content=reflection_text,
            metadata={
                "name": meta.get(name, {}).get('name', 'N/A'),
                "type": "Reflection"
            }
        )
        processed_docs.append(reflection_document)

        # # 결과 출력
        # for idx, doc in enumerate(processed_docs):
        #     print(f"Page {idx + 1} Content:\n{doc.page_content}...")
        #     print(f"Metadata: {doc.metadata}\n")

        # Chroma Vector Store에 추가
        print(f"\n=== Adding {filename} to Vector Store ===")
        if vector_store is None:
            vector_store = Chroma.from_documents(
                processed_docs,
                OpenAIEmbeddings(model='text-embedding-3-large', openai_api_key=OPENAI_API_KEY)
            )
        else:
            vector_store.add_documents(processed_docs)

        print(f"=== {filename} Processed and Added ===")

def execute_chain():
    print("=== Type 'exit' to quit ===")

    qas = []
    context = ""  # Multi-turn dialogue context

    while True:
        query = input("Enter a prompt: ")
        if query.lower() == 'exit':
            print('Exiting...')
            break

        else:
            retrieved_docs = vector_store.similarity_search(query, k=3)
            passages = "\n".join([f"Passage {i} (data_source: {doc.metadata['name']}):\n{doc.page_content}\n" for i, doc in enumerate(retrieved_docs)])
            prompt_template = f"""
            # Previous Context:
            {context}
            
            # Question: {query}

            # Relevant Passages:
            {passages}

            # Based on the context and passages above, generate an answer to the question. Explicitly mention the 'data_source'.
            ex) (출처: document_name.hwp)
            """

            try:
                llm = ChatOpenAI(model="gpt-4o-mini", temperature=0, openai_api_key=OPENAI_API_KEY)
                prompt = PromptTemplate(template=prompt_template, input_variables=["query", "passages"])
                chain = prompt | llm
                response = chain.invoke({"query": query, "passages": passages})
                print('Answer:', response.content)
                context += f"Q: {query}\nA: {response.content}\n"
                qas.append({
                    'query': query,
                    'response': response.content
                })

            except Exception as e:
                print(e)

    return qas

qas = execute_chain()

output_file_path = './result_hwp.json'
with open(output_file_path, 'w', encoding='utf-8') as json_file:
    json.dump(qas, json_file, ensure_ascii=False, indent=4)
