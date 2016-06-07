/* #############################################################################
LIBRARIES
############################################################################## */

#include <Arduino.h>
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

const int LEDpin = 5;

/* #############################################################################
CONFIGURATION
############################################################################## */

// Parameters for the SoftwareSerial and Adafruit_BluefruitLE_UART stored in BluefruitConfig file
SoftwareSerial bluefruitSS = SoftwareSerial(BLUEFRUIT_SWUART_TXD_PIN, BLUEFRUIT_SWUART_RXD_PIN);

Adafruit_BluefruitLE_UART ble(bluefruitSS, BLUEFRUIT_UART_MODE_PIN,
                              BLUEFRUIT_UART_CTS_PIN, BLUEFRUIT_UART_RTS_PIN);

#define FACTORYRESET_ENABLE         1
#define MINIMUM_FIRMWARE_VERSION    "0.6.6"
#define MODE_LED_BEHAVIOUR          "MODE"

/* #############################################################################
CODE
############################################################################## */

void setup() {
  pinMode(LEDpin, OUTPUT);

  Serial.begin(9600);

  setupBluefruit();
}

void loop() {
  String message = "";
  while (ble.available())
  {
    int c = ble.read();
    Serial.print((char)c);
    message.concat((char)c);

    if (message == "on")
    {
      message = "";
      Serial.println("\nTurning LED ON");
      digitalWrite(LEDpin, HIGH);
    }
    else if (message == "off")
    {
      message = "";
      Serial.println("\nTurning LED OFF");
      digitalWrite(LEDpin, LOW);
    }
    else if (message.length() > 3)
    {
      message = "";
    }
  }
}

/* #############################################################################
FUNCTIONS
############################################################################## */

// Error display
void error(const __FlashStringHelper * err)
{
  Serial.println(err);
  while (1);
}

// Bluefruit setup and reset
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
