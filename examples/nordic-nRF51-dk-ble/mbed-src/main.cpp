/*
 * nRF51-DK BLEDevice service/characteristic (read/write) using mbed.org
 */

// uncomment if not interested in a console log
#define CONSOLE_LOG 

#include "mbed.h"
#include "ble/BLE.h"

//-------------------------------------------------------------------------

#ifdef CONSOLE_LOG
#define INFO(x, ...)    printf(x,        ##__VA_ARGS__);
#define INFO_NL(x, ...) printf(x "\r\n", ##__VA_ARGS__);
#else
#define INFO(x, ...)    
#define INFO_NL(x, ...) 
#endif

// a little routine to print a 128-bit UUID nicely
void INFO_UUID(const char *prefix, UUID uuid)
{
   uint8_t *p = (uint8_t *)uuid.getBaseUUID();
   INFO("%s: ", prefix);
   for (int i=0; i<16; i++)
   {
     INFO("%02x", p[i]);
     if ((i == 3) || (i == 5) || (i == 7) || (i == 9)) INFO("-");
   }
   INFO_NL("");
}

//-------------------------------------------------------------------------

// name of the device 
const static char DEVICE_NAME[] = "nRF51-DK";

// GATT service and characteristic UUIDs
const UUID nRF51_GATT_SERVICE     = UUID((uint8_t *)"nRF51-DK        ");
const UUID nRF51_GATT_CHAR_BUTTON = UUID((uint8_t *)"nRF51-DK button ");
const UUID nRF51_GATT_CHAR_LED    = UUID((uint8_t *)"nRF51-DK led    ");

#define CHARACTERISTIC_BUTTON 0
#define CHARACTERISTIC_LED    1
#define CHARACTERISTIC_COUNT  2

// our bluetooth smart objects
BLE                ble;
GattService        *gatt_service;
GattCharacteristic *gatt_characteristics[CHARACTERISTIC_COUNT];
uint8_t             gatt_char_value[CHARACTERISTIC_COUNT];

#ifdef CONSOLE_LOG
Serial pc(USBTX,USBRX);
#endif

//-------------------------------------------------------------------------
// button handling
//-------------------------------------------------------------------------

// define our digital in values we will be using for the characteristic
DigitalIn button1(P0_17);
DigitalIn button2(P0_18);
DigitalIn button3(P0_19);
DigitalIn button4(P0_20);

uint8_t button_new_value = 0;
uint8_t button_old_value = button_new_value;

void monitorButtons() 
{
    // read in the buttons, mapped into nibble (0000 = all off, 1111 = all on)
    button_new_value = 0;
    button_new_value |= (button1.read() != 1); button_new_value <<= 1;
    button_new_value |= (button2.read() != 1); button_new_value <<= 1;
    button_new_value |= (button3.read() != 1); button_new_value <<= 1;
    button_new_value |= (button4.read() != 1); 
      
    // set the updated value of the characteristic if data has changed
    if (button_new_value != button_old_value)
    {
        ble.updateCharacteristicValue(
              gatt_characteristics[CHARACTERISTIC_BUTTON] -> getValueHandle(),
              &button_new_value, sizeof(button_new_value));
        button_old_value = button_new_value;

        INFO_NL("  button state: [0x%02x]", button_new_value);
    }
}

//-------------------------------------------------------------------------
// LED handling
//-------------------------------------------------------------------------

DigitalOut led1(P0_21);
DigitalOut led2(P0_22);
DigitalOut led3(P0_23);
DigitalOut led4(P0_24);

uint8_t led_value = 0;

void onLedDataWritten(const uint8_t* value, uint8_t length) 
{
    // we only care about a single byte
    led_value = value[0];

    // depending on the value coming through; set/unset LED's
    if ((led_value & 0x01) != 0) led1.write(0); else led1.write(1);
    if ((led_value & 0x02) != 0) led2.write(0); else led2.write(1);
    if ((led_value & 0x04) != 0) led3.write(0); else led3.write(1);
    if ((led_value & 0x08) != 0) led4.write(0); else led4.write(1);

    INFO_NL("     led state: [0x%02x]", led_value);
}

//-------------------------------------------------------------------------

