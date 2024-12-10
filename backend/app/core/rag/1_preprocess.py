import pandas as pd
import json

# meta data preprocessing

file_path = "./data/Rag기반 교사지원시스템 개발을 위한 데이터 목록_1120.xlsx"
all_sheets = pd.read_excel(file_path, sheet_name=None)
sheet_names = list(all_sheets.keys())
meta = {}

for sheet_number, sheet_name in enumerate(sheet_names):  
    df = all_sheets[sheet_name]  
    
    # if sheet_number == 0:
    #     df['콘텐츠명'] = df['콘텐츠명'].str.replace(".", "", regex=False)
    #     df['콘텐츠명'] = df['콘텐츠명'].str.replace(" ", "_", regex=False)

    #     for i in range(len(df)):
    #         key = str(df.iloc[i, 1])
    #         meta[key] = {
    #             'name': str(df.iloc[i, 1]), 
    #             'summary': str(df.iloc[i, 2]), 
    #             'detail': str(df.iloc[i, 3]),  
    #             'link': str(df.iloc[i, 6]),    
    #             'extension': str(df.iloc[i, 4]),
    #             'year': int(df.iloc[i, 7]) if not pd.isna(df.iloc[i, 7]) else None, 
    #         }
    
    # elif sheet_number == 1:
    #     for i in range(len(df)):
    #         key = str(df.iloc[i, 2])
    #         meta[key] = {
    #             'name': str(df.iloc[i, 2]), 
    #             'teacher': str(df.iloc[i, 3]),  
    #             'student': str(df.iloc[i, 4]),    
    #             'problem': str(df.iloc[i, 5]), 
    #             'improve': str(df.iloc[i, 6])   
    #         }
    
    if sheet_number == 2 or sheet_number == 3: 
        for i in range(len(df)):
            key = str(df.iloc[i, 1])
            meta[key] = {
                'question': str(df.iloc[i, 1]), 
                'answer': str(df.iloc[i, 2])
            }
    
    # elif sheet_number == 4: 
    #     for i in range(len(df)):
    #         key = str(df.iloc[i, 2])
    #         meta[key] = {
    #             'name': str(df.iloc[i, 1]), 
    #             'detail': str(df.iloc[i, 2])
    #         }

# JSON 파일로 저장
output_file_path = './data/faq.json'
with open(output_file_path, 'w') as json_file:
    json.dump(meta, json_file, ensure_ascii=False, indent=4)
