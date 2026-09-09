import openpyxl
import io

with io.open('sheet_names.txt', 'w', encoding='utf-8') as f:
    wb = openpyxl.load_workbook(r'T:\ThuongThuongWEB\DangKy\10T0_PhieuGiao_Sample.xlsm')
    f.write(str(wb.sheetnames))
