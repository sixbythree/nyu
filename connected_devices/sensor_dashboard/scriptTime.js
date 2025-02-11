// Function to update the current time
function updateTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    // Format the time to display as HH:MM:SS (you can customize the format)
    const formattedTime = `${hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    
    // Set the current time in the #current-time span
    document.getElementById('current-time').textContent = formattedTime;
}

// Call updateTime once to set the initial time, then every second
updateTime();  // Call once immediately
setInterval(updateTime, 1000);  // Update every second