let currentDate;
let currentTime;
const ctx = document.getElementById("movement"); // Get canvas element
const itx = document.getElementById("inflow");
let sensorData = new Array(24).fill(0);
let dateToDisplay = new Date();
let prevDayBtn = document.getElementById("prevDay");
let nextDayBtn = document.getElementById("nextDay");
let dateDisplay = document.getElementById("dateDisplay");

console.log(sensorData);
//--------------------------------------------------------------------------------------------------------------------

// Time Clock

function updateTime() {
  currentDate = new Date().toISOString(); //.toLocaleString([], { hour12: false });
  currentTime = currentDate.slice(11, 19);
  document.getElementById("current-time").textContent = currentTime; // Set the current time in the #current-time span
}

updateTime(); // Call once immediately
setInterval(updateTime, 1000); // Update every second
//--------------------------------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------------------------------

//Setting Up Motion Chart

// Function to update the motion detection chart
export function updateMotionChart(MRD) {
  const motionData = MRD["sensorReadings"]; // Extract sensor readings

  // Generate labels as sequential time indices
  const labels = motionData.map((_, index) => `T${index + 1}`);

  // If chart instance exists, update it
  if (window.chartInstanceM) {
    window.chartInstanceM.data.labels = labels;
    window.chartInstanceM.data.datasets[0].data = motionData;
    window.chartInstanceM.update(); // Refresh chart
  } else {
    // Create new chart
    window.chartInstanceM = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels, // X-axis labels
        datasets: [
          {
            label: "Motion Detection Readings",
            data: motionData, // Y-axis values
            borderColor: "blue",
            borderWidth: 2,
            pointBackgroundColor: "blue",
            pointRadius: 3,
            tension: 0.3, // Smooth curve effect
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            grid: { display: false },
            title: { display: true, text: "Time Index" },
          },
          y: {
            grid: { display: true },
            title: { display: true, text: "Sensor Readings" },
            beginAtZero: false,
          },
        },
        plugins: { legend: { display: true } },
      },
    });
  }
}

//--------------------------------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------------------------------

// Setting Up Main Chart

// Updating chart dynamically with new data
export function updateChartI(MRD, summary) {
  // Intializing dictionary for current sensorData

  const hours = [
    "12am",
    "1am",
    "2am",
    "3am",
    "4am",
    "5am",
    "6am",
    "7am",
    "8am",
    "9am",
    "10am",
    "11am",
    "12pm",
    "1pm",
    "2pm",
    "3pm",
    "4pm",
    "5pm",
    "6pm",
    "7pm",
    "8pm",
    "9pm",
    "10pm",
    "11pm",
  ];
  if (window.chartInstanceI) {
    window.chartInstanceM.data.labels = hours;
    window.chartInstanceI.data.datasets[0].data = sensorData;
    window.chartInstanceI.update(); // Refresh chart
  } else {
    // Inflow Floor Data Chart
    window.chartInstanceI = new Chart(itx, {
      type: "bar",
      data: {
        labels: hours,
        datasets: [
          {
            label: `# of People in North Floor ${currentTime}`,
            data: sensorData,
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          x: {
            grid: {
              display: false, // Disable vertical grid lines
            },
          },
          y: {
            grid: {
              display: true, // Enable horizontal grid lines
            },
            beginAtZero: true,
          },
        },
        maintainAspectRatio: true,
      },
    });
  }

  console.log("SUMMARY DATA", summary);
  console.log("Current Time", currentDate.slice(0, 10));

  for (let i = 0; i < summary.length; i++) {
    console.log("--------------------");
    console.log("UPDAING THE CHART");
    console.log("--------------------");
    console.log(sensorData[summary[i][2]]);
    sensorData[Number(summary[i][1])] = summary[i][2] || 0;
  }

  document.getElementById("result").innerHTML = JSON.stringify(MRD, null, 2);
  document.getElementById("population").innerHTML = summary.at(-1)[2];
  // Step 3: Update the chart with new data
  //chartInstance.data.datasets[0].label = `# of People in North Floor ${formattedTime}`
  chartInstanceI.update(); // This re-renders the chart with the updated data
  console.log("Displaying ", dateToDisplay);
}

//--------------------------------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------------------------------

function updateDatePicker() {
  dateDisplay.textContent = dateToDisplay.toDateString();
}
prevDayBtn.addEventListener("click", () => {
  dateToDisplay.setDate(dateToDisplay.getDate() - 1);
  console.log("PREV BUTTON CLICKED", dateToDisplay.toISOString().slice(0, 10));
  updateDatePicker();
});

nextDayBtn.addEventListener("click", () => {
  dateToDisplay.setDate(dateToDisplay.getDate() + 1);
  console.log("Next BUTTON CLICKED", dateToDisplay.toISOString().slice(0, 10));
  updateDatePicker();
});

updateDatePicker();
