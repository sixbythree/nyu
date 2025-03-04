document.addEventListener('DOMContentLoaded', () => {
    const darkModeButton = document.getElementById('dark-mode-button');

    // Check if dark mode is already enabled
    if (localStorage.getItem('dark-mode') === 'enabled') {
        document.body.classList.add('dark-mode');
    }

    darkModeButton.addEventListener('click', function() {
        // Toggle dark mode class
        document.body.classList.toggle('dark-mode');
        
        // Save the current mode in localStorage
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('dark-mode', 'enabled');
        } else {
            localStorage.setItem('dark-mode', 'disabled');
        }
    });
});