# Build script for Evothings Example apps.
#
# How to run:
# ruby build.rb
#

require 'fileutils'

include FileUtils::Verbose

# Make sure these are correct!
MAJOR = 2
MINOR = 1

VERSION = "#{MAJOR}.#{MINOR}"

@listJson = nil

### Path to libraries ###

# Libraries are in repository evothings-libraries. This repo
# has to be cloned to a sibling folder to evothings-examples.

# Get the path to library files.
def libraryPath(sourcePath)
	'../evothings-libraries/' + sourcePath
end

### Paths to generated examples ###

# Destination path for generated files.
def fullDestPath(destPath)
	'generated/' + destPath
end

# Build generated examples.
def buildGenerated
	rmDir('generated')
	copyDir(
		'examples',
		'generated')
	copyDir(
		'experiments',
		'generated')
	buildExamples
	buildExamplesList
end

def buildExamplesList
  @listJson = @listJson + "]"
  puts 'Writing examples-list.json file ' + fullDestPath('examples') + '/examples-list.json'
  writeFileUTF8(fullDestPath('examples') + '/examples-list.json', @listJson)
end


###### Examples ######

def buildMbedGAP
	destPath = 'examples/mbed-custom-gap'
	icon = 'arm-mbed.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8b00'
	copySettings(destPath, '', icon, uuid)
	copyCommon(destPath)
	copyJQuery(destPath)
	copyEasyBLE(destPath)
	copyUtil(destPath)
  collectExamplesList("mbed-custom-gap", "mbed Evothings GAP", "Example app using mbed and GAP")
end

def buildMbedGATT
	destPath = 'examples/mbed-custom-gatt'
	icon = 'arm-mbed.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8b01'
	copySettings(destPath, '', icon, uuid)
	copyCommon(destPath)
	copyJQuery(destPath)
	copyEasyBLE(destPath)
	copyUtil(destPath)
	collectExamplesList("mbed-custom-gatt", "mbed Evothings GATT", "Example app using mbed and GATT")
end

def buildMbedGATTWebBluetooth
	settingsPath = 'examples/mbed-custom-gatt-webbluetooth'
	destPath = 'examples/mbed-custom-gatt-webbluetooth/app'
	icon = 'arm-mbed.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8d02'
	copyExtendedSettings(settingsPath, '', icon, uuid)
	copyCommon(destPath)
	copyJQuery(destPath)
	copyWebBluetooth(destPath)
	collectExamplesList("mbed-custom-gatt-webbluetooth", "mbed Evothings GATT Web Bluetooth")
end

def buildArduinoBLE
	settingsPath = 'examples/arduino-ble'
	destPath = 'examples/arduino-ble/app'
	icon = 'arduino.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8b02'
	copySettings(settingsPath, 'app/', icon, uuid)
	copyCommon(destPath)
	copyJQuery(destPath)
	copyWhereIsTheArduinoCode(destPath)
	collectExamplesList("arduino-ble", "Arduino BLE")
end

def buildArduinoInputTCP
	# Copy CSS/JS files.
	settingsPath = 'examples/arduino-input-tcp'
	destPath = 'examples/arduino-input-tcp/app'
	icon = 'arduino.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8b03'
	copySettings(settingsPath, 'app/', icon, uuid)
	copyCommon(destPath)
	copyJQuery(destPath)
	copyArduinoTCP(destPath)
	copyWhereIsTheArduinoCode(destPath)

	# Copy Arduino files.
	destPath = 'examples/arduino-input-tcp'
	copyArduinoEthernet(destPath)
	copyArduinoWiFi(destPath)
	
	collectExamplesList("arduino-input-tcp", "Arduino Input TCP")
end

