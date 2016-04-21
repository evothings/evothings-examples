# Build script for Evothings Example apps.
#
# How to run:
# ruby build.rb
#

require 'fileutils'

include FileUtils::Verbose

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
	copyDir(
		'examples',
		'generated')
	copyDir(
		'experiments',
		'generated')
	buildExamples
end

###### Examples ######

def buildMbedGAP
	destPath = 'examples/mbed-custom-gap'
	icon = 'arm-mbed.png'
	copyCommon(destPath, icon)
	copyJQuery(destPath)
	copyEasyBLE(destPath)
	copyUtil(destPath)
end

def buildMbedGATT
	destPath = 'examples/mbed-custom-gatt'
	icon = 'arm-mbed.png'
	copyCommon(destPath, icon)
	copyJQuery(destPath)
	copyEasyBLE(destPath)
	copyUtil(destPath)
end

def buildArduinoBLE
	destPath = 'examples/arduino-ble/app'
	icon = 'arduino.png'
	copyCommon(destPath, icon)
	copyJQuery(destPath)
	copyWhereIsTheArduinoCode(destPath)
end

def buildArduinoInputTCP
	# Copy CSS/JS files.
	destPath = 'examples/arduino-input-tcp/app'
	icon = 'arduino.png'
	copyCommon(destPath, icon)
	copyJQuery(destPath)
	copyArduinoTCP(destPath)
	copyWhereIsTheArduinoCode(destPath)

	# Copy Arduino files.
	destPath = 'examples/arduino-input-tcp'
	copyArduinoEthernet(destPath)
	copyArduinoWiFi(destPath)
end

def buildArduinoLEDOnOffBLE
	destPath = 'examples/arduino-led-onoff-ble/app'
	icon = 'arduino.png'
	copyCommon(destPath, icon)
	copyJQuery(destPath)
	copyArduinoBLE(destPath)
	copyWhereIsTheArduinoCode(destPath)
end

def buildArduinoLEDOnOffTCP
	# Copy CSS/JS files.
	destPath = 'examples/arduino-led-onoff-tcp/app'
	icon = 'arduino.png'
	copyCommon(destPath, icon)
	copyJQuery(destPath)
	copyArduinoTCP(destPath)
	copyWhereIsTheArduinoCode(destPath)

	# Copy Arduino files.
	destPath = 'examples/arduino-led-onoff-tcp'
	copyArduinoEthernet(destPath)
	copyArduinoWiFi(destPath)
end

def buildArduinoScriptableTCP
	# Copy CSS/JS files.
	destPath = 'examples/arduino-scriptable-tcp/app'
	icon = 'arduino.png'
	copyCommon(destPath, icon)
	copyJQuery(destPath)
	copyArduinoTCP(destPath)
	copyWhereIsTheArduinoCode(destPath)

	# Copy Arduino files.
	destPath = 'examples/arduino-scriptable-tcp'
	copyArduinoEthernet(destPath)
	copyArduinoWiFi(destPath)
end

def buildBLEScan
	destPath = 'examples/ble-scan'
	icon = 'ble-logo.png'
	copyCommon(destPath, icon)
	copyJQuery(destPath)
end

def buildBLEDiscovery
	destPath = 'examples/ble-discovery'
	icon = 'ble-logo.png'
	copyImageFile(destPath, icon)
	writeSettingsFile(destPath, icon)
end

def buildTISensorTagCC2541Demo
	destPath = 'examples/ti-sensortag-cc2541-demo'
	icon = 'ti-sensortag-cc2541.png'
	copyCommon(destPath, icon)
	copyJQuery(destPath)
	copyEasyBLE(destPath)
end

def buildTISensorTagCC2650Demo
	destPath = 'examples/ti-sensortag-cc2650-demo'
	icon = 'ti-sensortag-cc2650.png'
	copyCommon(destPath, icon)
	copyJQuery(destPath)
	copyEasyBLE(destPath)
end

def buildTISensorTagSensors
	destPath = 'examples/ti-sensortag-sensors'
	icon = 'ti-sensortag-cc2650.png'
	copyCommon(destPath, icon)
	copyUtil(destPath)
	copyTISensorTag(destPath)
end

def buildTISensorTagAccelerometer
	destPath = 'examples/ti-sensortag-accelerometer'
	icon = 'ti-sensortag-cc2650.png'
	copyCommon(destPath, icon)
	copyUtil(destPath)
	copyTISensorTag(destPath)
end

def buildCordovaAccelerometer
	destPath = 'examples/cordova-accelerometer'
	icon = 'evothings-logo.png'
	copyCommon(destPath, icon)
	copyJQuery(destPath)
end

def buildCordovaBasic
	destPath = 'examples/cordova-basic'
	icon = 'evothings-logo.png'
	copyCommon(destPath, icon)
	copyJQuery(destPath)
end

def buildHelloWorld
	destPath = 'examples/hello-world'
	icon = 'evothings-logo.png'
	copyCommon(destPath, icon)
end

def buildHueLights
	destPath = 'examples/hue-lights'
	icon = 'philips-hue.png'
	copyCommon(destPath, icon)
	copyJQuery(destPath)
end

def buildEddystoneScan
	destPath = 'examples/eddystone-scan'
	icon = 'eddystone.png'
	copyCommon(destPath, icon)
	copyEddystone(destPath)
	copyJQuery(destPath)
end

def buildIBeaconScan
	destPath = 'examples/ibeacon-scan'
	icon = 'ibeacon.png'
	copyCommon(destPath, icon)
	copyJQuery(destPath)
end

def buildEstimoteBeacons
	destPath = 'examples/estimote-beacons'
	icon = 'estimote-beacons.png'
	copyCommon(destPath, icon)
	copyJQuery(destPath)
end

