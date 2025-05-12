let w, h;
let video;
let faceMesh;
let faces = [];
let handPose;
let hands = [];
let overlay;
let easedOffsetX = 0;
let easedOffsetY = 0;
let pixelBuffer;
let pixelScale = 0.5;
let lastPixelScale = pixelScale;
let pixelMode = "Full color"; // default from dropdown
let scanTriggeredByGesture = false;
let scanned = false;

let predictor;
let predicting = false;
let labelFM = "";

// Neural network classifier
let classifier;
let classifying = false;
let labelHP = "";

function preload() {
  // Load the faceMesh model from ml5.js
  faceMesh = ml5.faceMesh({ maxFaces: 2, flipped: false });
  handPose = ml5.handPose();
}

function setup() {
  const wrapper = select("#canvas-wrapper"); // p5 DOM selection
  w = wrapper.elt.offsetWidth;
  h = wrapper.elt.offsetHeight;
  createCanvas(w, h).parent("canvas-wrapper");
  video = createCapture(VIDEO);
  video.size(1280, 960);
  video.hide();
  overlay = createGraphics(w, h);
  faceMesh.detectStart(video, gotFaces);
  handPose.detectStart(video, gotHands);

  // Wait a moment to ensure video is ready

  // Load regression model
  let optionsFM = {
    task: "regression",
    debug: true,
  };

  let optionsHP = {
    task: "classification",
    debug: true,
  };

  predictor = ml5.neuralNetwork(optionsFM);

  const modelDetailsFM = {
    model: "./hs-weights/model (1).json",
    metadata: "./hs-weights/model_meta (1).json",
    weights: "./hs-weights/model.weights (1).bin",
  };

  predictor.load(modelDetailsFM, modelLoaded);
  setTimeout(updatePixelBuffer, 500);

  classifier = ml5.neuralNetwork(optionsHP);
  const modelDetailsHP = {
    model: "./hp-weights/modelHP.json",
    metadata: "./hp-weights/model_metaHP.json",
    weights: "./hp-weights/model.weightsHP.bin",
  };
  classifier.load(modelDetailsHP, modelLoaded);
}

function draw() {
  clear();
  drawingContext.imageSmoothingEnabled = false;

  const videoAspect = video.width / video.height;
  const canvasAspect = w / h;

  let baseDrawWidth, baseDrawHeight;
  if (videoAspect > canvasAspect) {
    baseDrawHeight = h;
    baseDrawWidth = h * videoAspect;
  } else {
    baseDrawWidth = w;
    baseDrawHeight = w / videoAspect;
  }

  let drawX = (w - baseDrawWidth) / 2;
  let drawY = (h - baseDrawHeight) / 2;

  // --- Face-centering offset ---
  let offsetX = 0;
  let offsetY = 0;

  if (faces.length > 0) {
    let box = faces[0].box;
    let faceCenterX = box.xMin + box.width / 2;
    let faceCenterY = box.yMin + box.height / 2;

    let scaleX = baseDrawWidth / video.width;
    let scaleY = baseDrawHeight / video.height;

    let faceCanvasX = faceCenterX * scaleX;
    let faceCanvasY = faceCenterY * scaleY;

    offsetX = w / 2 - (faceCanvasX + drawX);
    offsetY = h / 2 - (faceCanvasY + drawY);
  }

  // Easing
  let easing = 0.1;
  easedOffsetX =
    abs(offsetX - easedOffsetX) < 1
      ? offsetX
      : easedOffsetX + (offsetX - easedOffsetX) * easing;
  easedOffsetY =
    abs(offsetY - easedOffsetY) < 1
      ? offsetY
      : easedOffsetY + (offsetY - easedOffsetY) * easing;

  // Avoid clipping by scaling
  let marginX = Math.abs(easedOffsetX);
  let marginY = Math.abs(easedOffsetY);

  let scaleFactorX = (w + 2 * marginX) / baseDrawWidth;
  let scaleFactorY = (h + 2 * marginY) / baseDrawHeight;
  let scaleFactor = constrain(max(scaleFactorX, scaleFactorY), 1.0, 1.3);

  let drawWidth = baseDrawWidth * scaleFactor;
  let drawHeight = baseDrawHeight * scaleFactor;
  let finalX = (w - drawWidth) / 2 + easedOffsetX;
  let finalY = (h - drawHeight) / 2 + easedOffsetY;

  // --- Pixelate into buffer ---
  if (pixelBuffer) {
    pixelBuffer.image(video, 0, 0, pixelBuffer.width, pixelBuffer.height);
    let ctx = pixelBuffer.canvas.getContext("2d");
    let frame = ctx.getImageData(0, 0, pixelBuffer.width, pixelBuffer.height);
    let processed = applyPixelationMode(frame, pixelBuffer.canvas);
    ctx.putImageData(processed, 0, 0);

    // Draw it scaled up
    drawingContext.imageSmoothingEnabled = false;
    image(pixelBuffer, finalX, finalY, drawWidth, drawHeight);
  }

  // --- Overlay mask ---
  createOverlay();
  image(overlay, 0, 0);

  // --- Ellipse outline ---
  dashedEllipse();

  // --- Optional face box ---
  drawFaceBox(drawWidth, drawHeight, finalX, finalY);

  if (labelHP == "0") {
    pixelScale = constrain(pixelScale - 0.02, 0.05, 1.0); // 🔽 more pixelated
    console.log("logging Pixelation 0.05");
  } else if (labelHP == "1") {
    pixelMode = "full-color";
    console.log("logging Full-Color");
  } else if (labelHP == "2") {
    pixelMode = "2-color";
    console.log("logging 2-Color");
  } else if (labelHP == "3") {
    pixelMode = "3-color";
    console.log("logging 3-Color");
  } else if (labelHP == "4") {
    pixelMode = "16-color";
    console.log("logging Multi-Color");
  } else if (labelHP == "5") {
    console.log("logging Pixelization 1.0");
    pixelScale = constrain(pixelScale + 0.02, 0.05, 1.0); // 🔼 less pixelated
  }
  // else if (
  //   labelHP == "6" &&
  //   scanned == false &&
  //   scanTriggeredByGesture == false
  // ) {
  //   scanTriggeredByGesture = true;
  //   console.log("logging StartScan");
  //   startScan();
  //   captureSnapshot();
  //   scanned = true;
  // } else if (labelHP == "6" && scanned == true) {
  //   console.log("logging New Scan");
  //   resetScan();
  //   scanned = false;
  //   scanTriggeredByGesture = false;
  // }

  if (Math.abs(pixelScale - lastPixelScale) > 0.001) {
    updatePixelBuffer();
    lastPixelScale = pixelScale;
  }
}

