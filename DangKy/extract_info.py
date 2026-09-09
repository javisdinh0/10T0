import pandas as pd
import json
df = pd.read_excel(r'T:\ThuongThuongWEB\DangKy\10T0.xlsx', header=None)
df = df.astype(str)
data = {
    'head': df.head(10).to_dict(orient='records')
}
with open('data_info.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
