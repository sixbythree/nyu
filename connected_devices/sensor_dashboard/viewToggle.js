// Get the elements for each view and the chart containers
const northView = document.getElementById('north-view');
const southView = document.getElementById('south-view');
const splitView = document.getElementById('split-view');
const chartN = document.getElementById('chartN');
const chartS = document.getElementById('chartS');

// Initially show both charts and apply default border-radius
chartN.style.display = 'block';
chartS.style.display = 'block';
chartN.classList.remove('single-chart');
chartS.classList.remove('single-chart');

// Event listeners for the views
northView.addEventListener('click', () => {
    chartN.style.display = 'block';  // Show North chart
    chartS.style.display = 'none';   // Hide South chart
    chartN.classList.add('single-chart');  // Add single-chart class to apply larger border-radius
    chartS.classList.remove('single-chart');
    chartN.classList.add('chart-container');  // Ensure it stays within the chart container
});

southView.addEventListener('click', () => {
    chartN.style.display = 'none';   // Hide North chart
    chartS.style.display = 'block';  // Show South chart
    chartS.classList.add('single-chart');  // Add single-chart class to apply larger border-radius
    chartN.classList.remove('single-chart');
    chartS.classList.add('chart-container');  // Ensure it stays within the chart container
});

splitView.addEventListener('click', () => {
    chartN.style.display = 'block';  // Show North chart
    chartS.style.display = 'block';  // Show South chart
    chartN.classList.remove('single-chart'); // Remove the single-chart class when both are visible
    chartS.classList.remove('single-chart');
    chartN.classList.add('chart-container');  // Ensure it stays within the chart container
    chartS.classList.add('chart-container');  // Ensure it stays within the chart container
});