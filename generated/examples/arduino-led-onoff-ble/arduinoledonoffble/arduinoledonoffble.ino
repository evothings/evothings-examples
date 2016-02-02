// Arduino code for example Arduino LED On/Off BLE.
// Evothings AB, 2014

// Include BLE files.
#include <SPI.h>
#include <boards.h>
#include <RBL_nRF8001.h>
#include <services.h>

// Define input/output pins
#define INPUT_PIN A0
#define LED_PIN 2

// This function is called only once, at reset.
void setup()
{
	// Enable serial debug.
	Serial.begin(9600);
	Serial.println("Arduino EasyBLE example started");
	Serial.println("Serial rate set to 9600");

	// Enable output.
	pinMode(LED_PIN, OUTPUT);

	// Turn off LED.
	digitalWrite(LED_PIN, LOW);

	// Writing to an analog input pin sets baseline for later input.
	digitalWrite(INPUT_PIN, HIGH);

	// Default pins set to 9 and 8 for REQN and RDYN
	// Set your REQN and RDYN here before ble_begin() if you need
	//ble_set_pins(3, 2);

	// Initialize BLE library.
	ble_begin();

	// Set a custom BLE name.
	ble_set_name("arduinoble");

	Serial.println("ble_begin done!");

	// Turn on LED.
	digitalWrite(LED_PIN, HIGH);
}

// This function is called continuously, after setup() completes.
void loop()
{
	// If there's any input...
	while (ble_available())
	{
		// Read input.
		int c = ble_read();
		Serial.println("Got input:");
		if (c != 0)
		{
			// Non-zero input means "turn on LED".
			Serial.println("  on");
			digitalWrite(LED_PIN, HIGH);
		}
		else
		{
			// Input value zero means "turn off LED".
			Serial.println("  off");
			digitalWrite(LED_PIN, LOW);
		}
	}

	// Process BLE events.
	ble_do_events();
}
