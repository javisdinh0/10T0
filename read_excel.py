import pandas as pd
import sys
sys.stdout.reconfigure(encoding='utf-8')

def analyze_excel(file_path):
    print(f"=== Tệp: {file_path} ===")
    try:
        xls = pd.ExcelFile(file_path)
        print(f"Các sheet: {xls.sheet_names}")
        for sheet in xls.sheet_names:
            print(f"\n-- Sheet: {sheet} --")
            df = pd.read_excel(file_path, sheet_name=sheet)
            print("Cột:", df.columns.tolist())
            print("2 dòng đầu tiên:")
            print(df.head(2).to_dict(orient='records'))
            print("-" * 30)
    except Exception as e:
        print(f"Lỗi khi đọc file: {e}")

analyze_excel(r'T:\ThuongThuongWEB\DangKy\KetQua_Form.xlsx')
