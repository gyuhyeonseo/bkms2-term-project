content_prompt = """다음은 과학교사 수업과 관련된 질문이다.
답변은 한국어로, markdown형식으로 출력해라.

[질문]
{query}

[답변]
"""

title_prompt = """다음 내용에 대한 요약 (preview) 제목을 30자내로 말해줘.
언어는 한국어여야 하고, markdown형식이 아닌 string으로 반환해줘.

[내용]
{content}
[요약]
"""

prompt_template = """
# Previous Context:
{context}

# Question: {query}

# Relevant Passages:
{passages}

# Based on the context and passages above, generate an answer to the question. Explicitly mention the 'data_source'.
ex) (출처: document_name.hwp)
"""