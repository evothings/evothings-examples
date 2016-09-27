# Bosch XDK Sensors
This application demonstrates collecting sensor data from a Bosch XDK device, see http://xdk.bosch-connectivity.com.

The data is gathered by the XDK device and transferred over Bluetooth Low Energy to the application running on the smartphone. The app displays the data in a simple numeric table. For a live graph, see the companion example *Bosch XDK Sensors Graph*.

## Firmware
The directory `xdk-firmware` contains a ready to build XDK project. It can be built using the [XDK Workbench](http://xdk.bosch-connectivity.com/software-downloads) version 1.6.0 available for Windows 7 and higher. The XDK Workbench is an Eclipse CDT derivative and is at this time only available for Windows. The documentation shows in more detail how to build and flash the firmware to the XDK device.
