#include <vector>
#include <string> 
#include <iostream>
// #include <bits/stdc++.h>
// Define rotary encoder pins
#define ENC_A 15
#define ENC_B 19


int i=0;
int c;
int question=0;
bool pressed = false;
bool pressing = false;

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
  pinMode(5, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(ENC_A), read_encoder, CHANGE);
  attachInterrupt(digitalPinToInterrupt(ENC_B), read_encoder, CHANGE);

}

void loop() {

  // Button Logic

  int buttonStateq = digitalRead(10);
  int buttonStatea = digitalRead(3);
  int buttonStateb = digitalRead(4);
  int buttonStatec = digitalRead(5);
  //int analogValue = analogRead(A0);     // read the pot value

  // String av = String
  // int av = map(analogValue,660,750,0,10);
  // Serial.println("button state: " + String(buttonState));
  // Serial.println( "analog value: " + String(av));
  //Serial.println(String(buttonStateq));

  static int lastCounter = 0;

  // If count has changed print the new value to serial
  if(counter != lastCounter){
    //Serial.println(counter);
    lastCounter = counter;
  }
  if(counter>=6||counter<=-6){
    counter=0;
  }


  Serial.println(String(buttonStateq) + String(buttonStatea) + String(buttonStateb) + String(buttonStatec) + String(counter));
  // Serial.println(analogValue);
  delay(1);


  


  //   if(buttonState){
  //if (buttonStateq){

    //i++;
    //c = i/100;
    // Serial.print(c);
    // Serial.print('\n');
    //if(c>100){
      // Serial.print("Button is being held");
      // Serial.print("\n");
      // question++;
    //} else{
      //Serial.print("Button was pressed");
      //Serial.print("\n");
    //}
  
  //} else{
   // i=0;
     //Serial.print("Button is not pressed");
     //Serial.print("\n");
  //}

  //Serial.print(question);
  //Serial.print("\n");
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

