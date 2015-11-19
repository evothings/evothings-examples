# Build script for Evothings Example apps.
#
# How to run:
# ruby build.rb
#

require 'fileutils'

include FileUtils::Verbose

###### Examples ######

def buildMbedGAP
	destPath = 'examples/mbed-custom-gap'
	icon = 'mbed.png'
	copyCommon(destPath, icon)
	copyJQuery(destPath)
	copyEasyBLE(destPath)
	copyUtil(destPath)
end

def buildMbedGATT
	destPath = 'examples/mbed-custom-gatt'
	icon = 'mbed.png'
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
	copyCommon(destPath)
	copyJQuery(destPath)
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
	copyCommon(destPath)
	copyJQuery(destPath)
end

def buildCordovaBasic
	destPath = 'examples/cordova-basic'
	copyCommon(destPath)
	copyJQuery(destPath)
end

def buildHelloWorld
	destPath = 'examples/hello-world'
	copyCommon(destPath)
end

def buildHueLights
	destPath = 'examples/hue-lights'
	copyCommon(destPath)
	copyJQuery(destPath)
end

def buildEddystoneScan
	destPath = 'examples/eddystone-scan'
	copyCommon(destPath)
	copyEddystone(destPath)
	copyJQuery(destPath)
end

def buildIBeaconScan
	destPath = 'examples/ibeacon-scan'
	copyCommon(destPath)
	copyJQuery(destPath)
end

def buildEstimoteBeacons
	destPath = 'examples/estimote-beacons'
	icon = 'estimote.png'
	copyCommon(destPath, icon)
	copyJQuery(destPath)
end

def buildEstimoteNearables
	destPath = 'examples/estimote-nearables'
	icon = 'estimote.png'
	copyCommon(destPath, icon)
	copyJQuery(destPath)
end

def buildNordic_nRF51822EK_BLE
	destPath = 'examples/nordic-nRF51822-ek-ble'
	copyCommon(destPath)
	copyJQuery(destPath)
	copyNordic_nRF51822_BLE(destPath)
end

def buildNordic_nRF51DK_BLE
	destPath = 'examples/nordic-nRF51-dk-ble/app'
	copyCommon(destPath)
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
	copyCommon(destPath)
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
	copyCommon(destPath)
	copyEasyBLE(destPath)
	copyJQuery(destPath)
end

def buildLightblueBeanSerial
	destPath = 'experiments/lightblue-bean-serial'
	copyCommon(destPath)
	copyUtil(destPath)
end

def buildMediaTekLinkIt
	destPath = 'examples/mediatek-linkit/app'
	copyUI(destPath)
	copyJQuery(destPath)
end

def buildMediaTekLinkItConnect
	destPath = 'examples/mediatek-linkit-connect/app'
	copyCommon(destPath)
	copyJQuery(destPath)
end

def buildBlePeripheral
	destPath = 'experiments/ble-peripheral'
	copyUtil(destPath)
end

def buildEsp8266
	destPath = 'examples/esp8266/app'
	copyCommon(destPath)
	copyJQuery(destPath)
end

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
		copyFile('resources/app-icons/' + imageFile, destPath + '/app-icon.png')
	end
end

def writeSettingsFile(destPath, imageFile)
	if imageFile.nil?
		json = '{}'
	else
		json = '{"app-icon":"app-icon.png"}'
	end
	writeFileUTF8(destPath + '/evothings.json', json)
end

def copyUI(destPath)
	copyDir('resources/ui', destPath)
	copyDir('resources/libs/evothings/ui', destPath + '/libs/evothings')
end

def copyJQuery(destPath)
	copyDir('resources/libs/jquery', destPath + '/libs')
end

def copyEvothings(destPath)
	copyDir('resources/libs/evothings/evothings.js', destPath + '/libs/evothings')
	copyDir('resources/libs/evothings/version-1.2.0', destPath + '/libs/evothings')
end

def copyEasyBLE(destPath)
	copyUtil(destPath)
	copyDir('resources/libs/evothings/easyble', destPath + '/libs/evothings')
end

def copyArduinoBLE(destPath)
	copyEasyBLE(destPath)
	copyDir('resources/libs/evothings/arduinoble', destPath + '/libs/evothings')
end

def copyArduinoTCP(destPath)
	copyDir('resources/libs/evothings/arduinotcp', destPath + '/libs/evothings')
end

def copyNordic_nRF51822_BLE(destPath)
	copyEasyBLE(destPath)
	copyDir('resources/libs/evothings/nordic-nRF51822-ble', destPath + '/libs/evothings')
end

def copyNordic_nRF51_BLE(destPath)
	copyEasyBLE(destPath)
	copyDir('resources/libs/evothings/nordic-nRF51-ble', destPath + '/libs/evothings')
end

def copyRFduinoBLE(destPath)
	copyEasyBLE(destPath)
	copyDir('resources/libs/evothings/rfduinoble', destPath + '/libs/evothings')
end

def copyTISensorTag(destPath)
	copyEasyBLE(destPath)
	copyDir('resources/libs/evothings/tisensortag', destPath + '/libs/evothings')
end

def copyEddystone(destPath)
	copyEasyBLE(destPath)
	copyDir('resources/libs/evothings/eddystone', destPath + '/libs/evothings')
end

def copyUtil(destPath)
	copyDir('resources/libs/evothings/util', destPath + '/libs/evothings')
end

def copyWhereIsTheArduinoCode(destPath)
	copyFile(
		'resources/txt/where-is-the-arduino-code.txt',
		destPath + '/where-is-the-arduino-code.txt')
end

### Arduino .ino files ###

def copyArduinoEthernet(destPath)
	copyDir('resources/arduino/arduinoethernet', destPath + '/arduinoethernet')
end

def copyArduinoWiFi(destPath)
	copyDir('resources/arduino/arduinowifi', destPath + '/arduinowifi')
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

def build
	buildBlePeripheral
	buildMbedGAP
	buildMbedGATT
	buildArduinoBLE
	buildArduinoInputTCP
	buildArduinoLEDOnOffBLE
	buildArduinoLEDOnOffTCP
	buildArduinoScriptableTCP
	buildBLEScan
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
end

build
