document.addEventListener('DOMContentLoaded', function() {
    // Wizard navigation
    const steps = document.querySelectorAll('.wizard-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    const nextButtons = document.querySelectorAll('.next-btn');
    const prevButtons = document.querySelectorAll('.prev-btn');
    const generateBtn = document.getElementById('generateBtn');
    const modal = document.getElementById('idCardModal');
    const closeBtn = document.querySelector('.close-btn');
    const downloadBtn = document.getElementById('downloadBtn');
    const printBtn = document.getElementById('printBtn');
    
    let currentStep = 1;
    
    // Initialize photo preview
    const photoUpload = document.getElementById('photoUpload');
    const photoPreview = document.getElementById('photoPreview');
    const noPhotoText = document.getElementById('noPhotoText');
    const signatureUpload = document.getElementById('signatureUpload');
    
    // Show current step
    function showStep(step) {
        steps.forEach(s => s.classList.remove('active'));
        progressSteps.forEach(s => s.classList.remove('active'));
        
        document.querySelector(`.wizard-step[data-step="${step}"]`).classList.add('active');
        document.querySelector(`.progress-step[data-step="${step}"]`).classList.add('active');
        
        currentStep = step;
    }
    
    // Next button click
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Validate current step before proceeding
            if (validateStep(currentStep)) {
                if (currentStep === 3) {
                    // On the last step before generate, update the review section
                    updateReviewSection();
                }
                showStep(currentStep + 1);
            }
        });
    });
    
    // Previous button click
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            showStep(currentStep - 1);
        });
    });
    
    // Validate step fields
    function validateStep(step) {
        let isValid = true;
        const currentStepElement = document.querySelector(`.wizard-step[data-step="${step}"]`);
        
        // Check all required inputs in current step
        const inputs = currentStepElement.querySelectorAll('input[required], select[required]');
        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.style.borderColor = 'red';
                isValid = false;
                
                // Remove error highlight when user starts typing
                input.addEventListener('input', function() {
                    if (input.value.trim()) {
                        input.style.borderColor = '#ddd';
                    }
                });
            }
        });
        
        // Special validation for photo upload
        if (step === 3 && !photoUpload.files[0]) {
            photoUpload.style.borderColor = 'red';
            isValid = false;
            
            photoUpload.addEventListener('change', function() {
                if (photoUpload.files[0]) {
                    photoUpload.style.borderColor = '#ddd';
                }
            });
        }
        
        return isValid;
    }
    
    // Photo upload preview
    photoUpload.addEventListener('change', function(e) {
        if (e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(event) {
                photoPreview.src = event.target.result;
                photoPreview.style.display = 'block';
                noPhotoText.style.display = 'none';
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    
    // Signature upload preview
    signatureUpload.addEventListener('change', function(e) {
        if (e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('cardSignature').src = event.target.result;
                document.getElementById('cardSignature').style.display = 'block';
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    
    // Update review section
    function updateReviewSection() {
        // Personal Info
        const personalInfo = `
            <p><strong>Name:</strong> ${document.getElementById('firstName').value} ${document.getElementById('lastName').value}</p>
            <p><strong>Date of Birth:</strong> ${formatDate(document.getElementById('dob').value)}</p>
            <p><strong>Gender:</strong> ${document.getElementById('gender').value}</p>
            <p><strong>Email:</strong> ${document.getElementById('email').value}</p>
            <p><strong>Phone:</strong> ${document.getElementById('phone').value}</p>
        `;
        document.getElementById('personalInfoReview').innerHTML = personalInfo;
        
        // Organization Info
        const orgInfo = `
            <p><strong>Company:</strong> ${document.getElementById('companyName').value}</p>
            <p><strong>Department:</strong> ${document.getElementById('department').value}</p>
            <p><strong>Position:</strong> ${document.getElementById('position').value}</p>
            <p><strong>Employee ID:</strong> ${document.getElementById('employeeId').value || 'Auto-generated'}</p>
            <p><strong>Issue Date:</strong> ${formatDate(document.getElementById('issueDate').value)}</p>
            <p><strong>Expiry Date:</strong> ${document.getElementById('expiryDate').value ? formatDate(document.getElementById('expiryDate').value) : 'N/A'}</p>
        `;
        document.getElementById('orgInfoReview').innerHTML = orgInfo;
    }
    
    // Format date for display
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }
    
    // Generate ID Card
    generateBtn.addEventListener('click', function() {
        if (validateStep(currentStep)) {
            // Generate unique ID if not provided
            const employeeId = document.getElementById('employeeId').value || generateUniqueId();
            
            // Set card data
            document.getElementById('cardFullName').textContent = 
                `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}`;
            document.getElementById('cardIdNumber').textContent = employeeId;
            document.getElementById('cardPosition').textContent = document.getElementById('position').value;
            document.getElementById('cardDepartment').textContent = document.getElementById('department').value;
            document.getElementById('cardCompanyName').textContent = document.getElementById('companyName').value;
            document.getElementById('cardIssueDate').textContent = formatDate(document.getElementById('issueDate').value);
            document.getElementById('cardExpiryDate').textContent = document.getElementById('expiryDate').value ? 
                formatDate(document.getElementById('expiryDate').value) : 'N/A';
            document.getElementById('cardCompanyContact').textContent = document.getElementById('phone').value;
            
            // Set photo
            if (photoUpload.files[0]) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    document.getElementById('cardPhoto').src = event.target.result;
                };
                reader.readAsDataURL(photoUpload.files[0]);
            }
            
            // Generate QR code with ID data
            const qrContainer = document.getElementById('cardQrCode');
            qrContainer.innerHTML = '';
            const qrData = JSON.stringify({
                name: `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}`,
                id: employeeId,
                company: document.getElementById('companyName').value,
                position: document.getElementById('position').value,
                issueDate: document.getElementById('issueDate').value
            });
            new QRCode(qrContainer, {
                text: qrData,
                width: 100,
                height: 100
            });
            
            // Show modal
            modal.style.display = 'block';
        }
    });
    
    // Generate unique ID
    function generateUniqueId() {
        const prefix = document.getElementById('companyName').value.substring(0, 3).toUpperCase();
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        return `${prefix}-${randomNum}`;
    }
    
    // Close modal
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Download ID card as image
    downloadBtn.addEventListener('click', function() {
        // In a real implementation, you would use html2canvas or similar library
        // This is a simplified version
        alert('In a complete implementation, this would download the ID card as an image.');
    });
    
    // Print ID card
    printBtn.addEventListener('click', function() {
        window.print();
    });
    
    // Initialize first step
    showStep(1);
});