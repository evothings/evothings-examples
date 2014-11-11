/**
 * File: tisensortag.js
 * Description: JavaScript library for the TI SensorTag.
 * Author: Miki
 */

// Documentation for the TI SensorTag:
// http://processors.wiki.ti.com/index.php/SensorTag_User_Guide
// http://processors.wiki.ti.com/index.php/File:BLE_SensorTag_GATT_Server.pdf

if (!window.evothings) { window.evothings = {} }
evothings.tisensortag = (function()
{
	var sensortag = {}

	sensortag.DEVICEINFO_SERVICE = '0000180a-0000-1000-8000-00805f9b34fb'
	sensortag.FIRMWARE_DATA = '00002a26-0000-1000-8000-00805f9b34fb'

	sensortag.IRTEMPERATURE_SERVICE = 'f000aa00-0451-4000-b000-000000000000'
	sensortag.IRTEMPERATURE_DATA = 'f000aa01-0451-4000-b000-000000000000'
	sensortag.IRTEMPERATURE_CONFIG = 'f000aa02-0451-4000-b000-000000000000'
	sensortag.IRTEMPERATURE_PERIOD = 'f000aa03-0451-4000-b000-000000000000'
	sensortag.IRTEMPERATURE_NOTIFICATION = '00002902-0000-1000-8000-00805f9b34fb'

	sensortag.ACCELEROMETER_SERVICE = 'f000aa10-0451-4000-b000-000000000000'
	sensortag.ACCELEROMETER_DATA = 'f000aa11-0451-4000-b000-000000000000'
	sensortag.ACCELEROMETER_CONFIG = 'f000aa12-0451-4000-b000-000000000000'
	sensortag.ACCELEROMETER_PERIOD = 'f000aa13-0451-4000-b000-000000000000'
	sensortag.ACCELEROMETER_NOTIFICATION = '00002902-0000-1000-8000-00805f9b34fb'

	sensortag.HUMIDITY_SERVICE = 'f000aa20-0451-4000-b000-000000000000'
	sensortag.HUMIDITY_DATA = 'f000aa21-0451-4000-b000-000000000000'
	sensortag.HUMIDITY_CONFIG = 'f000aa22-0451-4000-b000-000000000000'
	sensortag.HUMIDITY_PERIOD = 'f000aa23-0451-4000-b000-000000000000'
	sensortag.HUMIDITY_NOTIFICATION = '00002902-0000-1000-8000-00805f9b34fb'

	sensortag.MAGNETOMETER_SERVICE = 'f000aa30-0451-4000-b000-000000000000'
	sensortag.MAGNETOMETER_DATA = 'f000aa31-0451-4000-b000-000000000000'
	sensortag.MAGNETOMETER_CONFIG = 'f000aa32-0451-4000-b000-000000000000'
	sensortag.MAGNETOMETER_PERIOD = 'f000aa33-0451-4000-b000-000000000000'
	sensortag.MAGNETOMETER_NOTIFICATION = '00002902-0000-1000-8000-00805f9b34fb'

	sensortag.BAROMETER_SERVICE = 'f000aa40-0451-4000-b000-000000000000'
	sensortag.BAROMETER_DATA = 'f000aa41-0451-4000-b000-000000000000'
	sensortag.BAROMETER_CONFIG = 'f000aa42-0451-4000-b000-000000000000'
	sensortag.BAROMETER_CALIBRATION = 'f000aa43-0451-4000-b000-000000000000'
	sensortag.BAROMETER_PERIOD = 'f000aa44-0451-4000-b000-000000000000'
	sensortag.BAROMETER_NOTIFICATION = '00002902-0000-1000-8000-00805f9b34fb'

	sensortag.GYROSCOPE_SERVICE = 'f000aa50-0451-4000-b000-000000000000'
	sensortag.GYROSCOPE_DATA = 'f000aa51-0451-4000-b000-000000000000'
	sensortag.GYROSCOPE_CONFIG = 'f000aa52-0451-4000-b000-000000000000'
	sensortag.GYROSCOPE_PERIOD = 'f000aa53-0451-4000-b000-000000000000'
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
	 * For debugging.
	 */
	sensortag.logServices = function(device)
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
				console.log('	characteristic: ' + characteristic.uuid)

				// Print all descriptors for characteristic.
				for (var descriptorUUID in characteristic.__descriptors)
				{
					var descriptor = characteristic.__descriptors[descriptorUUID]
					console.log('	  descriptor: ' + descriptor.uuid)
				}
			}
		}
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
		 * @param interval - update rate in milliseconds (min 300ms)
		 */
		instance.irTemperatureCallback = function(fun, interval)
		{
			instance.irTemperatureFun = fun
			instance.irTemperatureConfig = 1 // on
			instance.irTemperatureInterval = Math.max(300, interval)
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
			instance.accelerometerConfig = 1 // on
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
			instance.humidityConfig = 1 // on
			instance.requiredServices.push(sensortag.HUMIDITY_SERVICE)

			return instance
		}

		/**
		 * Public. Set the magnetometer notification callback.
		 * @param fun - success callback called repeatedly: fun(data)
		 * @param interval - magnetometer rate in milliseconds.
		 */
		instance.magnetometerCallback = function(fun, interval)
		{
			instance.magnetometerFun = fun
			instance.magnetometerConfig = 1 // on
			instance.magnetometerInterval = interval
			instance.requiredServices.push(sensortag.MAGNETOMETER_SERVICE)

			return instance
		}

		/**
		 * Public. Set the barometer notification callback.
		 * @param fun - success callback called repeatedly: fun(data)
		 * @param interval - barometer rate in milliseconds.
		 */
		instance.barometerCallback = function(fun, interval)
		{
			instance.barometerFun = fun
			instance.barometerConfig = 1 // on
  			instance.barometerInterval = interval
			instance.requiredServices.push(sensortag.BAROMETER_SERVICE)

			return instance
		}

		/**
		 * Public. Set the gyroscope notification callback.
		 * @param fun - success callback called repeatedly: fun(data)
		 * @param interval - gyroscope rate in milliseconds.
		 * @param axes - the axes to enable ((z << 2) | (y << 1) | x)
		 * Axis parameter values are:
		 * 1 = X only, 2 = Y only,
		 * 3 = X and Y, 4 = Z only,
		 * 5 = X and Z, 6 = Y and Z,
		 * 7 = X, Y and Z.
		 */
		instance.gyroscopeCallback = function(fun, interval, axes)
		{
			instance.gyroscopeFun = fun
			instance.gyroscopeConfig = axes
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
			instance.statusFun && instance.statusFun('Scanning...')
			instance.disconnectDevice()
			evothings.easyble.stopScan()
			evothings.easyble.reportDeviceOnce(false)
			var stopScanTime = Date.now() + 2000
			var closestDevice = null
			var strongestRSSI = -1000
			evothings.easyble.startScan(
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
							instance.statusFun && instance.statusFun('SensorTag found')
							evothings.easyble.stopScan()
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
			instance.statusFun && instance.statusFun('Connecting...')
			instance.device.connect(
				function(device)
				{
					instance.statusFun && instance.statusFun('Connected')
					instance.readDeviceInfo()
				},
				instance.errorFun)
		}

		/**
		 * Internal. When connected we read device info. This can be
		 * used to support different firmware versions etc.
		 * For now we just read the firmware version.
		 */
		instance.readDeviceInfo = function()
		{
			function gotDeviceInfoService(device)
			{
				instance.device.readCharacteristic(
					sensortag.FIRMWARE_DATA,
					gotFirmwareValue,
					instance.errorFun)
			}

			function gotFirmwareValue(data)
			{
				// Set firmware string.
				var fw = evothings.ble.fromUtf8(data)
				instance.firmwareString = fw.substr(0,3)
				instance.statusFun && instance.statusFun('Device data available')

				// Continue and read services requested by the application.
				instance.statusFun && instance.statusFun('Reading services...')
				instance.device.readServices(
					instance.requiredServices,
					instance.activateSensors,
					instance.errorFun)
			}

			// Read device information service.
			instance.device.readServices(
				[sensortag.DEVICEINFO_SERVICE],
				gotDeviceInfoService,
				instance.errorFun)
		}

		/**
		 * Public. Get firmware string.
		 */
		instance.getFirmwareString = function()
		{
			return instance.firmwareString
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
			//sensortag.logServices(instance.device)
			//console.log('---------------------- END -----------------------')

			instance.statusFun && instance.statusFun('Sensors online')
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
				instance.irTemperatureConfig,
				sensortag.IRTEMPERATURE_PERIOD,
				instance.irTemperatureInterval,
				sensortag.IRTEMPERATURE_DATA,
				sensortag.IRTEMPERATURE_NOTIFICATION,
				instance.irTemperatureFun
			)

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
				instance.accelerometerConfig,
				sensortag.ACCELEROMETER_PERIOD,
				instance.accelerometerInterval,
				sensortag.ACCELEROMETER_DATA,
				sensortag.ACCELEROMETER_NOTIFICATION,
				instance.accelerometerFun
			)

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
				instance.humidityConfig,
				null, // Not used.
				null, // Not used.
				sensortag.HUMIDITY_DATA,
				sensortag.HUMIDITY_NOTIFICATION,
				instance.humidityFun
			)

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
				instance.magnetometerConfig,
				sensortag.MAGNETOMETER_PERIOD,
				instance.magnetometerInterval,
				sensortag.MAGNETOMETER_DATA,
				sensortag.MAGNETOMETER_NOTIFICATION,
				instance.magnetometerFun
			)

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
				instance.barometerConfig,
				sensortag.BAROMETER_PERIOD,
				instance.barometerInterval,
				sensortag.BAROMETER_DATA,
				sensortag.BAROMETER_NOTIFICATION,
				instance.barometerFun
			)

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
				instance.gyroscopeConfig,
				sensortag.GYROSCOPE_PERIOD,
				instance.gyroscopeInterval,
				sensortag.GYROSCOPE_DATA,
				sensortag.GYROSCOPE_NOTIFICATION,
				instance.gyroscopeFun
			)

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
				instance.keypressFun
			)

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
				function(data) { notificationFunction(new Uint8Array(data)) },
				instance.errorFun)

			return instance
		}

		/**
		 * Helper function for turning off sensor notification.
		 */
		instance.sensorOff = function(dataUUID)
		{
			// Set sensor configuration to OFF
			configUUID && instance.device.writeCharacteristic(
				configUUID,
				new Uint8Array([0]),
				function() {},
				instance.errorFun)

			dataUUID && instance.device.disableNotification(
				dataUUID,
				function() {},
				instance.errorFun)

			return instance
		}

		/**
		 * Calculate IR temperature values from raw data.
		 * @param data - an Uint8Array.
		 * @return Object with fields: ambientTemperature, targetTemperature.
		 */
		instance.getIRTemperatureValues = function(data)
		{
			// Calculate ambient temperature (Celsius).
			var ac = evothings.util.littleEndianToUint16(data, 2) / 128.0

			// Calculate target temperature (Celsius, based on ambient).
			var Vobj2 = evothings.util.littleEndianToInt16(data, 0) * 0.00000015625
			var Tdie = ac + 273.15
			var S0 =  6.4E-14	// calibration factor
			var a1 =  1.750E-3
			var a2 = -1.678E-5
			var b0 = -2.940E-5
			var b1 = -5.700E-7
			var b2 =  4.630E-9
			var c2 = 13.4
			var Tref = 298.15
			var S = S0 * (1 + a1 * (Tdie - Tref) + a2 * Math.pow((Tdie - Tref), 2))
			var Vos = b0 + b1 * (Tdie - Tref) + b2 * Math.pow((Tdie - Tref), 2)
			var fObj = (Vobj2 - Vos) + c2 * Math.pow((Vobj2 - Vos), 2)
			var tObj = Math.pow(Math.pow(Tdie, 4 ) + (fObj / S), 0.25)
			var tc = tObj - 273.15

			// Return result.
			return { ambientTemperature: ac, targetTemperature: tc }
		}

		/**
		 * Calculate accelerometer values from raw data.
		 * @param data - an Uint8Array.
		 * @return Object with fields: x, y, z.
		 */
		instance.getAccelerometerValues = function(data)
		{
			// Calculate accelerometer values.
			var ax = evothings.util.littleEndianToInt8(data, 0) / 16.0
			var ay = evothings.util.littleEndianToInt8(data, 1) / 16.0
			var az = evothings.util.littleEndianToInt8(data, 2) / 16.0 * -1.0

			// Return result.
			return { x: ax, y: ay, z: az }
		}

		/**
		 * Calculate humidity values from raw data.
		 * @param data - an Uint8Array.
		 * @return Object with fields: humidityTemperature, relativeHumidity.
		 */
		instance.getHumidityValues = function(data)
		{
			// Calculate the humidity temperature (Celsius).
			var tc = -46.85 + 175.72 / 65536.0 * evothings.util.littleEndianToInt16(data, 0)

			// Calculate the relative humidity.
			var h = -6.0 + 125.00 / 65536.0 * (evothings.util.littleEndianToInt16(data, 2) & ~0x03)

			// Return result.
			return { humidityTemperature: tc, relativeHumidity: h }
		}

		/**
		 * Calculate magnetometer values from raw data.
		 * @param data - an Uint8Array.
		 * @return Object with fields: x, y, z.
		 */
		instance.getMagnetometerValues = function(data)
		{
			// Magnetometer values (Micro Tesla).
			var mx = evothings.util.littleEndianToInt16(data, 0) * (2000.0 / 65536.0) * -1
			var my = evothings.util.littleEndianToInt16(data, 2) * (2000.0 / 65536.0) * -1
			var mz = evothings.util.littleEndianToInt16(data, 4) * (2000.0 / 65536.0)

			// Return result.
			return { x: mx, y: my, z: mz }
		}

		/**
		 * Calculate barometer values from raw data.
		 * TODO: Implement (not implemented).
		 */
		instance.getBarometerValues = function(data)
		{
			// Not implemented.
			return {}
		}

		/**
		 * Calculate gyroscope values from raw data.
		 * @param data - an Uint8Array.
		 * @return Object with fields: x, y, z.
		 */
		instance.getGyroscopeValues = function(data)
		{
			// Calculate gyroscope values. NB: x,y,z has a weird order.
			var gy = -evothings.util.littleEndianToInt16(data, 0) * 500.0 / 65536.0
			var gx =  evothings.util.littleEndianToInt16(data, 2) * 500.0 / 65536.0
			var gz =  evothings.util.littleEndianToInt16(data, 4) * 500.0 / 65536.0

			// Return result.
			return { x: gx, y: gy, z: gz }
		}

		instance.celsiusToFahrenheit = function(celsius)
		{
			return (celsius * 9 / 5) + 32
		}

		// Finally, return the SensorTag instance object.
		return instance
	}

	// Return the SensorTag 'class' object.
	return sensortag
})()



