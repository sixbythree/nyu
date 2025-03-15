/*
  Data fetch script. Uses Fetch to get a text file
  every five seconds, and fill its contents into 
  a div on the HTML page. 

  Based on my fetch example (https://tigoe.github.io/html-for-conndev/fetch/). 

  created 30 Dec 2022
  by Tom Igoe
*/

export let MRD = {};
export let MRT;

//--------------------------------------------------------------------------------------------------------------------

// Setup

// this function is called once on page load (see below):
function setup() {
  // set an interval to run fetchText() every 5 seconds:
  setInterval(fetchText, 5000);
}

//--------------------------------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------------------------------

// Fetching text file

// make an HTTP call to get a text file:
function fetchText() {
  // parameters for the HTTP/S call
  let params = {
    mode: "cors", // if you need to turn off CORS, use no-cors
    headers: {
      // any HTTP headers you want can go here
      accept: "application/text",
    },
  };
  // make the HTTP/S call:
  // To pull from Tom's data file on his site => https://tigoe.net/data.json
  fetch("TOF.json", params)
    .then((response) => {
      console.log("Fetching data...");
      return response.text();
    }) // convert response to text
    .then((data) => {
      console.log(`Data is, ${data.split("\n").length} lines long`),
        getResponse(data);
    }) // get the body of the response
    .catch((error) => getResponse(error)); // if there is an error
}
//--------------------------------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------------------------------

// Motion Detection

/*
 Detects sequences of nonzero values in a data stream, identifying approach or departure patterns.
 
 @param {number[]} dataStream - An array of numerical sensor data.
 @returns {Object} dataBatch - An object containing detected batches with metadata.

 Each batch contains:
  - batchCount: Number of consecutive nonzero values.
  - start: Index where the batch started.
  - sensorReadings: Array of values in the batch.
  - slope: Calculated slope from linear regression.
  - timestamp: (Undefined source, assumed to be MRT['timestamp']).
*/
export function detectApproachOrDeparture(dataStream) {
  let counter = 0; // Counts consecutive nonzero values
  let batch = 1; // Tracks batch size
  let dataBatch = {}; // Stores detected batches

  for (let i = 0; i < dataStream.length; i++) {
    if (Number(dataStream[i].sensor) !== 0) {
      counter += 1; // Increment counter for consecutive nonzero values
    } else {
      // Process batch when a zero is encountered (end of a batch)
      if (batch !== 1) {
        if (!dataBatch[i]) {
          dataBatch[i] = {};
        }

        let indexStart = i - batch - 1; // Determine batch start index
        dataBatch[i] = {
          batchCount: batch, // Number of nonzero values in batch
          start: indexStart, // Start index of the batch
          sensorReadings: [], // Data values in the batch
          slope: 0, // Placeholder for calculated slope
          timeStamps: [], // Assumed external timestamp source
        };

        // Store the sensor readings & timeStamp in the batch
        for (let j = indexStart; j <= indexStart + batch; j++) {
          dataBatch[i]["sensorReadings"].push(dataStream[j].sensor);
          dataBatch[i]["timeStamps"].push(dataStream[j].timeStamp);
        }

        // Compute and store slope using linear regression
        dataBatch[i]["slope"] = [
          parseInt(
            linearRegressionFromArray(dataBatch[i]["sensorReadings"])["slope"]
          ),
        ];
        dataBatch[i]["TimeStamp"] = dataBatch[i].timeStamps.at(-1);
      }
      // Reset batch tracking variables
      counter = 0;
      batch = 1;
    }

    // Continue batch detection if nonzero values persist
    if (counter > 2) {
      if (Number(dataStream[i].sensor) !== 0) {
        batch += 1;
      }
    }
  }

  return dataBatch;
}
//--------------------------------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------------------------------

// Linear Regression

//GPT produced function
export function linearRegressionFromArray(yValues) {
  let n = yValues.length;
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0;

  for (let i = 0; i < n; i++) {
    let x = i; // Using index as x-value
    let y = yValues[i];

    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }

  // Compute slope (m)
  let m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  // Compute intercept (b)
  let b = (sumY - m * sumX) / n;

  return { slope: m, intercept: b };
}
//--------------------------------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------------------------------

// Getting fetched Data response

// function to call when you've got something to display:
function getResponse(data) {
  const lines = cleanData(data);
  console.log("Data cleaned and ready to use!");

  MRT = lines.map((l) => l.timeStamp.slice(11, 19)).at(-1);
  console.log("Most recent time:", MRT);
  let sensorData = lines.map((d) => ({
    sensor: d.sensor,
    timeStamp: d.timeStamp.slice(11, 19),
  }));
  let detector = detectApproachOrDeparture(sensorData);
  let mostRecent = Math.max(
    ...Object.keys(detector).map((key) => parseInt(key, 10))
  );
  MRD = detector[mostRecent];

  //   document.getElementById("result").innerHTML = JSON.stringify(lines, null, 2);
  //   document.getElementById("result").innerHTML = JSON.stringify(
  //     lines.map((l) => l.sensor),
  //     null,
  //     2
  //   );
  document.getElementById("result").innerHTML = JSON.stringify(MRD, null, 2);
}
//--------------------------------------------------------------------------------------------------------------------

//--------------------------------------------------------------------------------------------------------------------

// Cleaning Data

function cleanData(data) {
  console.log("Cleaning up data...");
  return data
    .split("\n")
    .filter((d) => d.trim())
    .map((d) => JSON.parse(d))
    .filter((d) => Object.keys(d).length > 0);
}

// This is a listener for the page to load.
// This is the command that actually starts the script:
window.addEventListener("DOMContentLoaded", setup);
//--------------------------------------------------------------------------------------------------------------------
