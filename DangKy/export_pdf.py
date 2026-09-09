import win32com.client
import os

excel_path = os.path.abspath(r'T:\ThuongThuongWEB\DangKy\10T0_PhieuGiao_HoanChinh.xlsm')
pdf_path = os.path.abspath(r'T:\ThuongThuongWEB\DangKy\10T0_PhieuGiao_In.pdf')

print("Starting Excel COM application...")
excel = win32com.client.Dispatch("Excel.Application")
excel.Visible = False
excel.DisplayAlerts = False

try:
    print("Opening workbook...")
    wb = excel.Workbooks.Open(excel_path)
    
    sheet_names_to_print = []
    print("Configuring page setup for each sheet...")
    for sheet in wb.Sheets:
        if sheet.Name.endswith('_Goc'):
            continue
            
        sheet.PageSetup.PrintArea = "A1:F19"
        sheet.PageSetup.PaperSize = 9 # xlPaperA4
        sheet.PageSetup.Orientation = 1 # xlPortrait
        sheet.PageSetup.Zoom = False
        sheet.PageSetup.FitToPagesWide = 1
        sheet.PageSetup.FitToPagesTall = 1
        sheet.PageSetup.CenterHorizontally = True
        
        sheet_names_to_print.append(sheet.Name)
        
    if sheet_names_to_print:
        print(f"Exporting {len(sheet_names_to_print)} sheets to PDF...")
        wb.Worksheets(sheet_names_to_print).Select()
        wb.ActiveSheet.ExportAsFixedFormat(0, pdf_path)
        print(f"Success! Exported PDF to {pdf_path}")
    else:
        print("No sheets to print.")
        
except Exception as e:
    print(f"Error: {e}")
finally:
    try:
        wb.Close(SaveChanges=False)
    except:
        pass
    excel.Quit()
