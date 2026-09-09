import openpyxl
from openpyxl.formatting.rule import FormulaRule
from openpyxl.styles import Font, PatternFill

wb = openpyxl.load_workbook(r'T:\ThuongThuongWEB\DangKy\10T0_PhieuGiao_Sample.xlsx')
ws = wb['Lê Trung Hiếu']

# Apply Conditional Formatting to A12:A19
strikethrough_font = Font(strike=True)
rule1 = FormulaRule(formula=['$B12=""'], stopIfTrue=True, font=strikethrough_font)
ws.conditional_formatting.add('A12:A19', rule1)

# Apply Conditional Formatting to hide checkboxes in D12:F19
white_font = Font(color="FFFFFF")
rule2 = FormulaRule(formula=['$B12=""'], stopIfTrue=True, font=white_font)
ws.conditional_formatting.add('D12:F19', rule2)

wb.save('test_cf.xlsx')
print("CF applied.")
