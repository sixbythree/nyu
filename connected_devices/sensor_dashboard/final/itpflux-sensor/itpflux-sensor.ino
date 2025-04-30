#include <Wire.h>
#include <SparkFun_VL53L5CX_Library.h> //http://librarymanager/All#SparkFun_VL53L5CX
#include <Adafruit_SSD1306.h>
#include <Adafruit_GFX.h>
#include <WiFiNINA.h>  // use this for Nano 33 IoT, MKR1010, Uno WiFi
#include <ArduinoMqttClient.h>
#include "arduino_secrets.h"


// initialize WiFi connection as SSL:
WiFiClient wifi;
MqttClient mqttClient(wifi);

// details for MQTT client:
char broker[] = "tigoe.net";
int port = 1883;
char topic[] = "itpflux-sensor"; //_VL53L0X";
String clientID = "arduinoMqttClient-";  // ?????Why is the client id arduinoMqttClient-?
String itpflux_Sensor_Reading = "\n";


// last time the client sent a message, in ms:
long lastTimeSent = 0;
// message sending interval:
int interval = .5 * 1000;



SparkFun_VL53L5CX myImager;
VL53L5CX_ResultsData measurementData; // Result data class structure, 1356 byes of RAM
 
const int SCREEN_WIDTH = 128; // OLED display width, in pixels
const int SCREEN_HEIGHT = 64; // OLED display height, in pixels
 
// initialize the display:
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT);

int imageResolution = 0; //Used to pretty print output
int imageWidth = 0; //Used to pretty print output

void setup() {
  pinMode(3,OUTPUT);

  Serial.begin(115200);
  delay(1000);

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

  Serial.println("SparkFun VL53L5CX Imager");

  Wire.begin(); //This resets to 100kHz I2C
  Wire.setClock(400000); //Sensor has max I2C freq of 400kHz 
  
  Serial.println("Initializing sensor board. This can take up to 10s. Please wait.");
  if (myImager.begin() == false)
  {
    Serial.println(F("Sensor not found - check your wiring. Freezing"));
    while (1) ;
  }
  
  myImager.setResolution(8*8); //Enable all 64 pads
    
  imageResolution = myImager.getResolution(); //Query sensor for current resolution - either 4x4 or 8x8
  imageWidth = sqrt(imageResolution); //Calculate printing width

  myImager.startRanging();


  // initialize serial and wait for serial monitor to open:
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

  digitalWrite(3,HIGH);
  
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




  // int sensorReading = analogRead(A0);
  // clear the display:
  display.clearDisplay();
  // set the text size to 2:
  display.setTextSize(2);
  // set the text color to white:
  display.setTextColor(SSD1306_INVERSE);
  // display.setCursor(0, 0); 
  
  // format the message as JSON string:
  String message = "{\"device\": \"DEVICE\", \"sensor\": READING}";

  // and DEVICE with your device's name:
  message.replace("DEVICE", topic);


  //Poll sensor for new data
  if (myImager.isDataReady() == true)
  {
    if (myImager.getRangingData(&measurementData)) //Read distance data into array
    
    {
      display.setCursor(0, 0); 
      display.print(measurementData.distance_mm[5]);
      display.print("-");
      display.print(measurementData.distance_mm[4]);
      display.setCursor(0, 20); 
      display.print(measurementData.distance_mm[21]);
      display.print("-");
      display.print(measurementData.distance_mm[20]);
      display.setCursor(0, 40); 
      display.print(measurementData.distance_mm[37]);
      display.print("-");
      display.print(measurementData.distance_mm[36]);
      
      // display.print(sensorReading);
      // push everything out to the screen:
      display.display();


      //The ST library returns the data transposed from zone mapping shown in datasheet
      //Pretty-print data with increasing y, decreasing x to reflect reality
      for (int y = 0 ; y <= imageWidth * (imageWidth - 1) ; y += imageWidth)
      {
        for (int x = imageWidth - 1 ; x >= 0 ; x--)
        {
          // Serial.print("\t");
          // Serial.print(measurementData.distance_mm[x + y]);
          itpflux_Sensor_Reading += String(measurementData.distance_mm[x + y]);
          itpflux_Sensor_Reading += "\t";
        }
        // Serial.println();
        itpflux_Sensor_Reading += "\n";
      }
      // Serial.println();
    }
    itpflux_Sensor_Reading += "9999\t9999\t9999\t9999\t9999\t9999\t9999\t9999";
    itpflux_Sensor_Reading += "\n";
    // Serial.println("READING--------------");
    // Serial.println(itpflux_Sensor_Reading);
    message.replace("READING", itpflux_Sensor_Reading);
    Serial.println(message);

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
      Serial.println();
      // // timestamp this message:
      lastTimeSent = millis();
      }
      
    itpflux_Sensor_Reading = "\n";
  }

  
  delay(10); //Small delay between polling
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