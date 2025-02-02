#include <ArduinoBLE.h>

#include <vector>
#include <string> 
#include <iostream>
// #include <bits/stdc++.h>
// Define rotary encoder pins
#define ENC_A 15
#define ENC_B 19


unsigned long _lastIncReadTime = micros(); 
unsigned long _lastDecReadTime = micros(); 
int _pauseLength = 25000;
int _fastIncrement = 10;

volatile int counter = 0;

int buttonState=1;
int mode = 1;
int startPress = 0;
int endPress = 0;
int lastButtonState=1;
int spinMode = 0;
int holdTime = 0;        // how long the button was hold
int idleTime = 0;        // how long the button was idle
int selector=0;




void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  // Set encoder pins and attach interrupts
  pinMode(ENC_A, INPUT_PULLUP);
  pinMode(ENC_B, INPUT_PULLUP);
  pinMode(5, INPUT_PULLUP);
  pinMode(8,OUTPUT);
  attachInterrupt(digitalPinToInterrupt(ENC_A), read_encoder, CHANGE);
  attachInterrupt(digitalPinToInterrupt(ENC_B), read_encoder, CHANGE);
}

void loop() {

  // Button Logic

  
  buttonState = digitalRead(5);
  
  button_status();
  //changeMode();

  static int lastCounter = 0;
  // If count has changed print the new value to serial
  if(counter != lastCounter){
    //Serial.println(counter);
    selector = 1;
    lastCounter = counter;

  } else{
    selector = 0;
  }
  

  // if(counter%3==0 || buttonStatec==0){
  //   digitalWrite(8,HIGH);
  // }else{
  //   digitalWrite(8,LOW);
  // }
  
  updateSpinMode();

  Serial.println(String(mode) + String(abs(counter)) + String(spinMode) + String(selector) + "   " + String(holdTime) + "   " + String(idleTime));
  // Serial.println(analogValue);
  if (selector == 1){
  delay(100);
  } else{
    delay(1);
  }

 
}


void button_status(){

  // If button has been pressed
  if(buttonState != lastButtonState) { 
     // button state changed. It runs only once.
     if(buttonState==LOW){  // If button is being pressed
      startPress = millis(); // This is the start time of the button press
      idleTime = startPress - endPress; // This is the time between no presses and the first press
     } else{ 
      changeMode(); // This is the precise placement for the changeMode() function call because here, the button is released. The button state has change from LOW back to HIGH.
      
      //Serial.println(holdTime);

      //Here we transmit button press data.
      Serial.println(String(mode) + String(abs(counter)) + String(spinMode) + String(selector) + "   " + String(holdTime) + "   " + String(idleTime));
      delay(100); // This delay is important because without it, any button short presses wont be transmitted quickly enough.
      mode = buttonState; //Reset mode back to whatever buttonState is.
     }
  } else {
     //button state not changed. It runs in a loop.  
     if(buttonState==LOW){  // If button is being held
      endPress = millis();  // This is incrementer for how long the button is pressed
      holdTime = endPress-startPress; // This is the time the button has been held
      //Serial.println(holdTime);
     } 
  }
  lastButtonState = buttonState;        // save state for next loop
}


void changeMode(){


  // This function helps with switching behavior of rotating the rotary encoder 
  // between answer select and subject select. The placement of the function call is
  // very important because it must be called after the button is released, not when
  // the button is pressed.

  if (int(holdTime)<300){

    // We only want to change button presses if the hold time of the button is a short press
    // which is set to be shorter than 250 ms.
    
    // If spinMode == 1, we are in subject select mode.
    // In subject select mode, we don't want to change the question at all.
    if (spinMode==1){ 
      mode=1; 
      spinMode=0; // SpinMode must be set back to 0 here to exit out of the subject select mode; if done before here, question will be changed.
      }
    else{
    mode = 0; // If we are not in subject select mode, a short button press changes the question.
    }
    //delay(100);
  } else if (int(holdTime)>500){
    mode = 1; // If we are not yet in subject select mode, a long button hold switches behavior of rotation to subject select.
  }
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


void updateSpinMode(){

  // If button is pressed down and held for more than half a second, we enter into subject select mode.
  // Exiting out of subject select mode is done in the changeMode() function which resets spinMode to 0
  // after button is short pressed for exit.

  if (buttonState == LOW){
    if (holdTime > 500){
      spinMode = 1;
      }
  }

  // Switching RE spin behavior between controlling subject select vs answer select
  if (spinMode==1){
    if(counter>6){
      counter=0;
    }else if(counter<0){
      counter+=7;
    }else if(counter<-7){
      counter=0;
    }
  } else if (spinMode==0) {
    if(counter>3){
      counter=0;
    }else if(counter<0){
      counter+=4;
    }else if(counter<-4){
      counter=0;
    }
  }
}





