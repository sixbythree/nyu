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
    fetch('log.json', params)
        .then(response => response.text())  // convert response to text
        .then(data => getResponse(data))    // get the body of the response
        .catch(error => getResponse(error));// if there is an error
}



export function detectApproachOrDeparture(dataStream){
    let counter = 0
    let batch = 1
    let dataBatch = {}
    for (let i=0; i<dataStream.length;i++){
        if (Number(dataStream[i])!=0){
            counter+=1
        } else{
            if (batch !== 1) {
                if (!dataBatch[i]) {
                    dataBatch[i] = {}
                }
                let indexStart = (i-batch)-1;
                dataBatch[i] = {
                        batchCount:batch,  // Batch count
                        start:indexStart,  // Start index of the batch
                        sensorReadings:[],  // Data values in the batch
                        slope:0,   // Slope (calculated later)
                        timestamp: MRT['timestamp']

                    };  // Initialize an empty array
    
                for(let j=(indexStart); j<=(indexStart)+batch; j++){
                    dataBatch[i]["sensorReadings"].push(dataStream[j])
                }
                dataBatch[i]["slope"] = [parseInt(linearRegressionFromArray(dataBatch[i]["sensorReadings"])["slope"])]
            }
            counter=0
            batch=1
        }
        
        if (counter>2){
            //console.log(counter)
            if (Number(dataStream[i])!=0){
                batch+=1
            }
        }
        
    }

    return dataBatch
    
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
    // const lines = data
    //     .split("\n")
    //     .filter(d => d.trim())
    //     .map(d => JSON.parse(d));

    const lines = data
    .trim()                             // Remove any surrounding whitespace/newlines
    .split("\n}")                        // Split the string at each closing brace of a JSON object
    .map(d => d.trim() + '}')             // Add the closing brace back to each line
    .filter(d => d.length > 2)           // Remove any empty strings
    .map(d => JSON.parse(d)); 
    MRT = lines[lines.length - 2];
    let sensorData = lines.map(d => d.sensor);
    let detector = detectApproachOrDeparture(sensorData);
    let mostRecent = Math.max(...Object.keys(detector).map(key => parseInt(key, 10)));
    MRD = detector[mostRecent];
    document.getElementById('result').innerHTML = JSON.stringify(MRD,null,2);  
}


// This is a listener for the page to load.
// This is the command that actually starts the script:
window.addEventListener('DOMContentLoaded', setup);


