import pandas as pd
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Đường dẫn file
source_file = r'T:\ThuongThuongWEB\DangKy\DangKy.xlsx'
template_file = r'T:\ThuongThuongWEB\DangKy\Form.xlsx'
output_file = r'T:\ThuongThuongWEB\DangKy\KetQua_Form.xlsx'

# Đọc dữ liệu
try:
    df_source = pd.read_excel(source_file, sheet_name='Câu trả lời biểu mẫu 1')
    df_template = pd.read_excel(template_file, sheet_name='Câu trả lời biểu mẫu 1')
except Exception as e:
    print(f"Lỗi đọc file: {e}")
    sys.exit(1)

template_columns = df_template.columns.tolist()

uniform_map = {
    'Quần kaki (Nam)': {
        'qty_col': 'Đăng ký đồng phục nam (PH bỏ trống nếu không đăng ký) [Quần kaki ]',
        'size_col': 'Đăng ký size đồng phục nam [Quần kaki ]'
    },
    'Quần sooc (Nam)': {
        'qty_col': 'Đăng ký đồng phục nam (PH bỏ trống nếu không đăng ký) [Quần sooc ]',
        'size_col': 'Đăng ký size đồng phục nam [Quần sooc ]'
    },
    'Áo sơ mi cộc tay (Nam)': {
        'qty_col': 'Đăng ký đồng phục nam (PH bỏ trống nếu không đăng ký) [Áo sơ mi cộc tay ]',
        'size_col': 'Đăng ký size đồng phục nam [Áo sơ mi cộc tay]'
    },
    'Áo sơ mi dài tay (Nam)': {
        'qty_col': 'Đăng ký đồng phục nam (PH bỏ trống nếu không đăng ký) [Áo sơ mi dài tay ]',
        'size_col': 'Đăng ký size đồng phục nam [Áo sơ mi dài tay]'
    },
    'Chân váy (Nữ)': {
        'qty_col': 'Đăng ký đồng phục nữ  (PH bỏ trống nếu không đăng ký) [Chân váy]',
        'size_col': 'Đăng ký size đồng phục nữ [Chân váy ]'
    },
    'Áo sơ mi cộc tay (Nữ)': {
        'qty_col': 'Đăng ký đồng phục nữ  (PH bỏ trống nếu không đăng ký) [Áo sơ mi cộc tay]',
        'size_col': 'Đăng ký size đồng phục nữ [Áo sơ mi cộc tay ]'
    },
    'Áo sơ mi dài tay (Nữ)': {
        'qty_col': 'Đăng ký đồng phục nữ  (PH bỏ trống nếu không đăng ký) [Áo sơ mi dài tay]',
        'size_col': 'Đăng ký size đồng phục nữ [Áo sơ mi dài tay ]'
    },
    'Áo polo trắng': {
        'qty_col': 'Đăng ký đồng phục nam-nữ  (PH bỏ trống nếu không đăng ký) [Áo polo trắng]',
        'size_col': 'Đăng ký size đồng phục nam - nữ [Áo polo trắng]'
    },
    'Áo polo xanh': {
        'qty_col': 'Đăng ký đồng phục nam-nữ  (PH bỏ trống nếu không đăng ký) [Áo polo xanh]',
        'size_col': 'Đăng ký size đồng phục nam - nữ [Áo polo xanh]'
    },
    'Bộ thể thao hè': {
        'qty_col': 'Đăng ký đồng phục nam-nữ  (PH bỏ trống nếu không đăng ký) [Bộ thể thao hè]',
        'size_col': 'Đăng ký size đồng phục nam - nữ [Bộ thể thao hè]'
    }
}

book_map = {
    'SGK Việt Nam Lớp 10': 'Đăng ký sách giáo khoa Việt Nam:  [Lớp 10]',
    'SGK Việt Nam Lớp 11': 'Đăng ký sách giáo khoa Việt Nam:  [Lớp 11]',
    'SGK Việt Nam Lớp 12': 'Đăng ký sách giáo khoa Việt Nam:  [Lớp 12]',
    'Vở kẻ ngang': 'Số lượng Vở kẻ ngang'
}

result_data = []

# Để thống kê
stats_uniforms = {}
stats_sizes = {}
stats_books = {}

