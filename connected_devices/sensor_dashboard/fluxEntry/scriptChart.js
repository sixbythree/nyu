let currentDate;
let currentTime;
const ctx = document.getElementById("movement"); // Get canvas element
const itx = document.getElementById("inflow");
let sensorData = new Array(24).fill(0);
let sensorDataIn = new Array(24).fill(0);
let sensorDataOut = new Array(24).fill(0);
let dateToDisplay = new Date();
let prevDayBtn = document.getElementById("prevDay");
let nextDayBtn = document.getElementById("nextDay");
let dateDisplay = document.getElementById("dateDisplay");
dateDisplay.textContent = dateToDisplay.toISOString().slice(0, 10);

console.log(sensorData);
console.log(sensorDataIn);
console.log(sensorDataOut);
//--------------------------------------------------------------------------------------------------------------------

// Time Clock

function updateTime() {
  currentDate = new Date().toLocaleString([], { hour12: false });
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
export function updateChartI(MRD, summary, expandedSummary) {
  // Intializing dictionary for current sensorData
  console.log("--------------------");
  console.log("UPDAING CHARTI");

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
    // window.chartInstanceI.data.datasets[0].data = sensorData;
    window.chartInstanceI.data.datasets[0].data = sensorDataIn;
    window.chartInstanceI.data.datasets[1].data = sensorDataOut;
    window.chartInstanceI.update(); // Refresh chart
  } else {
    // Inflow Floor Data Chart
    window.chartInstanceI = new Chart(itx, {
      type: "bar",
      data: {
        labels: hours,
        datasets: [
          {
            label: `# of People Entering  Floor`,
            data: sensorDataIn,
            borderWidth: 1,
          },
          {
            label: `# of People Exiting Floor`,
            data: sensorDataOut,
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: "y",

        scales: {
          x: {
            grid: {
              display: false, // Disable vertical grid lines
            },
            stacked: true,
          },
          y: {
            grid: {
              display: true, // Enable horizontal grid lines
            },
            beginAtZero: true,
            stacked: true,
          },
        },
        plugins: {
          legend: {
            reverse: true,
          },
        },

        maintainAspectRatio: true,
      },
    });
  }

  console.log("SUMMARY DATA", summary);
  console.log("EXPANDED SUMMARY DATA", expandedSummary);
  console.log("Displaying", dateToDisplay.toISOString().slice(0, 10));

  for (let i = 0; i < summary.length; i++) {
    if (summary[i][0] === dateToDisplay.toISOString().slice(0, 10)) {
      console.log("There Is Data To Show");
      console.log("CURRENT EXPANDED SUMMARY", expandedSummary[i][1]);
      // sensorData[Number(summary[i][1])] = summary[i][2] || 0;
      console.log("DATA POINT", expandedSummary[i][3]);
      sensorDataIn[Number(expandedSummary[i][1])] = expandedSummary[i][3] || 0;
      sensorDataOut[Number(expandedSummary[i][1])] = expandedSummary[i][5] || 0;
    } else {
      console.log("No Data To Show");
      // sensorData[Number(summary[i][1])] = 0;
      sensorDataIn[Number(expandedSummary[i][1])] = 0;
      sensorDataOut[Number(expandedSummary[i][1])] = 0;
    }
  }
  // console.log(sensorData);
  console.log(sensorDataIn);
  console.log(sensorDataOut);

  document.getElementById("result").innerHTML = JSON.stringify(MRD, null, 2);
  document.getElementById("population").innerHTML = summary.at(-1)[2];
  chartInstanceI.update(); // This re-renders the chart with the updated data
  console.log("Displaying:", dateToDisplay);
  console.log("--------------------");
}

//--------------------------------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------------------------------

function updateDatePicker() {
  dateDisplay.textContent = dateToDisplay.toISOString().slice(0, 10);
}
prevDayBtn.addEventListener("click", () => {
  console.log("Left Button Pressed");
  dateToDisplay.setDate(dateToDisplay.getDate() - 1); // Every time prev button is press, subtract 1 day
  updateDatePicker();
});

nextDayBtn.addEventListener("click", () => {
  console.log("Right Button Pressed");
  dateToDisplay.setDate(dateToDisplay.getDate() + 1); // Every time next button is press, add 1 day
  updateDatePicker();
});

// ADD A BUBBLE FOR EACH NEW PERSON
// POP BUBBLE WHEN PERSON LEAVES
// ADD ACCELERATION CHART TO MAIN BUBBLE PROPERTIES
