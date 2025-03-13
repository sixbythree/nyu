/*
  Data fetch script. Uses Fetch to get a text file
  every five seconds, and fill its contents into 
  a div on the HTML page. 

  Based on my fetch example (https://tigoe.github.io/html-for-conndev/fetch/). 

  created 30 Dec 2022
  by Tom Igoe
*/

// this function is called once on page load (see below):
function setup() {
    // set an interval to run fetchText() every 5 seconds:
    setInterval(fetchText, 5000);
}

// make an HTTP call to get a text file:
function fetchText() {
    // parameters for the HTTP/S call
    let params = {
        mode: 'cors', // if you need to turn off CORS, use no-cors
        headers: {    // any HTTP headers you want can go here
            'accept': 'application/text'
        }
    }
    // make the HTTP/S call:
    // To pull from Tom's data file on his site => https://tigoe.net/data.json
    fetch('TOF.json', params)
        .then(response => response.text())  // convert response to text
        .then(data => getResponse(data))    // get the body of the response
        .catch(error => getResponse(error));// if there is an error
}


/**
 * Detects sequences of nonzero values in a data stream, identifying approach or departure patterns.
 *
 * @param {number[]} dataStream - An array of numerical sensor data.
 * @returns {Object} dataBatch - An object containing detected batches with metadata.
 *
 * Each batch contains:
 *  - batchCount: Number of consecutive nonzero values.
 *  - start: Index where the batch started.
 *  - sensorReadings: Array of values in the batch.
 *  - slope: Calculated slope from linear regression.
 *  - timestamp: (Undefined source, assumed to be MRT['timestamp']).
 */
export function detectApproachOrDeparture(dataStream) {
    let counter = 0; // Counts consecutive nonzero values
    let batch = 1; // Tracks batch size
    let dataBatch = {}; // Stores detected batches

    for (let i = 0; i < dataStream.length; i++) {
        if (Number(dataStream[i]) !== 0) {
            counter += 1; // Increment counter for consecutive nonzero values
        } else {
            // Process batch when a zero is encountered (end of a batch)
            if (batch !== 1) {
                if (!dataBatch[i]) {
                    dataBatch[i] = {};
                }
                
                let indexStart = (i - batch) - 1; // Determine batch start index
                dataBatch[i] = {
                    batchCount: batch,  // Number of nonzero values in batch
                    start: indexStart,  // Start index of the batch
                    sensorReadings: [], // Data values in the batch
                    slope: 0,  // Placeholder for calculated slope
                    timestamp: MRT['timestamp'] // Assumed external timestamp source
                };

                // Store the sensor readings in the batch
                for (let j = indexStart; j <= indexStart + batch; j++) {
                    dataBatch[i]["sensorReadings"].push(dataStream[j]);
                }

                // Compute and store slope using linear regression
                dataBatch[i]["slope"] = [parseInt(linearRegressionFromArray(dataBatch[i]["sensorReadings"])['slope'])];
            }
            // Reset batch tracking variables
            counter = 0;
            batch = 1;
        }
        
        // Continue batch detection if nonzero values persist
        if (counter > 2) {
            if (Number(dataStream[i]) !== 0) {
                batch += 1;
            }
        }
    }

    return dataBatch;
}


//GPT produced function
export function linearRegressionFromArray(yValues) {
    let n = yValues.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

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

export let MRD = {};
export let MRT;

// function to call when you've got something to display:
function getResponse(data) {
    const lines = data
        .split("\n")
        .filter(d => d.trim())
        .map(d => JSON.parse(d)); 
        // .filter(d => d.trim())
    
    // console.log("data:",lines[564].timeStamp.slice(11, 19));
    // const lines = data
    
    MRT = lines.map(l => l.timeStamp.slice(11,19));
    // console.log("Most recent time:", MRT.at(-1)) 
    let sensorData = lines.map(d => d.sensor);
    let detector = detectApproachOrDeparture(sensorData);
    let mostRecent = Math.max(...Object.keys(detector).map(key => parseInt(key, 10)));
    MRD = detector[mostRecent];
    console.log('most recent:', MRD)
    console.log("Most recent data size:",Object.keys(MRD).length)
    document.getElementById('result').innerHTML =  JSON.stringify(lines,null,2); //JSON.stringify(MRD,null,2);  
}


// This is a listener for the page to load.
// This is the command that actually starts the script:
window.addEventListener('DOMContentLoaded', setup);


