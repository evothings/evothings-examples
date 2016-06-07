#include <RH_ASK.h> // Radiohead library for RF modules
#include <SPI.h> // Not actually used but needed to compile

// RH_ASK driver; // Default settings (Speed = 2000bps; RX pin = 11; TX pin = 12; Ptt pin = 10)
RH_ASK driver(2000, 2, 3); // Setting RX pin (receiver) to 2 and TX pin (transmitter) to 3

const int room = 0; // Identification number
String startRequest = "a" + String(room); // Request string sent by the "mother" Arduino

const int photocellPin = A0; // Photocell pin
int photocellReading; // Variable for storing photocell reading

void setup()
{
    pinMode(photocellPin, INPUT);
    
    Serial.begin(9600); // For debugging
    if (!driver.init()) // If the RF modules failed to initialize
         Serial.println("init failed");
}

void loop()
{
    uint8_t buf[2]; // Buffer used for storing received request, its size is set to 2 bytes as the request is: "a" + String(room) (eg. a0)
    uint8_t buflen = sizeof(buf);
    
    if (driver.recv(buf, &buflen)) // Upon reception of a request
    {
        String request = (char*)buf; // Storing the request in a string for comparison
        request = request.substring(0, 2); // Message received is sometimes followed by weird characters, keeping only the first two
        Serial.print("Got request: "); // Printing out the received request for debugging
        Serial.println(request);
        
        if (request == startRequest) // If the request matches this Arduino's start request, measure data and send it
        {
            Serial.println("Start request received");
            Serial.println("");
            delay(150);
            
            // Sending data
            Serial.println("Sending data");
            Serial.println("");
            photocellReading = analogRead(photocellPin); // Measuring luminosity
            Serial.print("Photocell reading: ");
            Serial.println(photocellReading); // For debugging
            
            // Mapping the data to a number between 100 and 999 so that it is always 3 digits long, which makes it easyer to parse by the mother Arduino
            int mapPhotocellReading = map(photocellReading, 0, 1023, 100, 999);
            String str = room + String(mapPhotocellReading); // Creating a string containing room number and reading so that the "mother" Arduino knows where it comes from
            char data[5]; // Char array for storing response, needs to be 1 byte longer that the string length
            str.toCharArray(data, 5); // Copying string to char array
            
            driver.send((uint8_t *)data, strlen(data)); // Sending response
            driver.waitPacketSent(); // Waiting until response packet is fully sent
            
            Serial.print("Data sent: "); // For debugging
            Serial.println(data);
            Serial.println("");
        }
    }
}
