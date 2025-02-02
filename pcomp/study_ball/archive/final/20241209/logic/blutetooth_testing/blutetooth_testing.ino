/*
  LED

  This example creates a Bluetooth® Low Energy peripheral with service that contains a
  characteristic to control an LED.

  The circuit:
  - Arduino MKR WiFi 1010, Arduino Uno WiFi Rev2 board, Arduino Nano 33 IoT,
    Arduino Nano 33 BLE, or Arduino Nano 33 BLE Sense board.

  You can use a generic Bluetooth® Low Energy central app, like LightBlue (iOS and Android) or
  nRF Connect (Android), to interact with the services and characteristics
  created in this sketch.

  This example code is in the public domain.
*/

#include <ArduinoBLE.h>

BLEService studyService("19B10000-E8F2-537E-4F6C-D104768A1214"); // Bluetooth® Low Energy LED Service

// Bluetooth® Low Energy Study  Characteristic - custom 128-bit UUID, read and writable by central
BLEByteCharacteristic studyCharacteristic("19B10001-E8F2-537E-4F6C-D104768A1214", BLERead | BLEWrite);

const int studyPin = 5; // pin to use for the LED
int buttonState;


void setup() {
  Serial.begin(9600);
  while (!Serial);

  // set LED pin to output mode
  //pinMode(ledPin, OUTPUT);

  // begin initialization
  if (!BLE.begin()) {
    Serial.println("starting Bluetooth® Low Energy module failed!");

    while (1);
  }

  // set advertised local name and service UUID:
  BLE.setLocalName("Study Ball");
  BLE.setAdvertisedService(studyService);

  // add the characteristic to the service
  studyService.addCharacteristic(studyCharacteristic);

  // add service
  BLE.addService(studyService);

  // set the initial value for the characeristic:
  studyCharacteristic.writeValue(1);

  // start advertising
  BLE.advertise();

  Serial.println("BLE Study Peripheral");
}

void loop() {
  // listen for Bluetooth® Low Energy peripherals to connect:
  BLEDevice central = BLE.central();

  // if a central is connected to peripheral:
  if (central) {
    Serial.print("Connected to central: ");
    // print the central's MAC address:
    Serial.println(central.address());

    // while the central is still connected to peripheral:
    while (central.connected()) {
      // if the remote device wrote to the characteristic,
      // use the value to control the LED:

      if (studyCharacteristic.written()) {
         if (studyCharacteristic.value()) {   // any value other than 0
           Serial.println("Study Ball on");
           digitalWrite(studyPin, HIGH);         // will turn the LED on
         } else {                              // a 0 value
           Serial.println(F("Study Ball off"));
           digitalWrite(studyPin, LOW);          // will turn the LED off
         }
       }  

    buttonState = digitalRead(5);
    Serial.print(F("Button Value "));
    Serial.println(buttonState);

    }
    
    
    // when the central disconnects, print it out:
    Serial.print(F("Disconnected from central: "));
    Serial.println(central.address());
  }
}
