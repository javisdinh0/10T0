import openpyxl
from openpyxl.formatting.rule import FormulaRule
from openpyxl.styles import Font

print("Fixing CF rule for 0 values...")

def fix_workbook(filepath):
    print(f"Processing {filepath}...")
    try:
        wb = openpyxl.load_workbook(filepath, keep_vba=True)
    except Exception as e:
        print(f"Error loading {filepath}: {e}")
        return
        
    strikethrough_font = Font(strike=True)
    white_font = Font(color="FFFFFF")
    
    for ws in wb.worksheets:
        if ws.title.endswith('_Goc'):
            continue
            
        # Clear existing conditional formatting
        # openpyxl ConditionalFormattingList does not have clear(), we can re-initialize the dictionary
        ws.conditional_formatting.cf_rules = {}
        
        rule1 = FormulaRule(formula=['OR($B12="", $B12=0, $B12="0")'], stopIfTrue=True, font=strikethrough_font)
        ws.conditional_formatting.add('A12:A19', rule1)
        
        rule2 = FormulaRule(formula=['OR($B12="", $B12=0, $B12="0")'], stopIfTrue=True, font=white_font)
        ws.conditional_formatting.add('D12:F19', rule2)
        
    wb.save(filepath)

fix_workbook(r'T:\ThuongThuongWEB\DangKy\10T0_PhieuGiao_Sample.xlsm')
fix_workbook(r'T:\ThuongThuongWEB\DangKy\10T0_PhieuGiao_HoanChinh.xlsm')
fix_workbook(r'T:\ThuongThuongWEB\DangKy\10E_PhieuGiao_HoanChinh.xlsm')

print("All CFs updated.")
