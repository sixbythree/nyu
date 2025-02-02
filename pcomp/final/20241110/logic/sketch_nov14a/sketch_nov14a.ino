#include <Wire.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_GFX.h>
#include <vector>
#include <string> 
#include <iostream>
// #include <bits/stdc++.h>
// Define rotary encoder pins
#define ENC_A 15
#define ENC_B 19

const int SCREEN_WIDTH = 128; // OLED display width, in pixels
const int SCREEN_HEIGHT = 64; // OLED display height, in pixels
 
// initialize the display:
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT);


unsigned long _lastIncReadTime = micros(); 
unsigned long _lastDecReadTime = micros(); 
int _pauseLength = 25000;
int _fastIncrement = 10;

volatile int counter = 0;



void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  // Set encoder pins and attach interrupts
  pinMode(ENC_A, INPUT_PULLUP);
  pinMode(ENC_B, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(ENC_A), read_encoder, CHANGE);
  attachInterrupt(digitalPinToInterrupt(ENC_B), read_encoder, CHANGE);

  if (!Serial) delay(3000);
  // first parameter of begin() sets voltage source.
  // SSD1306_SWITCHCAPVCC is for 3.3V
  // second parameter is I2C address, which is
  // 0x3C, or 3D for some 128x64 modules:
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("Display setup failed");
    while (true);
  }
  Serial.println("Display is good to go");
}

void loop() {

  // Button Logic

  int buttonStateq = digitalRead(2);
  int buttonStatea = digitalRead(3);
  int buttonStateb = digitalRead(4);
  int buttonStatec = digitalRead(5);

  static int lastCounter = 0;

  // If count has changed print the new value to serial
  if(counter != lastCounter){
    //Serial.println(counter);
    lastCounter = counter;
  }
  if(counter>=6||counter<=-6){
    counter=0;
  }



  // clear the display:
  display.clearDisplay();
  // set the text size to 2:
  display.setTextSize(2);
  // set the text color to white:
  display.setTextColor(SSD1306_INVERSE);
 
  // move the cursor to 0,0:
  display.setCursor(0, 0);
  // print the seconds:
  display.print("secs:");
  display.print(millis() / 1000);
 
  // move the cursor down 20 pixels:
  display.setCursor(0, 20);
  // print a sensor reading:
  display.print("sensor:");
  //Serial.println(String(buttonStateq) + String(buttonStatea) + String(buttonStateb) + String(buttonStatec) + String(counter));

  display.print(String(buttonStateq) + String(buttonStatea) + String(buttonStateb) + String(buttonStatec) + String(counter));
  // Serial.println(analogValue);
  // push everything out to the screen:
  display.display();
  delay(1);

}


void read_encoder() {
  // Encoder interrupt routine for both pins. Updates counter
  // if they are valid and have rotated a full indent
 
  static uint8_t old_AB = 3;  // Lookup table index
  static int8_t encval = 0;   // Encoder value  
  static const int8_t enc_states[]  = {0,-1,1,0,1,0,0,-1,-1,0,0,1,0,1,-1,0}; // Lookup table

  old_AB <<=2;  // Remember previous state

  if (digitalRead(ENC_A)) old_AB |= 0x02; // Add current state of pin A
  if (digitalRead(ENC_B)) old_AB |= 0x01; // Add current state of pin B
  
  encval += enc_states[( old_AB & 0x0f )];

  // Update counter if encoder has rotated a full indent, that is at least 4 steps
  if( encval > 3 ) {        // Four steps forward
    int changevalue = -1;
    if((micros() - _lastIncReadTime) < _pauseLength) {
      changevalue = _fastIncrement * changevalue; 
    }
    _lastIncReadTime = micros();
    counter = counter + changevalue;              // Update counter
    encval = 0;
  }
  else if( encval < -3 ) {        // Four steps backward
    int changevalue = 1;
    if((micros() - _lastDecReadTime) < _pauseLength) {
      changevalue = _fastIncrement * changevalue; 
    }
    _lastDecReadTime = micros();
    counter = counter + changevalue;              // Update counter
    encval = 0;
  }
} 

