/*
Arduino WiFi Script Server

Web server that accept commands for scripting the Arduino board.

This example is written for a network using WPA encryption.
For WEP or WPA, change the Wifi.begin() call accordingly.

The API is based on GET or PUT requests:

Set pin mode to OUTPUT for pin n: PUT /On
Response: "OK"
Example: O5 -> OK

Set pin mode to INPUT for pin n: PUT /In
Response: "OK"
Example: I5 -> OK
	
Write LOW to pin n: PUT /Ln
Response: "OK"
Example: L5 -> OK

Write HIGH to pin n: PUT /Hn
Response: "OK"
Example: H5 -> OK

READ pin n: GET /Rn
Response: "H" (HIGH) or "L" (LOW)
Example: R5 -> H

Created October 20, 2013
Mikael Kindborg, Evothings AB
*/

// Include files.
#include <SPI.h>
#include <WiFi.h>

// Your network SSID (network name).
char ssid[] = "";

// Your network password.
char pass[] = "";

// Your network key Index number (needed only for WEP).
int keyIndex = 0;

// Server status flag.
int status = WL_IDLE_STATUS;

// Create WiFi server on port 80 (standard web port).
WiFiServer server(80);

void setup()
{
	// Start serial communication with the given baud rate.
	// NOTE: Remember to set the baud rate in the Serial
	// monitor to the same value.
	Serial.begin(115200);

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

	// Start the web server.
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

	//while (client.connected())
	//{
		String request = readGetRequest(&client);
		consumeRequest(&client);
		executeRequest(&client, &request);
   //   client.flush();
	//}

	// Close the connection.
	//client.stop();

	Serial.println("Client disonnected");
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

int getCommandIndex(String* request)
{
	int index;
	if (-1 != (index = request->indexOf("GET")))
	{
		return index + 5; // 5 = index at end of "GET /"
	}
	else if (-1 != (index = request->indexOf("OPTIONS")))
	{
		return index + 9; // 9 = index at end of "OPTIONS /"
	}
	else if (-1 != (index = request->indexOf("/")))
	{
		return index + 1; // 1 = index at end of "/"
	}
	else
	{
		return -1;
	}
}

char readCommand(String* request)
{
	int index;
	if (-1 != (index = getCommandIndex(request)))
	{
		return request->charAt(index);
	}
	else
	{
		return '-';
	}
}

// Read the number parameter from the request string.
int readParam(String* request)
{
	int index;
	if (-1 != (index = getCommandIndex(request)))
	{
		String value = request->substring(index + 1, index + 2); // command is 1 character long and the value directly follows it
		return value.toInt();
	}
	else
	{
		return '-';
	}
}

// Read the GET request line,
String readGetRequest(WiFiClient* client)
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

			// Print the value.
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

// Read rest of the request.
void consumeRequest(WiFiClient* client)
{
	int endOfLineCounter = 0;

	// Loop while the client is connected.
	while (client->connected())
	{
		// Read available bytes.
		while (client->available())
		{
			// Read a byte.
			char c = client->read();

			// Print the value.
			Serial.write(c);

			if ('\n' == c || '\r' == c)
			{
				// Increment counter if character is cr or nl.
				++endOfLineCounter;
			}
			else
			{
				// Reset counter if other character.
				endOfLineCounter = 0;
			}

			// Exit when last empty line is consumed.
			if (4 == endOfLineCounter)
			{
				return;
			}
		}
	}
}

void sendResponse(WiFiClient* client, String response)
{
	// Send HTTP response flag to allow for cross-origin
	// Ajax requests.
	client->println("HTTP/1.1 200 OK");
	client->println("Access-Control-Allow-Origin: *");
	client->println("Content-type:text/plain");
	client->println();

	// Write the string in the response body.
	client->print(response);
	client->println();
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
