/**
 * File: sensortag.js
 * Description: JavaScript library for the TI SensorTag.
 * Author: Miki
 */

// Documentation for the TI SensorTag:
// http://processors.wiki.ti.com/index.php/SensorTag_User_Guide
// http://processors.wiki.ti.com/index.php/File:BLE_SensorTag_GATT_Server.pdf

// For debugging.
function LogServices(device)
{
	// Here we simply print found services, characteristics,
	// and descriptors to the debug console in Evothings Workbench.

	// Print all services.
	for (var serviceUUID in device.__services)
	{
		var service = device.__services[serviceUUID]
		console.log('  service: ' + service.uuid)

		// Print all characteristics for service.
		for (var characteristicUUID in service.__characteristics)
		{
			var characteristic = service.__characteristics[characteristicUUID]
			console.log('    characteristic: ' + characteristic.uuid)

			// Print all descriptors for characteristic.
			for (var descriptorUUID in characteristic.__descriptors)
			{
				var descriptor = characteristic.__descriptors[descriptorUUID]
				console.log('      descriptor: ' + descriptor.uuid)
			}
		}
	}
}

var TISensorTag = (function()
{
	var sensortag = {}

	sensortag.IRTEMPERATURE_SERVICE = 'f000aa00-0451-4000-b000-000000000000'
	sensortag.IRTEMPERATURE_CONFIG = 'f000aa02-0451-4000-b000-000000000000'
	sensortag.IRTEMPERATURE_DATA = 'f000aa01-0451-4000-b000-000000000000'
	sensortag.IRTEMPERATURE_NOTIFICATION = '00002902-0000-1000-8000-00805f9b34fb'

	sensortag.ACCELEROMETER_SERVICE = 'f000aa10-0451-4000-b000-000000000000'
	sensortag.ACCELEROMETER_CONFIG = 'f000aa12-0451-4000-b000-000000000000'
	sensortag.ACCELEROMETER_PERIOD = 'f000aa13-0451-4000-b000-000000000000'
	sensortag.ACCELEROMETER_DATA = 'f000aa11-0451-4000-b000-000000000000'
	sensortag.ACCELEROMETER_NOTIFICATION = '00002902-0000-1000-8000-00805f9b34fb'

	sensortag.HUMIDITY_SERVICE = 'f000aa20-0451-4000-b000-000000000000'
	sensortag.HUMIDITY_CONFIG = 'f000aa22-0451-4000-b000-000000000000'
	sensortag.HUMIDITY_DATA = 'f000aa21-0451-4000-b000-000000000000'
	sensortag.HUMIDITY_NOTIFICATION = '00002902-0000-1000-8000-00805f9b34fb'

	sensortag.MAGNETOMETER_SERVICE = 'f000aa30-0451-4000-b000-000000000000'
	sensortag.MAGNETOMETER_CONFIG = 'f000aa32-0451-4000-b000-000000000000'
	sensortag.MAGNETOMETER_PERIOD = 'f000aa33-0451-4000-b000-000000000000'
	sensortag.MAGNETOMETER_DATA = 'f000aa31-0451-4000-b000-000000000000'
	sensortag.MAGNETOMETER_NOTIFICATION = '00002902-0000-1000-8000-00805f9b34fb'

	sensortag.BAROMETER_SERVICE = 'f000aa40-0451-4000-b000-000000000000'
	sensortag.BAROMETER_CONFIG = 'f000aa42-0451-4000-b000-000000000000'
	sensortag.BAROMETER_DATA = 'f000aa41-0451-4000-b000-000000000000'
	sensortag.BAROMETER_NOTIFICATION = '00002902-0000-1000-8000-00805f9b34fb'

	sensortag.GYROSCOPE_SERVICE = 'f000aa50-0451-4000-b000-000000000000'
	sensortag.GYROSCOPE_CONFIG = 'f000aa52-0451-4000-b000-000000000000'
	sensortag.GYROSCOPE_PERIOD = 'f000aa53-0451-4000-b000-000000000000'
	sensortag.GYROSCOPE_DATA = 'f000aa51-0451-4000-b000-000000000000'
	sensortag.GYROSCOPE_NOTIFICATION = '00002902-0000-1000-8000-00805f9b34fb'

	sensortag.KEYPRESS_SERVICE = '0000ffe0-0000-1000-8000-00805f9b34fb'
	sensortag.KEYPRESS_DATA = '0000ffe1-0000-1000-8000-00805f9b34fb'
	sensortag.KEYPRESS_NOTIFICATION = '00002902-0000-1000-8000-00805f9b34fb'

	/**
	 * Internal. Override if needed.
	 */
	sensortag.deviceIsSensorTag = function(device)
	{
		return (device != null) &&
			(device.name != null) &&
			(device.name.indexOf('Sensor Tag') > -1 ||
				device.name.indexOf('SensorTag') > -1)
	}

	/**
	 * Public. Create tag instance.
	 */
	sensortag.createInstance = function()
	{
		/**
		 * Internal. Variable holding the sensor tag instance object.
		 */
		var instance = {}

		/**
		 * Internal. Services used by the application.
		 */
		instance.requiredServices = []

		/**
		 * Internal. Default error handler function.
		 */
		instance.errorFun = function(error)
		{
			console.log('SensorTag error: ' + error)
		}

		/**
		 * Internal. Default status handler function.
		 */
		instance.statusFun = function(status)
		{
			console.log('SensorTag status: ' + status)
		}

		/**
		 * Public. Set the IR temperature notification callback.
		 * @param fun - success callback called repeatedly: fun(data)
		 * @param interval - accelerometer rate in milliseconds.
		 */
		instance.irTemperatureCallback = function(fun)
		{
			instance.irTemperatureFun = fun
			instance.requiredServices.push(sensortag.IRTEMPERATURE_SERVICE)

			return instance
		}

		/**
		 * Public. Set the accelerometer notification callback.
		 * @param fun - success callback called repeatedly: fun(data)
		 * @param interval - accelerometer rate in milliseconds.
		 */
		instance.accelerometerCallback = function(fun, interval)
		{
			instance.accelerometerFun = fun
			instance.accelerometerInterval = interval
			instance.requiredServices.push(sensortag.ACCELEROMETER_SERVICE)

			return instance
		}

		/**
		 * Public. Set the humidity notification callback.
		 * @param fun - success callback called repeatedly: fun(data)
		 * @param interval - accelerometer rate in milliseconds.
		 */
		instance.humidityCallback = function(fun)
		{
			instance.humidityFun = fun
			instance.requiredServices.push(sensortag.HUMIDITY_SERVICE)

			return instance
		}

		/**
		 * Public. Set the magnetometer notification callback.
		 * @param fun - success callback called repeatedly: fun(data)
		 * @param interval - accelerometer rate in milliseconds.
		 */
		instance.magnetometerCallback = function(fun, interval)
		{
			instance.magnetometerFun = fun
			instance.magnetometerInterval = interval
			instance.requiredServices.push(sensortag.MAGNETOMETER_SERVICE)

			return instance
		}

		/**
		 * Public. Set the barometer notification callback.
		 * @param fun - success callback called repeatedly: fun(data)
		 * @param interval - accelerometer rate in milliseconds.
		 */
		instance.barometerCallback = function(fun)
		{
			instance.barometerFun = fun
			instance.requiredServices.push(sensortag.BAROMETER_SERVICE)

			return instance
		}

		/**
		 * Public. Set the gyroscope notification callback.
		 * @param fun - success callback called repeatedly: fun(data)
		 * @param axes - the axes to enable, 1 to enable X axis only,
		 * 2 to enable Y axis only, 3 = X and Y, 4 = Z only,
		 * 5 = X and Z, 6 = Y and Z, 7 = X, Y and Z.
		 * @param interval - gyroscope rate in milliseconds.
		 */
		instance.gyroscopeCallback = function(fun, axes, interval)
		{
			instance.gyroscopeFun = fun
			instance.gyroscopeAxes = axes
			instance.gyroscopeInterval = interval
			instance.requiredServices.push(sensortag.GYROSCOPE_SERVICE)

			return instance
		}

		/**
		 * Public. Set the keypress notification callback.
		 * @param fun - success callback called when a key is pressed: fun(data)
		 */
		instance.keypressCallback = function(fun)
		{
			instance.keypressFun = fun
			instance.requiredServices.push(sensortag.KEYPRESS_SERVICE)

			return instance
		}

		/**
		 * Public. Set the error handler function.
		 * @param fun - error callback: fun(error)
		 */
		instance.errorCallback = function(fun)
		{
			instance.errorFun = fun

			return instance
		}

		/**
		 * Public. Set the status handler function.
		 * @param fun - callback: fun(status)
		 */
		instance.statusCallback = function(fun)
		{
			instance.statusFun = fun

			return instance
		}

		/**
		 * Public. Connect to the closest physical SensorTag device.
		 */
		instance.connectToClosestDevice = function()
		{
			instance.statusFun('Scanning...')
			instance.disconnectDevice()
			easyble.stopScan()
			easyble.reportDeviceOnce(false)
			var stopScanTime = Date.now() + 2000
			var closestDevice = null
			var strongestRSSI = -1000
			easyble.startScan(
				function(device)
				{
					// Connect if we have found a sensor tag.
					if (sensortag.deviceIsSensorTag(device)
						&& device.rssi != 127 // Invalid RSSI value
						)
					{
						if (device.rssi > strongestRSSI)
						{
							closestDevice = device
							strongestRSSI = device.rssi
						}

						if (Date.now() >= stopScanTime)
						{
							instance.statusFun('SensorTag found')
							easyble.stopScan()
							instance.device = closestDevice
							instance.connectToDevice()
						}
					}
				},
				function(errorCode)
				{
					instance.errorFun('Scan failed')
				})

			return instance
		}

		/**
		 * Internal.
		 */
		instance.connectToDevice = function()
		{
			instance.statusFun('Connecting...')
			instance.device.connect(
				function(device)
				{
				instance.statusFun('Connected')
				instance.statusFun('Reading services...')
					device.readServices(
						instance.requiredServices,
						instance.activateSensors,
						instance.errorFun)
				},
				instance.errorFun)
		}

		/**
		 * Public/Internal. Disconnect from the physical device.
		 */
		instance.disconnectDevice = function()
		{
			if (instance.device)
			{
				instance.device.close()
				instance.device = null
			}

			return instance
		}

		/**
		 * Internal.
		 */
		instance.activateSensors = function()
		{
			// Debug logging.
			//console.log('-------------------- SERVICES --------------------')
			//LogServices(instance.device)
			//console.log('---------------------- END -----------------------')

			instance.statusFun('Sensors online')
			instance.irTemperatureOn()
			instance.accelerometerOn()
			instance.humidityOn()
			instance.magnetometerOn()
			instance.barometerOn()
			instance.gyroscopeOn()
			instance.keypressOn()
		}

		/**
		 * Public. Turn on IR temperature notification.
		 */
		instance.irTemperatureOn = function()
		{
			instance.sensorOn(
				sensortag.IRTEMPERATURE_CONFIG,
				1, // Sensor on.
				null, // Not used.
				null, // Not used.
				sensortag.IRTEMPERATURE_DATA,
				sensortag.IRTEMPERATURE_NOTIFICATION,
				instance.irTemperatureFun)

			return instance
		}

		/**
		 * Public. Turn off IR temperature notification.
		 */
		instance.irTemperatureOff = function()
		{
			instance.sensorOff(sensortag.IRTEMPERATURE_DATA)

			return instance
		}

		/**
		 * Public. Turn on accelerometer notification.
		 */
		instance.accelerometerOn = function()
		{
			instance.sensorOn(
				sensortag.ACCELEROMETER_CONFIG,
				1, // Sensor on.
				sensortag.ACCELEROMETER_PERIOD,
				instance.accelerometerInterval,
				sensortag.ACCELEROMETER_DATA,
				sensortag.ACCELEROMETER_NOTIFICATION,
				instance.accelerometerFun)

			return instance
		}

		/**
		 * Public. Turn off accelerometer notification.
		 */
		instance.accelerometerOff = function()
		{
			instance.sensorOff(sensortag.ACCELEROMETER_DATA)

			return instance
		}

		/**
		 * Public. Turn on humidity notification.
		 */
		instance.humidityOn = function()
		{
			instance.sensorOn(
				sensortag.HUMIDITY_CONFIG,
				1, // Sensor on.
				null, // Not used.
				null, // Not used.
				sensortag.HUMIDITY_DATA,
				sensortag.HUMIDITY_NOTIFICATION,
				instance.humidityFun)

			return instance
		}

		/**
		 * Public. Turn off humidity notification.
		 */
		instance.humidityOff = function()
		{
			instance.sensorOff(sensortag.HUMIDITY_DATA)

			return instance
		}

		/**
		 * Public. Turn on magnetometer notification.
		 */
		instance.magnetometerOn = function()
		{
			instance.sensorOn(
				sensortag.MAGNETOMETER_CONFIG,
				1, // Sensor on.
				sensortag.MAGNETOMETER_PERIOD,
				instance.magnetometerInterval,
				sensortag.MAGNETOMETER_DATA,
				sensortag.MAGNETOMETER_NOTIFICATION,
				instance.magnetometerFun)

			return instance
		}

		/**
		 * Public. Turn off magnetometer notification.
		 */
		instance.magnetometerOff = function()
		{
			instance.sensorOff(sensortag.MAGNETOMETER_DATA)

			return instance
		}

		/**
		 * Public. Turn on barometer notification.
		 */
		instance.barometerOn = function()
		{
			instance.sensorOn(
				sensortag.BAROMETER_CONFIG,
				1, // Sensor on.
				null, // Not used.
				null, // Not used.
				sensortag.BAROMETER_DATA,
				sensortag.BAROMETER_NOTIFICATION,
				instance.barometerFun)

			return instance
		}

		/**
		 * Public. Turn off barometer notification.
		 */
		instance.barometerOff = function()
		{
			instance.sensorOff(sensortag.BAROMETER_DATA)

			return instance
		}

		/**
		 * Public. Turn on gyroscope notification.
		 */
		instance.gyroscopeOn = function()
		{
			instance.sensorOn(
				sensortag.GYROSCOPE_CONFIG,
				instance.gyroscopeAxes,
				sensortag.GYROSCOPE_PERIOD,
				instance.gyroscopeInterval,
				sensortag.GYROSCOPE_DATA,
				sensortag.GYROSCOPE_NOTIFICATION,
				instance.gyroscopeFun)

			return instance
		}

		/**
		 * Public. Turn off gyroscope notification.
		 */
		instance.gyroscopeOff = function()
		{
			instance.sensorOff(sensortag.GYROSCOPE_DATA)

			return instance
		}

		/**
		 * Public. Turn on keypress notification.
		 */
		instance.keypressOn = function()
		{
			instance.sensorOn(
				null, // Not used.
				null, // Not used.
				null, // Not used.
				null, // Not used.
				sensortag.KEYPRESS_DATA,
				sensortag.KEYPRESS_NOTIFICATION,
				instance.keypressFun)

			return instance
		}

		/**
		 * Public. Turn off keypress notification.
		 */
		instance.keypressOff = function()
		{
			instance.sensorOff(sensortag.KEYPRESS_DATA)

			return instance
		}

		/**
		 * Private/public. Helper function for turning on sensor notification.
		 * You can call this function from the application to enables sensors
		 * using custom parameters (advanced use).
		 */
		instance.sensorOn = function(
			configUUID,
			configValue,
			periodUUID,
			periodValue,
			dataUUID,
			notificationUUID,
			notificationFunction)
		{
			// Only start sensor if a notification function has been set.
			if (!notificationFunction) { return }

			// Set sensor configuration to ON.
			configUUID && instance.device.writeCharacteristic(
				configUUID,
				new Uint8Array([configValue]),
				function() {},
				instance.errorFun)

			// Set sensor update period.
			periodUUID && periodValue && instance.device.writeCharacteristic(
				periodUUID,
				new Uint8Array([periodValue / 10]),
				function() {},
				instance.errorFun)

			// Set sensor notification to ON.
			dataUUID && notificationUUID && instance.device.writeDescriptor(
				dataUUID, // Characteristic for data
				notificationUUID, // Configuration descriptor
				new Uint8Array([1,0]),
				function() {},
				instance.errorFun)

			// Start sensor notification.
			dataUUID && instance.device.enableNotification(
				dataUUID,
				function(data) { notificationFunction(new Int8Array(data)) },
				instance.errorFun)

			return instance
		}

		/**
		 * Helper function for turning off sensor notification.
		 */
		instance.sensorOff = function(dataUUID)
		{
			dataUUID && instance.device.disableNotification(
				dataUUID,
				function() {},
				instance.errorFun)

			return instance
		}

		// Finally, return the SensorTag instance object.
		return instance
	}

	// Return the SensorTag 'class' object.
	return sensortag
})()
