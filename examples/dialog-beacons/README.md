# Dialog Semiconductor Beacons

This application provides a quick demonstration of the [DA14580](http://www.dialog-semiconductor.com/bluetooth-smart). Using the Dialog BLE chip is is possible to broadcast multiple beacon formats such as [Eddystone](https://developers.google.com/beacons/), [iBeacon](https://developer.apple.com/ibeacon/) and [AltBeacon](http://altbeacon.org/) using only one beacon. The app detects both Eddystone and iBeacon format. Once the mobile device gets close to a beacon the app will display a picture and some more detailed information about the beacons found in the area.

Using the overflow button in the upper-right corner it is possible to change the RSSI threshold and offset. These values are used to determine the required signal strength of the beacon before the data is displayed on the screen.

## iBeacon and Eddystone beacons
To use the application with your own iBeacon or Eddystone beacons, change the `var beaconRegions` object in `app-ibeacon.js` or `var beaconData` object in `app-eddystone.js` to match your own data.

## Firmware
The directory `DA14580` contains the binaries for the Development Kit. Using [Dialog's SmartSnippets Bluetooth software platform](http://www.dialog-semiconductor.com/bluetooth-smart/development-tools) you can store the image file to flash memory of the device. The SmartSnippets can be found on [Dialog's customer support site](http://support.dialog-semiconductor.com/connectivity). (Registration required)