for index, row in df_source.iterrows():
    new_row = {col: "" for col in template_columns}
    
    # 1. Thông tin cơ bản
    for basic_col in ['Dấu thời gian', 'Địa chỉ email', 'Họ tên học sinh', 'Ngày sinh', 'Lớp', 'Giới tính']:
        if basic_col in new_row and basic_col in row:
            val = row[basic_col]
            if basic_col == 'Họ tên học sinh' and isinstance(val, str):
                # Viết hoa chữ cái đầu (Title Case)
                val = val.title()
            new_row[basic_col] = val
            
    # 2. Xử lý Đồng phục
    uniform_text = str(row.get('Đăng ký đồng phục ', ''))
    if uniform_text != 'nan' and uniform_text.strip():
        lines = uniform_text.split('\n')
        for line in lines:
            match = re.search(r'-\s(.*?):\s(\d+)\s.*\(Size\s(.*?)\)', line, re.IGNORECASE)
            if match:
                item_name = match.group(1).strip()
                qty = int(match.group(2))
                # IN HOA size
                size = match.group(3).strip().upper()
                
                # Cập nhật thống kê đồng phục
                stats_uniforms[item_name] = stats_uniforms.get(item_name, 0) + qty
                # Cập nhật thống kê size
                stats_sizes[size] = stats_sizes.get(size, 0) + qty
                
                if item_name in uniform_map:
                    qty_col = uniform_map[item_name]['qty_col']
                    size_col = uniform_map[item_name]['size_col']
                    if qty_col in new_row:
                        new_row[qty_col] = qty
                    if size_col in new_row:
                        new_row[size_col] = size

    # 3. Xử lý Sách
    book_text = str(row.get('Đăng ký sách', ''))
    if book_text != 'nan' and book_text.strip():
        lines = book_text.split('\n')
        for line in lines:
            match = re.search(r'-\s(.*?):\s(\d+)', line, re.IGNORECASE)
            if match:
                item_name = match.group(1).strip()
                qty = int(match.group(2))
                
                # Cập nhật thống kê sách
                stats_books[item_name] = stats_books.get(item_name, 0) + qty
                
                if item_name in book_map:
                    qty_col = book_map[item_name]
                    if qty_col in new_row:
                        new_row[qty_col] = qty
                        
    result_data.append(new_row)

df_result = pd.DataFrame(result_data, columns=template_columns)

# Chuyển đổi dict thống kê sang DataFrame
df_stats_uniform = pd.DataFrame(list(stats_uniforms.items()), columns=['Loại đồng phục', 'Số lượng'])
df_stats_size = pd.DataFrame(list(stats_sizes.items()), columns=['Size', 'Số lượng'])
df_stats_book = pd.DataFrame(list(stats_books.items()), columns=['Loại Sách/Vở', 'Số lượng'])

try:
    with pd.ExcelWriter(output_file, engine='xlsxwriter') as writer:
        # Ghi sheet chính
        df_result.to_excel(writer, sheet_name='ChiTiet_DangKy', index=False)
        
        # Ghi sheet thống kê
        workbook = writer.book
        worksheet_stat = workbook.add_worksheet('ThongKe')
        
        bold_format = workbook.add_format({'bold': True})
        
        # Ghi Data thống kê Đồng Phục vào Excel (Bắt đầu từ A1)
        worksheet_stat.write('A1', 'THỐNG KÊ ĐỒNG PHỤC', bold_format)
        worksheet_stat.write('A2', 'Loại đồng phục', bold_format)
        worksheet_stat.write('B2', 'Số lượng', bold_format)
        row_idx = 2
        for item, qty in stats_uniforms.items():
            worksheet_stat.write(row_idx, 0, item)
            worksheet_stat.write(row_idx, 1, qty)
            row_idx += 1
            
        # Biểu đồ cột Đồng Phục
        chart_uniform = workbook.add_chart({'type': 'column'})
        chart_uniform.add_series({
            'name': 'Số lượng đặt',
            'categories': ['ThongKe', 2, 0, row_idx - 1, 0],
            'values':     ['ThongKe', 2, 1, row_idx - 1, 1],
        })
        chart_uniform.set_title({'name': 'Số lượng Đồng phục'})
        worksheet_stat.insert_chart('D2', chart_uniform)
        
        # Ghi Data thống kê Size (Bắt đầu từ A(row_idx + 3))
        start_size_row = row_idx + 2
        worksheet_stat.write(start_size_row, 0, 'THỐNG KÊ THEO SIZE', bold_format)
        worksheet_stat.write(start_size_row + 1, 0, 'Size', bold_format)
        worksheet_stat.write(start_size_row + 1, 1, 'Số lượng', bold_format)
        row_idx = start_size_row + 2
        for item, qty in stats_sizes.items():
            worksheet_stat.write(row_idx, 0, item)
            worksheet_stat.write(row_idx, 1, qty)
            row_idx += 1
            
        # Biểu đồ tròn Size
        chart_size = workbook.add_chart({'type': 'pie'})
        chart_size.add_series({
            'name': 'Tỉ lệ Size',
            'categories': ['ThongKe', start_size_row + 2, 0, row_idx - 1, 0],
            'values':     ['ThongKe', start_size_row + 2, 1, row_idx - 1, 1],
            'data_labels': {'value': True, 'percentage': True}
        })
        chart_size.set_title({'name': 'Phân bổ Size'})
        worksheet_stat.insert_chart('D18', chart_size)
        
        # Ghi Data thống kê Sách (Bắt đầu từ A(row_idx + 3))
        start_book_row = row_idx + 2
        worksheet_stat.write(start_book_row, 0, 'THỐNG KÊ SÁCH VỞ', bold_format)
        worksheet_stat.write(start_book_row + 1, 0, 'Loại', bold_format)
        worksheet_stat.write(start_book_row + 1, 1, 'Số lượng', bold_format)
        row_idx = start_book_row + 2
        for item, qty in stats_books.items():
            worksheet_stat.write(row_idx, 0, item)
            worksheet_stat.write(row_idx, 1, qty)
            row_idx += 1
            
        # Auto-fit columns
        worksheet_stat.set_column('A:A', 25)
        worksheet_stat.set_column('B:B', 10)

    print(f"Đã xử lý xong {len(df_result)} dòng. Đã xuất ra file: {output_file} kèm biểu đồ.")
except Exception as e:
    print(f"Lỗi khi lưu file: {e}")