void onConnection(const Gap::ConnectionCallbackParams_t *params)
{
  INFO_NL(">> connected");

  // set the initial values of the characteristics (for every session)
  led_value = 0;
  onLedDataWritten(&led_value, 1); // force LED's to be in off state
}

void onDataWritten(const GattWriteCallbackParams *context) 
{
   // was the characteristic being written to nRF51_GATT_CHAR_LED? 
  if (context -> handle == 
       gatt_characteristics[CHARACTERISTIC_LED] -> getValueHandle())
   {
     onLedDataWritten(context -> data, context -> len);
   } 
}

void disconnectionCallback(const Gap::DisconnectionCallbackParams_t *params)
{
    INFO_NL(">> disconnected");
    ble.gap().startAdvertising(); // restart advertising
    INFO_NL(">> device advertising");
}


int main() 
{
#ifdef CONSOLE_LOG
    // wait a second before trying to write something to console 
    wait(1);
#endif
    INFO_NL(">> nRF51-DK start");

    // create our button characteristic (read, notify)
    gatt_characteristics[CHARACTERISTIC_BUTTON] = 
      new GattCharacteristic(
            nRF51_GATT_CHAR_BUTTON, 
            &gatt_char_value[CHARACTERISTIC_BUTTON], 1, 1,
            GattCharacteristic::BLE_GATT_CHAR_PROPERTIES_READ | 
            GattCharacteristic::BLE_GATT_CHAR_PROPERTIES_NOTIFY);

    // create our LED characteristic (read, write)
    gatt_characteristics[CHARACTERISTIC_LED] = 
      new GattCharacteristic(
            nRF51_GATT_CHAR_LED, 
            &gatt_char_value[CHARACTERISTIC_LED], 1, 1,
            GattCharacteristic::BLE_GATT_CHAR_PROPERTIES_READ | 
            GattCharacteristic::BLE_GATT_CHAR_PROPERTIES_WRITE | 
            GattCharacteristic::BLE_GATT_CHAR_PROPERTIES_WRITE_WITHOUT_RESPONSE);

    // create our service, with both characteristics
    gatt_service = 
      new GattService(nRF51_GATT_SERVICE, 
                      gatt_characteristics, CHARACTERISTIC_COUNT);

    // initialize our ble device
    ble.init();
    ble.gap().setDeviceName((uint8_t *)DEVICE_NAME);
    INFO_NL(">> initialized device '%s'", DEVICE_NAME);

    // configure our advertising type, payload and interval
    ble.gap().accumulateAdvertisingPayload(
          GapAdvertisingData::BREDR_NOT_SUPPORTED | 
          GapAdvertisingData::LE_GENERAL_DISCOVERABLE);
    ble.gap().accumulateAdvertisingPayload(
          GapAdvertisingData::COMPLETE_LOCAL_NAME, 
          (uint8_t *)DEVICE_NAME, sizeof(DEVICE_NAME));
    ble.gap().setAdvertisingType(GapAdvertisingParams::ADV_CONNECTABLE_UNDIRECTED);
    ble.gap().setAdvertisingInterval(160); // 100ms
    INFO_NL(">> configured advertising type, payload and interval");

    // configure our callbacks
    ble.gap().onDisconnection(disconnectionCallback);
    ble.gap().onConnection(onConnection);
    ble.onDataWritten(onDataWritten);
    INFO_NL(">> registered for callbacks");

    // add our gatt service with two characteristics
    ble.addService(*gatt_service);
    INFO_NL(">> added GATT service with two characteristics");

    // show some debugging information about service/characteristics
    INFO_UUID(" ", nRF51_GATT_SERVICE);
    INFO_UUID("  :", nRF51_GATT_CHAR_BUTTON);
    INFO_UUID("  :", nRF51_GATT_CHAR_LED);

    // start advertising
    ble.gap().startAdvertising();
    INFO_NL(">> device advertising");

    // start monitoring the buttons and posting new values
    Ticker ticker;
    ticker.attach(monitorButtons, 0.1);  // every 10th of a second
    INFO_NL(">> monitoring button state");

    // let the device do its thing
    INFO_NL(">> waiting for events ");
    for (;;)
    {
      ble.waitForEvent();
    }
}

//-------------------------------------------------------------------------