function startScan() {
  showSection("step2");

  // Delay to simulate processing...
  setTimeout(() => {
    showSection("step3");
    triggerConfetti();

    // Delay screenshot until after step3 is visible and rendered
    setTimeout(() => {
      captureFullPage();
    }, 500); // tweak delay as needed
  }, 1000);
}

function showSection(id) {
  document.getElementById("step1").classList.add("hidden");
  document.getElementById("step2").classList.add("hidden");
  document.getElementById("step3").classList.add("hidden");
  document.getElementById(id).classList.remove("hidden");
}

function resetScan() {
  showSection("step1");
}

// // Callback function that receives face detection results
// function gotFaces(results) {
//   faces = results;
// }

function gotFaces(results) {
  faces = results;

  if (!predicting && faces.length > 0) {
    predicting = true;
    predictData();
  }
}

function gotHands(results) {
  hands = results;

  // Only classify if not already classifying and at least one hand detected
  if (!classifying && hands.length > 0) {
    // Prevent overlapping classifications
    classifying = true;
    classifyData();
  }
}

function gotResultsFM(results) {
  labelFM = results[0].size;
  predicting = false;

  const hatSizeDisplay = document.getElementById("myHatSize");
  const isStep3Visible = !document
    .getElementById("step3")
    .classList.contains("hidden");

  // Only update the hat size if we are NOT already on the result screen
  if (!isStep3Visible && hatSizeDisplay) {
    if (labelFM.toFixed(1) < 57 && labelFM.toFixed(1) > 55) {
      hatSizeDisplay.innerHTML = `Between 54cm and 57cm!`;
    }
    // hatSizeDisplay.innerHTML = `${labelFM.toFixed(1)}cm`;
  }
}

function gotResultsHP(results) {
  // Store and display the classification result
  labelHP = results[0].label;
  console.log(labelHP);

  // Reset flag so the next fresh detection can be classified
  classifying = false;
}

function classifyData() {
  // Convert handpose data into a format suitable for the neural network
  let hand = hands[0];
  let inputData = flattenDataHP(hand);

  // Classify the data
  classifier.classify(inputData, gotResultsHP);
}

function predictData() {
  const face = faces[0];
  const inputData = flattenDataNormalized(face);

  predictor.predict(inputData, gotResultsFM);
}

function flattenDataNormalized(face) {
  const templeIndices = [
    21, 54, 139, 71, 68, 156, 70, 284, 251, 368, 301, 298, 383, 300,
  ];
  const box = face.box;
  const inputData = {};
  let i = 0;

  for (let idx of templeIndices) {
    const kp = face.keypoints[idx];

    let xNorm = (kp.x - box.xMin) / box.width;
    let yNorm = (kp.y - box.yMin) / box.height;
    inputData[i++] = xNorm;
    inputData[i++] = yNorm;
  }

  return inputData;
}

