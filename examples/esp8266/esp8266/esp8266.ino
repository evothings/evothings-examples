#include <ESP8266WiFi.h>

const char* ssid = "foo";
const char* password = "bar";
const int ledPin = 2;
WiFiServer server(1337);

void setup(void) {

	Serial.begin(115200);
	WiFi.begin(ssid, password);

	// Configure GPIO2 as OUTPUT.
	pinMode(ledPin, OUTPUT);

	// Start TCP server.
	server.begin();
}

void loop(void) {

	// Check if module is still connected to WiFi.
	if (WiFi.status() != WL_CONNECTED) {

		while (WiFi.status() != WL_CONNECTED) {
			delay(500);
		}

		// Print the new IP to Serial.
		printWiFiStatus();
	}

	WiFiClient client = server.available();

	if (client) {

		Serial.println("Client connected.");

		while (client.connected()) {
			if (client.available()) {

				char command = client.read();

				if (command == 'H') {

					digitalWrite(ledPin, HIGH);
					Serial.println("Led is now on.");
				}
				else if (command == 'L') {

					digitalWrite(ledPin, LOW);
					Serial.println("Led is now off.");
				}
			}
		}
		Serial.println("Client disconnected.");
		client.stop();
	}
}

void printWiFiStatus() {

	Serial.println("");
	Serial.print("Connected to ");
	Serial.println(ssid);
	Serial.print("IP address: ");
	Serial.println(WiFi.localIP());
}
