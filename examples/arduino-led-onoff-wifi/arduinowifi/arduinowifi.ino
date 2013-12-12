/*
Arduino WiFi Script Server

Created October 20, 2013
Mikael Kindborg, EvoThings AB

TCP socket server that accept commands for basic scripting
of the Arduino board.

This example is written for a network using WPA encryption.
For WEP or WPA, change the Wifi.begin() call accordingly.

The API consists of the following requests.
Requests and responses end with a new line.

n is a pin number ranging from 2 to 9.

Set pin mode to OUTPUT for pin n: On
Response: "OK"
Example: O5 -> OK
Note: O is upper case letter o, not digit 0.

Set pin mode to INPUT for pin n: In
Response: "OK"
Example: I5 -> OK

Write LOW to pin n: Ln
Response: "OK"
Example: L5 -> OK

Write HIGH to pin n: Hn
Response: "OK"
Example: H5 -> OK

READ pin n: Rn
Response: "H" (HIGH) or "L" (LOW)
Example: R5 -> H
*/

// Include files.
#include <SPI.h>
#include <WiFi.h>

// Your network SSID (network name).
// TODO: Enter the name of your wifi network here.
char ssid[] = "wifi name";

// Your network password.
// TODO: Enter the password of your wifi network here.
char pass[] = "wifi password";

// Your network key Index number (needed only for WEP).
int keyIndex = 0;

// Server status flag.
int status = WL_IDLE_STATUS;

// Create WiFi server listening on the given port.
WiFiServer server(3300);

void setup()
{
	// Start serial communication with the given baud rate.
	// NOTE: Remember to set the baud rate in the Serial
	// monitor to the same value.
	Serial.begin(9600);

	// Wait for serial port to connect. Needed for Leonardo only
	while (!Serial) { ; }

	// Check for the presence of the WiFi shield.
	if (WiFi.status() == WL_NO_SHIELD)
	{
		// If no shield, print message and exit setup.
		Serial.println("WiFi shield not present");
		status = WL_NO_SHIELD;
		return;
	}

	String version = WiFi.firmwareVersion();
	if (version != "1.1.0")
	{
		Serial.println("Please upgrade the firmware");
	}

	// Connect to Wifi network.
	while (status != WL_CONNECTED)
	{
		Serial.print("Connecting to Network named: ");
		Serial.println(ssid);

		// Connect to WPA/WPA2 network. Update this line if
		// using open or WEP network.
		status = WiFi.begin(ssid, pass);

		// Wait for connection.
		delay(1000);
	}

	// Start the server.
	server.begin();

	// Print WiFi status.
	printWifiStatus();
}

void loop()
{
	// Check that we are connected.
	if (status != WL_CONNECTED)
	{
		return;
	}

	// Listen for incoming client requests.
	WiFiClient client = server.available();
	if (!client)
	{
		return;
	}

	Serial.println("Client connected");

	String request = readRequest(&client);
	executeRequest(&client, &request);

	// Close the connection.
	//client.stop();

	Serial.println("Client disonnected");
}

// Read the request line,
String readRequest(WiFiClient* client)
{
	String request = "";

	// Loop while the client is connected.
	while (client->connected())
	{
		// Read available bytes.
		while (client->available())
		{
			// Read a byte.
			char c = client->read();

			// Print the value (for debugging).
			Serial.write(c);

			// Exit loop if end of line.
			if ('\n' == c)
			{
			    return request;
			}

			// Add byte to request line.
			request += c;
		}
	}
}

void executeRequest(WiFiClient* client, String* request)
{
	char command = readCommand(request);
	int n = readParam(request);
	if ('O' == command)
	{
		pinMode(n, OUTPUT);
		sendResponse(client, "OK");
	}
	else if ('I' == command)
	{
		pinMode(n, INPUT);
		sendResponse(client, "OK");
	}
	else if ('L' == command)
	{
		digitalWrite(n, LOW);
		sendResponse(client, "OK");
	}
	else if ('H' == command)
	{
		digitalWrite(n, HIGH);
		sendResponse(client, "OK");
	}
	else if ('R' == command)
	{
		sendResponse(client, String(digitalRead(n)));
	}
	else
	{
		sendResponse(client, "UNKNOWN COMMAND");
	}
}

// Read the command from the request string.
char readCommand(String* request)
{
	String commandString = request->substring(0, 1);
	return commandString.charAt(0);
}

// Read the parameter from the request string.
int readParam(String* request)
{
	String value = request->substring(1, 2);
	return value.toInt();
}

void sendResponse(WiFiClient* client, String response)
{
	// Send response to client.
	client->println(response);

	// Debug print.
	Serial.println("sendResponse:");
	Serial.println(response);
}

void printWifiStatus()
{
	Serial.println("WiFi status");

	// Print network name.
	Serial.print("  SSID: ");
	Serial.println(WiFi.SSID());

	// Print WiFi shield IP address.
	IPAddress ip = WiFi.localIP();
	Serial.print("  IP Address: ");
	Serial.println(ip);

	// Print the signal strength.
	long rssi = WiFi.RSSI();
	Serial.print("  Signal strength (RSSI):");
	Serial.print(rssi);
	Serial.println(" dBm");
}
