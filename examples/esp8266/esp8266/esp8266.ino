#include <ESP8266WiFi.h> //A simple ESP8266 Arduino library with built in re-connect functionality. (https://github.com/ekstrand/ESP8266wifi)

const char* ssid = "your_wifi_network_name";
const char* password = "your_wifi_network_password";
const int ledPin = 2;
WiFiServer server(1337); //Creates a server that listens for incoming connections on the specified port. (https://www.arduino.cc/en/Reference/WiFiServer)

// the declaration is not useful.

void setup(void) {
  Serial.begin(115200); // opens serial port, sets data rate to 115200 bps (https://www.arduino.cc/en/Serial/Begin), (https://www.arduino.cc/en/Reference/Serial)
  WiFi.begin(ssid, password); //Initializes the WiFi library's network settings and provides the current status. (https://www.arduino.cc/en/Reference/WiFiBegin)

  // Configure GPIO2 as OUTPUT.
  pinMode(ledPin, OUTPUT);

  // Start TCP server.
  server.begin(); //Tells the server to begin listening for incoming connections. //http://www.arduino.org/learning/reference/wifiserver-begin
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

  WiFiClient client = server.available(); //Gets a client that is connected to the server and has data available for reading. (https://www.arduino.cc/en/Reference/WiFiServerAvailable)

  if (client) { //a Client object; if no Client has data available for reading, this object will evaluate to false in an if-statement
    Serial.println("Client connected."); //Prints data to the serial port as human-readable ASCII text followed by a carriage return character.(https://www.arduino.cc/en/Serial/Println)

    while (client.connected()) {
      if (client.available()) { //Returns the number of bytes available for reading (that is, the amount of data that has been written to the client by the server it is connected to). (https://www.arduino.cc/en/Reference/WiFiClientAvailable)
        char command = client.read(); //This function reads the next byte received from the server the client is connected to (after the last call to read()). (http://www.arduino.org/learning/reference/wificlient-read)
        if (command == 'H') {
          digitalWrite(ledPin, HIGH); //Write a HIGH or a LOW value to a digital pin. (https://www.arduino.cc/en/Reference/DigitalWrite)
          Serial.println("LED is now off."); //the HIGH and LOW state is negative logical.
        }
        else if (command == 'L') {
          digitalWrite(ledPin, LOW);
          Serial.println("LED is now on."); //the HIGH and LOW state is negative logical.
        }
      }
    }
    Serial.println("Client disconnected.");
    client.stop(); //This function disconnects from the server. (http://www.arduino.org/learning/reference/wificlient-stop)
  }
}

void printWiFiStatus() {
  Serial.println("");
  Serial.print("Connected to "); //Prints data to the serial port as human-readable ASCII text. (https://www.arduino.cc/en/Serial/Print)
  Serial.println(ssid);
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}
