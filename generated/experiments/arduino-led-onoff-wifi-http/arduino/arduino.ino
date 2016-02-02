/*
Arduino WiFi Web Server LED Demo

A simple web server that lets you blink an LED via a REST API.
The IP address of your WiFi Shield is printed to the Serial
monitor once connected.

This example is written for a network using WPA encryption.
For WEP or WPA, change the Wifi.begin() call accordingly.

With the REST API, you can turn on and off the LED on pin 5.

For example, if the IP address of the shield is 192.168.0.101,
turn the LED on with:
  http://192.168.0.101/H
and off with:
  http://yourAddress/L

Circuit:
* WiFi shield attached
* LED attached to pin 5

Created 25 Nov 2012
by Tom Igoe

Modified October 20, 2013
by Mikael Kindborg, Evothings AB
*/

// Include files.
#include <SPI.h>
#include <WiFi.h>

// Your network SSID (network name).
char ssid[] = "type your wifi network name here";

// Your network password.
char pass[] = "type your wifi password here";

// Your network key Index number (needed only for WEP).
int keyIndex = 0;

// LED pin.
int pin = 5;

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

    // Set LED pin mode to output.
    pinMode(pin, OUTPUT);

    // Turn LED off.
    digitalWrite(pin, LOW);

    // Check for the presence of the WiFi shield.
    if (WiFi.status() == WL_NO_SHIELD)
    {
        If no shield, print message and exit setup.
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
        delay(5000);
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

    String request = readGetRequest(&client);
    consumeRequest(&client);

    // Check if the request is "GET /H" or "GET /L".
    if (request.startsWith("GET /H"))
    {
        // GET /H turns the LED on.
        digitalWrite(pin, HIGH);
    }
    else if (request.startsWith("GET /L"))
    {
        // GET /L turns the LED off.
        digitalWrite(pin, LOW);
    }

    sendResponse(&client, "OK");

    // Close the connection.
    client.stop();

    Serial.println("Client disonnected");
}

// Read the GET request line,
String readGetRequest(WiFiClient* client)
{
    String request = "";

    // Loop while the client is connected.
    while (client->connected())
    {
        // Read available bytes.
        if (client->available())
        {
            // Read a byte.
            char c = client->read();

            // Print the value.
            Serial.write(c);

            // Exit loop if end of line.
            if ('\n' == c)
            {
                break;
            }

            // Add byte to request line.
            request += c;
        }
    }

    return request;
}

// Read rest of the request.
void consumeRequest(WiFiClient* client)
{
    int endOfLineCounter = 0;

    // Loop while the client is connected.
    while (client->connected())
    {
        // Read available bytes.
        if (client->available())
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
                break;
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
    client->println("Content-type:text/html");
    client->println();

    // Write the string in the response body.
    client->print(response);
    client->println();
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
