// Code for Simblee LED On Off example.
// For Simblee (RFD77201) connected to Simblee RGB Shield (RFD22122).
// Evothings AB, 2014

#include <SimbleeBLE.h>

// Define input/output pins.
// Input pins for key buttons, and output pins for LED RGB On-Off control
// GPIO2 on the Simblee RGB shield is the Red LED
// GPIO3 on the Simblee RGB shield is the Green LED
// GPIO4 on the Simblee RGB shield is the Blue LED
// GPIO5 on the Simblee RGB shield is key button A
// GPIO6 on the Simblee RGB shield is key button B

#define RED_LED_PIN 2
#define GREEN_LED_PIN 3
#define BLUE_LED_PIN 4
//#define BUTTON_A_INPUT_PIN 5
//#define BUTTON_B_INPUT_PIN 6

// This function is called only once, at reset.
void setup()
{
  // Enable serial debug.
  Serial.begin(9600);
  Serial.println("Simblee example started");
  Serial.println("Serial rate set to 9600 baud");

  // Enable outputs.
  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(GREEN_LED_PIN, OUTPUT);
  pinMode(BLUE_LED_PIN, OUTPUT);

  // Turn Off all LEDs initially
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(GREEN_LED_PIN, LOW);
  digitalWrite(BLUE_LED_PIN, LOW);

  // Indicate RGB LED is operational to user.
  digitalWrite(RED_LED_PIN, HIGH);
  delay (500);
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(GREEN_LED_PIN, HIGH);
  delay (500);
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(GREEN_LED_PIN, LOW);
  digitalWrite(BLUE_LED_PIN, HIGH);
  delay (500);
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(GREEN_LED_PIN, LOW);
  digitalWrite(BLUE_LED_PIN, LOW);

  // Check Simblee CPU temperature, and print to log
  float CPU_temperature = Simblee_temperature(CELSIUS);
  Serial.print("Simblee_temperature is: ");
  Serial.print(CPU_temperature);
  Serial.println(" deg C");

  // this is the data we want to appear in the advertisement
  // (the deviceName length plus the advertisement length must be <= 18 bytes
  // SimbleeBLE.advertisementData = "ledbtn";
  SimbleeBLE.advertisementInterval = 500;
  Serial.println("Simblee BLE Advertising interval 500ms");
  SimbleeBLE.deviceName = "Simblee";
  Serial.println("Simblee BLE DeviceName: Simblee");
  SimbleeBLE.txPowerLevel = -20;
  Serial.println("Simblee BLE Tx Power Level: -20dBm");

  // start the BLE stack
  SimbleeBLE.begin();
  Serial.println("Simblee BLE stack started");
}

// This function is called continuously, after setup() completes.
void loop()
{
  // switch to lower power mode
  Simblee_ULPDelay(INFINITE);
}


void SimbleeBLE_onAdvertisement()
{
  Serial.println("Simblee is doing BLE advertising ...");
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(GREEN_LED_PIN, LOW);
  digitalWrite(BLUE_LED_PIN, LOW);
}

void SimbleeBLE_onConnect()
{
  Serial.println("Simblee BLE connection successful");
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(GREEN_LED_PIN, HIGH);
  digitalWrite(BLUE_LED_PIN, LOW);
}

void SimbleeBLE_onDisconnect()
{
  Serial.println("Simblee BLE disconnected");
  // don't leave the leds on after disconnection
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(GREEN_LED_PIN, LOW);
  digitalWrite(BLUE_LED_PIN, LOW);
}

void SimbleeBLE_onReceive(char *data, int len)
{
  // if the first byte is 0x01 / on / true
  Serial.println("Received data over BLE");
  if (data[0])
  {
    digitalWrite(BLUE_LED_PIN, HIGH);
    Serial.println("Turn Simblee Blue LED On");
  }
  else
  {
    digitalWrite(BLUE_LED_PIN, LOW);
    Serial.println("Turn Simblee Blue LED Off");
  }
}
