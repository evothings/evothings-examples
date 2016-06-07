/* #############################################################################
LIBRARIES
############################################################################## */

#include <Arduino.h>
#include <RH_ASK.h>
#include <SPI.h>
#if not defined (_VARIANT_ARDUINO_DUE_X_) && not defined (_VARIANT_ARDUINO_ZERO_)
#include <SoftwareSerial.h>
#endif

#include "Adafruit_BLE.h"
#include "Adafruit_BluefruitLE_SPI.h"
#include "Adafruit_BluefruitLE_UART.h"

#include "BluefruitConfig.h"

/* #############################################################################
VARIABLES
############################################################################## */

const int nbRooms = 3; // Total number of rooms

int values[nbRooms]; // Used for storing the data gathered from the the transmitters
int LEDpin[] = {5, 6, 7}; // Pins used for the LEDs

int limit[3]; // Used for storing the luminosity limits at which the light is considered off

// Used for storing the millis() values
unsigned long time;
unsigned long currentTime;

String dataToSend; // Used for storing the data sent to the Smartphone

char* requests[] = {"a0", "a1", "a2"}; // Used for storing the requests, don't forget to change it if you use more or less than 3 transmitter Arduinos

char *request; // Used for storing the request to be sent

bool gotResponse = false;
bool firstRequest = true;
bool bleIsConnected = false;
bool sending = true; // For stopping the BLE broadcasting

/* #############################################################################
OBJECTS
############################################################################## */

RH_ASK driver(2000, 2, 3, 8); // Setting RX pin (receiver) to 2, TX pin (transmitter) to 3 and PTT pin (not used) to an unused pin, as the default PTT pin (10) is used

// Parameters for the SoftwareSerial and Adafruit_BluefruitLE_UART stored in BluefruitConfig file
SoftwareSerial bluefruitSS = SoftwareSerial(BLUEFRUIT_SWUART_TXD_PIN, BLUEFRUIT_SWUART_RXD_PIN);

Adafruit_BluefruitLE_UART ble(bluefruitSS, BLUEFRUIT_UART_MODE_PIN,
                              BLUEFRUIT_UART_CTS_PIN, BLUEFRUIT_UART_RTS_PIN);

/*=========================================================================
    APPLICATION SETTINGS

    FACTORYRESET_ENABLE       Perform a factory reset when running this sketch
   
                              Enabling this will put your Bluefruit LE module
                              in a 'known good' state and clear any config
                              data set in previous sketches or projects, so
                              running this at least once is a good idea.
   
                              When deploying your project, however, you will
                              want to disable factory reset by setting this
                              value to 0.  If you are making changes to your
                              Bluefruit LE device via AT commands, and those
                              changes aren't persisting across resets, this
                              is the reason why.  Factory reset will erase
                              the non-volatile memory where config data is
                              stored, setting it back to factory default
                              values.
       
                              Some sketches that require you to bond to a
                              central device (HID mouse, keyboard, etc.)
                              won't work at all with this feature enabled
                              since the factory reset will clear all of the
                              bonding data stored on the chip, meaning the
                              central device won't be able to reconnect.
    MINIMUM_FIRMWARE_VERSION  Minimum firmware version to have some new features
    MODE_LED_BEHAVIOUR        LED activity, valid options are
                              "DISABLE" or "MODE" or "BLEUART" or
                              "HWUART"  or "SPI"  or "MANUAL"
    -----------------------------------------------------------------------*/
#define FACTORYRESET_ENABLE         1
#define MINIMUM_FIRMWARE_VERSION    "0.6.6"
#define MODE_LED_BEHAVIOUR          "MODE"
/*=========================================================================*/

/* #############################################################################
CODE
############################################################################## */

void setup(void)
{
  for (int i = 0; i < sizeof(LEDpin); i++)
  {
    pinMode(LEDpin[i], OUTPUT); // Initialising LED pins
  }

  for (int i = 0; i < nbRooms; i++)
  {
    limit[i] = 0; // Initialising the limits at 0
  }

  Serial.begin(9600); // For debugging
  if (!driver.init()) // If the RF modules failed to initialise
    Serial.println("init failed");

  setupBluefruit();

  Serial.println(F("******************************"));

  // LED Activity command is only supported from 0.6.6
  if ( ble.isVersionAtLeast(MINIMUM_FIRMWARE_VERSION) )
  {
    // Change Mode LED Activity
    Serial.println(F("Change LED activity to " MODE_LED_BEHAVIOUR));
    ble.sendCommandCheckOK("AT+HWModeLED=" MODE_LED_BEHAVIOUR);
  }

  // Set module to DATA mode
  Serial.println( F("Switching to DATA mode!") );
  ble.setMode(BLUEFRUIT_MODE_DATA);

  Serial.println(F("******************************"));
}