def buildArduinoLEDOnOffBLE
	settingsPath = 'examples/arduino-led-onoff-ble'
	destPath = 'examples/arduino-led-onoff-ble/app'
	icon = 'arduino.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8b04'
	copySettings(settingsPath, 'app/', icon, uuid)
	copyCommon(destPath)
	copyJQuery(destPath)
	copyArduinoBLE(destPath)
	copyWhereIsTheArduinoCode(destPath)
	collectExamplesList("arduino-led-onoff-ble", "Arduino LED On/Off BLE")
end

def buildArduinoLEDOnOffTCP
	# Copy CSS/JS files.
	settingsPath = 'examples/arduino-led-onoff-tcp'
	destPath = 'examples/arduino-led-onoff-tcp/app'
	icon = 'arduino.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8b05'
	copySettings(settingsPath, 'app/', icon, uuid)
	copyCommon(destPath)
	copyJQuery(destPath)
	copyArduinoTCP(destPath)
	copyWhereIsTheArduinoCode(destPath)

	# Copy Arduino files.
	destPath = 'examples/arduino-led-onoff-tcp'
	copyArduinoEthernet(destPath)
	copyArduinoWiFi(destPath)
	collectExamplesList("arduino-led-onoff-tcp", "Arduino LED On/Off TCP")
end

def buildArduinoScriptableTCP
	# Copy CSS/JS files.
	settingsPath = 'examples/arduino-scriptable-tcp'
	destPath = 'examples/arduino-scriptable-tcp/app'
	icon = 'arduino.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8b06'
	copySettings(settingsPath, 'app/', icon, uuid)
	copyCommon(destPath)
	copyJQuery(destPath)
	copyArduinoTCP(destPath)
	copyWhereIsTheArduinoCode(destPath)

	# Copy Arduino files.
	destPath = 'examples/arduino-scriptable-tcp'
	copyArduinoEthernet(destPath)
	copyArduinoWiFi(destPath)
	collectExamplesList("arduino-scriptable-tcp", "Arduino Scriptable")
end

def buildBLEScan
	destPath = 'examples/ble-scan'
	icon = 'ble-logo.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8b07'
	copySettings(destPath, '', icon, uuid)
	copyCommon(destPath)
	copyJQuery(destPath)
	collectExamplesList("ble-scan", "BLE Scan")
end

def buildBLEDiscovery
	destPath = 'examples/ble-discovery'
	icon = 'ble-logo.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8b08'
	# This example uses no libs.
	#copyCommon(destPath)
	copySettings(destPath, '', icon, uuid)
	collectExamplesList("ble-discovery", "BLE Discovery")
end

def buildTISensorTagCC2541Demo
	destPath = 'examples/ble-ti-sensortag-cc2541-demo'
	icon = 'ti-sensortag-cc2541.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8b09'
	copySettings(destPath, '', icon, uuid)
	copyCommon(destPath)
	copyJQuery(destPath)
	copyEasyBLE(destPath)
	collectExamplesList("ble-ti-sensortag-cc2541-demo", "TI SensorTag CC2541 Demo")
end

def buildTISensorTagCC2541WebBluetooth
	settingsPath = 'examples/ble-ti-sensortag-cc2541-webbluetooth'
	destPath = 'examples/ble-ti-sensortag-cc2541-webbluetooth/app'
	icon = 'ti-sensortag-cc2541.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8d00'
	copyExtendedSettings(settingsPath, '', icon, uuid)
	copyCommon(destPath)
	copyJQuery(destPath)
	copyWebBluetooth(destPath)
	collectExamplesList("ble-ti-sensortag-cc2541-webbluetooth", "TI SensorTag CC2541 Accelerometer Web Bluetooth")
end

def buildTISensorTagCC2650Demo
	destPath = 'examples/ble-ti-sensortag-cc2650-demo'
	icon = 'ti-sensortag-cc2650.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8b0a'
	copySettings(destPath, '', icon, uuid)
	copyCommon(destPath)
	copyJQuery(destPath)
	copyEasyBLE(destPath)
	collectExamplesList("ble-ti-sensortag-cc2650-demo", "TI SensorTag CC2650 Demo")
