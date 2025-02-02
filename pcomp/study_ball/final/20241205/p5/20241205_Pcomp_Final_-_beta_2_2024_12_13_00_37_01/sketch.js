let colors = ["blue", "red", "purple", "green", "pink"];
let subjects = [
  "algebra",
  "arithmetic",
  "calculus",
  "geometry",
  "precalculus",
  "trigonometry",
  "vocabulary"
]
let subject;
let tables = [];
let table;
let selector;
let answers = ["A", "B", "C", "D"];
let val = 0;
let count = 0;
let start = false;
let prev = false;
let curr = false;
let streak;
let port = "/dev/tty.usbmodem1101";
let answer;
// Declare a "SerialPort" object
let serial;
let latestData = "waiting for data"; // you'll use this to write incoming data to the canvas

function preload() {
  //  if(int(latestData.replace("-", "")) == 0){
  //   table = loadTable("geometry.csv", "csv", "header");
  // } else{
  //table = loadTable("algebra.csv", "csv", "header");

  for (i = 0; i < subjects.length; i++) {
    console.log(subjects[i] + ".csv");
    console.log("i;", i);
    tables[i] = loadTable(subjects[i] + ".csv", "csv", "header");
  }
}

function setup() {
  createCanvas(600, 600).position(500, 100, "relative");
  angleMode(DEGREES);
  table = tables[0];
  streak = width / 8;

  // Instantiate our SerialPort object
  serial = new p5.SerialPort();

  // Get a list the ports available
  // You should have a callback defined to see the results
  serial.list();

  // Assuming our Arduino is connected, let's open the connection to it
  // Change this to the name of your arduino's serial port
  serial.open(port);

  // Here are the callbacks that you can register
  // When we connect to the underlying server
  serial.on("connected", serverConnected);

  // When we get a list of serial ports that are available
  serial.on("list", gotList);
  // OR
  //serial.onList(gotList);

  // When we some data from the serial port
  serial.on("data", gotData);
  // OR
  //serial.onData(gotData);

  // When or if we get an error
  serial.on("error", gotError);
  // OR
  //serial.onError(gotError);

  // When our serial port is opened and ready for read/write
  serial.on("open", gotOpen);
  // OR
  //serial.onOpen(gotOpen);

  serial.on("close", gotClose);

  // Callback to get the raw data, as it comes in for handling yourself
  //serial.on('rawdata', gotRawData);
  // OR
  //serial.onRawData(gotRawData);
}

// We are connected and ready to go
function serverConnected() {
  print("Connected to Server");
}

// Got the list of ports
function gotList(thelist) {
  print("List of Serial Ports:");
  // theList is an array of their names
  for (let i = 0; i < thelist.length; i++) {
    // Display in the console
    print(i + " " + thelist[i]);
  }
}

// Connected to our serial device
function gotOpen() {
  print("Serial Port is Open");
}

function gotClose() {
  print("Serial Port is Closed");
  latestData = "Serial Port is Closed";
}

//print error to console
function gotError(theerror) {
  print(theerror);
}

// There is data available to work with from the serial port
function gotData() {
  let currentString = serial.readLine(); // read the incoming string
  trim(currentString); // remove any trailing whitespace
  if (!currentString) return; // if the string is empty, do no more
  //console.log(currentString); // print the string
  latestData = currentString; // save it for the draw method
}

// We got raw from the serial port
function gotRawData(thedata) {
  print("gotRawData" + thedata);
}

function draw() {
  console.log(latestData.replace("-", ""));
  console.log(latestData.replace("-", "").slice(4, 5));
  
  if (mode() == 1) {
    changeSubject();
  } else {
    changeQuestion();
  }
 
  if (start) {
    bgcolorControl();
    textColorControl();
    myQuestion.show();
    myQuestion.smiley();
    subjectBox();
  }
  
}

