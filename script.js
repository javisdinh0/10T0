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
    const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxDfsGdT8fGuseflyitxgxl8_oJbK2wTbC9SSke5Za0vKlGg6irfFvgUb6IOAuiO5mT/exec';

    // Handle Form Submit
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            const submitBtn = form.querySelector('.btn-submit');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Đang gửi...';
            submitBtn.disabled = true;

            // Collect data
            const formData = new FormData(form);
            const dataObj = Object.fromEntries(formData.entries());

            // Check if URL is configured
            if (GAS_WEB_APP_URL === 'YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE') {
                alert("Bạn cần phải thay thế biến GAS_WEB_APP_URL trong script.js bằng đường link Web App thật của bạn sau khi deploy Google Apps Script!");
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                return;
            }

            // Send to Google Apps Script
            fetch(GAS_WEB_APP_URL, {
                method: 'POST',
                mode: 'no-cors', // Dùng no-cors để bỏ qua lỗi preflight do Google tự động redirect
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify(dataObj)
            })
            .then(() => {
                // Với no-cors, response sẽ luôn là opaque (bảo mật), nên cứ mặc định là thành công nếu không có throw exception
                form.style.display = 'none';
                document.querySelector('.form-header').style.display = 'none';
                document.getElementById('successMessage').classList.remove('hidden');
            })
            .catch(error => {
                console.error('Error!', error.message);
                alert('Có lỗi xảy ra khi gửi dữ liệu. Vui lòng thử lại sau.');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
        }
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

        // Scroll to first error
        if (!isValid) {
            const firstError = document.querySelector('.form-group.error');
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

    function calculateSize() {
        const h = parseInt(calcHeight.value);
        const w = parseInt(calcWeight.value);
        
        if (!h || !w) {
            calcResult.style.display = 'none';
            calcError.style.display = 'block';
            currentSuggestedSize = '';
            return;
        }
        
        calcError.style.display = 'none';
        
        let size = '';
        
        // Simple logic based on the chart
        if (h <= 145 && w <= 45) size = 'xs'; // Combining Số 5 and XS for simplicity
        else if (h <= 145 && w <= 50) size = 'xs';
        else if (h <= 155 && w <= 55) size = 's';
        else if (h <= 160 && w <= 60) size = 'm';
        else if (h <= 170 && w <= 65) size = 'l';
        else if (h <= 176 && w <= 70) size = 'xl';
        else if (h <= 180 && w <= 75) size = '2xl';
        else if (h <= 180 && w <= 80) size = '3xl';
        else if (h <= 180 && w <= 85) size = '4xl';
        else if (h <= 180 && w <= 90) size = '5xl';
        else if (h <= 180 && w <= 95) size = '6xl';
        else size = '7xl';

        // Additional safeguard for edge cases
        if(w > 95) size = '7xl';
        if(w < 40) size = 'xs';

        currentSuggestedSize = size;
        suggestedSizeDisplay.textContent = size.toUpperCase();
        calcResult.style.display = 'flex';
    }

    calcHeight.addEventListener('input', calculateSize);
    calcWeight.addEventListener('input', calculateSize);

    btnApplySize.addEventListener('click', function() {
        if (!currentSuggestedSize) return;
        
        // Apply to all visible select size elements
        const sizeSelects = document.querySelectorAll('.uniform-size-select');
        sizeSelects.forEach(select => {
            // Only apply if the section is not hidden
            const parentSection = select.closest('.clothing-items');
            if (parentSection && !parentSection.classList.contains('hidden')) {
                // Check if the size exists in the options
                let optionExists = Array.from(select.options).some(opt => opt.value === currentSuggestedSize);
                if(optionExists) {
                    select.value = currentSuggestedSize;
                    // Trigger change to update styling
                    select.dispatchEvent(new Event('change'));
                }
            }
        });
        
        alert(`Đã áp dụng size ${currentSuggestedSize.toUpperCase()} cho tất cả các đồ đồng phục bạn có thể chọn!`);
    });
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
