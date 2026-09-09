import pandas as pd
import json

try:
    df = pd.read_excel(r'T:\ThuongThuongWEB\DangKy\10E.xlsx', header=None)
    df = df.astype(str)
    
    # We expect row 0, 1 to be headers, row 3 to be "LỚP, MÃ, TÊN HỌC SINH..."
    # Let's dump the first 10 rows to see the structure
    data = {
        'head': df.head(10).to_dict(orient='records')
    }
    with open('10E_info.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
except Exception as e:
    with open('10E_info.json', 'w', encoding='utf-8') as f:
        f.write(str(e))
