// In class demo training a hand pose classifier
// https://github.com/shiffman/ML-for-Creative-Coding

// Neural network classifier
let classifier;

function setup() {
  // No interface or visual elements
  createCanvas(100, 100);

  // ml5 neural network not compatible with webgpu
  // could also try 'cpu' for small datasets
  ml5.setBackend("webgl");

  // Configure the neural network
  // The network will perform classification (as opposed to regression)
  // Debug mode will show the training visualization
  let options = {
    task: "classification",
    debug: true,
  };
  classifier = ml5.neuralNetwork(options);

  // Load the collected data from the file
  // classifier.loadData("2025-3-11_12-35-46.json", dataLoaded);
  classifier.loadData("hs-hp-saved-data-trim.json", dataLoaded);
}

function dataLoaded() {
  console.log("Data loaded");
  // Normalize the collected data
  classifier.normalizeData();
  // Train the neural network
  // Epochs are the number of times the network will see the data
  // Learning rate is the step size for the optimizer (weight adjustments according to error)
  classifier.train({ epochs: 200, learningRate: 0.0001 }, finishedTraining);
}

function finishedTraining() {
  console.log("Finished training");
  // Save the trained model
  classifier.save();
}