function mode() {
  if (latestData.slice(2, 3) == "1") {
    selector = 1; // subject select mode
  } else {
    selector = 0; // answer select mode
  }
  return selector;
}

function changeQuestion() {
  
  
  if (latestData.slice(0, 1) == "1" || mouseIsPressed == true) {
    if (!curr) {
      prev = !prev;
      count += 1;
      val += 1;
    }
    myQuestion = makeQ(val);
    start = true;
    curr = true;
    //console.log(answer)
    answer = answers[int(latestData.replace("-", "").slice(1, 2))];
    myQuestion.uans = answer;
  } else {
    curr = false;
  }
}

function changeSubject() {
  subject = subjects[int(latestData.replace("-", "").slice(1, 2))];
  table = tables[int(latestData.replace("-", "").slice(1, 2))];
}

function bgcolorControl() {
  if (count == colors.length) {
    count = 0;
  }

  fill(colors[count]);
  rect(0, 0, width, height);
}

function textColorControl() {
  if (count == 1 || count == 4) {
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

function subjectBox() {
  push();
  
  boxX = (7 * width) / 8
  boxY = (10 * height) / 12
  boxWidth = 125
  boxHeight = 50
  
  fill(255);
  rectMode(CENTER);
  rect(boxX, boxY, boxWidth, boxHeight);

  fill(0, 255, 100);
  stroke(0, 50, 50);
  textAlign(CENTER);
  
 

  text(subject, boxX, boxY);
  pop();
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


// function textWrap(vari){
  
//   if (textBounds()<vari 
  
// }

class Question {
  constructor(q, a, b, c, d, ans = 0) {
    this.question = q;
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.ans = ans;
    this.uans = 0;
    this.correct = false;
  }

  // makes an image from the questions in algebra table
  show() {
    textSize(20);
    textAlign(CENTER, CENTER);
    //textWrap(WORD);
    text(this.question, width / 2, (2 * height) / 12);

    textAlign("left");
    text("A: " + this.a, width / 4, (4 * height) / 12);
    text("B: " + this.b, width / 4, (6 * height) / 12);
    text("C: " + this.c, width / 4, (8 * height) / 12);
    text("D: " + this.d, width / 4, (10 * height) / 12);

    push();
    stroke("white");
    strokeWeight(4);
    noFill();
    if (this.uans == "A") {
      ellipse(
        width / 4 + 0.01875 * width,
        (4 * height) / 12 - 0.00625 * width,
        width / 10
      );
    } else if (this.uans == "B") {
      ellipse(
        width / 4 + 0.01875 * width,
        (6 * height) / 12 - 0.00625 * width,
        width / 10
      );
    } else if (this.uans == "C") {
      ellipse(
        width / 4 + 0.01875 * width,
        (8 * height) / 12 - 0.00625 * width,
        width / 10
      );
    } else if (this.uans == "D") {
      ellipse(
        width / 4 + 0.01875 * width,
        (10 * height) / 12 - 0.00625 * width,
        width / 10
      );
    }
    pop();
  }

  smiley() {
    if (this.uans) {
      this.correct = true;
      if (this.uans == this.ans) {
        fill("orange");
        noStroke();
        ellipse((2 * width) / 3, height / 2, streak);
        fill(0);
        ellipse(
          (2 * width) / 3 - width / 40,
          height / 2 - height / 80,
          0.01875 * height
        );
        fill(0);
        ellipse(
          (2 * width) / 3 + width / 40,
          height / 2 - height / 80,
          0.01875 * height
        );
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
        fill("orange");
        noStroke();
        ellipse((2 * width) / 3, height / 2, width / 8);
        fill(0);
        ellipse(
          (2 * width) / 3 - width / 40,
          height / 2 - height / 80,
          0.01875 * height
        );
        fill(0);
        ellipse(
          (2 * width) / 3 + width / 40,
          height / 2 - height / 80,
          0.01875 * height
        );
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

  correct() {
    if (this.correct) {
      streak += 10;
    }
  }
}
