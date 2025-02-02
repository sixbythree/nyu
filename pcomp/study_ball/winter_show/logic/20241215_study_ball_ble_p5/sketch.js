//20241215 Study Ball Bluetooth Low Energy Implementation

// The serviceUuid must match the serviceUuid of the device you would like to connect
const serviceUuid = "4beab14c-1b6e-4b7c-9eaa-fc4185257b6b";
let myCharacteristic;
let latestData = null;
let myBLE;


let colors = ["blue", "red", "purple", "green", "pink"];
let subjects = [
  "algebra",
  "arithmetic",
  "calculus",
  "geometry",
  "precalculus",
  "trigonometry",
  "vocabulary",
];
let clock;
let iiii = 0;
let subject = subjects[0];
let tables = [];
let table;
let timerDone = false;
let myQuestion = null;
let selector = false;
let selTrigger = false;
let skip = false;
let cancel = false;
let decided = false;
let answers = ["A", "B", "C", "D"];
let answered = false;
let userAns = null;
let showSmiley = false;
let showRightAnswer = false;
let val = 0;
let colorIndex = 0;
let start = false;
let prev = false;
let curr = false;
let streak;
let port = "/dev/tty.usbmodem1101";
let answer;





function preload() {

  for (i = 0; i < subjects.length; i++) {
    console.log(subjects[i] + ".csv");
    console.log("i;", i);
    tables[i] = loadTable(subjects[i] + ".csv", "csv", "header");
  }

  the_color_of_nothing = loadSound("ford. - The Color of Nothing.mp3")
}


function setup() {
  createCanvas(600, 600).position(500, 100, "relative");
  angleMode(DEGREES);
  table = tables[0];
  streak = width / 8;
  clock = millis();

  //colorMode(HSB, 255);
  // Create a p5ble class
  myBLE = new p5ble();


  // Create a 'Connect' button
  const connectButton = createButton('Connect')
  connectButton.mousePressed(connectToBle).position(1000,700);
  
}

function mousePressed(){
  the_color_of_nothing.setVolume(1);
  the_color_of_nothing.play()
}

function connectToBle() {
  // Connect to a device by passing the service UUID
  myBLE.connect(serviceUuid, gotCharacteristics);
  
}

// A function that will be called once got characteristics
function gotCharacteristics(error, characteristics) {
  console.log(error);
  console.log(characteristics);

  myCharacteristic = characteristics[0];

  // Read the value of the first characteristic

  myBLE.read(myCharacteristic, 'string', gotValue);
}

// A function that will be called once got values
function gotValue(error, value) {
  if (error) console.log('error: ', error);
  console.log('value: ', value);
  latestData = value;
  // After getting a value, call p5ble.read() again to get the value again
  //myBLE.read(myCharacteristic, gotValue);
  // You can also pass in the dataType
  // Options: 'unit8', 'uint16', 'uint32', 'int8', 'int16', 'int32', 'float32', 'float64', 'string'
  myBLE.read(myCharacteristic, 'string', gotValue);
}
 
 
function draw() {
  //console.log(latestData.replace("-", ""));
  
  if(latestData==null){
  background(255,255,255);
  }else{
  background(0,0,255);
  console.log(latestData);
  //text(latestData,300,300)

  if (checkMode()) {
    // Subject Mode
    selectSubject();
  } else {
    // Answer mode
    if (!selector) {
      nextQuestion();
      displayQ()
      selecting();
    } else {
      // if (start) {

      if (selector && checkMode()==false) {
        displayQ()
        userAns = answers[int(latestData[1])];
        myQuestion.uans = userAns;
        myQuestion.answering();
      }
      //selectAnswer();
      if (latestData[0] == "0") {
        showSmiley = true;
        showRightAnswer = true;
        colorIndex+=1
        val+=1
        noLoop();
      }
      myQuestion.smiley();
      myQuestion.rightAnswer();
      
      if (showSmiley) {
        setTimeout(function () {
          selector = false;
          showSmiley = false;
          showRightAnswer = false;
          myQuestion.correct();
          loop();
        }, 2000);
      } 
    }
  }
  //instructionBox();
  subjectBox();
}
}