end

def buildTISensorTagSensors
	destPath = 'examples/ble-ti-sensortag-sensors'
	icon = 'ti-sensortag-cc2650.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8b0b'
	copySettings(destPath, '', icon, uuid)
	copyCommon(destPath)
	copyUtil(destPath)
	copyTISensorTag(destPath)
	collectExamplesList("ble-ti-sensortag-sensors", "TI SensorTag CC2650 & CC2541 Sensors")
end

def buildTISensorTagAccelerometer
	destPath = 'examples/ble-ti-sensortag-accelerometer'
	icon = 'ti-sensortag-cc2650.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8b0c'
	copySettings(destPath, '', icon, uuid)
	copyCommon(destPath)
	copyUtil(destPath)
	copyTISensorTag(destPath)
	collectExamplesList("ble-ti-sensortag-accelerometer", "TI SensorTag CC2650 & CC2541 Accelerometer")
end

def buildCordovaAccelerometer
	destPath = 'examples/cordova-accelerometer'
	icon = 'evothings-logo.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8b0d'
	copySettings(destPath, '', icon, uuid)
	copyCommon(destPath)
	copyJQuery(destPath)
	collectExamplesList("cordova-accelerometer", "Cordova Accelerometer")
end

def buildCordovaBasic
	destPath = 'examples/cordova-basic'
	icon = 'evothings-logo.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8b0e'
	copySettings(destPath, '', icon, uuid)
	copyCommon(destPath)
	copyJQuery(destPath)
	collectExamplesList("cordova-basic", "Cordova Basic")
end

def buildHelloWorld
	destPath = 'examples/hello-world'
	icon = 'evothings-logo.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8b0f'
	copySettings(destPath, '', icon, uuid)
	copyCommon(destPath)
	collectExamplesList("hello-world", "Hello World")
end

def buildHelloECMAScript6
	settingsPath = 'examples/hello-ecmascript6'
	destPath = 'examples/hello-ecmascript6/app'
	icon = 'evothings-logo.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8d01'
	copyExtendedSettings(settingsPath, '', icon, uuid)
	copyCommon(destPath)
	copyWebBluetooth(destPath)
	collectExamplesList("hello-ecmascript6", "Hello ECMAScript 6")
end

def buildHueLights
	destPath = 'examples/hue-lights'
	icon = 'philips-hue.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8b1f'
	copySettings(destPath, '', icon, uuid)
	copyCommon(destPath)
	copyJQuery(destPath)
	collectExamplesList("hue-lights", "Philips Hue Demo")
end

def buildEddystoneScan
	destPath = 'examples/eddystone-scan'
	icon = 'eddystone.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8b2f'
	copySettings(destPath, '', icon, uuid)
	copyCommon(destPath)
	copyEddystone(destPath)
	copyJQuery(destPath)
	collectExamplesList("eddystone-scan", "Eddystone Scan")
end

def buildIBeaconScan
	destPath = 'examples/ibeacon-scan'
	icon = 'ibeacon.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8b3f'
	copySettings(destPath, '', icon, uuid)
	copyCommon(destPath)
	copyJQuery(destPath)
	collectExamplesList("ibeacon-scan", "iBeacon Scan")
end

def buildEstimoteBeacons
	destPath = 'examples/estimote-beacons'
	icon = 'estimote-beacons.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8b4f'
	copySettings(destPath, '', icon, uuid)
	copyCommon(destPath)
	copyJQuery(destPath)
	collectExamplesList("estimote-beacons", "Estimote Beacons")
end

def buildEstimoteNearables
	destPath = 'examples/estimote-nearables'
	icon = 'estimote-nearables.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8b5f'
	copySettings(destPath, '', icon, uuid)
	copyCommon(destPath)
	copyJQuery(destPath)
	collectExamplesList("estimote-nearables", "Estimote Nearables (iOS only)")
end

