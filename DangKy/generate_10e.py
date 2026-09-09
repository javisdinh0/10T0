import openpyxl
from copy import copy
import pandas as pd
import re

print("Loading emails...")
try:
    df_dangky = pd.read_excel(r'T:\ThuongThuongWEB\DangKy\DangKy.xlsx')
    email_dict = dict(zip(df_dangky['Họ tên học sinh'].str.strip().str.lower(), df_dangky['Địa chỉ email']))
except Exception as e:
    print(f"Error loading DangKy.xlsx: {e}")
    email_dict = {}

print("Loading 10E.xlsx...")
wb_10e = openpyxl.load_workbook(r'T:\ThuongThuongWEB\DangKy\10E.xlsx')
sheet_10e = wb_10e.active
sheet_10e.title = '10E_Goc'

# Fix row 13 if it hasn't been fixed manually
if sheet_10e['Q13'].value == 1 or str(sheet_10e['Q13'].value) == '1':
    print("Fixing row 13 data anomaly...")
    sheet_10e['R13'].value = sheet_10e['Q13'].value
    sheet_10e['S13'].value = sheet_10e['R13'].value if sheet_10e['R13'].value == 'M' else 'M'
    sheet_10e['Q13'].value = None

print("Loading template from 10T0_PhieuGiao_Sample.xlsm...")
wb_template = openpyxl.load_workbook(r'T:\ThuongThuongWEB\DangKy\10T0_PhieuGiao_Sample.xlsm', keep_vba=True)
template_source = wb_template[wb_template.sheetnames[1]]

# Create a new workbook that will be macro-enabled, easiest way is to start with a copy of 10T0_PhieuGiao_Sample to keep VBA
# Then we replace the 10T0_Goc with 10E_Goc, and delete old students
print("Preparing new HoanChinh workbook...")
wb_out = openpyxl.load_workbook(r'T:\ThuongThuongWEB\DangKy\10T0_PhieuGiao_Sample.xlsm', keep_vba=True)
# Delete 10T0_Goc
del wb_out['10T0_Goc']

# Copy 10E_Goc into wb_out
new_goc = wb_out.create_sheet('10E_Goc', 0)
for row in sheet_10e.iter_rows():
    for cell in row:
        new_cell = new_goc.cell(row=cell.row, column=cell.column, value=cell.value)
        if cell.has_style:
            new_cell.font = copy(cell.font)
            new_cell.border = copy(cell.border)
            new_cell.fill = copy(cell.fill)
            new_cell.number_format = copy(cell.number_format)
            new_cell.protection = copy(cell.protection)
            new_cell.alignment = copy(cell.alignment)
            
# Fix formulas in template
template = wb_out[wb_out.sheetnames[1]] # The template sheet
for row in template.iter_rows():
    for cell in row:
        if cell.value and isinstance(cell.value, str) and cell.value.startswith('='):
            cell.value = cell.value.replace('10T0_Goc', '10E_Goc')

max_row = new_goc.max_row
template_row = template['H1'].value

print("Generating student sheets...")
for target_row in range(9, max_row + 1):
    student_name = new_goc[f'C{target_row}'].value
    if not student_name or str(student_name).strip() == "":
        continue
        
    if target_row == 9: # We repurpose the first sheet (which was row 9 in 10T0, and is also row 9 here!)
        ws = template
        ws.title = str(student_name).strip()[:31]
        email = email_dict.get(str(student_name).strip().lower(), "")
        ws['B4'] = email
        ws['H1'] = target_row
    else:
        sheet_title = str(student_name).strip()
        sheet_title = re.sub(r'[\\*?:/\[\]]', '', sheet_title)[:31]
        
        original_title = sheet_title
        counter = 1
        while sheet_title in wb_out.sheetnames:
            sheet_title = f"{original_title[:28]}_{counter}"
            counter += 1
            
        ws = wb_out.copy_worksheet(template)
        ws.title = sheet_title
        
        ws['H1'] = target_row
        email = email_dict.get(str(student_name).strip().lower(), "")
        ws['B4'] = email

# Delete any extra sheets from template if they exist (though it should only be one)
out_file = r'T:\ThuongThuongWEB\DangKy\10E_PhieuGiao_HoanChinh.xlsm'
wb_out.save(out_file)
print(f"Finished generating {out_file}")
