// viewToggle.js

// Get the elements for each view
const northView = document.getElementById('north-view');
const southView = document.getElementById('south-view');
const splitView = document.getElementById('split-view');
const chartN = document.getElementById('chartN');
const chartS = document.getElementById('chartS');

// Initially show both charts
chartN.style.display = 'block';
chartS.style.display = 'block';

// Event listeners for the views
northView.addEventListener('click', () => {
    chartN.style.display = 'block';  // Show North chart
    chartS.style.display = 'none';   // Hide South chart
});

southView.addEventListener('click', () => {
    chartN.style.display = 'none';   // Hide North chart
    chartS.style.display = 'block';  // Show South chart
});

splitView.addEventListener('click', () => {
    chartN.style.display = 'block';  // Show North chart
    chartS.style.display = 'block';  // Show South chart
});