def buildNordic_nRF51822EK_BLE
	destPath = 'examples/nordic-nRF51822-ek-ble'
	icon = 'nordic-semi.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8b6f'
	copySettings(destPath, '', icon, uuid)
	copyCommon(destPath)
	copyJQuery(destPath)
	copyNordic_nRF51822_BLE(destPath)
	collectExamplesList("nordic-nRF51822-ek-ble", "Nordic Semiconductor nRF51822-EK BLE")
end

def buildNordic_nRF51DK_BLE
	settingsPath = 'examples/nordic-nRF51-ble'
	destPath = 'examples/nordic-nRF51-ble/app'
	icon = 'nordic-semi.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8b7f'
	copySettings(settingsPath, 'app/', icon, uuid)
	copyCommon(destPath)
	copyJQuery(destPath)
	copyNordic_nRF51_BLE(destPath)
	collectExamplesList("nordic-nRF51-ble", "Nordic Semiconductor nRF51-DK BLE")
end

def buildRFduinoLEDOnOff
	settingsPath = 'examples/rfduino-led-onoff'
	destPath = 'examples/rfduino-led-onoff/app'
	icon = 'rfduino.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8b8f'
	copySettings(settingsPath, 'app/', icon, uuid)
	copyCommon(destPath)
	copyJQuery(destPath)
	copyRFduinoBLE(destPath)
	copyWhereIsTheArduinoCode(destPath)
	collectExamplesList("rfduino-led-onoff", "RFduino LED On/Off")
end

def buildLightblueBeanBasic
	settingsPath = 'examples/lightbluebean-basic'
	destPath = 'examples/lightbluebean-basic/app'
	icon = 'lightblue-bean.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8b9f'
	copySettings(settingsPath, 'app/', icon, uuid)
	copyCommon(destPath)
	copyEasyBLE(destPath)
	collectExamplesList("lightbluebean-basic", "LightBlue Bean - Basic")
end

def buildRedBearLabSimpleControl
	destPath = 'examples/redbearlab-simplecontrol'
	icon = 'redbearlab.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8baf'
	copySettings(destPath, '', icon, uuid)
	copyCommon(destPath)
	copyEasyBLE(destPath)
	copyJQuery(destPath)
	collectExamplesList("redbearlab-simplecontrol", "Redbear Labs - Simple Control")
end

def buildRedBearLabSimpleChat
	destPath = 'examples/redbearlab-simplechat'
	icon = 'redbearlab.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8bbf'
	copySettings(destPath, '', icon, uuid)
	copyCommon(destPath)
	copyEasyBLE(destPath)
	copyJQuery(destPath)
	collectExamplesList("redbearlab-simplechat", "Redbear Labs - Simple Chat")
end

def buildBlunoHelloWorld
	settingsPath = 'examples/bluno-helloworld'
	destPath = 'examples/bluno-helloworld/app'
	icon = 'bluno.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8bcf'
	copySettings(settingsPath, 'app/', icon, uuid)
	copyCommon(destPath)
	copyEasyBLE(destPath)
	copyJQuery(destPath)
	collectExamplesList("bluno-helloworld", "Bluno - Hello World")
end

def buildLightblueBeanSerial
	destPath = 'experiments/lightblue-bean-serial'
	icon = 'lightblue-bean.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8bdf'
	copySettings(destPath, '', icon, uuid)
	copyCommon(destPath)
	copyUtil(destPath)
	#collectExamplesList("lightblue-bean-serial", "LightBlue Bean - Serial")
end

def buildMediaTekLinkIt
	settingsPath = 'examples/mediatek-linkit'
	destPath = 'examples/mediatek-linkit/app'
	icon = 'mediatek-linkit.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8bef'
	copySettings(settingsPath, 'app/', icon, uuid)
	copyCommon(destPath)
	copyJQuery(destPath)
  collectExamplesList("mediatek-linkit", "MediaTek Linkit ONE - Position")
end

