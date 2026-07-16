// ==========================================
// CẤU HÌNH (ĐÃ ĐIỀN SẴN ĐẦY ĐỦ CÁC ID CỦA BẠN)
// ==========================================

const SHEET_ID = '1k9Z0rlAiNXDDmcayAqA1twqaYxYQTXAD66HtEd-AIz4';
const TEMPLATE_DOC_ID = '1PkU9X26EfzSmJSiIe1__XL0U3gGlnXvV-nestkQP4fg';
const OUTPUT_FOLDER_ID = '1bH7ACnbMecRqVJEhBVDxhyeOuiZLAE_t';

// ==========================================
// CODE XỬ LÝ (RẤT MẠNH MẼ, TỰ ĐỘNG BẮT LỖI)
// ==========================================

function doPost(e) {
  // Lưu ý: Web App triển khai với quyền "Bất kỳ ai" (Anyone) sẽ tự trả CORS cho phản hồi,
  // nên frontend gọi fetch bình thường và đọc được JSON kết quả. ContentService không hỗ trợ
  // đặt header thủ công, vì vậy không cần (và không thể) tự thêm header CORS ở đây.
  try {
    // 1. Kiểm tra dữ liệu đầu vào
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Không nhận được dữ liệu POST từ trang web.");
    }
    const data = JSON.parse(e.postData.contents);
    
    // 2. Kết nối CỤ THỂ vào đúng file Google Sheet của bạn
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const sheet = spreadsheet.getActiveSheet();
    const timestamp = new Date();
    
    // 3. Xây dựng chuỗi tóm tắt
    const dongPhucSummary = buildUniformSummary(data);
    const sachVoSummary = buildBooksSummary(data);

    // 4. Lưu vào Sheet
    sheet.appendRow([
      timestamp, 
      data.email, 
      data.fullName, 
      data.dob, 
      data.class, 
      data.gender, 
      dongPhucSummary, 
      sachVoSummary
    ]);

    // 5. Tạo PDF và Gửi Mail
    let pdfUrl = '';
    const pdfFile = createPdfReport(data, dongPhucSummary, sachVoSummary);
    pdfUrl = pdfFile.getUrl();
    sendEmailWithPdf(data.email, data.fullName, pdfFile);

    // Thành công
    return ContentService.createTextOutput(JSON.stringify({
      status: "success", 
      message: "Data recorded successfully",
      pdfUrl: pdfUrl
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // 6. Ghi lại lỗi trực tiếp vào Sheet (vào 1 dòng mới để bạn dễ xem)
    try {
      const errorSheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
      errorSheet.appendRow([new Date(), "LỖI HỆ THỐNG", error.toString(), e ? e.postData.contents : "No data"]);
    } catch(e2) {}

    // Báo lỗi về Frontend
    return ContentService.createTextOutput(JSON.stringify({
      status: "error", 
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ----------------- CÁC HÀM PHỤ TRỢ -----------------

function buildUniformSummary(data) {
  let items = [];
  
  if (data.male_pants_kaki_qty && data.male_pants_kaki_qty !== "0") items.push(`- Quần kaki (Nam): ${data.male_pants_kaki_qty} chiếc (Size ${data.male_pants_kaki_size})`);
  if (data.male_pants_short_qty && data.male_pants_short_qty !== "0") items.push(`- Quần sooc (Nam): ${data.male_pants_short_qty} chiếc (Size ${data.male_pants_short_size})`);
  if (data.male_shirt_short_qty && data.male_shirt_short_qty !== "0") items.push(`- Áo sơ mi cộc tay (Nam): ${data.male_shirt_short_qty} chiếc (Size ${data.male_shirt_short_size})`);
  if (data.male_shirt_long_qty && data.male_shirt_long_qty !== "0") items.push(`- Áo sơ mi dài tay (Nam): ${data.male_shirt_long_qty} chiếc (Size ${data.male_shirt_long_size})`);
  
  if (data.female_skirt_qty && data.female_skirt_qty !== "0") items.push(`- Chân váy (Nữ): ${data.female_skirt_qty} chiếc (Size ${data.female_skirt_size})`);
  if (data.female_shirt_short_qty && data.female_shirt_short_qty !== "0") items.push(`- Áo sơ mi cộc tay (Nữ): ${data.female_shirt_short_qty} chiếc (Size ${data.female_shirt_short_size})`);
  if (data.female_shirt_long_qty && data.female_shirt_long_qty !== "0") items.push(`- Áo sơ mi dài tay (Nữ): ${data.female_shirt_long_qty} chiếc (Size ${data.female_shirt_long_size})`);
  
  if (data.unisex_polo_white_qty && data.unisex_polo_white_qty !== "0") items.push(`- Áo polo trắng: ${data.unisex_polo_white_qty} chiếc (Size ${data.unisex_polo_white_size})`);
  if (data.unisex_polo_blue_qty && data.unisex_polo_blue_qty !== "0") items.push(`- Áo polo xanh: ${data.unisex_polo_blue_qty} chiếc (Size ${data.unisex_polo_blue_size})`);
  if (data.unisex_sport_summer_qty && data.unisex_sport_summer_qty !== "0") items.push(`- Bộ thể thao hè: ${data.unisex_sport_summer_qty} bộ (Size ${data.unisex_sport_summer_size})`);
  
  return items.length > 0 ? items.join("\n") : "Không đăng ký";
}

function buildBooksSummary(data) {
  let items = [];
  if (data.sgk_vn_10 && data.sgk_vn_10 !== "0") items.push(`- SGK Việt Nam Lớp 10: ${data.sgk_vn_10} bộ`);
  if (data.sgk_vn_11 && data.sgk_vn_11 !== "0") items.push(`- SGK Việt Nam Lớp 11: ${data.sgk_vn_11} bộ`);
  if (data.sgk_vn_12 && data.sgk_vn_12 !== "0") items.push(`- SGK Việt Nam Lớp 12: ${data.sgk_vn_12} bộ`);
  if (data.sgk_nn_10 && data.sgk_nn_10 !== "0") items.push(`- SGK Nước ngoài Lớp 10: ${data.sgk_nn_10} bộ`);
  if (data.sgk_nn_11 && data.sgk_nn_11 !== "0") items.push(`- SGK Nước ngoài Lớp 11: ${data.sgk_nn_11} bộ`);
  if (data.sgk_nn_12 && data.sgk_nn_12 !== "0") items.push(`- SGK Nước ngoài Lớp 12: ${data.sgk_nn_12} bộ`);
  if (data.notebook_qty && data.notebook_qty !== "" && data.notebook_qty !== "0") items.push(`- Vở kẻ ngang: ${data.notebook_qty} quyển`);
  return items.length > 0 ? items.join("\n") : "Không đăng ký";
}

function createPdfReport(data, dongPhucSummary, sachVoSummary) {
  const templateDoc = DriveApp.getFileById(TEMPLATE_DOC_ID);
  let folder = DriveApp.getRootFolder();
  try { folder = DriveApp.getFolderById(OUTPUT_FOLDER_ID); } catch(e) {}

  const tempFile = templateDoc.makeCopy(`Bao_Cao_Dang_Ky_${data.fullName}`, folder);
  const tempDoc = DocumentApp.openById(tempFile.getId());
  const body = tempDoc.getBody();

  body.replaceText("{{HoTen}}", data.fullName || "N/A");
  body.replaceText("{{Email}}", data.email || "N/A");
  body.replaceText("{{NgaySinh}}", data.dob || "N/A");
  body.replaceText("{{Lop}}", data.class || "N/A");
  body.replaceText("{{GioiTinh}}", data.gender || "N/A");
  body.replaceText("{{DongPhuc}}", dongPhucSummary);
  body.replaceText("{{SachVo}}", sachVoSummary);
  body.replaceText("{{ThoiGian}}", new Date().toLocaleString("vi-VN"));

  tempDoc.saveAndClose();

  const pdfBlob = tempFile.getAs(MimeType.PDF);
  const finalPdfFile = folder.createFile(pdfBlob).setName(`PhieuDangKy_${data.fullName}.pdf`);
  tempFile.setTrashed(true);

  return finalPdfFile;
}

function sendEmailWithPdf(emailAddress, fullName, pdfFile) {
  if (!emailAddress) return;
  const subject = `[Newton Grammar School] Xác nhận Đăng ký Đồng phục và Sách vở - ${fullName}`;
  const body = `Kính gửi Phụ huynh học sinh ${fullName},\n\nTrường THPT Newton (CS1) xin xác nhận đã nhận được thông tin đăng ký Đồng phục và Sách vở của học sinh ${fullName} (Lớp 10T0) cho năm học 2026-2027.\n\nChi tiết đăng ký được đính kèm trong file PDF của email này.\n\nTrân trọng,\nBGH Trường THPT Newton.`;
  GmailApp.sendEmail(emailAddress, subject, body, {
    attachments: [pdfFile.getAs(MimeType.PDF)],
    name: "Newton Grammar School"
  });
}
