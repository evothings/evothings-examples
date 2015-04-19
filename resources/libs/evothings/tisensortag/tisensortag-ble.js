// Shared functions for BLE TI SensorTags.

;(function()
{
	/**
	 * @namespace
	 * @description JavaScript library for the TI SensorTag.
	 * @alias evothings.tisensortag.ble
	 */
	var sensortag = {}

	// Add object to namespace.
	evothings.tisensortag.ble = sensortag

	/**
	 * @namespace
	 * @description Status constants.
	 * @alias evothings.tisensortag.ble.status
	 */
	sensortag.status = {}
	sensortag.status.SCANNING = 'SCANNING'
	sensortag.status.SENSORTAG_FOUND = 'SENSORTAG_FOUND'
	sensortag.status.SENSORTAG_NOT_FOUND = 'SENSORTAG_NOT_FOUND'
	sensortag.status.CONNECTING = 'CONNECTING'
	sensortag.status.CONNECTED = 'CONNECTED'
	sensortag.status.DEVICE_INFO_AVAILABLE = 'DEVICE_INFO_AVAILABLE'
	sensortag.status.READING_SERVICES = 'READING_SERVICES'
	sensortag.status.SENSORTAG_ONLINE = 'SENSORTAG_ONLINE'

	/**
	 * @namespace
	 * @description Error constants. There are additional
	 * error strings reported by the cordova-ble plugin
	 * and the easyble.js library.
	 * @alias evothings.tisensortag.ble.error
	 */
	sensortag.error = {}
	sensortag.error.SCAN_FAILED = 'SCAN_FAILED'

	/**
	 * Public. Create a SensorTag instance.
	 * @returns {@link evothings.tisensortag.SensorTagInstance}
	 * @public
	 */
	sensortag.addInstanceMethods = function(anInstance)
	{
		/**
		 * @namespace
		 * @alias evothings.tisensortag.SensorTagInstance
		 * @description Variable holding the sensor tag instance object.
		 * This object specifies the interface common to Bluetooth Smart
		 * SensorTags.
		 * @public
		 */
		var instance = anInstance

		// UUIDs for services, characteristics, and descriptors.

		instance.DEVICEINFO_SERVICE = '0000180a-0000-1000-8000-00805f9b34fb'
		instance.FIRMWARE_DATA = '00002a26-0000-1000-8000-00805f9b34fb'
		instance.MODELNUMBER_DATA = '00002a24-0000-1000-8000-00805f9b34fb'

		instance.IRTEMPERATURE_SERVICE = 'f000aa00-0451-4000-b000-000000000000'
		instance.IRTEMPERATURE_DATA = 'f000aa01-0451-4000-b000-000000000000'
		instance.IRTEMPERATURE_CONFIG = 'f000aa02-0451-4000-b000-000000000000'
		// Missing in HW rev. 1.2 (FW rev. 1.5)
		instance.IRTEMPERATURE_PERIOD = 'f000aa03-0451-4000-b000-000000000000'
		instance.IRTEMPERATURE_NOTIFICATION = '00002902-0000-1000-8000-00805f9b34fb'

		instance.HUMIDITY_SERVICE = 'f000aa20-0451-4000-b000-000000000000'
		instance.HUMIDITY_DATA = 'f000aa21-0451-4000-b000-000000000000'
		instance.HUMIDITY_CONFIG = 'f000aa22-0451-4000-b000-000000000000'
		instance.HUMIDITY_PERIOD = 'f000aa23-0451-4000-b000-000000000000'
		instance.HUMIDITY_NOTIFICATION = '00002902-0000-1000-8000-00805f9b34fb'

		instance.BAROMETER_SERVICE = 'f000aa40-0451-4000-b000-000000000000'
		instance.BAROMETER_DATA = 'f000aa41-0451-4000-b000-000000000000'
		instance.BAROMETER_CONFIG = 'f000aa42-0451-4000-b000-000000000000'
		instance.BAROMETER_CALIBRATION = 'f000aa43-0451-4000-b000-000000000000'
		instance.BAROMETER_PERIOD = 'f000aa44-0451-4000-b000-000000000000'
		instance.BAROMETER_NOTIFICATION = '00002902-0000-1000-8000-00805f9b34fb'

		// Only in SensorTag CC2541.
		instance.ACCELEROMETER_SERVICE = 'f000aa10-0451-4000-b000-000000000000'
		instance.ACCELEROMETER_DATA = 'f000aa11-0451-4000-b000-000000000000'
		instance.ACCELEROMETER_CONFIG = 'f000aa12-0451-4000-b000-000000000000'
		instance.ACCELEROMETER_PERIOD = 'f000aa13-0451-4000-b000-000000000000'
		instance.ACCELEROMETER_NOTIFICATION = '00002902-0000-1000-8000-00805f9b34fb'

		// Only in SensorTag CC2541.
		instance.MAGNETOMETER_SERVICE = 'f000aa30-0451-4000-b000-000000000000'
		instance.MAGNETOMETER_DATA = 'f000aa31-0451-4000-b000-000000000000'
		instance.MAGNETOMETER_CONFIG = 'f000aa32-0451-4000-b000-000000000000'
		instance.MAGNETOMETER_PERIOD = 'f000aa33-0451-4000-b000-000000000000'
		instance.MAGNETOMETER_NOTIFICATION = '00002902-0000-1000-8000-00805f9b34fb'

		// Only in SensorTag CC2541.
		instance.GYROSCOPE_SERVICE = 'f000aa50-0451-4000-b000-000000000000'
		instance.GYROSCOPE_DATA = 'f000aa51-0451-4000-b000-000000000000'
		instance.GYROSCOPE_CONFIG = 'f000aa52-0451-4000-b000-000000000000'
		instance.GYROSCOPE_PERIOD = 'f000aa53-0451-4000-b000-000000000000'
		instance.GYROSCOPE_NOTIFICATION = '00002902-0000-1000-8000-00805f9b34fb'

		// Only in SensorTag CC2650.
		instance.LUXOMETER_SERVICE = 'f000aa70-0451-4000-b000-000000000000'
		instance.LUXOMETER_DATA = 'f000aa71-0451-4000-b000-000000000000'
		instance.LUXOMETER_CONFIG = 'f000aa72-0451-4000-b000-000000000000'
		instance.LUXOMETER_PERIOD = 'f000aa73-0451-4000-b000-000000000000'
		instance.LUXOMETER_NOTIFICATION = '00002902-0000-1000-8000-00805f9b34fb'

		// Only in SensorTag CC2650.
		instance.MOVEMENT_SERVICE = 'f000aa80-0451-4000-b000-000000000000'
		instance.MOVEMENT_DATA = 'f000aa81-0451-4000-b000-000000000000'
		instance.MOVEMENT_CONFIG = 'f000aa82-0451-4000-b000-000000000000'
		instance.MOVEMENT_PERIOD = 'f000aa83-0451-4000-b000-000000000000'
		instance.MOVEMENT_NOTIFICATION = '00002902-0000-1000-8000-00805f9b34fb'

		instance.KEYPRESS_SERVICE = '0000ffe0-0000-1000-8000-00805f9b34fb'
		instance.KEYPRESS_DATA = '0000ffe1-0000-1000-8000-00805f9b34fb'
		instance.KEYPRESS_NOTIFICATION = '00002902-0000-1000-8000-00805f9b34fb'

		/**
		 * Internal. Services used by the application.
		 * @instance
		 * @private
		 */
		instance.requiredServices = []

		/**
		 * Both CC2541 and CC2650.
		 * Implementation method.
		 * @private
		 */
		instance.irTemperatureCallback = function(fun, interval)
		{
			instance.irTemperatureFun = fun
			instance.irTemperatureConfig = [1] // on
			instance.irTemperatureInterval = Math.max(300, interval)
			instance.requiredServices.push(instance.IRTEMPERATURE_SERVICE)

			return instance
		}

		/**
		 * Both CC2541 and CC2650.
		 * Public. Set the humidity notification callback.
		 * @param fun - success callback called repeatedly: fun(data)
		 * @param interval - humidity rate in milliseconds.
		 * @instance
		 * @public
		 */
		instance.humidityCallback = function(fun, interval)
		{
			instance.humidityFun = fun
			instance.humidityConfig = [1] // on
			instance.humidityInterval = Math.max(100, interval)
			instance.requiredServices.push(instance.HUMIDITY_SERVICE)

			return instance
		}

		/**
		 * Both CC2541 and CC2650.
		 * Public. Set the barometer notification callback.
		 * @param fun - success callback called repeatedly: fun(data)
		 * @param interval - barometer rate in milliseconds.
		 * @instance
		 * @public
		 */
		instance.barometerCallback = function(fun, interval)
		{
			instance.barometerFun = fun
			instance.barometerConfig = [1] // on
  			instance.barometerInterval = Math.max(100, interval)
			instance.requiredServices.push(instance.BAROMETER_SERVICE)

			return instance
		}

		/**
		 * Both CC2541 and CC2650.
		 * Public. Set the keypress notification callback.
		 * @param fun - success callback called when a key is pressed: fun(data)
		 * @instance
		 * @public
		 */
		instance.keypressCallback = function(fun)
		{
			instance.keypressFun = fun
			instance.requiredServices.push(instance.KEYPRESS_SERVICE)

			return instance
		}

		/**
		 * Determine if a BLE device is a SensorTag.
		 * This version checks the general case using
		 * the advertised name.
		 * Specific versions for CC2541 and CC2650 uses
		 * advertisement data to determine tag type.
		 * @instance
		 * @public
		 */
		instance.deviceIsSensorTag = function(device)
		{
			return (device != null) &&
				(device.name != null) &&
				(device.name.indexOf('Sensor Tag') > -1 ||
					device.name.indexOf('SensorTag') > -1)
		}

		/**
		 * Public. Connect to the nearest physical SensorTag device.
		 * @instance
		 * @public
		 * @deprecated Use evothings.tiseonsortag.ble.connectToNearestDevice
		 */
		instance.connectToClosestDevice = function()
		{
			return instance.connectToNearestDevice()
		}

		/**
		 * Public. Connect to the nearest physical SensorTag device.
		 * For this to work reliably SensorTags should be at least a
		 * couple of meters apart.
		 * @param scanTimeMilliseconds The time to scan for nearby
		 * SensorTags (optional, defaults to 3 seconds).
		 * @instance
		 * @public
		 */
		instance.connectToNearestDevice = function(scanTimeMilliseconds)
		{
			instance.callStatusCallback(sensortag.status.SCANNING)
			instance.disconnectDevice()
			evothings.easyble.stopScan()
			evothings.easyble.reportDeviceOnce(false)

			var nearestDevice = null
			var strongestRSSI = -1000
			var scanTimeoutStarted = false
			var noTagFoundTimer = null

			// Timer that connects to the nearest SensorTag efter the
			// specified timeout.
			function startConnectTimer()
			{
				// Set timeout period.
				scanTimeMilliseconds = (('undefined' == typeof scanTimeMilliseconds)
					? 1000 // Default scan time is 3 seconds
					: scanTimeMilliseconds) // Use user-set value

				// Start timer.
				setTimeout(
					function() {
						if (nearestDevice)
						{
							evothings.easyble.stopScan()
							instance.callStatusCallback(
								sensortag.status.SENSORTAG_FOUND)
							instance.device = nearestDevice
							instance.connectToDevice()
						}
					},
					scanTimeMilliseconds)
			}

			// Timer that times out if no tag at all is found.
			// Period is set to 10 seconds.
			function startNoTagFoundTimer(device)
			{
				// Set scan timeout period.
				var timeOut = 10000

				// Start timer.
				noTagFoundTimer = setTimeout(
					function() {
						if (!nearestDevice)
						{
							evothings.easyble.stopScan()
							instance.callStatusCallback(
								sensortag.status.SENSORTAG_NOT_FOUND)
						}
					},
					timeOut)
			}

			function stopNoTagFoundTimer()
			{
				clearTimeout(noTagFoundTimer)
			}

			// Called when a device is found during scanning.
			function deviceFound(device)
			{
				// Update the device if it is nearest so far
				// and the RRSI value is valid. 127 is an invalid
				// (unknown) RSSI value reported occasionally.
				// deviceIsSensorTag is implemented in CC2541 and
				// CC2650 object code.
				if (device.rssi != 127 && instance.deviceIsSensorTag(device))
				{
					//console.log('deviceFound: ' + device.name)

					if (device.rssi > strongestRSSI)
					{
						// If this is the first SensorTag found,
						// start the timer that makes the connection.
						if (!nearestDevice)
						{
							stopNoTagFoundTimer()
							startConnectTimer()
						}

						nearestDevice = device
						strongestRSSI = device.rssi
					}
				}
			}

			function scanError(errorCode)
			{
				instance.callErrorCallback(sensortag.error.SCAN_FAILED)
			}

			// Start timer that reports if no tag at all was found.
			startNoTagFoundTimer()

			// Start scanning.
			evothings.easyble.startScan(deviceFound, scanError)

			return instance
		}

		/**
		 * Internal.
		 * @instance
		 * @private
		 */
		instance.connectToDevice = function()
		{
			instance.callStatusCallback(sensortag.status.CONNECTING)
			instance.device.connect(
				function(device)
				{
					instance.callStatusCallback(sensortag.status.CONNECTED)
					instance.readDeviceInfo()
				},
				instance.errorFun)
		}

		/**
		 * Internal. When connected we read device info and services.
		 * @instance
		 * @private
		 */
		instance.readDeviceInfo = function()
		{
			function readDeviceInfoService()
			{
				// Read device information service.
				instance.device.readServices(
					[instance.DEVICEINFO_SERVICE],
					gotDeviceInfoService,
					instance.errorFun)
			}

			function gotDeviceInfoService(device)
			{
				readModelNumber()
			}

			function readModelNumber()
			{
				// Read model number.
				instance.device.readCharacteristic(
					instance.MODELNUMBER_DATA,
					gotModelNumber,
					instance.errorFun)
			}

			function gotModelNumber(data)
			{
				// Set model number.
				var modelNumber = evothings.ble.fromUtf8(data)
				if (-1 !== modelNumber.indexOf('ST2'))
				{
					instance.deviceModel = 'CC2650'
				}
				else
				{
					instance.deviceModel = 'CC2541'
				}

				// Next read firmware version.
				readFirmwareVersion()
			}

			function readFirmwareVersion()
			{
				instance.device.readCharacteristic(
					instance.FIRMWARE_DATA,
					gotFirmwareVersion,
					instance.errorFun)
			}

			function gotFirmwareVersion(data)
			{
				// Set firmware string.
				var fw = evothings.ble.fromUtf8(data)
				instance.firmwareString = fw.match(/\d+\.\d+\S?\b/g)[0] || ''

				// Notify that device info is available.
				instance.callStatusCallback(sensortag.status.DEVICE_INFO_AVAILABLE)

				// Read services requested by the application.
				readRequestedServices()
			}

			function readRequestedServices()
			{
				// Notify that status is reading services.
				instance.callStatusCallback(sensortag.status.READING_SERVICES)
				// Read services requested by the application.
				instance.device.readServices(
					instance.requiredServices,
					instance.activateSensors,
					instance.errorFun)
			}

			// Start by reading model number. Then read other
			// data successively.
			readDeviceInfoService()
		}

		/**
		 * Public. Disconnect from the physical device.
		 * @instance
		 * @public
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
		 * @instance
		 * @private
		 */
		instance.activateSensors = function()
		{
			// Debug logging.
			//console.log('-------------------- SERVICES --------------------')
			//sensortag.logServices(instance.device)
			//console.log('---------------------- END -----------------------')

			// Call implementation method in sub module.
			instance.activateSensorsImpl()

			instance.callStatusCallback(sensortag.status.SENSORTAG_ONLINE)
		}

		/**
		 * Both CC2541 and CC2650.
		 * Public. Turn on IR temperature notification.
		 * @instance
		 * @public
		 */
		instance.irTemperatureOn = function()
		{
			instance.sensorOn(
				instance.IRTEMPERATURE_CONFIG,
				instance.irTemperatureConfig,
				instance.IRTEMPERATURE_PERIOD,
				instance.irTemperatureInterval,
				instance.IRTEMPERATURE_DATA,
				instance.IRTEMPERATURE_NOTIFICATION,
				instance.irTemperatureFun
			)

			return instance
		}

		/**
		 * Both CC2541 and CC2650.
		 * Public. Turn off IR temperature notification.
		 * @instance
		 * @public
		 */
		instance.irTemperatureOff = function()
		{
			instance.sensorOff(instance.IRTEMPERATURE_DATA)

			return instance
		}

		/**
		 * Both CC2541 and CC2650.
		 * Public. Turn on humidity notification.
		 * @instance
		 * @public
		 */
		instance.humidityOn = function()
		{
			instance.sensorOn(
				instance.HUMIDITY_CONFIG,
				instance.humidityConfig,
				instance.HUMIDITY_PERIOD,
				instance.humidityInterval,
				instance.HUMIDITY_DATA,
				instance.HUMIDITY_NOTIFICATION,
				instance.humidityFun
			)

			return instance
		}

		/**
		 * Both CC2541 and CC2650.
		 * Public. Turn off humidity notification.
		 * @instance
		 * @public
		 */
		instance.humidityOff = function()
		{
			instance.sensorOff(instance.HUMIDITY_DATA)

			return instance
		}

		/**
		 * Public. Turn on barometer notification.
		 * @instance
		 * @public
		 */
		instance.barometerOn = function()
		{
			// Implemented in sub modules.

			return instance
		}

		/**
		 * Both CC2541 and CC2650.
		 * Public. Turn off barometer notification.
		 * @instance
		 * @public
		 */
		instance.barometerOff = function()
		{
			instance.sensorOff(instance.BAROMETER_DATA)

			return instance
		}

		/**
		 * Both CC2541 and CC2650.
		 * Public. Turn on keypress notification.
		 * @instance
		 * @public
		 */
		instance.keypressOn = function()
		{
			instance.sensorOn(
				null, // Not used.
				null, // Not used.
				null, // Not used.
				null, // Not used.
				instance.KEYPRESS_DATA,
				instance.KEYPRESS_NOTIFICATION,
				instance.keypressFun
			)

			return instance
		}

		/**
		 * Both CC2541 and CC2650.
		 * Public. Turn off keypress notification.
		 * @instance
		 * @public
		 */
		instance.keypressOff = function()
		{
			instance.sensorOff(instance.KEYPRESS_DATA)

			return instance
		}

		/**
		 * Public. Used internally as a helper function for turning on
		 * sensor notification. You can call this function from the
		 * application to enable sensors using custom parameters.
		 * For advanced use.
		 * @instance
		 * @public
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
				new Uint8Array(configValue),
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
		 * @instance
		 * @public
		 */
		instance.sensorOff = function(dataUUID)
		{
			// TODO: Check that sensor notification function is set.

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
		 * Calculate humidity values from raw data.
		 * @param data - an Uint8Array.
		 * @return Object with fields: humidityTemperature, relativeHumidity.
		 * @instance
		 * @public
		 */
		instance.getHumidityValues = function(data)
		{
			// Calculate the humidity temperature (Celsius).
			var tData = evothings.util.littleEndianToInt16(data, 0)
			var tc = -46.85 + 175.72 / 65536.0 * tData

			// Calculate the relative humidity.
			var hData = (evothings.util.littleEndianToInt16(data, 2) & ~0x03)
			var h = -6.0 + 125.00 / 65536.0 * hData

			// Return result.
			return { humidityTemperature: tc, relativeHumidity: h }
		}

		// Finally, return the SensorTag instance object.
		return instance
	}
})()