def buildMediaTekLinkItConnect
	settingsPath = 'examples/mediatek-linkit-connect'
	destPath = 'examples/mediatek-linkit-connect/app'
	icon = 'mediatek-linkit.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8bff'
	copySettings(settingsPath, 'app/', icon, uuid)
	copyCommon(destPath)
	copyJQuery(destPath)
  collectExamplesList("mediatek-linkit-connect", "Linkit Connect 7681")
end

def buildBlePeripheral
	destPath = 'experiments/ble-peripheral'
	icon = 'ble-logo.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8b11'
	copySettings(destPath, '', icon, uuid)
	copyCommon(destPath)
	copyUtil(destPath)
  #collectExamplesList("mediatek-linkit-connect", "Linkit Connect 7681")
end

def buildEsp8266
	settingsPath = 'examples/esp8266'
	destPath = 'examples/esp8266/app'
	icon = 'esp8266.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8b12'
	copySettings(settingsPath, 'app/', icon, uuid)
	copyCommon(destPath)
	copyJQuery(destPath)
  collectExamplesList("esp8266", "ESP8266")
end

def buildDialogBlinky
	settingsPath = 'examples/dialog-blinky'
	destPath = 'examples/dialog-blinky/app'
	icon = 'dialog-semiconductor.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703ee2f8b01'
	copySettings(settingsPath, 'app/', icon, uuid)
	copyCommon(destPath)
	copyEasyBLE(destPath)
	copyUtil(destPath)
  collectExamplesList("dialog-blinky", "Dialog - Blinky")
end

def buildDialogBeacons
	settingsPath = 'examples/dialog-beacons'
	destPath = 'examples/dialog-beacons/app'
	icon = 'dialog-semiconductor.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703ee2f8b02'
	copySettings(settingsPath, 'app/', icon, uuid)
	copyCommon(destPath)
	copyJQuery(destPath)
	copyUtil(destPath)
	copyEasyBLE(destPath)
	copyEddystone(destPath)
  collectExamplesList("dialog-beacons", "Dialog - Beacons")
end

def buildDialogIoTSensor
	settingsPath = 'examples/dialog-iotsensor'
	destPath = 'examples/dialog-iotsensor/app'
	icon = 'dialog-semiconductor.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703ee2f8b03'
	copySettings(settingsPath, 'app/', icon, uuid)
	copyCommon(destPath)
	copyJQuery(destPath)
	copyUtil(destPath)
	copyEasyBLE(destPath)
	copyDialogIoTSensorLibrary(destPath)
  collectExamplesList("dialog-iotsensor", "Dialog - IoT Sensor")
end

def buildTemplateBasicApp
	destPath = 'examples/template-basic-app'
	icon = 'evothings-logo.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8b13'
	copySettings(destPath, '', icon, uuid)
	copyCommon(destPath)
	copyJQuery(destPath)
  # We don't include templates in example list
  #collectExamplesList("template-basic-app", "Template Basic App")
end

def buildArduino101LEDOnOff
	settingsPath = 'examples/arduino101-led-onoff'
	destPath = 'examples/arduino101-led-onoff/app'
	icon = 'arduino101.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8b14'
	copySettings(settingsPath, 'app/', icon, uuid)
	copyCommon(destPath)
	copyJQuery(destPath)
	copyArduinoBLE(destPath)
  collectExamplesList("arduino101-led-onoff", "Arduino101 LED On/Off BLE")
end

def buildMicrobitLED
	destPath = 'examples/microbit-led'
	icon = 'microbit.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8b15'
	copySettings(destPath, '', icon, uuid)
	copyCommon(destPath)
	copyEasyBLE(destPath)
  collectExamplesList("microbit-led", "Microbit LED")
end

def buildMicrobitAccelerometer
	destPath = 'examples/microbit-accelerometer'
	icon = 'microbit.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8b16'
	copySettings(destPath, '', icon, uuid)
	copyCommon(destPath)
	copyJQuery(destPath)
	copyEasyBLE(destPath)
  collectExamplesList("microbit-accelerometer", "Microbit Accelerometer")
