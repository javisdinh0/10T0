document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');
    const genderRadios = document.querySelectorAll('input[name="gender"]');
    
    const sectionUniform = document.getElementById('sectionUniform');
    const maleUniforms = document.getElementById('maleUniforms');
    const femaleUniforms = document.getElementById('femaleUniforms');
    const unisexUniforms = document.getElementById('unisexUniforms');
    const btnClear = document.getElementById('btnClear');

    // Handle Gender Change to show/hide respective sections
    genderRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            try {
                // Show the uniform section wrapper
                sectionUniform.classList.remove('hidden');
                sectionUniform.style.display = 'block';
                unisexUniforms.classList.remove('hidden');
                unisexUniforms.style.display = 'block';

                if (this.value === 'Nam') {
                    maleUniforms.classList.remove('hidden');
                    maleUniforms.style.display = 'block';
                    femaleUniforms.classList.add('hidden');
                    femaleUniforms.style.display = 'none';
                    
                    // Clear female inputs
                    resetSectionInputs(femaleUniforms);
                } else if (this.value === 'Nữ') {
                    femaleUniforms.classList.remove('hidden');
                    femaleUniforms.style.display = 'block';
                    maleUniforms.classList.add('hidden');
                    maleUniforms.style.display = 'none';
                    
                    // Clear male inputs
                    resetSectionInputs(maleUniforms);
                }
            } catch(e) {
                console.error(e);
            }
        });
    });

    // ĐIỀN GOOGLE APPS SCRIPT WEB APP URL CỦA BẠN VÀO ĐÂY SAU KHI DEPLOY
    const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwcFPPLZtbdtxnGgzg--aW9ApRw0SfTdfdgigu8uC_quLC2kLq7jxWUFrV7MSSCw0lh/exec';

    // Helper for summary mapping (for receipt)
    function buildReceiptUniformSummary(d) {
        let items = [];
        if (d.male_pants_kaki_qty && d.male_pants_kaki_qty !== "0") items.push(`Quần kaki (Nam): ${d.male_pants_kaki_qty} x (Size ${d.male_pants_kaki_size})`);
        if (d.male_pants_short_qty && d.male_pants_short_qty !== "0") items.push(`Quần sooc (Nam): ${d.male_pants_short_qty} x (Size ${d.male_pants_short_size})`);
        if (d.male_shirt_short_qty && d.male_shirt_short_qty !== "0") items.push(`Áo sơ mi cộc tay (Nam): ${d.male_shirt_short_qty} x (Size ${d.male_shirt_short_size})`);
        if (d.male_shirt_long_qty && d.male_shirt_long_qty !== "0") items.push(`Áo sơ mi dài tay (Nam): ${d.male_shirt_long_qty} x (Size ${d.male_shirt_long_size})`);
        if (d.female_skirt_qty && d.female_skirt_qty !== "0") items.push(`Chân váy (Nữ): ${d.female_skirt_qty} x (Size ${d.female_skirt_size})`);
        if (d.female_shirt_short_qty && d.female_shirt_short_qty !== "0") items.push(`Áo sơ mi cộc tay (Nữ): ${d.female_shirt_short_qty} x (Size ${d.female_shirt_short_size})`);
        if (d.female_shirt_long_qty && d.female_shirt_long_qty !== "0") items.push(`Áo sơ mi dài tay (Nữ): ${d.female_shirt_long_qty} x (Size ${d.female_shirt_long_size})`);
        if (d.unisex_polo_white_qty && d.unisex_polo_white_qty !== "0") items.push(`Áo polo trắng: ${d.unisex_polo_white_qty} x (Size ${d.unisex_polo_white_size})`);
        if (d.unisex_polo_blue_qty && d.unisex_polo_blue_qty !== "0") items.push(`Áo polo xanh: ${d.unisex_polo_blue_qty} x (Size ${d.unisex_polo_blue_size})`);
        if (d.unisex_sport_summer_qty && d.unisex_sport_summer_qty !== "0") items.push(`Bộ thể thao hè: ${d.unisex_sport_summer_qty} x (Size ${d.unisex_sport_summer_size})`);
        return items.length > 0 ? "- " + items.join("\n- ") : "Không đăng ký";
    }

    function buildReceiptBooksSummary(d) {
        let items = [];
        if (d.sgk_vn_10 && d.sgk_vn_10 !== "0") items.push(`SGK VN Lớp 10: ${d.sgk_vn_10} bộ`);
        if (d.sgk_vn_11 && d.sgk_vn_11 !== "0") items.push(`SGK VN Lớp 11: ${d.sgk_vn_11} bộ`);
        if (d.sgk_vn_12 && d.sgk_vn_12 !== "0") items.push(`SGK VN Lớp 12: ${d.sgk_vn_12} bộ`);
        if (d.sgk_nn_10 && d.sgk_nn_10 !== "0") items.push(`SGK NN Lớp 10: ${d.sgk_nn_10} bộ`);
        if (d.sgk_nn_11 && d.sgk_nn_11 !== "0") items.push(`SGK NN Lớp 11: ${d.sgk_nn_11} bộ`);
        if (d.sgk_nn_12 && d.sgk_nn_12 !== "0") items.push(`SGK NN Lớp 12: ${d.sgk_nn_12} bộ`);
        if (d.notebook_qty && d.notebook_qty !== "" && d.notebook_qty !== "0") items.push(`Vở kẻ ngang: ${d.notebook_qty} quyển`);
        return items.length > 0 ? "- " + items.join("\n- ") : "Không đăng ký";
    }

    // Handle Form Submit
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Custom validation check before submitting
        let firstError = null;
        let hasError = false;
        
        const clothingItems = document.querySelectorAll('.clothing-item');
        clothingItems.forEach(item => {
            if (item.closest('.hidden')) return;
            const qtySelect = item.querySelector('select[name$="_qty"]');
            const sizeSelect = item.querySelector('select[name$="_size"]');
            const errorMsg = item.querySelector('.size-error-msg');
            
            if (qtySelect && sizeSelect && qtySelect.value !== "0" && sizeSelect.value === "") {
                item.classList.add('item-error');
                if (errorMsg) errorMsg.style.display = 'block';
                hasError = true;
                if (!firstError) firstError = item;
            }
        });
        
        if (hasError) {
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            alert("Vui lòng chọn size cho các trang phục bạn đã điền số lượng!");
            return; // Stop submission
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Đang gửi...';
        submitBtn.disabled = true;

        const formData = new FormData(form);
        const dataObj = Object.fromEntries(formData.entries());

        // Check if URL is configured
        if (GAS_WEB_APP_URL === 'YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE' || GAS_WEB_APP_URL.includes('YOUR_')) {
            alert("Bạn cần phải thay thế biến GAS_WEB_APP_URL trong script.js bằng đường link Web App thật của bạn sau khi deploy Google Apps Script!");
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            return;
        }

        // --- Generate Receipt Image before hiding form ---
        // Fill receipt template
        document.getElementById('rtFullName').textContent = dataObj.fullName || 'N/A';
        document.getElementById('rtEmail').textContent = dataObj.email || 'N/A';
        document.getElementById('rtDob').textContent = dataObj.dob ? dataObj.dob.split('-').reverse().join('/') : 'N/A';
        document.getElementById('rtClass').textContent = dataObj.class || 'N/A';
        document.getElementById('rtGender').textContent = dataObj.gender || 'N/A';
        document.getElementById('rtHeight').textContent = document.getElementById('calcHeight').value ? document.getElementById('calcHeight').value + ' cm' : 'Không nhập';
        document.getElementById('rtWeight').textContent = document.getElementById('calcWeight').value ? document.getElementById('calcWeight').value + ' kg' : 'Không nhập';
        document.getElementById('rtUniforms').textContent = buildReceiptUniformSummary(dataObj);
        document.getElementById('rtBooks').textContent = buildReceiptBooksSummary(dataObj);
        document.getElementById('rtTime').textContent = new Date().toLocaleString('vi-VN');

        const receiptTemplate = document.getElementById('receiptTemplate');
        
        // Use html2canvas to capture the receipt
        html2canvas(receiptTemplate, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL("image/png");
            const previewImg = document.createElement('img');
            previewImg.src = imgData;
            previewImg.style.width = '100%';
            previewImg.style.display = 'block';
            
            const container = document.getElementById('receiptPreviewContainer');
            container.innerHTML = '';
            container.appendChild(previewImg);

            const downloadBtn = document.getElementById('btnDownloadReceipt');
            downloadBtn.href = imgData;
            const safeName = (dataObj.fullName || 'HocSinh').replace(/[^a-zA-Z0-9]/g, '_');
            downloadBtn.download = `Bien_Nhan_${safeName}.png`;
            downloadBtn.classList.remove('hidden');

            // Send to Google Apps Script in background
            fetch(GAS_WEB_APP_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify(dataObj)
            })
            .then(() => {
                form.style.display = 'none';
                const formHeader = document.querySelector('.form-header');
                if(formHeader) formHeader.style.display = 'none';
                document.getElementById('successMessage').classList.remove('hidden');
            })
            .catch(error => {
                console.error('Error!', error);
                alert('Có lỗi xảy ra khi gửi dữ liệu:\n' + error.message + '\n\nVui lòng thử lại hoặc liên hệ GVCN để được hỗ trợ.');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
        }).catch(error => {
            console.error("html2canvas error:", error);
            // Fallback if canvas fails
            fetch(GAS_WEB_APP_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(dataObj)
            }).then(() => {
                form.style.display = 'none';
                const formHeader = document.querySelector('.form-header');
                if(formHeader) formHeader.style.display = 'none';
                document.getElementById('successMessage').classList.remove('hidden');
            });
        });
    });

    // Handle Clear Button
    btnClear.addEventListener('click', function() {
        if(confirm('Bạn có chắc chắn muốn xóa toàn bộ thông tin đã nhập?')) {
            form.reset();
            maleUniforms.classList.add('hidden');
            femaleUniforms.classList.add('hidden');
            unisexUniforms.classList.add('hidden');
            
            // Remove error classes
            document.querySelectorAll('.form-group.error').forEach(el => {
                el.classList.remove('error');
            });
            document.querySelectorAll('.clothing-item.item-error').forEach(el => {
                el.classList.remove('item-error');
            });
            
            // Reset custom select styling
            document.querySelectorAll('select').forEach(select => {
                select.style.borderColor = '#d1d5db';
                select.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            });
            
            document.getElementById('calcResult').style.display = 'none';
        }
    });

    // Validation logic
    function validateForm() {
        let isValid = true;
        
        // Reset previous errors
        document.querySelectorAll('.form-group.error').forEach(el => {
            el.classList.remove('error');
        });
        document.querySelectorAll('.clothing-item.item-error').forEach(el => {
            el.classList.remove('item-error');
        });

        // Validate Email
        const email = document.getElementById('email');
        if (!email.value || !/^\S+@\S+\.\S+$/.test(email.value)) {
            showError(email);
            isValid = false;
        }

        // Validate Full Name
        const fullName = document.getElementById('fullName');
        if (!fullName.value.trim()) {
            showError(fullName);
            isValid = false;
        }

        // Validate DOB
        const dob = document.getElementById('dob');
        if (!dob.value) {
            showError(dob);
            isValid = false;
        }

        // Validate Gender
        const genderSelected = Array.from(genderRadios).some(radio => radio.checked);
        if (!genderSelected) {
            const genderGroup = genderRadios[0].closest('.form-group');
            genderGroup.classList.add('error');
            isValid = false;
        }

        // Validate size: món đồng phục đã chọn số lượng (>0) thì bắt buộc chọn size
        document.querySelectorAll('.clothing-item').forEach(item => {
            const sizeSel = item.querySelector('.uniform-size-select');
            if (!sizeSel) return; // các mục sách không có size
            const qtySel = item.querySelector('select[name$="_qty"]');
            if (!qtySel) return;

            // Bỏ qua section đang ẩn (đã được reset về 0)
            const parentGroup = sizeSel.closest('.clothing-items');
            if (parentGroup && parentGroup.classList.contains('hidden')) return;

            if (qtySel.value && qtySel.value !== '0' && !sizeSel.value) {
                item.classList.add('item-error');

                // Chèn thông báo lỗi nếu chưa có
                if (!item.querySelector('.size-error-msg')) {
                    const msg = document.createElement('p');
                    msg.className = 'size-error-msg';
                    msg.textContent = 'Vui lòng chọn size cho món đã đăng ký số lượng.';
                    item.appendChild(msg);
                }
                isValid = false;
            }
        });

        // Scroll to first error
        if (!isValid) {
            const firstError = document.querySelector('.form-group.error, .clothing-item.item-error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        return isValid;
    }

    function showError(inputElement) {
        inputElement.closest('.form-group').classList.add('error');
    }

    function resetSectionInputs(section) {
        const selects = section.querySelectorAll('select');
        selects.forEach(select => {
            select.value = select.options[0].value;
            select.style.borderColor = '#d1d5db';
            select.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        });
    }

    // Interactive Select Fields styling
    const allSelects = document.querySelectorAll('select');
    allSelects.forEach(select => {
        select.addEventListener('change', function() {
            if (this.value && this.value !== '0' && this.value !== '') {
                this.style.borderColor = 'var(--primary-color)';
                this.style.backgroundColor = 'rgba(79, 70, 229, 0.05)';
            } else {
                this.style.borderColor = '#d1d5db';
                this.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            }
            // Xóa cảnh báo thiếu size khi người dùng thao tác lại trong món đó
            const parentItem = this.closest('.clothing-item');
            if (parentItem) parentItem.classList.remove('item-error');
        });
    });

    // Size Calculator Logic
    const calcHeight = document.getElementById('calcHeight');
    const calcWeight = document.getElementById('calcWeight');
    const calcResult = document.getElementById('calcResult');
    const calcError = document.getElementById('calcError');
    const suggestedSizeDisplay = document.getElementById('suggestedSizeDisplay');
    const btnApplySize = document.getElementById('btnApplySize');
    let currentSuggestedSize = '';

    // Bảng size chuẩn (khớp với Bảng size trong modal).
    // Cân nặng quyết định size, chiều cao dùng để kiểm tra tính nhất quán.
    // Chỉ gợi ý khi CẢ chiều cao và cân nặng cùng khớp một size; nếu không -> cảnh báo tự chọn.
    const SIZE_CHART = [
        { size: 'xs',  wMin: 40, wMax: 50, hMin: 138, hMax: 150 }, // gộp Số 5 + XS
        { size: 's',   wMin: 50, wMax: 55, hMin: 148, hMax: 157 },
        { size: 'm',   wMin: 55, wMax: 60, hMin: 155, hMax: 163 },
        { size: 'l',   wMin: 60, wMax: 65, hMin: 161, hMax: 171 },
        { size: 'xl',  wMin: 65, wMax: 70, hMin: 169, hMax: 178 },
        { size: '2xl', wMin: 70, wMax: 75, hMin: 176, hMax: 182 },
        { size: '3xl', wMin: 75, wMax: 80, hMin: 176, hMax: 183 },
        { size: '4xl', wMin: 80, wMax: 85, hMin: 176, hMax: 184 },
        { size: '5xl', wMin: 85, wMax: 90, hMin: 176, hMax: 185 },
        { size: '6xl', wMin: 90, wMax: 95, hMin: 176, hMax: 186 }
    ];

    function showCalcWarning(msg) {
        calcResult.style.display = 'none';
        calcError.textContent = msg;
        calcError.style.display = 'block';
        currentSuggestedSize = '';
    }

    function calculateSize() {
        const h = parseFloat(calcHeight.value);
        const w = parseFloat(calcWeight.value);

        // 1. Bắt buộc nhập ĐẦY ĐỦ cả chiều cao và cân nặng
        if (!h || !w) {
            showCalcWarning('Vui lòng nhập cả chiều cao và cân nặng để xem gợi ý.');
            return;
        }

        // 2. Tìm size theo cân nặng
        const byWeight = SIZE_CHART.find(s => w >= s.wMin && w < s.wMax);

        // Ngoài bảng size tiêu chuẩn (quá nhỏ, quá lớn, hoặc rơi vào 7XL không có trong danh sách chọn)
        if (!byWeight) {
            showCalcWarning('Số đo nằm ngoài bảng size tiêu chuẩn. Vui lòng bấm "Bảng size & Hướng dẫn chọn" để tự chọn size phù hợp.');
            return;
        }

        // 3. Kiểm tra chiều cao có khớp với size theo cân nặng không
        const heightMatches = h >= byWeight.hMin && h <= byWeight.hMax;
        
        const btnApplySizeAlt = document.getElementById('btnApplySizeAlt');
        
        if (!heightMatches) {
            // Tìm size tương ứng với chiều cao
            const byHeight = SIZE_CHART.find(s => h >= s.hMin && h <= s.hMax);
            
            if (byHeight && byHeight.size !== byWeight.size) {
                // Hiện cả 2 lựa chọn
                calcError.style.display = 'none';
                suggestedSizeDisplay.innerHTML = `${byWeight.size.toUpperCase()}</span> hoặc <span class="size-badge">${byHeight.size.toUpperCase()}`;
                
                // Cập nhật text 2 nút
                btnApplySize.textContent = `Áp dụng size ${byWeight.size.toUpperCase()}`;
                currentSuggestedSize = byWeight.size;
                
                btnApplySizeAlt.textContent = `Áp dụng size ${byHeight.size.toUpperCase()}`;
                btnApplySizeAlt.style.display = 'inline-block';
                btnApplySizeAlt.dataset.size = byHeight.size;
                
                calcResult.style.display = 'flex';
                return;
            } else {
                showCalcWarning('Chiều cao và cân nặng chênh lệch lớn ngoài bảng size. Vui lòng tự chọn size phù hợp.');
                return;
            }
        }

        // 4. Cả hai khớp -> đưa ra gợi ý 1 size
        calcError.style.display = 'none';
        currentSuggestedSize = byWeight.size;
        suggestedSizeDisplay.textContent = byWeight.size.toUpperCase();
        btnApplySize.textContent = 'Áp dụng cho tất cả đồ';
        btnApplySizeAlt.style.display = 'none';
        calcResult.style.display = 'flex';
    }

    calcHeight.addEventListener('input', calculateSize);
    calcWeight.addEventListener('input', calculateSize);

    function applySizeToAll(sizeToApply) {
        if (!sizeToApply) return;
        
        // Apply to all visible select size elements
        const sizeSelects = document.querySelectorAll('.uniform-size-select');
        sizeSelects.forEach(select => {
            // Only apply if the section is not hidden
            const parentSection = select.closest('.clothing-items');
            if (parentSection && !parentSection.classList.contains('hidden')) {
                // Check if the size exists in the options
                let optionExists = Array.from(select.options).some(opt => opt.value === sizeToApply);
                if(optionExists) {
                    select.value = sizeToApply;
                    // Trigger change to update styling
                    select.dispatchEvent(new Event('change'));
                }
            }
        });
        
        alert(`Đã áp dụng size ${sizeToApply.toUpperCase()} cho tất cả các đồ đồng phục bạn có thể chọn!`);
    }

    btnApplySize.addEventListener('click', function() {
        applySizeToAll(currentSuggestedSize);
    });
    
    const btnApplySizeAlt = document.getElementById('btnApplySizeAlt');
    if(btnApplySizeAlt) {
        btnApplySizeAlt.addEventListener('click', function() {
            applySizeToAll(this.dataset.size);
        });
    }

    // ===== Cải thiện trải nghiệm =====
    // Đóng modal đang mở bằng phím Esc
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(m => closeModalBtn(m.id));
        }
    });

    // Tránh input number bị đổi giá trị ngoài ý muốn khi lăn chuột
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('wheel', function() { this.blur(); });
    });

    // Ngày sinh: không cho chọn ngày trong tương lai
    const dobInput = document.getElementById('dob');
    if (dobInput) {
        dobInput.max = new Date().toISOString().split('T')[0];
    }
});

// Modal functions in global scope for onclick attributes
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
}

function closeModalBtn(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

function closeModal(event, modalId) {
    if (event.target.id === modalId) {
        closeModalBtn(modalId);
    }
}
