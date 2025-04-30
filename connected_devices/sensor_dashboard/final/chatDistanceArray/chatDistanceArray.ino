#include <Wire.h>
#include <SparkFun_VL53L5CX_Library.h> // http://librarymanager/All#SparkFun_VL53L5CX

SparkFun_VL53L5CX myImager;
VL53L5CX_ResultsData measurementData;

int imageResolution = 0;
int imageWidth = 0;

void setup()
{
  Serial.begin(115200);
  delay(1000);
  Serial.println("SparkFun VL53L5CX Imager Enhanced Example");

  Wire.begin();
  Wire.setClock(400000);

  Serial.println("Initializing sensor board. This can take up to 10s. Please wait.");
  if (!myImager.begin()) {
    Serial.println(F("Sensor not found - check your wiring. Freezing"));
    while (1);
  }

  // 🔧 Set resolution and performance settings
  myImager.setResolution(8 * 8);
  myImager.setIntegrationTime(100);     // Longer integration = better range (max 1000)
  myImager.setSharpenerPercent(10);     // Lower = smoother data, better for dark/distant
  myImager.setRangingFrequency(10);     // Lower frequency gives more time per frame

  imageResolution = myImager.getResolution();
  imageWidth = sqrt(imageResolution);

  myImager.startRanging();
}

void loop()
{
  if (myImager.isDataReady())
  {
    if (myImager.getRangingData(&measurementData))
    {
      Serial.println("Distance Map (mm):");

      for (int y = 0; y <= imageWidth * (imageWidth - 1); y += imageWidth)
      {
        for (int x = imageWidth - 1; x >= 0; x--)
        {
          int index = x + y;
          uint8_t targets = measurementData.nb_target_detected[index];
          uint8_t status = measurementData.target_status[index];
          uint16_t distance = measurementData.distance_mm[index];

          Serial.print("\t");

          // 🚫 Treat low-confidence readings as "Inf"
          if (targets == 0 || status > 5) {
            Serial.print("_");
          } else {
            if (distance<400){
              Serial.print("_");
            } else{
              Serial.print("1");
            }
            
          }
        }
        Serial.println();
      }

      Serial.println();
    }
  }

  delay(5); // Adjust if needed
}