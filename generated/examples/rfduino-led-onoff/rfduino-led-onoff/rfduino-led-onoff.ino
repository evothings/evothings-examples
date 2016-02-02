// Code for RFduino LED On Off example.
// For RFduino (RFD22102) connected to RFduino RGB Shield (RFD22122).
// Evothings AB, 2014

#include <RFduinoBLE.h>

// Define input/output pins.
// Input pins for key buttons, and output pins for LED RGB On-Off control
// GPIO2 on the RFduino RGB shield is the Red LED
// GPIO3 on the RFduino RGB shield is the Green LED
// GPIO4 on the RFduino RGB shield is the Blue LED
// GPIO5 on the RFduino RGB shield is key button A
// GPIO6 on the RFduino RGB shield is key button B

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
	Serial.println("RFduino example started");
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

	// Check RFduino CPU temperature, and print to log
	float CPU_temperature = RFduino_temperature(CELSIUS);
	Serial.print("RFduino_temperature is: ");
	Serial.print(CPU_temperature);
	Serial.println(" deg C");

	// this is the data we want to appear in the advertisement
	// (the deviceName length plus the advertisement length must be <= 18 bytes
	// RFduinoBLE.advertisementData = "ledbtn";
	RFduinoBLE.advertisementInterval = 500;
	Serial.println("RFduino BLE Advertising interval 500ms");
	RFduinoBLE.deviceName = "RFduino";
	Serial.println("RFduino BLE DeviceName: RFduino");
	RFduinoBLE.txPowerLevel = -20;
	Serial.println("RFduino BLE Tx Power Level: -20dBm");

	// start the BLE stack
	RFduinoBLE.begin();
	Serial.println("RFduino BLE stack started");
}

// This function is called continuously, after setup() completes.
void loop()
{
	// switch to lower power mode
	RFduino_ULPDelay(INFINITE);
}


void RFduinoBLE_onAdvertisement()
{
	Serial.println("RFduino is doing BLE advertising ...");
	digitalWrite(RED_LED_PIN, LOW);
	digitalWrite(GREEN_LED_PIN, LOW);
	digitalWrite(BLUE_LED_PIN, LOW);
}

void RFduinoBLE_onConnect()
{
	Serial.println("RFduino BLE connection successful");
	digitalWrite(RED_LED_PIN, LOW);
	digitalWrite(GREEN_LED_PIN, HIGH);
	digitalWrite(BLUE_LED_PIN, LOW);
}

void RFduinoBLE_onDisconnect()
{
	Serial.println("RFduino BLE disconnected");
	// don't leave the leds on after disconnection
	digitalWrite(RED_LED_PIN, LOW);
	digitalWrite(GREEN_LED_PIN, LOW);
	digitalWrite(BLUE_LED_PIN, LOW);
}

void RFduinoBLE_onReceive(char *data, int len)
{
	// if the first byte is 0x01 / on / true
	Serial.println("Received data over BLE");
	if (data[0])
	{
		digitalWrite(BLUE_LED_PIN, HIGH);
		Serial.println("Turn RFduino Blue LED On");
	}
	else
	{
		digitalWrite(BLUE_LED_PIN, LOW);
		Serial.println("Turn RFduino Blue LED Off");
	}
}
