import pandas as pd
import json
import openpyxl

file_path = '/Users/jeongmoonwon/Downloads/bkms2-term-project/RAG/data/Rag기반 교사지원시스템 개발을 위한 데이터 목록_1120.xlsx'

# df = pd.read_excel(file_path, sheet_name=0)
# df = df[(df['파일 공유'] == '완료') & (df['형식'] == 'pdf')]
# df['콘텐츠명'] = df['콘텐츠명'].str.replace(".", "", regex=False)
# df['콘텐츠명'] = df['콘텐츠명'].str.replace(" ", "_", regex=False)

# meta = {}
# for i in range(len(df)):
#     meta[str(df.iloc[i, 1])] = {
#         'summary': str(df.iloc[i, 2]), 
#         'detail': str(df.iloc[i, 3]),  
#         'link': str(df.iloc[i, 6]),    
#         'year': int(df.iloc[i, 7]) if not pd.isna(df.iloc[i, 7]) else None, 
#     }

# output_file_path = '/Users/jeongmoonwon/Downloads/bkms2-term-project/RAG/data/meta_pdf.json'
# with open(output_file_path, 'w') as json_file:
#     json.dump(meta, json_file, ensure_ascii=False, indent=4)
    
df = pd.read_excel(file_path, sheet_name=1)
df = df[df['지도안'] == 'O']

meta = {}
for i in range(len(df)):
    meta[int(df.iloc[i, 0])] = {
        'name': str(df.iloc[i, 2]), 
        'teacher': str(df.iloc[i, 3]),  
        'student': str(df.iloc[i, 4]),    
        'problem': str(df.iloc[i, 5]), 
        'improve': str(df.iloc[i, 6])   
    }
output_file_path = '/Users/jeongmoonwon/Downloads/bkms2-term-project/RAG/data/meta_hwp.json'
with open(output_file_path, 'w') as json_file:
    json.dump(meta, json_file, ensure_ascii=False, indent=4)