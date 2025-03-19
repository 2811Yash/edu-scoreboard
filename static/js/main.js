
document.addEventListener('DOMContentLoaded', function() {
    // Enable Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Auto-hide alerts after 5 seconds
    setTimeout(function() {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(function(alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
    }, 5000);

    // File input handling
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(function(input) {
        const label = input.nextElementSibling;
        if (label && label.classList.contains('custom-file-label')) {
            input.addEventListener('change', function(e) {
                const fileName = e.target.files[0].name;
                label.textContent = fileName;
            });
        }
    });
});
