# IoT Sensor Library

This JavaScript library is used to communicate with the [IoT Sensor Development Kit](http://www.dialog-semiconductor.com/iotsensor).

In order to use this library, build a Cordova app that contains the [BLE plugin](https://github.com/evothings/cordova-ble) or create a new application using the [Evothings Workbench](https://evothings.com/doc/studio/workbench.html).

To use this library, place the `libs/evothings/dialog-iotsensor` folder in the root of your Evothings application or `www` folder (Cordova). 

Make sure to also copy the easyble library to `libs/evothings/easyble`. You can find the latest version on the [evothings-libraries repository](https://github.com/evothings/evothings-libraries).

## Initialization & Connecting

Include the `iotsensor.js` file

```html
<script src="libs/evothings/dialog-iotsensor/iotsensor.js"></script>
```

Create a new iotsensor object by specifying the project type (RAW or SFL) you are using.

```javascript
// Device type we are connecting to, can either be RAW or SFL
var type = evothings.iotsensor.SFL;

// Create a new IoT Sensor SFL instance
var iotsensor = evothings.iotsensor.createInstance(type);
```

Now that we have created a new IoT Sensor instance, we can try to connect to the sensor using BLE.
The library provides the option to automatically connect to the closest IoT Sensor available using the `connectToClosestSensor(scanTime, callbackFun, disconnectFun)` function.

```javascript
// Scan for 3000ms
iotsensor.connectToClosestSensor(
  3000,
  function()
  {
    console.log('We are connected!');
  },
  function(error)
  {
    console.log('Disconnect error: ' + error);
  }
);
```
You can also connect to a device manually, see the [documentation](http://nbezembinder1.github.io/dialog/docs/evothings.iotsensor.instance_ble.html#connectToDevice__anchor) for more information.
```javascript
iotsensor.startScanningForDevices(
    function(device)
    {
        console.log('Device found: ' + device.name + ' RSSI: ' + device.rssi);
        if(iotsensor.isIoTSensor(device))
        {
            // We have an IoT Sensor, let's connect!
            iotsensor.connectToDevice(
                device,
                function()
                {
                    // Connected and device is ready
                },
                function(error)
                {
                    console.log('Disconnect error ' + error);
                }
            );
        }
    }
);
```

## Device info & Sensor data

The IoT Sensor provides a features report to see which sensors are available and the firmware version of the device connected.
It is good practice to use these options to determine the capabilities of the device.
```javascript
console.log('IoT Sensor device info:'
             + '\n Device model:  '	+ iotsensor.getDeviceModel()
             + '\n Firmware:      ' + iotsensor.getFirmwareString()
             + '\n Accelerometer: ' + iotsensor.isAccelerometerAvailable()
             + '\n Gyroscope:     ' + iotsensor.isGyroscopeAvailable()
             + '\n Magnetometer:  ' + iotsensor.isMagnetometerAvailable()
             + '\n Barometer:     ' + iotsensor.isBarometerAvailable()
             + '\n Temperature:   ' + iotsensor.isTemperatureAvailable()
             + '\n Humidity:      ' + iotsensor.isHumidityAvailable()
             + '\n Sensor Fusion: ' + iotsensor.isSflAvailable());
```

In order to receive data from one of the sensors, a callback function must be set. This function is called everytime new data is available from the sensor.
Once the callback is set, the sensor can be enabled. Note that Sensor Fusion is not available in RAW projects.
```javascript
// Set the accelerometer callback and turn on the accelerometer
iotsensor.accelerometerCallback(handleReply)
  .accelerometerOn();
  
function handleReply(data)
{
  console.log('Accelerometer: ' + 
              '\n x: ' + data.x + 
              '\n y: ' + data.y + 
              '\n z: ' + data.z);
}
```
Note: All data (except for Sensor Fusion) is automatically converted to the correct unit of measurement. Please refer to the [documentation](http://nbezembinder1.github.io/dialog/docs/evothings.iotsensor.instance.html#accelerometerCallback__anchor) for more information

## Settings
Using this JavaScript library the IoT Sensor can be configured to your liking. 
The settings of the device can be divided into three categories:

    Basic configuration
        Used to configure the sensors
    Sensor fusion
        Set the SFL coefficients to control the relative weight of accelerometer and magnetometer data
    Calibration
        Set calibration coefficients
        Set calibration control flags

For a complete overview of all available settings, refer to the [documentation](http://nbezembinder1.github.io/dialog/docs/evothings.iotsensor.instance_settings.html).

### Basic configuration

    It is good practice to read the basic configuration settings from the device on startup,
    in case the settings in flash memory do not match the default settings specified in configuration.BASIC
    
The `configuration.BASIC` object is an array and contains eleven different settings to control the sensors. 
In order to set correct values in the device, refer to the [enums](http://nbezembinder1.github.io/dialog/docs/evothings.iotsensor.instance_settings.html) object. These objects contain all possible values that can be written to the device. Currently there is no check build in to make sure you are not writing wrong values to the device.
```javascript
// Change accelerometer range to 16g
iotsensor.configuration.BASIC.ACCELEROMETER_RANGE = iotsensor.enums.ACCELEROMETER_RANGE._16g;
        
// After changing a settings, set the basic configuration in device
iotsensor.setBasicConfiguration();

// Optional - Store basic configuration in flash
iotsensor.storeBasicConfigurationInFlash();

// Optional - Retrieve new settings from device
iotsensor.readBasicConfiguration(
    function(data)
    {
      console.log('Settings: ' + data);
    }
);
```

## Sensor Fusion
Changing the Sensor Fusion coefficients works the same as changing the basic configuration:
```javascript
// Change Beta A to 2000
iotsensor.configuration.SFL_COEF.BETA_A = 2000;
        
// Set basic configuration in device
iotsensor.setSflCoefficients();

// Retrieve sensor fusion coefficients from device
iotsensor.readSflCoefficients(
    function(data)
    {
        console.log('Sfl coefficients: ' + data);
    }
);
```

## Calibration
In order to change the calibration coefficients and calibration control flag settings, refer to the `configuration.CAL_COEF` and `configuration.CAL_CONTROL` object.
```javascript
// Set Q_FORMAT
iotsensor.configuration.CAL_COEF.Q_FORMAT = 12;

// Set offset vector
iotsensor.configuration.OFFSET_VECTOR = new Int16Array([100, 100, 100]);

// Set matrix
iotsensor.configuration.MATRIX = [new Int16Array([100, 0, 0]), new Int16Array([0, 100, 0]), new Int16Array([0, 0, 100])];

// Set Calibration coefficients in device
iotsensor.setCalibrationCoefficients();

// Retrieve calibration coefficients from device
iotsensor.readCalibrationCoefficients(
    function(data)
    {
        console.log('Calibration coefficients: ' + data);
    }
);
```

```javascript
// Set calibration control flag byte 2 (CONTROL_FLAG[0])
iotsensor.configuration.CAL_CONTROL.CONTROL_FLAGS[0] = 28 // 0011100

// Set calibration control flags in device
iotsensor.setCalibrationControl();

// Retrieve calibration control flags from device
iotsensor.readCalibrationControl(
    function(data)
    {
        console.log('Calibration control ' + data);
    }
);
```

To learn more about the different control flags, refer to the user manual on the [Dialog customer support](http://support.dialog-semiconductor.com/) site.

The function `storeCalibrationAndControl()` stores all settings regarding Sensor Fusion and Calibration in flash memory.
```javascript
iotsensor.storeCalibrationAndControl();
```

## Other
When an error occurs or when there is a new update, the default error and status handler is called. 
The default handler outputs the error and status to the console as follows:
```javascript
// Error
console.log(evothings.iotsensor.currentTime() + ' IoT Sensor error: ' + error);

// Status
console.log(evothings.iotsensor.currentTime() + ' IoT Sensor status: ' + status);
```
Both the error and status handler can be set to your liking:
```javascript
iotsensor.errorCallback(errorFun)
  .statusCallback(statusFun);
  
function errorFun(error)
{
  console.log('ERROR: ' + error);
}

function statusFun(status)
{
  console.log('STATUS: ' + status);
}
```
In order to determine if a sensor is correctly turned ON the sensor status callback can be used.
This function is called everytime a sensor receives a START command and sends a reply back to the device.

Note: If this callback function is not set, an error `Callback function not set for COMMAND_ID 1` is returned every time a sensor is turned ON.
```javascript
iotsensor.sensorStatusCallback(handleReply);

function handleReply(data)
{
  console.log('Sensor status: ' + data); // 1: On
}