function displayQ(){
  bgcolorControl();
  textColorControl();
  myQuestion.showQuestion();
  myQuestion.showOptions();
}

function checkMode() {
  if (latestData[2] == "1") {
    return true; // subject select mode
  } else {
    return false; // answer select mode
  }
}

function nextQuestion(forcedv) {
  // if button unpressed, next question
  if (latestData[0] == "1") {
    // if studying has just begun yet curr will be false
    if (!curr) {
      prev = !prev;
      colorIndex += 1;
      val += 1;
    }
    myQuestion = makeQ(val || forcedv);
    start = true;
    curr = true;
  } else {
    curr = false;
  }
}

function selectSubject() {
  subject = subjects[int(latestData[1])];
  table = tables[int(latestData[1])];
}

function selecting() {
  if (latestData[3] == "1") {
    if (!selTrigger) {
      selector = !selector;
    }
    selTrigger = false;
  }
}



function bgcolorControl() {
  if (colorIndex == colors.length) {
    colorIndex = 0;
  }

  fill(colors[colorIndex]);
  rect(0, 0, width, height);
}

function textColorControl() {
  if (colorIndex == 1 || colorIndex == 4) {
    fill(0);
    stroke(0);
    strokeWeight(1);
  } else {
    fill(255);
    stroke(255);
    strokeWeight(1);
  }
}

function cycleQuestionsSet() {
  if (val == table.getRowCount()) {
    val = 0;
  }
}

function instructionBox() {
  
  
  push();
  boxX = (7 * width) / 8;
  boxY = (3 * height) / 12;
  boxWidth = 125;
  boxHeight = 100;

  fill(0,0,255);
  rectMode(CENTER);
  rect(boxX, boxY, boxWidth, boxHeight);

  fill(0, 255, 100);
  stroke(0, 50, 50);
  textAlign(CENTER);

  textSize(20);
  text("Press to submit answer or skip question", boxX, boxY);
  text("Press to submit answer or skip question", boxX, boxY);
  pop();
    
  
}

function subjectBox() {
  
  if (checkMode()){
  
  push();
  boxX = (7 * width) / 8;
  boxY = (10 * height) / 12;
  boxWidth = 125;
  boxHeight = 50;

  fill(0,0,255);
  rectMode(CENTER);
  rect(boxX, boxY, boxWidth, boxHeight);

  fill(0, 255, 100);
  stroke(0, 50, 50);
  textAlign(CENTER);

  text(subject, boxX, boxY);
  pop();
    
  } else{
    
  push();
  boxX = (7 * width) / 8;
  boxY = (10 * height) / 12;
  boxWidth = 125;
  boxHeight = 50;

  fill(255);
  rectMode(CENTER);
  rect(boxX, boxY, boxWidth, boxHeight);

  fill(0, 255, 100);
  stroke(0, 50, 50);
  textAlign(CENTER);

  text(subject, boxX, boxY);
  pop();
  }
}

function makeQ(n) {
  return new Question(
    table.getRow(n).getString("Question"),
    table.getRow(n).getString("Option A"),
    table.getRow(n).getString("Option B"),
    table.getRow(n).getString("Option C"),
    table.getRow(n).getString("Option D"),
    table.getRow(n).getString("Correct Answer")
  );
}

function keyPressed() {
  console.log("HI");
  if (key === "a") {
    answer = "A";
  } else if (key === "b") {
    answer = "B";
  } else if (key === "c") {
    answer = "C";
  } else if (key === "d") {
    answer = "D";
  }
}

