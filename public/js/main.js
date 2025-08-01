// Any client-side JavaScript can go here
document.addEventListener('DOMContentLoaded', function() {
    // Flash message auto-dismiss
    const flashMessages = document.querySelectorAll('.flash-message');
    if (flashMessages.length > 0) {
        flashMessages.forEach(message => {
            setTimeout(() => {
                message.style.display = 'none';
            }, 5000);
        });
    }
    
    // Form validation can be added here
});