void loop(void)
{
  if (sending) // For stopping the BLE broadcasting
  {
    for (int i = 0; i < nbRooms; i++)
    {
      gotResponse = false;

      // Send request
      time = millis(); // Starting timer
      sendRequest(i); // Send request to transmitter Arduino

      // Receiving response
      while (!gotResponse) // While no response has been received
      {
        currentTime = millis();
        if (currentTime - time > 500) // If 0.5 seconds has passed without receiving any response, resend request
        {
          time = millis(); // Reset timer
          Serial.println("No response after 0.5 second, resending request");
          sendRequest(i);
        }

        uint8_t buf[4]; // Buffer used for storing received data, its size is set to 3 bytes as the data is: String(room) + value (eg. 0555)
        uint8_t buflen = sizeof(buf);

        if (driver.recv(buf, &buflen)) // Upon reception of the data
        {
          String message = (char*)buf; // Storing data in a string for parsing
          int room = message.substring(0, 1).toInt(); // Parsing room number
          int data = message.substring(1).toInt(); // Parsing data

          if (room == i) // If the data is from the correct room
          {
            gotResponse = true;
            values[room] = data; // Storing the data

            // Turning LEDs on and off
            if (values[room] > limit[room])
            {
              digitalWrite(LEDpin[i], HIGH);
            }
            else
            {
              digitalWrite(LEDpin[i], LOW);
            }

            // For debugging
            Serial.print("Data for room ");
            Serial.print(room);
            Serial.print(" is ");
            Serial.println(data);
            Serial.println("");
          }
        }
      }
      delay(50);
    }

    dataToSend = "#"; // Start data string with # for easyier parsing by the Smartphone app
    for (int i = 0; i < nbRooms; i++)
    {
      dataToSend.concat(String(values[i]));
      if (i < nbRooms - 1)
      {
        dataToSend.concat("/"); // Separate the values with a /
      }
    }
    dataToSend.concat("*"); // End data string with *
    Serial.print("Sending: ");
    Serial.println(dataToSend);
    Serial.println("");
  }

  char n, inputs[BUFSIZE + 1]; // Used for storing data to be sent to Smartphone

  dataToSend.toCharArray(inputs, BUFSIZE + 1); // Copying data string to buffer
  ble.print(inputs); // Sending data

  String values = ""; // Emptying data string
  
  // Reading data received from Smartphone
  bool recording = false;
  while ( ble.available() ) // While there is data available from BLE
  {
    int c = ble.read();
    Serial.println((char)c);

    if (recording) // If we have read the #
    {
      if ((char)c != '*')
      {
        values.concat((char)c); // As long as c is different from the end character *, add it to the data string
      }
      else
      {
        Serial.println(values);
        setLimits(values);
        recording = false; // Set the limits to the ones we just received
        values = "";
      }
    }

    if ((char)c == '#') // Start recording upon reception of the start character #
    {
      recording = true;
    }
  }
}

/* #############################################################################
FUNCTIONS
############################################################################## */

// A small helper
void error(const __FlashStringHelper * err)
{
  Serial.println(err);
  while (1);
}

void setupBluefruit()
{
  /* Initialise the module */
  Serial.print(F("Initialising the Bluefruit LE module: "));

  if ( !ble.begin(VERBOSE_MODE) )
  {
    error(F("Couldn't find Bluefruit, make sure it's in Command mode & check wiring?"));
  }
  Serial.println( F("OK!") );

  if ( FACTORYRESET_ENABLE )
  {
    /* Perform a factory reset to make sure everything is in a known state */
    Serial.println(F("Performing a factory reset: "));
    if ( ! ble.factoryReset() ) {
      error(F("Couldn't factory reset"));
    }
  }

  /* Disable command echo from Bluefruit */
  ble.echo(false);

  Serial.println("Requesting Bluefruit info:");
  /* Print Bluefruit information */
  ble.info();

  ble.verbose(false);
}

// Send a request to the corresponding room transmitter (i)
void sendRequest(int i)
{
  request = requests[i];
  driver.send((uint8_t *)request, strlen(request));
  driver.waitPacketSent();

  Serial.print("Request sent to room ");
  Serial.println(i);
  Serial.println("Awaiting response");
  Serial.println("");
}

// Store the limits
void setLimits(String values)
{
  for (int i = 0; i < nbRooms; i++)
  {
    if (i < nbRooms - 1)
    {
      limit[i] = values.substring(4 * i, 3 + 4 * i).toInt(); // Pärsing the limits
    }
    else
    {
      limit[i] = values.substring(4 * i).toInt(); // Parsing the last limit
    }
  }
}