class Question {
  constructor(q, a, b, c, d, ans = 0) {
    this.question = q;
    this.a = a;
    this.aPos = (4 * height) / 12 - 0.00625 * width;
    this.b = b;
    this.bPos = (6 * height) / 12 - 0.00625 * width;
    this.c = c;
    this.cPos = (8 * height) / 12 - 0.00625 * width;
    this.d = d;
    this.dPos = (10 * height) / 12 - 0.00625 * width;
    this.ans = ans;
    this.uans = 0;
    this.smileySize;
  }

  // makes an image from the questions in algebra table
  showQuestion() {
    textSize(20);
    textAlign(CENTER, CENTER);
    //textWrap(WORD);
    text(this.question, width / 2, (2 * height) / 12);
  }

  showOptions() {
    textSize(20);
    textAlign("left");
    text("A: " + this.a, width / 4, (4 * height) / 12);
    text("B: " + this.b, width / 4, (6 * height) / 12);
    text("C: " + this.c, width / 4, (8 * height) / 12);
    text("D: " + this.d, width / 4, (10 * height) / 12);
  }

  answering() {
    push();
    stroke("white");
    strokeWeight(4);
    noFill();
    if (this.uans == "A") {
      ellipse(
        width / 4 + 0.01875 * width,
        this.aPos,
        width / 10
      );
    } else if (this.uans == "B") {
      ellipse(
        width / 4 + 0.01875 * width,
        this.bPos,
        width / 10
      );
    } else if (this.uans == "C") {
      ellipse(
        width / 4 + 0.01875 * width,
        this.cPos,
        width / 10
      );
    } else if (this.uans == "D") {
      ellipse(
        width / 4 + 0.01875 * width,
        this.dPos,
        width / 10
      );
    }
    pop();
  }

  rightAnswer(){
    if (showRightAnswer) {
    if (this.uans != this.ans){
      push();
      stroke("orange");
    strokeWeight(4);
    noFill();
      if (this.ans == "A") {
        ellipse(
          width / 4 + 0.01875 * width,
          this.aPos,
          width / 10
        );
      } else if (this.ans == "B") {
        ellipse(
          width / 4 + 0.01875 * width,
          this.bPos,
          width / 10
        );
      } else if (this.ans == "C") {
        ellipse(
          width / 4 + 0.01875 * width,
          this.cPos,
          width / 10
        );
      } else if (this.ans == "D") {
        ellipse(
          width / 4 + 0.01875 * width,
          this.dPos,
          width / 10
        );
      }
      pop();
     }
    }


  }

  smiley() {
    if (this.uans) {
      if (showSmiley) {
        if (this.uans == this.ans) {
           // smiley head
          fill("orange");
          noStroke();
          ellipse((2 * width) / 3, height / 2, streak);

          // smiley left eye
          fill(0);
          ellipse(
            (2 * width) / 3 - width / 40,
            height / 2 - height / 80,
            0.01875 * height
          );

          // smiley right eye
          fill(0);
          ellipse(
            (2 * width) / 3 + width / 40,
            height / 2 - height / 80,
            0.01875 * height
          );

          // smiley smile
          noFill();
          stroke(0);
          strokeWeight(1);
          arc(
            (2 * width) / 3,
            height / 2 + width / 80,
            width / 16,
            width / 16,
            20,
            160
          );
        } else {
          // smiley head
          fill("orange");
          noStroke();
          ellipse((2 * width) / 3, height / 2, streak);

          // smiley left eye
          fill(0);
          ellipse(
            (2 * width) / 3 - width / 40,
            height / 2 - height / 80,
            0.01875 * height
          );

          // smiley right eye
          fill(0);
          ellipse(
            (2 * width) / 3 + width / 40,
            height / 2 - height / 80,
            0.01875 * height
          );

          // smiley smile
          noFill();
          stroke(0);
          strokeWeight(1);
          line(
            (2 * width) / 3 + width / 40,
            height / 2 + 0.01875 * height,
            (2 * width) / 3 - width / 80,
            height / 2 + height / 32
          );
        }
      }
    }
  }

  correct() {
    if (this.uans == this.ans) {
      streak += 50;
    } else {
      streak = width/8;
    }
  }
}
