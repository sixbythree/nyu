function setup() {
  createCanvas(400, 400);
  textSize(10);
  textAlign(CENTER, CENTER);
}

function draw() {
  background(220);

  let question =
    "Lots of words Lots of words Lots of words Lots of words Lots of words Lots of words.Lots of words Lots of words Lots of words Lots of words Lots of words Lots of words.Lots of words Lots of words Lots of words Lots of words Lots of words Lots of words.";

  let boxWidth = width * 0.9;
  let boxHeight = height * 0.9;
  
  rect(8*width*0.1,height*0.05, boxWidth*.2, boxHeight*.2 )

  text(
    question,
    (8*width*0.1) / 2 + (8*width*0.1) / 2,
    2*height*.1 + height * 0.1,
    boxWidth*.2,
    boxHeight*.2
  ); //
}
