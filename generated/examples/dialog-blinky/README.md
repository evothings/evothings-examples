# Dialog Semiconductor Blinky

This application demonstrates the functionality of the [DA1458x Development Kit](http://www.dialog-semiconductor.com/bluetooth-smart/development-tools). It is a simple application which demonstrates basic initialization of the DA1458x chip and LED blinking. A user can control the LED on the Development Kit (DK) via the application on his smartphone.

A Bluetooth Low Energy connection is set up between the DK and the smartphone. The user interface on the smartphone consists of multiple buttons to turn the LED on or off and a slider to control the blinking of the LED. A button is added to the DK as an extra component. Pressing the button will randomly change the background-color of the application to demonstrate the connection is bidirectional.

## GPIO button
A push button can be added to the Development Kit (DK for extra functionality. For example the Elektor's Arduino 37 in 1 Sensor Kit [GPIO push button](https://www.modmypi.com/download/37-piece-sensor-description.pdf). The PCB mounted push button has a built in 10k Ohm restistor connected between the center pin and the 'S' pin and can be used as a pull up or pull down resistor. The push button connects the two outer pins ('S' and ground). The 'S' pin is connected to pin `P1_1` on the DK, and the ground pin to one of the available ground pins on the DK. See the user manual for more information.

## Firmware
The directory `DA1458x` contains the binaries for the Development Kits. Using [Dialog's SmartSnippets Bluetooth software platform](http://www.dialog-semiconductor.com/bluetooth-smart/development-tools) you can store the image file to flash memory of the device. The SmartSnippets can be found on [Dialog's customer support site](http://support.dialog-semiconductor.com/connectivity) (Registration required)