end

def buildMicrobitSensors
	destPath = 'examples/microbit-sensors'
	icon = 'microbit.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8b17'
	copySettings(destPath, '', icon, uuid)
	copyCommon(destPath)
	copyEasyBLE(destPath)
  collectExamplesList("microbit-sensors", "Microbit Sensors")
end

def buildArduinoBluefruitLEDOnOff
  settingsPath = 'examples/arduino-bluefruit-led-onoff'
	destPath = 'examples/arduino-bluefruit-led-onoff/app'
	icon = 'bluefruit-le-uart.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8b18'
	copySettings(settingsPath,  'app/', icon, uuid)
	copyCommon(destPath)
	copyJQuery(destPath)
	copyEasyBLE(destPath)
  collectExamplesList("arduino-bluefruit-led-onoff", "Arduino Bluefruit LE UART Friend LED On/Off")
end

def buildArduinoBluefruitRFDataGatherer
	settingsPath = 'examples/arduino-bluefruit-rf-data-gatherer'
	destPath = 'examples/arduino-bluefruit-rf-data-gatherer/app'
	icon = 'bluefruit-le-uart.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8b19'
	copySettings(settingsPath, 'app/', icon, uuid)
	copyCommon(destPath)
	copyJQuery(destPath)
	copyEasyBLE(destPath)
  collectExamplesList("arduino-bluefruit-rf-data-gatherer", "Arduino Bluefruit RF Data Gatherer")
end

def buildRPi3SystemInformation
	settingsPath = 'examples/rpi3-system-information'
	destPath = 'examples/rpi3-system-information/app'
	icon = 'rpi.png'
	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8b1a'
	copySettings(settingsPath, 'app/', icon, uuid)
	copyCommon(destPath)
	copyJQuery(destPath)
	copyEasyBLE(destPath)
  collectExamplesList("rpi3-system-information", "Raspberry Pi 3 - System Information")
end

def buildMediaTekLinkIt7688Duo
    settingsPath = 'examples/mediatek-linkit-7688-duo'
    destPath = 'examples/mediatek-linkit-7688-duo/app'
    icon = 'mediatek-linkit.png'
    uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8b1b'
    copySettings(settingsPath, 'app/', icon, uuid)
    copyCommon(destPath)
    copyJQuery(destPath)
  collectExamplesList("mediatek-linkit-7688-duo", "MediaTek LinkIt 7688 Duo")
end

# TODO
#def buildTemplateBLEApp
#	destPath = 'examples/template-ble-app'
#	icon = 'evothings-logo.png'
#	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8b14'
#	copyCommon(destPath)
#	copyJQuery(destPath)
#	copyEasyBLE(destPath)
#end

# TODO
#def buildTemplateEddystoneApp
#	destPath = 'examples/template-eddystone-app'
#	icon = 'evothings-logo.png'
#	uuid = 'fe860e6e-d35e-4bd0-831a-7703cc2f8b15'
#	copyCommon(destPath)
#	copyJQuery(destPath)
#	copyEddystone(destPath)
#end

###### Copy helpers ######

### CSS/JS ###

def copyCommon(destPath)
	copyUI(destPath)
	copyEvothings(destPath)
end

def copySettings(destPath, indexPath, imageFile, uuid)
	copyImageFile(destPath, imageFile)
	writeSettingsFile(destPath, indexPath, uuid)
end

def copyExtendedSettings(destPath, indexPath, imageFile, uuid)
	copyImageFile(destPath, imageFile)
	writeExtendedSettingsFile(destPath, indexPath, uuid)
end

# Image format is hard-wired to png.
# Get file extension from imageFile if you need to generalise.
def copyImageFile(destPath, imageFile)
	unless imageFile.nil?
		copyFile(
			'resources/app-icons/' + imageFile,
			fullDestPath(destPath) + '/app-icon.png')
	end
