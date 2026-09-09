import win32com.client
import os
import sys

try:
    xl = win32com.client.Dispatch("Excel.Application")
    xl.Visible = False
    xl.DisplayAlerts = False
    
    file_path = os.path.abspath(r'T:\ThuongThuongWEB\DangKy\10T0_PhieuGiao_Sample.xlsx')
    out_path = os.path.abspath(r'T:\ThuongThuongWEB\DangKy\10T0_PhieuGiao_Sample.xlsm')
    
    wb = xl.Workbooks.Open(file_path)
    xlmodule = wb.VBProject.VBComponents("ThisWorkbook")
    
    vba_code = """
Private Sub Workbook_SheetChange(ByVal Sh As Object, ByVal Target As Range)
    On Error Resume Next
    If Not Intersect(Target, Sh.Range("H1")) Is Nothing Then
        Application.EnableEvents = False
        Dim newName As String
        newName = Sh.Range("A2").Text
        If newName <> "" And newName <> "0" Then
            newName = Replace(newName, ":", "")
            newName = Replace(newName, "\\", "")
            newName = Replace(newName, "/", "")
            newName = Replace(newName, "?", "")
            newName = Replace(newName, "*", "")
            newName = Replace(newName, "[", "")
            newName = Replace(newName, "]", "")
            newName = Left(newName, 31)
            Sh.Name = newName
        End If
        Application.EnableEvents = True
    End If
End Sub
"""
    xlmodule.CodeModule.AddFromString(vba_code)
    
    # FileFormat=52 is xlOpenXMLWorkbookMacroEnabled
    wb.SaveAs(out_path, FileFormat=52)
    wb.Close(SaveChanges=False)
    xl.Quit()
    print("VBA Injected successfully.")
except Exception as e:
    print(f"Error injecting VBA: {e}")
    try:
        xl.Quit()
    except:
        pass
    sys.exit(1)
