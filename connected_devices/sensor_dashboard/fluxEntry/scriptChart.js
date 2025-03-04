// Importing data fetched from sensor
import {MRD} from "./script.js"; 

let population=0;

// Time Clock
let currentTime;
function updateTime() {
    
    currentTime = new Date().toLocaleTimeString([], { hour12: false }) 

    // Alternative way
    // const now = new Date();
    // const hours = now.getHours();
    // const minutes = now.getMinutes();
    // const seconds = now.getSeconds();
    
    // // Formatting the time to display as HH:MM:SS *GPT
    // currentTime = `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    document.getElementById('current-time').textContent = currentTime; // Set the current time in the #current-time span
}


// Call updateTime once to set the initial time, then every second
updateTime();  // Call once immediately
setInterval(updateTime, 1000);  // Update every second

// Set Check-in Variable
let lastCheckIn = currentTime; 


let isMRDPopulated = false;  // Flag to check if MRD data is populated

// Function to update MRD and set the flag
function updateMRD() {
    if (MRD && Object.keys(MRD).length > 0) {  // Check if MRD has data
        isMRDPopulated = true;
        console.log('MRD ready!')
    } else{
        console.log('MRD is not populated yet, waiting...');
    }
}

async function waitForMRD() {
    while (!isMRDPopulated) {
        updateMRD();  // Try updating MRD
        console.log("Waiting for MRD...");
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before checking again
    }
    console.log("MRD is populated, proceeding...");
}


await waitForMRD();


//Setting Up Chart
// const mrd = document.getElementById('movement');
const itx = document.getElementById('inflow');
const timeLog = {};


// Intializing dictionary for current sensorData
for (let hour = 0; hour < 24; hour++) {
    timeLog[`${hour}:00`] = 0;  // Set each hour as key and initialize value as 0
}
  
// Preparing sensorData to be pushed to chart
let sensorData = []
for (let hour = 0; hour < 24; hour++) {
    const hourKey = `${hour}:00`;  // Create the key, e.g., "0:00", "1:00"
    sensorData.push(timeLog[hourKey]);  // Push the value of that hour into the data array
  }

console.log(timeLog)


// Get canvas element
const ctx = document.getElementById('movement');

// Function to update the motion detection chart
function updateMotionChart() {

    const motionData = MRD["sensorReadings"];  // Extract sensor readings

    // Generate labels as sequential time indices
    const labels = motionData.map((_, index) => `T${index + 1}`);

    // If chart instance exists, update it
    if (window.chartInstanceM) {
        window.chartInstanceM.data.labels = labels;
        window.chartInstanceM.data.datasets[0].data = motionData;
        window.chartInstanceM.update();  // Refresh chart
    } else {
        // Create new chart
        window.chartInstanceM = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,  // X-axis labels
                datasets: [{
                    label: "Motion Detection Readings",
                    data: motionData,  // Y-axis values
                    borderColor: "blue",
                    borderWidth: 2,
                    pointBackgroundColor: "blue",
                    pointRadius: 3,
                    tension: 0.3 // Smooth curve effect
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: { grid: { display: false }, title: { display: true, text: "Time Index" } },
                    y: { grid: { display: true }, title: { display: true, text: "Sensor Readings" }, beginAtZero: false }
                },
                plugins: { legend: { display: true } }
            }
        });
    }
}

// Call the function initially
updateMotionChart();

// Set an interval to update the chart every 5 seconds
setInterval(updateMotionChart, 5000);

  

// Inflow Floor Data Chart 
const chartInstanceI = new Chart(itx, {
    type: 'bar',
    data: {
    labels: ['12am', '1am', '2am', '3am', '4am', '5am', '6am',
             '7am', '8am', '9am', '10am', '11am', '12pm',
             '1pm', '2pm', '3pm', '4pm', '5pm', '6pm',
             '7pm', '8pm', '9pm', '10pm', '11pm'
    ],
    datasets: [{
        label: `# of People in North Floor ${currentTime}`,
        data: sensorData, //: [timeLog['0:00'], timeLog['0:00'], timeLog['0:00'], 11, 14, 10, 19, 16, 20, 17, 2, 4, 3, 1, 6, 3, 5, 7, 8, 4, 9, 2, 1, 5],
        borderWidth: 1
    }]
    },
    options: {
    scales: {
        x: {
            grid: {
                display: false // Disable vertical grid lines
            }
        },
        y: {
            grid: {
                display: true // Enable horizontal grid lines
            },
            beginAtZero: true
        }
    }
    }
});






// Updating chart dynamically with new data
function updateChart() {

    // // If most recent data has been fetched
    // if (!isMRDPopulated) {
    //     updateMRD();
    //     return;  // If MRD is not populated, exit the function early
    // } 

    // Update the `sensorData` array with new readings for current hour
    if (currentTime.slice(0,2) === MRD['timestamp'].slice(0,2)) {
        
        console.log("Most Recent Data Time Record:", MRD['timestamp'])
        console.log("Last Check-in:", lastCheckIn)        
        
        // Since our last time check-in, did another person approach?
        // MRD provides our Most Recent Data for movement detection (non 0 sensor readings)

        // If the timestamp for our Most Recent Data entry is greater than our last check-in
        // Determine if someone approached or departed.

        if (MRD['timestamp']>=lastCheckIn){
            
            lastCheckIn=currentTime; // Update last check-in

            // Negative slope indicates a person approaching
            if (MRD['slope']<0){  
                console.log("Somebody Approaching")
                timeLog[`${Number(currentTime.slice(0,2))}:00`] += 1; 
                population+=1; 
            } 

            // Positive slope indicates a person departing
            else if (MRD['slope']>0){
                console.log("Somebody Departing")
                timeLog[`${Number(currentTime.slice(0,2))}:00`] -= 1;  
                population-=1;
            } 

            // Slope of 0 indicates no movement
            else{
                timeLog[`${Number(currentTime.slice(0,2))}:00`] += 0;
            }

            // Updating sensor record with new movement data
            sensorData[Number(currentTime.slice(0,2))] = timeLog[`${Number(currentTime.slice(0,2))}:00`];  // Update the corresponding sensorData value
        }
    }
    console.log(timeLog)

    document.getElementById('population').innerHTML = population;

    // Step 3: Update the chart with new data
    //chartInstance.data.datasets[0].label = `# of People in North Floor ${formattedTime}`
    chartInstanceI.update();  // This re-renders the chart with the updated data
  }

  

  // Simulate calling the update function after some time (e.g., every minute or every new sensor reading)
  setInterval(updateChart, 5000);  // Update every 5 seconds for demo purposes
  