end

def collectExamplesList(path, title, description = "The simplest application you can make.", icon = "app-icon.png")
  if @listJson.nil?
    @listJson = "["
  else
    @listJson = @listJson + ",\n"
  end 
  @listJson = @listJson + 
		"{\n" +
		"  \"path\": \"" + path + "\",\n" +
		"  \"icon\" :\"" + icon + "\",\n" +
		"  \"title\" :\"" + title + "\",\n" +
		"  \"description\" :\"" + description + "\"\n" +
		"}\n"
end

def writeSettingsFile(destPath, indexPath, uuid)
	json =
		"{\n" +
		"  \"index-file\": \"" + indexPath + "index.html\",\n" +
		"  \"app-uuid\" :\"" +  uuid + "\",\n" +
		"  \"app-icon\" :\"app-icon.png\",\n" +
		"  \"app-doc-url\" :\"https://evothings.com/" + VERSION + "/doc/" + destPath + ".html\"\n" +
		"}\n"
	puts 'Writing settings file ' + fullDestPath(destPath) + '/evothings.json'
	writeFileUTF8(fullDestPath(destPath) + '/evothings.json', json)
end

def writeExtendedSettingsFile(destPath, indexPath, uuid)
	json =
		"{\n" +
		"  \"app-dir\": \"app\",\n" +
		"  \"www-dir\": \"www\",\n" +
		"  \"index-file\": \"" + indexPath + "index.html\",\n" +
		"  \"dont-build\": [\"libs\", \"ui\"],\n" +
		"  \"app-uuid\" :\"" +  uuid + "\",\n" +
		"  \"app-icon\" :\"app-icon.png\",\n" +
		"  \"app-doc-url\" :\"https://evothings.com/" + VERSION + "/doc/" + destPath + ".html\"\n" +
		"}\n"
	puts 'Writing settings file ' + fullDestPath(destPath) + '/evothings.json'
	writeFileUTF8(fullDestPath(destPath) + '/evothings.json', json)
end

def copyUI(destPath)
	copyDir('resources/ui', fullDestPath(destPath))
	copyDir(libraryPath('libs/evothings/ui'), fullDestPath(destPath) + '/libs/evothings')
end

def copyJQuery(destPath)
	copyDir(libraryPath('libs/jquery'), fullDestPath(destPath) + '/libs')
end

def copyEvothings(destPath)
	copyDir(
		libraryPath('libs/evothings/evothings.js'),
		fullDestPath(destPath) + '/libs/evothings')
	copyDir(
		libraryPath('libs/evothings/VERSION'),
		fullDestPath(destPath) + '/libs/evothings')
end

def copyEasyBLE(destPath)
	copyUtil(destPath)
	copyDir(
		libraryPath('libs/evothings/easyble'),
		fullDestPath(destPath) + '/libs/evothings')
end

def copyWebBluetooth(destPath)
	copyDir(
		libraryPath('libs/bleat'),
		fullDestPath(destPath) + '/libs')
end

def copyArduinoBLE(destPath)
	copyEasyBLE(destPath)
	copyDir(
		libraryPath('libs/evothings/arduinoble'),
		fullDestPath(destPath) + '/libs/evothings')
end

def copyArduinoTCP(destPath)
	copyDir(
		libraryPath('libs/evothings/arduinotcp'),
		fullDestPath(destPath) + '/libs/evothings')
end

def copyNordic_nRF51822_BLE(destPath)
	copyEasyBLE(destPath)
	copyDir(
		libraryPath('libs/evothings/nordic-nRF51822-ble'),
		fullDestPath(destPath) + '/libs/evothings')
end

def copyNordic_nRF51_BLE(destPath)
	copyEasyBLE(destPath)
	copyDir(
		libraryPath('libs/evothings/nordic-nRF51-ble'),
		fullDestPath(destPath) + '/libs/evothings')
end

