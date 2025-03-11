/*
  WiFi TCP Client with Time of Flight (TOF) Sensor 
  TCP Socket client for WiFiNINA and WiFi101 libraries.
  Connects to the TCP socket server, reads a TOF sensor once
  every five seconds, and sends a message with the reading.

  You'll need to include an arduino_secrets.h file with the following info:
  #define SECRET_SSID "ssid"      // your network name
  #define SECRET_PASS "password"  // your network password

  Here's a test with netcat: 
  char serverAddress[] = "x.x.x.x";  // replace with your computer's IP
  then on your computer, run  netcat:
  $ nc -klw 2 8080 | tee log.json
  This will send the output to the command line and to a file called log.json

  created 30 Dec 2022
  updated 27 Jan 2025
  by Tom Igoe

  updated 3 Mar 2025
  by Samuel Oge
 */


#include <WiFiNINA.h>  // use this for Nano 33 IoT or MKR1010 boards
#include "arduino_secrets.h"
#include "Adafruit_VL53L0X.h"  // this is the library for TOF sensor

// Initialize the Wifi client library
WiFiClient client;

// replace with your host computer's IP address
const char server[] = "10.23.11.233";
const int portNum = 8080;
// change this to a unique name for the device:
String deviceName = "TOF_sensor";
// message sending interval, in ms:
int interval = 5000;
// last time a message was sent, in ms:
long lastSend = 0;
// // Declare message as global varibable:
// String message; 

// make an instance of the library:
Adafruit_VL53L0X sensor = Adafruit_VL53L0X();

const int maxDistance = 2000;
int sleeping = 0;


void setup() {
  //Initialize serial
  Serial.begin(9600);
  // if serial monitor's not open, wait 3 seconds:
  if (!Serial) delay(3000);

  // Connect to WPA/WPA2 network.
  WiFi.begin(SECRET_SSID, SECRET_PASS);

  // attempt to connect to Wifi network:
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print("Attempting to connect to SSID: ");
    Serial.println(SECRET_SSID);
    // wait a second for connection:
    delay(1000);
  }
  Serial.print("Connected to to SSID: ");
  Serial.println(SECRET_SSID);
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
  Serial.print("Signal Strength (dBm): ");
  Serial.println(WiFi.RSSI());


  // initialize sensor, stop if it fails:
  if (!sensor.begin()) {
    Serial.println("Sensor not responding. Check wiring.");
    while (true)
      ;
  }
  /* config can be:
    VL53L0X_SENSE_DEFAULT: about 500mm range
    VL53L0X_SENSE_LONG_RANGE: about 2000mm range
    VL53L0X_SENSE_HIGH_SPEED: about 500mm range
    VL53L0X_SENSE_HIGH_ACCURACY: about 400mm range, 1mm accuracy
  */
  sensor.configSensor(Adafruit_VL53L0X::VL53L0X_SENSE_LONG_RANGE);
  // set sensor to range continuously:
  sensor.startRangeContinuous();
}

void loop() {
  // if the client's not connected, connect:
  if (!client.connected()) {
    Serial.println("connecting");
    Serial.println(server);
    Serial.println(portNum);
    client.connect(server, portNum);
    // skip the rest of the loop:
    return;
  }

  // if the reading is done:
  if (sensor.isRangeComplete()) {
    // read the result:
    int reading = sensor.readRangeResult();

    // format the message as JSON string:
    String message = "{\"device\": \"DEVICE\", \"sensor\": READING}";
    // and DEVICE with your device's name:
    message.replace("DEVICE", deviceName);

    // if it's with the max distance:
    if (reading < (maxDistance - 300)) {
      // print the result (distance in mm):
      Serial.println("Detecting");
      Serial.println(reading);
      sleeping = 0;
      // replace READING with the reading:
      message.replace("READING", String(reading));
      // send the message:
      client.println(message);
    } else {
      Serial.println("Sleeping");
      if (!sleeping) {
        // When there are no passerbys, sensor reading should be 0.
        message.replace("READING", String(0));
        // send the message:
        client.println(message);
        sleeping = 1;
      }
    }

    // // once every interval, get a reading and send it:
    // if (millis() - lastSend > interval) {
    //     // update the timestamp:
    //   lastSend = millis();
    // }
  }
}