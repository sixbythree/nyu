/*
  TOF MQTT Client sender/receiver

  This sketch demonstrates an MQTT client that connects to a broker, subscribes to a topic,
  and both listens for messages on that topic and sends messages to it, a random number between 0 and 255.
  When the client receives a message, it parses it, and PWMs the built-in LED.

  This sketch uses https://public.cloud.shiftr.io as the MQTT broker, but others will work as well.
  See https://tigoe.github.io/mqtt-examples/#broker-client-settings for connection details. 

Libraries used:
  * http://librarymanager/All#WiFiNINA or
  * http://librarymanager/All#WiFi101 
  * http://librarymanager/All#WiFiS3 
  * http://librarymanager/All#ArduinoMqttClient

  the arduino_secrets.h file:
  #define SECRET_SSID ""    // network name
  #define SECRET_PASS ""    // network password
  #define SECRET_MQTT_USER "public" // broker username
  #define SECRET_MQTT_PASS "public" // broker password

  created 11 June 2020
  updated 25 Feb 2023
  by Tom Igoe
*/

#include <WiFiNINA.h>  // use this for Nano 33 IoT, MKR1010, Uno WiFi
// #include <WiFi101.h>    // use this for MKR1000
// #include <WiFiS3.h>  // use this for Uno R4 WiFi
// #include <ESP8266WiFi.h>  // use this for ESP8266-based boards
#include <ArduinoMqttClient.h>
#include "arduino_secrets.h"
#include "Adafruit_VL53L0X.h"  // this is the library for TOF sensor


// initialize WiFi connection as SSL:
WiFiClient wifi;
MqttClient mqttClient(wifi);

// details for MQTT client:
char broker[] = "tigoe.net";
int port = 1883;
char topic[] = "TOF";
String clientID = "arduinoMqttClient-";  // ?????Why is the client id arduinoMqttClient-?

// last time the client sent a message, in ms:
long lastTimeSent = 0;
// message sending interval:
int interval = .5 * 1000;

// make an instance of the library:
Adafruit_VL53L0X sensor = Adafruit_VL53L0X();

const int maxDistance = 1000;
int sleeping = 0;

void setup() {
  // initialize serial:
  Serial.begin(9600);
  // wait for serial monitor to open:
  if (!Serial) delay(3000);
  pinMode(LED_BUILTIN, OUTPUT);
  // connect to WiFi:
  connectToNetwork();
  Serial.println("Loading...");
  // make the clientID unique by adding the last three digits of the MAC address:
  byte mac[6];
  WiFi.macAddress(mac);
  for (int i = 0; i < 3; i++) {
    clientID += String(mac[i], HEX);
  }
  // set the credentials for the MQTT client:
  mqttClient.setId(clientID);
  // if needed, login to the broker with a username and password:
  mqttClient.setUsernamePassword(SECRET_MQTT_USER, SECRET_MQTT_PASS);

  Serial.println("Starting TOF!");

  // initialize sensor, stop if it fails:
  if (!sensor.begin()) {
    Serial.println("Sensor not responding. Check wiring.");
    while (true)
      ;
  }

  sensor.configSensor(Adafruit_VL53L0X::VL53L0X_SENSE_LONG_RANGE);
  // set sensor to range continuously:
  sensor.startRangeContinuous();
  Serial.println("Setup Complete!");
}

void loop() {
  // if you disconnected from the network, reconnect:
  if (WiFi.status() != WL_CONNECTED) {
    connectToNetwork();
    // skip the rest of the loop until you are connected:
    return;
  }
  // if not connected to the broker, try to connect:
  if (!mqttClient.connected()) {
    Serial.println("attempting to connect to broker");
    connectToBroker();
  }
  // poll for new messages from the broker:
  mqttClient.poll();


  // if the reading is done:
  if (sensor.isRangeComplete()) {
    // read the result:
    int sensorReading = sensor.readRangeResult();

    // format the message as JSON string:
    String message = "{\"device\": \"DEVICE\", \"sensor\": READING}";
    // and DEVICE with your device's name:
    message.replace("DEVICE", topic);

    // if it's with the max distance:
    if (sensorReading < (maxDistance - 300)) {
      sleeping = 0;

      // print the result (distance in mm):
      Serial.println("Detecting");
      Serial.println(sensorReading);
      message.replace("READING", String(sensorReading));      
      
      if (millis() - lastTimeSent > interval) {
        Serial.println(message);
        if (mqttClient.connected()) {
          // start a new message on the topic:
          mqttClient.beginMessage(topic);
          // print the body of the message:
          mqttClient.print(message);
          // send the message:
          mqttClient.endMessage();
          // send a serial notification:
          Serial.print("published a message: ");
          Serial.println(message);
          // timestamp this message:
          lastTimeSent = millis();
        }
      }
    } else {
      Serial.println("Sleeping");
      if (!sleeping) {
        // When there are no passerbys, sensor reading should be 0.
        message.replace("READING", String(0));
        // send the message:
        if (mqttClient.connected()) {
            // start a new message on the topic:
            mqttClient.beginMessage(topic);
            // print the body of the message:
            mqttClient.print(message);
            // send the message:
            mqttClient.endMessage();
            // send a serial notification:
            Serial.print("published a message: ");
            Serial.println(sensorReading);
            // timestamp this message:
            lastTimeSent = millis();
          }
        }
        sleeping = 1;
      }
    }
  }


boolean connectToBroker() {
  // if the MQTT client is not connected:
  if (!mqttClient.connect(broker, port)) {
    // print out the error message:
    Serial.print("MQTT connection failed. Error no: ");
    Serial.println(mqttClient.connectError());
    // return that you're not connected:
    return false;
  }

  // set the message receive callback:
  mqttClient.onMessage(onMqttMessage);  // ????? what is onMessage for
  // subscribe to a topic:
  Serial.print("Subscribing to topic: ");
  Serial.println(topic);
  mqttClient.subscribe(topic);

  // once you're connected, you
  // return that you're connected:
  return true;
}

// When does this code get executed?
void onMqttMessage(int messageSize) {
  // we received a message, print out the topic and contents
  // Serial.println("Received a message with topic ");
  // Serial.print(mqttClient.messageTopic());
  // Serial.print(", length ");
  // Serial.print(messageSize);
  // Serial.println(" bytes:");
  String incoming = "";
  // use the Stream interface to print the contents
  while (mqttClient.available()) {
    incoming += (char)mqttClient.read();
  }
  // convert the incoming string to an int so you can use it:
  int result = incoming.toInt();
  // use the result to dim the builtin LED:
  if (result > 0) {
    analogWrite(LED_BUILTIN, result);
  }
  // print the result:
  // Serial.println(result);
  delay(100);
}

void connectToNetwork() {
  // try to connect to the network:
  while (WiFi.status() != WL_CONNECTED) {
    Serial.println("Attempting to connect to: " + String(SECRET_SSID));
    //Connect to WPA / WPA2 network:
    WiFi.begin(SECRET_SSID, SECRET_PASS);
    delay(2000);
  }

  // print IP address once connected:
  Serial.print("Connected. My IP address: ");
  Serial.println(WiFi.localIP());
}