def copyRFduinoBLE(destPath)
	copyEasyBLE(destPath)
	copyDir(
		libraryPath('libs/evothings/rfduinoble'),
		fullDestPath(destPath) + '/libs/evothings')
end

def copyTISensorTag(destPath)
	copyEasyBLE(destPath)
	copyDir(
		libraryPath('libs/evothings/tisensortag'),
		fullDestPath(destPath) + '/libs/evothings')
end

def copyEddystone(destPath)
	copyEasyBLE(destPath)
	copyDir(
		libraryPath('libs/evothings/eddystone'),
		fullDestPath(destPath) + '/libs/evothings')
end

def copyUtil(destPath)
	copyDir(
		libraryPath('libs/evothings/util'),
		fullDestPath(destPath) + '/libs/evothings')
end

def copyDialogIoTSensorLibrary(destPath)
	copyDir(
		libraryPath('libs/evothings/dialog-iotsensor'),
		fullDestPath(destPath) + '/libs/evothings')
end

def copyWhereIsTheArduinoCode(destPath)
	copyFile(
		'resources/txt/where-is-the-arduino-code.txt',
		fullDestPath(destPath) + '/where-is-the-arduino-code.txt')
end

### Arduino .ino files ###

def copyArduinoEthernet(destPath)
	copyDir(
		libraryPath('arduino/arduinoethernet'),
		fullDestPath(destPath) + '/arduinoethernet')
end

def copyArduinoWiFi(destPath)
	copyDir(
		libraryPath('arduino/arduinowifi'),
		fullDestPath(destPath) + '/arduinowifi')
end

### General copy methods ###

def copyDir(srcPath, destPath)
	mkpath(destPath)
	cp_r(srcPath, destPath)
end

def rmDir(path)
	rm_rf(path)
end

def copyFile(srcPath, destPath)
	cp(srcPath, destPath)
end

def writeFileUTF8(destPath, content)
	File.open(destPath, "w:UTF-8") { |f| f.write(content) }
end

###### Script entry point ######

def buildExamples
	buildBlePeripheral
	buildMbedGAP
	buildMbedGATT
	buildMbedGATTWebBluetooth
	buildArduinoBLE
	buildArduinoInputTCP
	buildArduinoLEDOnOffBLE
	buildArduinoLEDOnOffTCP
	buildArduinoScriptableTCP
	buildBLEScan
	buildBLEDiscovery
	buildBlunoHelloWorld
	buildCordovaAccelerometer
	buildCordovaBasic
	buildEstimoteBeacons
	buildEstimoteNearables
	buildHelloWorld
	buildHelloECMAScript6
	buildHueLights
	buildEddystoneScan
	buildIBeaconScan
	buildLightblueBeanBasic
	buildLightblueBeanSerial
	buildNordic_nRF51822EK_BLE
	buildNordic_nRF51DK_BLE
	buildRedBearLabSimpleChat
	buildRedBearLabSimpleControl
	buildRFduinoLEDOnOff
	buildTISensorTagCC2541Demo
	buildTISensorTagCC2541WebBluetooth
	buildTISensorTagCC2650Demo
	buildTISensorTagSensors
	buildTISensorTagAccelerometer
	buildMediaTekLinkIt
	buildMediaTekLinkItConnect
	buildEsp8266
	buildArduino101LEDOnOff
	buildMicrobitLED
	buildMicrobitAccelerometer
	buildMicrobitSensors
	buildArduinoBluefruitLEDOnOff
	buildArduinoBluefruitRFDataGatherer
	buildDialogBlinky
	buildDialogBeacons
	buildDialogIoTSensor
	buildRPi3SystemInformation
    buildMediaTekLinkIt7688Duo
	# Templates - these are used by "New" button i Evothings Studio.
	buildTemplateBasicApp
	# TODO: buildTemplateBLEApp
	# TODO: buildTemplateEddystoneApp
end

# Build the examples.

buildGenerated