def buildEstimoteNearables
	destPath = 'examples/estimote-nearables'
	icon = 'estimote-nearables.png'
	copyCommon(destPath, icon)
	copyJQuery(destPath)
end

def buildNordic_nRF51822EK_BLE
	destPath = 'examples/nordic-nRF51822-ek-ble'
	icon = 'nordic-semi.png'
	copyCommon(destPath, icon)
	copyJQuery(destPath)
	copyNordic_nRF51822_BLE(destPath)
end

def buildNordic_nRF51DK_BLE
	destPath = 'examples/nordic-nRF51-dk-ble/app'
	icon = 'nordic-semi.png'
	copyCommon(destPath, icon)
	copyJQuery(destPath)
	copyNordic_nRF51_BLE(destPath)
end

def buildRFduinoLEDOnOff
	destPath = 'examples/rfduino-led-onoff/app'
	icon = 'rfduino.png'
	copyCommon(destPath, icon)
	copyJQuery(destPath)
	copyRFduinoBLE(destPath)
	copyWhereIsTheArduinoCode(destPath)
end

def buildLightblueBeanBasic
	destPath = 'examples/lightblue-bean-basic/app'
	icon = 'lightblue-bean.png'
	copyCommon(destPath, icon)
	copyEasyBLE(destPath)
end

def buildRedBearLabSimpleControl
	destPath = 'examples/redbearlab-simplecontrol'
	icon = 'redbearlab.png'
	copyCommon(destPath, icon)
	copyEasyBLE(destPath)
	copyJQuery(destPath)
end

def buildRedBearLabSimpleChat
	destPath = 'examples/redbearlab-simplechat'
	icon = 'redbearlab.png'
	copyCommon(destPath, icon)
	copyEasyBLE(destPath)
	copyJQuery(destPath)
end

def buildBlunoHelloWorld
	destPath = 'examples/bluno-helloworld/app'
	icon = 'bluno.png'
	copyCommon(destPath, icon)
	copyEasyBLE(destPath)
	copyJQuery(destPath)
end

def buildLightblueBeanSerial
	destPath = 'experiments/lightblue-bean-serial'
	icon = 'lightblue-bean.png'
	copyCommon(destPath, icon)
	copyUtil(destPath)
end

def buildMediaTekLinkIt
	destPath = 'examples/mediatek-linkit/app'
	icon = 'mediatek-linkit.png'
	copyCommon(destPath, icon)
	copyJQuery(destPath)
end

def buildMediaTekLinkItConnect
	destPath = 'examples/mediatek-linkit-connect/app'
	icon = 'mediatek-linkit.png'
	copyCommon(destPath, icon)
	copyJQuery(destPath)
end

def buildBlePeripheral
	destPath = 'experiments/ble-peripheral'
	icon = 'ble-logo.png'
	copyCommon(destPath, icon)
	copyUtil(destPath)
end

def buildEsp8266
	destPath = 'examples/esp8266/app'
	icon = 'esp8266.png'
	copyCommon(destPath, icon)
	copyJQuery(destPath)
end

def buildDialogBlinky
	destPath = 'examples/dialog-blinky/app'
	icon = 'dialog-semiconductor.png'
	copyCommon(destPath, icon)
	copyEasyBLE(destPath)
	copyUtil(destPath)
end

def buildDialogBeacons
	destPath = 'examples/dialog-beacons/app'
	icon = 'dialog-semiconductor.png'
	copyCommon(destPath, icon)
	copyJQuery(destPath)
	copyUtil(destPath)
	copyEasyBLE(destPath)
	copyEddystone(destPath)
end

def buildDialogIoTSensor
	destPath = 'examples/dialog-iotsensor/app'
	icon = 'dialog-semiconductor.png'
	copyCommon(destPath, icon)
	copyJQuery(destPath)
	copyUtil(destPath)
	copyEasyBLE(destPath)
	copyDialogIoTSensorLibrary(destPath)
end

def buildTemplateBasicApp
	destPath = 'examples/template-basic-app'
	icon = 'evothings-logo.png'
	copyCommon(destPath, icon)
	copyJQuery(destPath)
end

# TODO
#def buildTemplateBLEApp
#	destPath = 'examples/template-ble-app'
#	icon = 'evothings-logo.png'
#	copyCommon(destPath, icon)
#	copyJQuery(destPath)
#	copyEasyBLE(destPath)
#end

# TODO
#def buildTemplateEddystoneApp
#	destPath = 'examples/template-eddystone-app'
#	icon = 'evothings-logo.png'
#	copyCommon(destPath, icon)
#	copyJQuery(destPath)
#	copyEddystone(destPath)
#end

###### Copy helpers ######

### CSS/JS ###

def copyCommon(destPath, imageFile = nil)
	copyUI(destPath)
	copyEvothings(destPath)
	copyImageFile(destPath, imageFile)
	writeSettingsFile(destPath, imageFile)
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

def writeSettingsFile(destPath, imageFile)
	if imageFile.nil?
		json = '{}'
	else
		json = '{"app-icon":"app-icon.png"}'
	end
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
end

def copyEasyBLE(destPath)
	copyUtil(destPath)
	copyDir(
		libraryPath('libs/evothings/easyble'),
		fullDestPath(destPath) + '/libs/evothings')
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
	buildTISensorTagCC2650Demo
	buildTISensorTagSensors
	buildTISensorTagAccelerometer
	buildMediaTekLinkIt
	buildMediaTekLinkItConnect
	buildEsp8266
	buildDialogBlinky
	buildDialogBeacons
	buildDialogIoTSensor
	# Templates - these are used by "New" button i Evothings Studio.
	buildTemplateBasicApp
	# TODO: buildTemplateBLEApp
	# TODO: buildTemplateEddystoneApp
end

# Build the examples.

buildGenerated
