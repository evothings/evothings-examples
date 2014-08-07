/*
Arduino Ethernet Script Server

Created Mars 4, 2014
Mikael Kindborg, Evothings AB

TCP socket server that accept commands for basic scripting
of the Arduino board.

This example is written for use with an Ethernet shield.

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
#include <Ethernet.h>

// Enter a MAC address for your controller below, usually found on a sticker
// on the back of your Ethernet shield
byte mac[] = { 0x90, 0xA2, 0xDA, 0x0E, 0xD0, 0x93 };

// The IP address will be dependent on your local network.
// If you have IP network info, uncomment the lines starting
// with IPAddress and enter relevant data for your network.
// If you don't know, you probably have dynamically allocated IP adresses, then
// you don't need to do anything, move along.
// IPAddress ip(192,168,1, 177);
// IPAddress gateway(192,168,1, 1);
// IPAddress subnet(255, 255, 255, 0);

// Create a server listening on the given port.
EthernetServer server(3300);

void setup()
{
	// Initialize the Ethernet shield.
	// If you entered fixed ipaddress info, gateway, subnet mask,
	// then uncommment the next line.
	// Ethernet.begin(mac, ip, gateway, subnet);

	// If it works to get a dynamic IP from a DHCP server, use this
	// code to test if you're getting a dynamic adress. If this
	// does not work, use the above method of specifying an IP-address.
	// dhcp test starts here
	if (Ethernet.begin(mac) == 0)
	{
		Serial.println("Failed to configure Ethernet using DHCP");
		// No point in carrying on, stop here forever.
		while(true) ;
	}
	// dhcp test end

	// Start serial communication with the given baud rate.
	// NOTE: Remember to set the baud rate in the Serial
	// monitor to the same value.
	Serial.begin(9600);

	// Wait for serial port to connect. Needed for Leonardo only.
	while (!Serial) { ; }

	// Start the server.
	server.begin();

	// Print status.
	printServerStatus();
}

void loop()
{
	// Listen for incoming client requests.
	EthernetClient client = server.available();
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
String readRequest(EthernetClient* client)
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
	return request;
}

void executeRequest(EthernetClient* client, String* request)
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

void sendResponse(EthernetClient* client, String response)
{
	// Send response to client.
	client->println(response);

	// Debug print.
	Serial.println("sendResponse:");
	Serial.println(response);
}

void printServerStatus()
{
	Serial.print("Server address:");
	Serial.println(Ethernet.localIP());
}
