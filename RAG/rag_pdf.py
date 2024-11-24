from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_chroma import Chroma

from langchain_text_splitters import RecursiveCharacterTextSplitter

from langchain_core.prompts import PromptTemplate

from langchain_community.document_loaders import PyPDFLoader

import os, json
from dotenv import load_dotenv
import unicodedata

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# 비표준 유니코드 문자 제거
def clean_text(text): 
    return ''.join(ch for ch in text if unicodedata.category(ch) != 'Cs')

# 메타 데이터 불러오기
with open("./data/meta_pdf.json", 'r', encoding='utf-8') as file:
    meta = json.load(file)

# TextSplitter 설정
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=2000,  # 최대 청크 크기
    chunk_overlap=100,  # 겹치는 크기
    separators=["\n\n", "\n", ".", "!", "?"]  # 문장 단위로 분리
)

folder_path = "./data/pdf/in_excel"

vector_store = None 

for filename in os.listdir(folder_path)[7:9]: 
    if filename.endswith(".pdf"):
        print(f"\n=== File: {filename} ===\n")
        path = os.path.join(folder_path, filename)
        name = str(filename.split('.pdf')[0]).strip()

        if name != '2022년_지능형_과학실에서의_학생참여형_교수학습_자료': # "2023_지능형_과학실_수업박람회_포스터_1_IoT_활용_수업"
            continue

        documents = PyPDFLoader(path).load()  # 페이지 단위로 로드
        processed_docs = []

        # 페이지 단위로 처리
        for i in range(len(documents)):
            current_page = clean_text(documents[i].page_content.replace("�", " "))
            current_page_metadata = {
                "summary": meta[name]['summary'],
                "detail": meta[name]['detail'],
                "link": meta[name]['link'],
                "page_number": i + 1  # 페이지 번호 추가
            }

            # 마지막 페이지가 아니면 겹치기 처리
            if i < len(documents) - 1:
                next_page = clean_text(documents[i + 1].page_content.replace("�", " "))
                combined_text = current_page + "\n" + next_page
                split_chunks = text_splitter.split_text(combined_text)

                # 현재 페이지 청크와 다음 페이지 청크 일부 겹치기
                overlapping_chunk = split_chunks[-1]  # 마지막 청크
                current_page = current_page + "\n" + overlapping_chunk  # 현재 페이지 확장

            documents[i].page_content = current_page
            documents[i].metadata.update(current_page_metadata)
            processed_docs.append(documents[i])

        # 결과 출력
        for idx, doc in enumerate(processed_docs):
            print(f"Page {idx + 1} Content:\n{doc.page_content}...")
            print(f"Metadata: {doc.metadata}\n")
        
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
            passages = "\n".join([f"Passage {i} (data_source: {doc.metadata['source']}):\n{doc.page_content}\n" for i, doc in enumerate(retrieved_docs)])
            prompt_template = f"""
            # Previous Context:
            {context}
            
            # Question: {query}

            # Relevant Passages:
            {passages}

            # Based on the context and passages above, generate an answer to the question. Explicitly mention the 'data_source'.
            ex) (출처: document_name.pdf)
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

output_file_path = './result_pdf.json'
with open(output_file_path, 'w') as json_file:
    json.dump(qas, json_file, ensure_ascii=False, indent=4)