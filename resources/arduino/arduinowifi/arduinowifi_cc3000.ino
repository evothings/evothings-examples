/*
Arduino CC3000 Wifi Module
Created January 15, 2016
Klaus Camilleri

This example is a mix of both an example written by Adafruit team & Wifi example written by Mikael Kindborg, Evothings AB

TCP socket server that accept commands for basic scripting
of the Arduino board.
This example is written for a network using WPA encryption.
For WEP or WPA, change the Wifi.begin() call accordingly.
The API consists of the requests listed below.
Requests and responses end with a new line.
The input parameter n is a pin number ranging from 2 to 9.
The response is always a 4-character string with a
hex encoded number ranging from 0 to FFFF.
Possible response string values:
H (result from digital read)
L (result from digital read)
0 to 1023 - Analog value (result from analog read)
Set pin mode to OUTPUT for pin n: On
Response: None
Example: O5
Note: O is upper case letter o, not digit zero (0).
Set pin mode to INPUT for pin n: In
Response: None
Example: I5
Write LOW to pin n: Ln
Response: None
Example: L5
Write HIGH to pin n: Hn
Response: None
Example: H5
READ pin n: Rn
Response: "H" (HIGH) or "L" (LOW)
Example: R5 -> H
ANALOG read pin n: An
Response: int value as string (range "0" to "1023")
Example: A5 -> 42
*/

#include <Adafruit_CC3000.h>
#include <SPI.h>

// These are the interrupt and control pins
#define ADAFRUIT_CC3000_IRQ   3  // MUST be an interrupt pin!
// These can be any two pins
#define ADAFRUIT_CC3000_VBAT  5
#define ADAFRUIT_CC3000_CS    10
// Use hardware SPI for the remaining pins
// On an UNO, SCK = 13, MISO = 12, and MOSI = 11

Adafruit_CC3000 cc3000 = Adafruit_CC3000(ADAFRUIT_CC3000_CS, ADAFRUIT_CC3000_IRQ, ADAFRUIT_CC3000_VBAT,
                                         SPI_CLOCK_DIVIDER); // you can change this clock speed

#define WLAN_SSID       "wifi"   // cannot be longer than 32 characters!
#define WLAN_PASS       "password"
// Security can be WLAN_SEC_UNSEC, WLAN_SEC_WEP, WLAN_SEC_WPA or WLAN_SEC_WPA2
#define WLAN_SECURITY   WLAN_SEC_WPA2

#define LISTEN_PORT           3300      // What TCP port to listen on for connections.  

#define BUFFER_SIZE           120

#define TIMEOUT_MS            500    // Amount of time in milliseconds to wait for
                                     // an incoming request to finish.  Don't set this
                                     // too high or your server could be slow to respond.

Adafruit_CC3000_Server httpServer(LISTEN_PORT);
uint8_t buffer[BUFFER_SIZE+1];
int bufindex = 0;

void setup(void)
{
  Serial.begin(115200);
  
  // Initialise the module
  Serial.println(F("\nInitializing..."));
  if (!cc3000.begin())
  {
    Serial.println(F("Couldn't begin()! Check your wiring?"));
    while(1);
  }
  
  Serial.print(F("\nAttempting to connect to ")); Serial.println(WLAN_SSID);
  if (!cc3000.connectToAP(WLAN_SSID, WLAN_PASS, WLAN_SECURITY)) {
    Serial.println(F("Failed!"));
    while(1);
  }
   
  Serial.println(F("Connected!"));
  
  Serial.println(F("Request DHCP"));
  while (!cc3000.checkDHCP())
  {
    delay(100); 
  }  

  // Start listening for connections
  httpServer.begin();
  
  Serial.println(F("Listening for connections..."));
}

void loop(void)
{
  // Try to get a client which is connected.
  Adafruit_CC3000_ClientRef client = httpServer.available();
  if (client) {
    Serial.println(F("Client connected."));
    
    Serial.println("Client connected");

    String request = readRequest(&client);
    executeRequest(&client, &request);

    // Close the connection.
    //client.stop();

    Serial.println("Client disonnected");
  }
}



String readRequest(Adafruit_CC3000_ClientRef* client)
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


void executeRequest(Adafruit_CC3000_ClientRef* client, String* request)
{
  char command = readCommand(request);
  int n = readParam(request);
  if ('O' == command)
  {
    pinMode(n, OUTPUT);
  }
  else if ('I' == command)
  {
    pinMode(n, INPUT);
  }
  else if ('L' == command)
  {
    digitalWrite(n, LOW);
  }
  else if ('H' == command)
  {
    digitalWrite(n, HIGH);
  }
  else if ('R' == command)
  {
    sendResponse(client, String(digitalRead(n)));
  }
  else if ('A' == command)
  {
    sendResponse(client, String(analogRead(n)));
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
	// This handles a hex digit 0 to F (0 to 15).
	char buffer[2];
	buffer[0] = request->charAt(1);
	buffer[1] = 0;
	return (int) strtol(buffer, NULL, 16);
}

void sendResponse(Adafruit_CC3000_ClientRef* client, String response)
{
  // Send response to client.
  client->println(response);

  // Debug print.
  Serial.println("sendResponse:");
  Serial.println(response);
}
