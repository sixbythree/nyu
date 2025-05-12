let faceMesh;
let video;
let faces = [];
let predictor;
let phase = "collect"; // collect, train, predict
let trainingData = { data: [] };
let currentSize = "";
let sizeOutput = "";

// Keypoints around temples
const templeIndices = [
  21, 54, 139, 71, 68, 156, 70, 284, 251, 368, 301, 298, 383, 300,
];

function preload() {
  faceMesh = ml5.faceMesh({ maxFaces: 1, flipped: false });
}

function setup() {
  createCanvas(640, 480);
  input = createInput("");
  input.position(10, height + 10);

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  faceMesh.detectStart(video, gotFaces);

  // Neural network setup
  let options = {
    task: "regression",
    debug: true,
  };
  predictor = ml5.neuralNetwork(options);

  // Phase buttons
  let collectBtn = createButton("Collect Data");
  collectBtn.position(150, height + 10);
  collectBtn.mousePressed(collectSample);

  let trainBtn = createButton("Train Model");
  trainBtn.position(250, height + 10);
  trainBtn.mousePressed(() => {
    phase = "train";
    trainModel();
  });

  let predictBtn = createButton("Predict");
  predictBtn.position(350, height + 10);
  predictBtn.mousePressed(() => (phase = "predict"));
}

function collectSample() {
  let face = faces[0];
  currentSize = parseFloat(input.value());
  let inputData = flattenDataNormalized(face);
  trainingData.data.push({
    xs: inputData,
    ys: { size: parseFloat(currentSize) },
  });
  console.log(
    `Recorded size ${currentSize}, total samples: ${trainingData.data.length}`
  );
}

function keyPressed() {
  console.log(key, phase);
  currentSize = input.value();

  if (key === "s") {
    // Normalize size values for 0-1 range
    let sizes = trainingData.data.map((item) => item.ys.size);
    let minSize = Math.min(...sizes);
    let maxSize = Math.max(...sizes);

    trainingData.data.forEach((item) => {
      item.ys.size = (item.ys.size - minSize) / (maxSize - minSize);
    });

    console.log(`Normalized sizes from [${minSize}, ${maxSize}] to [0, 1]`);
    console.log(`Total samples: ${trainingData.data.length}`);
  }
}

function trainModel() {
  if (trainingData.data.length === 0) {
    console.log("No training data!");
    return;
  }

  // Load collected data into neural network
  trainingData.data.forEach((item) => {
    let inputs = Object.values(item.xs);
    predictor.addData(inputs, item.ys);
  });

  // Train the model
  predictor.normalizeData();
  predictor.train({ epochs: 50, learningRate: 0.01 }, finishedTraining);
}

function finishedTraining() {
  console.log("Finished training");
  phase = "predict";
}

function gotFaces(results) {
  faces = results;

  if (phase === "predict" && faces.length > 0) {
    predict();
  }
}

function predict() {
  if (faces.length > 0) {
    const face = faces[0];
    const inputData = flattenDataNormalized(face);
    const inputArray = Object.values(inputData);
    predictor.predict(inputArray, gotResults);
  }
}

function gotResults(results) {
  sizeOutput = results[0].size;
  console.log("Predicted size:", sizeOutput);
}

function flattenDataNormalized(face) {
  const box = face.box;
  const inputData = {};
  let i = 0;
  for (let idx of templeIndices) {
    const kp = face.keypoints[idx];
    let xNorm = kp.x / width; // (kp.x - box.xMin) / box.width;
    let yNorm = kp.y / height; // (kp.y - box.yMin) / box.height;
    inputData[i++] = xNorm;
    inputData[i++] = yNorm;
  }
  return inputData;
}

function draw() {
  image(video, 0, 0, width, height);

  // Draw face keypoints
  if (faces.length > 0) {
    let face = faces[0];
    let box = face.box;

    // Draw bounding box
    noFill();
    stroke(255, 0, 0);
    strokeWeight(2);
    rect(box.xMin, box.yMin, box.width, box.height);

    // Draw temple points
    for (let idx of templeIndices) {
      let keypoint = face.keypoints[idx];
      fill(0, 255, 0);
      noStroke();
      circle(keypoint.x, keypoint.y, 10);
    }
  }

  // Display UI based on phase
  fill(0);
  noStroke();
  rect(0, height - 40, width, 40);

  fill(255);
  textSize(24);
  textAlign(CENTER, CENTER);

  if (phase === "collect") {
    text(
      `Collecting: Enter size (${trainingData.data.length} samples)`,
      width / 2,
      height - 20
    );
  } else if (phase === "train") {
    text("Training model...", width / 2, height - 20);
  } else if (phase === "predict") {
    text(`Predicted hat size: ${nf(sizeOutput, 0, 2)}`, width / 2, height - 20);
  }
}
