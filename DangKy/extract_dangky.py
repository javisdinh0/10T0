import pandas as pd
import json

try:
    df = pd.read_excel(r'T:\ThuongThuongWEB\DangKy\DangKy.xlsx')
    data = {
        'columns': df.columns.tolist(),
        'head': df.head(5).astype(str).to_dict(orient='records')
    }
    with open('dangky_info.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
except Exception as e:
    with open('dangky_info.json', 'w', encoding='utf-8') as f:
        f.write(str(e))