// Flatten handpose data into a 1D array
function flattenDataHP(hand) {
  let inputData = [];
  let keypoints = hand.keypoints;
  for (let keypoint of keypoints) {
    inputData.push(keypoint.x);
    inputData.push(keypoint.y);
  }
  return inputData;
}

function modelLoaded() {
  console.log("✅ Model loaded");
}

function createOverlay() {
  overlay.clear();
  overlay.fill(253, 202, 92); // semi-transparent black
  overlay.noStroke();
  overlay.rect(0, 0, w, h);

  overlay.erase(); // erase in the overlay only
  overlay.ellipse(w / 2, h / 2, w * 0.9, h * 0.7);
  overlay.noErase();
}

function dashedEllipse() {
  drawingContext.setLineDash([10, 10]); // dash and gap lengths
  stroke("white");
  strokeWeight(4);
  noFill();
  ellipse(w / 2, h / 2, w * 0.9, h * 0.7);
  drawingContext.setLineDash([]);
}

function previewAspectRatico() {
  rectMode(CENTER);
  fill("red");
  ellipse(w / 2, h / 2, w * 0.9, h * 0.7);
}

function triggerConfetti() {
  const confetti = document.getElementById("confetti");
  confetti.style.display = "block";
  for (let i = 0; i < 100; i++) {
    const dot = document.createElement("div");
    dot.className = "dot";
    dot.style.left = Math.random() * 100 + "%";
    dot.style.top = Math.random() * 100 + "%";
    dot.style.setProperty("--x", `${(Math.random() - 0.5) * 200}px`);
    dot.style.setProperty("--y", `${(Math.random() - 0.5) * 200}px`);
    confetti.appendChild(dot);
    setTimeout(() => dot.remove(), 1000);
  }
}

function captureSnapshot() {
  const snapshotCanvas = document.getElementById("snapshot");
  const ctx = snapshotCanvas.getContext("2d");

  // Match dimensions with the scan-container
  snapshotCanvas.width = w;
  snapshotCanvas.height = h;

  // Draw current frame from the main canvas (with pixelation) onto the snapshot
  ctx.drawImage(document.querySelector("canvas"), 0, 0, w, h);
}

function updatePixelBuffer() {
  const pw = video.width * pixelScale;
  const ph = video.height * pixelScale;
  pixelBuffer = createGraphics(pw, ph);
}

function applyPixelationMode(imageData, tempCanvas) {
  const data = imageData.data;
  const cx = Math.floor(tempCanvas.width / 2);
  const cy = Math.floor(tempCanvas.height / 2);
  const idx = (cy * tempCanvas.width + cx) * 4;
  const skinR = data[idx],
    skinG = data[idx + 1],
    skinB = data[idx + 2];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];
    const avg = (r + g + b) / 3;
    if (pixelMode === "2-color") {
      const bw = avg < 128 ? 0 : 255;
      data[i] = data[i + 1] = data[i + 2] = bw;
    } else if (pixelMode === "3-color") {
      if (avg < 85) data[i] = data[i + 1] = data[i + 2] = 0;
      else if (avg > 170) data[i] = data[i + 1] = data[i + 2] = 255;
      else (data[i] = skinR), (data[i + 1] = skinG), (data[i + 2] = skinB);
    } else if (pixelMode === "16-color") {
      const level = (v) => Math.round(v / 64) * 64;
      let newR = level(r),
        newG = level(g),
        newB = level(b);
      const gray = newR === newG && newG === newB;
      if (gray && newR !== 0 && newR !== 255) {
        newR = 255;
        newG = 65;
        newB = 0;
      }
      data[i] = newR;
      data[i + 1] = newG;
      data[i + 2] = newB;
    }
  }

  return imageData;
}

function drawFaceBox(drawWidth, drawHeight, finalX, finalY) {
  if (faces.length > 0) {
    let box = faces[0].box;
    let scaleX = drawWidth / video.width;
    let scaleY = drawHeight / video.height;
    let x = finalX + box.xMin * scaleX;
    let y = finalY + box.yMin * scaleY;
    let boxW = box.width * scaleX;
    let boxH = box.height * scaleY;
    noFill();
    stroke(255, 0, 0);
    strokeWeight(2);
    rect(x, y, boxW, boxH);
  }
}

function captureFullPage() {
  html2canvas(document.body).then((canvas) => {
    const link = document.createElement("a");
    link.download = "hatsizer-fullscreen.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}
