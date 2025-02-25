// Importing data fetched from sensor
import { dFormatted, getResponse } from "./script.js"; 


// Time Clock
let formattedTime;
function updateTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    // Formatting the time to display as HH:MM:SS *GPT
    formattedTime = `${hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    
    // Set the current time in the #current-time span
    document.getElementById('current-time').textContent = formattedTime;
}

// Call updateTime once to set the initial time, then every second
// TODO: Explore setInterval
updateTime();  // Call once immediately
setInterval(updateTime, 1000);  // Update every second


const ntx = document.getElementById('northF');
const stx = document.getElementById('southF');
const timeLog = {};


// Intializing dictiionary for current and current sensorData
for (let hour = 0; hour < 24; hour++) {
    timeLog[`${hour}:00`] = 0;  // Set each hour as key and initialize value as 0
}
  

// Preparing sensorData to be pushed to chart
let sensorData = []
for (let hour = 0; hour < 24; hour++) {
    const hourKey = `${hour}:00`;  // Create the key, e.g., "0:00", "1:00"
    sensorData.push(timeLog[hourKey]);  // Push the value of that hour into the data array
  }
  



// North Floor Data Chart 
const chartInstance = new Chart(ntx, {
    type: 'bar',
    data: {
    labels: ['12am', '1am', '2am', '3am', '4am', '5am', '6am',
             '7am', '8am', '9am', '10am', '11am', '12pm',
             '1pm', '2pm', '3pm', '4pm', '5pm', '6pm',
             '7pm', '8pm', '9pm', '10pm', '11pm'
    ],
    datasets: [{
        label: `# of People in North Floor ${formattedTime}`,
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



// South Floor Data Chart 
new Chart(stx, {
    type: 'bar',
    data: {
    labels: ['12am', '1am', '2am', '3am', '4am', '5am', '6am',
             '7am', '8am', '9am', '10am', '11am', '12pm',
             '1pm', '2pm', '3pm', '4pm', '5pm', '6pm',
             '7pm', '8pm', '9pm', '10pm', '11pm'
    ],
    datasets: [{
        label: '# of People in South Floor',
        data: [20, 17, 9, 4, 12, 7, 13, 18, 11, 19, 3, 6, 8, 2, 10, 5, 16, 15, 4, 9, 1, 3, 20, 7],
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
    // Update the `sensorData` array with new readings
    for (let hour = 0; hour < 24; hour++) {
      const hourKey = `${hour}:00`;
      if (hourKey.slice(0,2) === formattedTime.slice(0,2)) {
        console.log("The time matches!");
        timeLog[hourKey] += 1;  // Simulate sensor picking up new reading (e.g., increase by 1)
        sensorData[hour] = timeLog[hourKey];  // Update the corresponding sensorData value
    }
    }
  
    // Step 3: Update the chart with new data
    //chartInstance.data.datasets[0].label = `# of People in North Floor ${formattedTime}`
    chartInstance.update();  // This re-renders the chart with the updated data
  }
  
  // Simulate calling the update function after some time (e.g., every minute or every new sensor reading)
  setInterval(updateChart, 5000);  // Update every 5 seconds for demo purposes
  