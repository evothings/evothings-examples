// File: iotsensor-ble.js

// Shared functions for BLE IoT Sensor
;(function()
{
	"use strict"; 

	/**
	 * @namespace
	 * @description JavaScript library for the Dialog IoT Sensor. <br />
	 * Shared functions are added for the BLE IoT Sensor (RAW and SFL). <br />
	 * See {@link evothings.iotsensor.instance} and {@link evothings.iotsensor.instance_ble} after creating a new instance
	 * @alias evothings.iotsensor.ble
	 * @public
	 */
	var iotsensor = {};

	// Add object to namespace
	evothings.iotsensor.ble = iotsensor;

	/**
	 * @namespace
	 * @description Status constants.
	 * @alias evothings.iotsensor.ble.status
	 * @public
	 */
	var status = {};

	// Add to namespace. This trick is needed for JSDoc,
	// cannot use iotsensor.status below, docs do not
	// generate properly in this case
	iotsensor.status = status;

	/**
	 * @description Scanning is ongoing.
	 * @public
	 */
	status.SCANNING = 'SCANNING';
	
	/**
	 * @description Scanning is ongoing.
	 * @public
	 */
	status.STOPPED_SCANNING = 'STOPPED_SCANNING';

	/**
	 * @description Found IoT Sensor device.
	 * @public
	 */
	status.IOTSENSOR_FOUND = 'IOTSENSOR_FOUND';

	/**
	 * @description Connecting to physical device.
	 * @public
	 */
	status.CONNECTING = 'CONNECTING';

	/**
	 * @description Connected to physical device.
	 * @public
	 */
	status.CONNECTED = 'CONNECTED';

	/**
	 * @description Reading info about the device.
	 * @public
	 */
	status.READING_DEVICE_INFO = 'READING_DEVICE_INFO';

	/**
	 * @description Info about the device is available.
	 * @public
	 */
	status.DEVICE_INFO_AVAILABLE = 'DEVICE_INFO_AVAILABLE';

	/**
	 * @description Reading services of the device.
	 * @public
	 */
	status.READING_SERVICES = 'READING_SERVICES';

	/**
	 * @description IoT Sensor device is connected and sensors are avaliable.
	 * @public
	 */
	status.IOTSENSOR_ONLINE = 'IOTSENSOR_ONLINE';

	/**
	 * @namespace
	 * @description Error constants. There are additional
	 * error strings reported by the cordova-ble plugin
	 * and the easyble.js library.
	 * @alias evothings.iotsensor.ble.error
	 * @public
	 */
	var error = {};

	// Add to namespace. This trick is needed for JSDoc,
	// cannot use iotsensor.error below, docs do not
	// generate properly in this case
	iotsensor.error = error;

	/**
	 * @description Scan failed.
	 * @public
	 */
	error.SCAN_FAILED = 'SCAN_FAILED';

	/**
	 * @description Connection lost
	 * @public
	 */
	error.CONNECTION_LOST = 'CONNECTION_LOST';

	/**
	 * @description Scanning timed out, no device found.
	 * @public
	 */
	error.IOTSENSOR_NOT_FOUND = 'IOTSENSOR_NOT_FOUND';

	/**
	 * Create an IoTSensor instance.
	 * @returns {@link evothings.iotsensor.instance_ble}
	 * @private
	 */
	iotsensor.addInstanceMethods = function(anInstance)
	{
		/**
		 * @namespace
		 * @alias evothings.iotsensor.instance_ble
		 * @description Abstract IoT Sensor instance object.
		 * This object specifies the interface common to BLE IoT Sensors
		 * @public
		 */
		var instance = anInstance;

		// UUIDs for services, characteristics and descriptors
		instance.NOTIFICATION_DESCRIPTOR = '00002902-0000-1000-8000-00805f9b34fb';

		instance.CONTROL_POINT = '2ea78970-7d44-44bb-b097-26183f402409'; // WR Control Point
		instance.CONTROL_REPLY = '2ea78970-7d44-44bb-b097-26183f40240A'; // NTFCommand Reply
		instance.DEVICE_INFO_SERVICE = '2ea78970-7d44-44bb-b097-26183f402400'; 	// RD Service Attribute (wrbl_dws_svc)
		instance.FEATURES_DATA = '2ea78970-7d44-44bb-b097-26183f402408'; // RD Device Features (wrbl_dws_feat_char)

		instance.ACCELEROMETER = {
			SERVICE: '2ea78970-7d44-44bb-b097-26183f402400',
			DATA: '2ea78970-7d44-44bb-b097-26183f402401',
			AVAILABLE: 0
		};

		instance.GYROSCOPE = {
			SERVICE: '2ea78970-7d44-44bb-b097-26183f402400',
			DATA: '2ea78970-7d44-44bb-b097-26183f402402',
			AVAILABLE: 0
		};

		instance.MAGNETOMETER = {
			SERVICE: '2ea78970-7d44-44bb-b097-26183f402400',
			DATA: '2ea78970-7d44-44bb-b097-26183f402403',
			AVAILABLE: 0
		};

		instance.BAROMETER = {
			SERVICE: '2ea78970-7d44-44bb-b097-26183f402400',
			DATA: '2ea78970-7d44-44bb-b097-26183f402404',
			AVAILABLE: 0
		};

		instance.HUMIDITY = {
			SERVICE: '2ea78970-7d44-44bb-b097-26183f402400',
			DATA: '2ea78970-7d44-44bb-b097-26183f402405',
			AVAILABLE: 0
		}

		instance.TEMPERATURE = {
			SERVICE: '2ea78970-7d44-44bb-b097-26183f402400',
			DATA: '2ea78970-7d44-44bb-b097-26183f402406',
			AVAILABLE: 0
		};

		// Only in IoT Sensor SFL
		instance.SFL = {
			SERVICE: '2ea78970-7d44-44bb-b097-26183f402400',
			DATA: '2ea78970-7d44-44bb-b097-26183f402407',
			AVAILABLE: 0
		};

		/**
		 * @description Implementation of {@link evothings.iotsensor.instance#accelerometerCallback}
		 * @instance
		 * @private
		 */
		instance.accelerometerCallback = function(callbackFun)
		{
			instance.accelerometerFun = callbackFun;
			instance.ACCELEROMETER.dataFun = getAccelerometerValues;
			return instance;
		}

		/**
		 * @description Implementation of {@link evothings.iotsensor.instance#gyroscopeCallback}
		 * @instance
		 * @private
		 */
		instance.gyroscopeCallback = function(callbackFun)
		{
			instance.gyroscopeFun = callbackFun;
			instance.GYROSCOPE.dataFun = getGyroscopeValues;
			return instance;
		}

		/**
		 * @description Implementation of {@link evothings.iotsensor.instance#magnetometerCallback}
		 * @instance
		 * @private
		 */
		instance.magnetometerCallback = function(callbackFun)
		{
			instance.magnetometerFun = callbackFun;
			instance.MAGNETOMETER.dataFun = getMagnetometerValues;
			return instance;
		}

		/**
		 * @description Implementation of {@link evothings.iotsensor.instance#barometerCallback}
		 * @instance
		 * @private
		 */
		instance.barometerCallback = function(callbackFun)
		{
			instance.barometerFun = callbackFun;
			instance.BAROMETER.dataFun = getBarometerValue;
			return instance;
		}

		/**
		 * @description Implementation of {@link evothings.iotsensor.instance#temperatureCallback}
		 * @instance
		 * @private
		 */
		instance.temperatureCallback = function(callbackFun)
		{
			instance.temperatureFun = callbackFun;
			instance.TEMPERATURE.dataFun = getTemperatureValue;
			return instance;
		}

		/**
		 * @description Implementation of {@link evothings.iotsensor.instance#humidityCallback}
		 * @instance
		 * @private
		 */
		instance.humidityCallback = function(callbackFun)
		{
			instance.humidityFun = callbackFun;
			instance.HUMIDITY.dataFun = getHumidityValue;
			return instance;
		}

		/**
		 * @description Determine if a BLE device is a IoT Sensor. <br />
		 * Checks the general case using the advertised name. <br />
		 * Specific implementation is added for SFL and RAW.
		 * @param {evothings.easyble.EasyBLEDevice} - easyble device object
		 * @returns {boolean} 
		 * @instance
		 * @example
		 * if(iotsensor.isIoTSensor(device))
		 * {
		 * 	// connect to device
		 * }
		 * @public
		 */
		instance.isIoTSensor = function(device)
		{
			return (device != null) &&
				(device.name != null) &&
				(device.name.indexOf('IoT-DK') > -1);
		}	

		/**
		 * @description Connect to nearest IoT Sensor device.
		 * @param {integer} scanTime Time (in ms) to scan for nearby IoT Sensors
		 * (optional, default 2 seconds)
		 * @param {function} callbackFun - Callback called when connected and device is initalized
		 * @param {function} disconnectFun - Callback called when connection is lost (optional)
		 * @instance
		 * @example
		 * iotsensor.connectToClosestSensor(
		 * 	3000, // Scan for 3000 ms
		 * 	function()
		 * 	{
		 * 		// Connected and device is ready
		 * 	},
		 * 	function(error)
		 * 	{
		 * 		console.log('Disconnect error ' + error);
		 * 	}
		 * );
		 * @public
		 */
		instance.connectToClosestSensor = function(scanTime, callbackFun, disconnectFun)
		{
			instance.callStatusCallback(iotsensor.status.SCANNING);
			instance.disconnectDevice(); // Make sure we are not connected to any device yet
			evothings.easyble.stopScan(); // Make sure we are not scanning for devices yet
			evothings.easyble.reportDeviceOnce(false); // Report found devices continuously

			var devices = {}; // Object that holds all found devices in time period
			var noSensorFoundTimer = null; // Timer object used to stop scanning after certain period

			function deviceFound(device)
			{
				// Only log IoT Sensors
				if(instance.isIoTSensor(device))
				{
					// If this is the first IoT Sensor found
					// start connect timer
					if(Object.keys(devices).length === 0)
					{
						clearTimeout(noSensorFoundTimer);
						startConnectTimer();
					}

					devices[device.address] = device;
					devices = getSortedBluetoothList(devices);
				}
			}

			// Timer that connects to nearest IoT Sensor after timeout
			function startConnectTimer()
			{
				var timeOut = 2000; // Scan timeout period (ms)
				
				// Start timer
				setTimeout(
					function() 
					{
						// If we have at least one device we connect to the closest one
						if(Object.keys(devices).length !== 0)
						{
							evothings.easyble.stopScan();
							instance.callStatusCallback(iotsensor.status.IOTSENSOR_FOUND);
							instance.connectToDevice(devices[0], callbackFun, disconnectFun); // Connect to closest device
						}
					},
					timeOut
				);
			}

			// Timer that automatically stops scanning after
			// timeout period (default: 10s)
			function startNoSensorFoundTimer()
			{

				// Set timeout period, check if scanTime is defined
				scanTime = ((typeof scanTime == 'undefined') ? 2000 : scanTime);

				// Start timer
				noSensorFoundTimer = setTimeout(
					function()
					{
						// No devices found after timeout period, stop scanning
						if(Object.keys(devices).length === 0)
						{
							instance.callErrorCallback(iotsensor.error.IOTSENSOR_NOT_FOUND);
							instance.stopScanningForDevices();
						}
					},
					scanTime
				);
			}

			// Sort devices by RSSI
			function getSortedBluetoothList(devices)
			{
				var list = [];
				for (var key in devices)
				{	
					list.push(devices[key]);
				}

				list.sort(function(device1, device2)
				{
					return mapBluetoothRSSI(device1.rssi) < mapBluetoothRSSI(device2.rssi);
				});
				return list;
			}

			// Map the RSSI value to a value between 1 and 100.
			function mapBluetoothRSSI(rssi)
			{
				if (rssi >= 0) return 1; // Unknown RSSI maps to 1.
				if (rssi < -100) return 100; // Max RSSI
				return 100 + rssi;
			};

			// Start timer that stops scanning of no sensor is found after timeout
			startNoSensorFoundTimer();

			// Start scanning, call deviceFound(device) if device is found
			evothings.easyble.startScan(
				deviceFound,
				function(error)
				{
					instance.callErrorCallback(iotsensor.error.SCAN_FAILED + ' (' + error + ')');
				}
			);

		}

		/**
		 * @description Start a manual scan for physical devices. <br />
		 * This process can be automated by using {@link evothings.iotsensor.instance_ble#connectToClosestSensor|connectToClosestSensor(scanTime, callbackFun, disconnectFun)} <br />
		 * The device ({@link https://evothings.com/doc/lib-doc/evothings.easyble.EasyBLEDevice.html|evothings.easyble.EasyBLEDevice}) that is found is passed to 
		 * callbackFun and can be used to inspect device fields to determine properties such as RSSI, name etc. <br /> 
		 * You can call {@link evothings.iotsensor.instance_ble#isIoTSensor|isIoTSensor(device)} to determine if this is an IoT sensor.
		 * To connect, call {@link evothings.iotsensor.instance_ble#connectToDevice|connectToDevice(device, callbackFun, disconnectFun)}.
		 * @param {function} callbackFun - Callback called with found device: callbackFun(device).
		 * @instance
		 * @example
		 * iotsensor.startScanningForDevices(
		 * 	function(device)
		 * 	{
		 * 		console.log('Device found: ' + device.name + ' RSSI: ' + device.rssi);
		 * 		if(iotsensor.isIoTSensor(device))
		 * 		{
		 * 			// We have an IoT Sensor, let's connect!
		 *			iotsensor.connectToDevice(
		 * 				device,
		 * 				function()
		 * 				{
		 * 					// Connected and device is ready
		 * 				},
		 * 				function(error)
		 * 				{
		 * 					console.log('Disconnect error ' + error);
		 * 				}
		 * 			);
		 * 		}
		 * 	}
		 * );
		 * @public
		 */
		instance.startScanningForDevices = function(callbackFun)
		{
			instance.callStatusCallback(iotsensor.status.SCANNING);
			instance.disconnectDevice();
			evothings.easyble.stopScan();
			evothings.easyble.reportDeviceOnce(false);

			function deviceFound(device)
			{
				// RSSI of 127 is invalid and will be ignored
				if(device.rssi != 127)
				{
					callbackFun(device);
				}
			}

			// Start scanning
			evothings.easyble.startScan(
				deviceFound,
				function(error)
				{
					instance.callErrorCallback(iotsensor.error.SCAN_FAILED + ' (' + error + ')');
				}
			);

			return instance;
		}

		/**
		 * @description Stop scanning for physical devices and call {@link evothings.iotsensor.instance#statusCallback|statusCallback} with {@link evothings.iotsensor.ble.status|STOPPED_SCANNING} message.
		 * @instance
		 * @example
		 * iotsensor.stopScanningForDevices();
		 * @public
		 */
		instance.stopScanningForDevices = function()
		{
			instance.callStatusCallback(iotsensor.status.STOPPED_SCANNING);
			evothings.easyble.stopScan();
			return instance;
		}

		/**
		 * @description Connect to an IoT Sensor device
		 * @param {evothings.easyble.EasyBLEDevice} device - A evothings.easyble.device object
		 * @param {function} callbackFun - Callback called when connected and device is initialized
		 * @param {function} disconnectFun - Callback called when connection is lost (optional)
		 * @instance
		 * @example
		 * iotsensor.connectToDevice(
		 * 	device,
		 * 	function()
		 * 	{
		 * 		// Connected and device is ready
		 * 	},
		 * 	function(error)
		 * 	{
		 * 		console.log('Disconnect error ' + error);
		 * 	}
		 * );
		 * @public
		 */
		instance.connectToDevice = function(device, callbackFun, disconnectFun)
		{
			instance.device = device; // Store device for future use
			instance.callStatusCallback(iotsensor.status.CONNECTING);
			instance.device.connect(
				function(success)
				{
					// Connected
					instance.callStatusCallback(iotsensor.status.CONNECTED);
					readDeviceInfo(callbackFun); 
				},
				function(error)
				{
					// Disconnected
					// Call disconnectFun if set, else call default error handler
					if(disconnectFun)
					{
						disconnectFun(error);
					}
					else 
					{
						instance.callErrorCallback(iotsensor.error.CONNECTION_LOST + ' (' + error + ')');
					}
				}
			);
		}

		/**
		 * Disconnect from the connect device
		 * @instance
		 * @example
		 * iotsensor.disconnectDevice();
		 * @public
		 */
		instance.disconnectDevice = function()
		{
			if(instance.device)
			{
				instance.device.close(); // Close Bluetooth connection
				// instance.device = null;  // Remove device
			}
			return instance;
		}

		/**
		 * @description Once connected we read device info and services
		 * @param callbackFun - Callback called when device is connected
		 * @instance
		 * @private
		 */
		function readDeviceInfo(callbackFun)
		{
			function readDeviceInfoService()
			{
				instance.callStatusCallback(iotsensor.status.READING_DEVICE_INFO);

				// Read device information service
				instance.device.readServices(
					[instance.DEVICE_INFO_SERVICE],
					gotDeviceInfoService,
					instance.errorFun);
			}

			function gotDeviceInfoService(device)
			{
				// Finished reading/storing all services
				// initialize device here
				readFeatures();

				enableCommandReply();
			}

			function readFeatures()
			{
				// read available sensors and get firmware version
				instance.device.readServiceCharacteristic(
					instance.DEVICE_INFO_SERVICE,
					instance.FEATURES_DATA,
					gotDeviceInfo,
					instance.errorFun
				);
			}

			function enableCommandReply()
			{
				// Enable notifications for CONTROL_REPLY (wrbl_dws_control_reply_char)
				instance.device.writeServiceDescriptor(
					instance.DEVICE_INFO_SERVICE,
					instance.CONTROL_REPLY,
					instance.NOTIFICATION_DESCRIPTOR,
					new Uint8Array([1, 0]),
					function() {},
					instance.errorFun
				);

				// Start notifications for CONTROL_REPLY (wrbl_dws_control_reply_char)
				instance.device.enableServiceNotification(
					instance.DEVICE_INFO_SERVICE,
					instance.CONTROL_REPLY,
					function(data) 
					{ 
						// var arr = new Uint8Array(data) returns an object
						// in Safari instead of an Array.
						instance.handleCommandReply([].slice.call(new Uint8Array(data))); 
					},
					instance.errorFun
				);
			}

			function gotDeviceInfo(data)
			{	
				// var arr = new Uint8Array(data) returns an object
				// in Safari instead of an Array.
				var arr = [].slice.call(new Uint8Array(data));

				// Collect available sensors (1: available, 0: unavailable)
				// Byte 0 to 6 return sensor capabilities
				instance.ACCELEROMETER.AVAILABLE 	= arr[0];
				instance.GYROSCOPE.AVAILABLE 		= arr[1];
				instance.MAGNETOMETER.AVAILABLE 	= arr[2];
				instance.BAROMETER.AVAILABLE 		= arr[3];
				instance.TEMPERATURE.AVAILABLE 		= arr[4];
				instance.HUMIDITY.AVAILABLE 		= arr[5];
				instance.SFL.AVAILABLE 				= arr[6];

				// If sensor fusion is available it is safe to assume accelero/gyro/magnetometer are also available
				if(arr[6] === 1)
				{
					instance.ACCELEROMETER.AVAILABLE 	= 1;
					instance.GYROSCOPE.AVAILABLE 		= 1;
					instance.MAGNETOMETER.AVAILABLE 	= 1;
				}

				// Store firmware version
				// Offset 7 to 22 contain the firmware version in ASCII
				instance.firmwareString = String.fromCharCode.apply(null, arr.slice(7, 22)); 
				
				callbackFun(); // Call this function when device is all ready
			}

			readDeviceInfoService();
		}

		/**
		 * @description RAW and SFL. Implementation of {@link evothings.iotsensor.instance#accelerometerOn}
		 * @instance
		 * @private
		 */
		instance.accelerometerOn = function()
		{
			instance.sensorOn(
				instance.ACCELEROMETER,
				instance.accelerometerFun
			);
			return instance;
		}	

		/**
		 * @description RAW and SFL. Implementation of {@link evothings.iotsensor.instance#accelerometerOff}
		 * @instance
		 * @private
		 */
		instance.accelerometerOff = function()
		{
			instance.sensorOff(instance.ACCELEROMETER);
			return instance;
		}

		/**
		 * @description RAW and SFL. Implementation of {@link evothings.iotsensor.instance#gyroscopeOn}
		 * @instance
		 * @private
		 */
		instance.gyroscopeOn = function()
		{
			instance.sensorOn(
				instance.GYROSCOPE,
				instance.gyroscopeFun
			);
			return instance;
		}	

		/**
		 * @description RAW and SFL. Implementation of {@link evothings.iotsensor.instance#gyroscopeOff}
		 * @instance
		 * @private
		 */
		instance.gyroscopeOff = function()
		{
			instance.sensorOff(instance.GYROSCOPE);
			return instance;
		}

		/**
		 * @description RAW and SFL. Implementation of {@link evothings.iotsensor.instance#magnetometerOn}
		 * @instance
		 * @private
		 */
		instance.magnetometerOn = function()
		{
			instance.sensorOn(
				instance.MAGNETOMETER,
				instance.magnetometerFun
			);
			return instance;
		}	

		/**
		 * @description RAW and SFL. Implementation of {@link evothings.iotsensor.instance#magnetometerOff}
		 * @instance
		 * @private
		 */
		instance.magnetometerOff = function()
		{
			instance.sensorOff(instance.MAGNETOMETER);
			return instance;
		}

		/**
		 * @description RAW and SFL. Implementation of {@link evothings.iotsensor.instance#barometerOn}
		 * @instance
		 * @private
		 */
		instance.barometerOn = function()
		{
			instance.sensorOn(
				instance.BAROMETER,
				instance.barometerFun
			);
			return instance;
		}	

		/**
		 * @description RAW and SFL. Implementation of {@link evothings.iotsensor.instance#barometerOff}
		 * @instance
		 * @private
		 */
		instance.barometerOff = function()
		{
			instance.sensorOff(instance.BAROMETER);
			return instance;
		}

		/**
		 * @description RAW and SFL. Implementation of {@link evothings.iotsensor.instance#temperatureOn}
		 * @instance
		 * @private
		 */
		instance.temperatureOn = function()
		{
			instance.sensorOn(
				instance.TEMPERATURE,
				instance.temperatureFun
			);
			return instance;
		}	

		/**
		 * @description RAW and SFL. Implementation of {@link evothings.iotsensor.instance#temperatureOff}
		 * @instance
		 * @private
		 */
		instance.temperatureOff = function()
		{
			instance.sensorOff(instance.TEMPERATURE);
			return instance;
		}

		/**
		 * @description RAW and SFL. Implementation of {@link evothings.iotsensor.instance#humidityOn}
		 * @instance
		 * @private
		 */
		instance.humidityOn = function()
		{
			instance.sensorOn(
				instance.HUMIDITY,
				instance.humidityFun
			);
			return instance;
		}	

		/**
		 * @description RAW and SFL. Implementation of {@link evothings.iotsensor.instance#humidityOff}
		 * @instance
		 * @private
		 */
		instance.humidityOff = function()
		{
			instance.sensorOff(instance.HUMIDITY);
			return instance;
		}

		/**
		 * @description RAW and SFL. Implementation of {@link evothings.iotsensor.instance#disableAllSensors}
		 * @instance
		 * @example
		 * iotsensor.disableAllSensors();
		 * @public
		 */
		 instance.disableAllSensors = function()
		 {
		 	// Write 0x00 to CONTROL_POINT
			instance.device.writeServiceCharacteristic(
				instance.DEVICE_INFO_SERVICE,
				instance.CONTROL_POINT,
				new Uint8Array([0,0]),
				function() {},
				instance.errorFun
			);
		 }

		/**
		 * @description Internal. Used internally as a helper function to turn on 
		 * sensor notifications. 
		 * @instance
		 * @private
		 */
		instance.sensorOn = function(service, callbackFun)
		{
			// Only enable sensor if callback function is set
			if(!callbackFun)
			{
				return;
			}

			// Before starting notifications we must first write
			// 0x01 to CONTROL_POINT
			instance.device.writeServiceCharacteristic(
				instance.DEVICE_INFO_SERVICE,
				instance.CONTROL_POINT,
				new Uint8Array([1,0]),
				function() {},
				instance.errorFun
			);

			// Enable sensor notification
			service.DATA && instance.device.writeServiceDescriptor(
				service.SERVICE,
				service.DATA,
				instance.NOTIFICATION_DESCRIPTOR,
				new Uint8Array([1, 0]),
				function() {},
				instance.errorFun
			);

			// Start sensor notification
			service.DATA && instance.device.enableServiceNotification(
				service.SERVICE,
				service.DATA,
				function(data) { 
					// var arr = new Uint8Array(data) returns an object
					// in Safari instead of an Array.
					var values = service.dataFun([].slice.call(new Uint8Array(data)));
					callbackFun(values);
				},
				instance.errorFun
			);
		}

		/**
		 * @description Internal. Helper function to turn off sensor notifications
		 * @instance
		 * @private
		 */
		instance.sensorOff = function(service)
		{
			// Do not write 0x00 to CONTROL_POINT. This will disable all other sensors as well.

			// Disable sensor notification
			service.DATA && instance.device.writeServiceDescriptor(
				service.SERVICE,
				service.DATA,
				instance.NOTIFICATION_DESCRIPTOR,
				new Uint8Array([0, 0]),
				function() { },
				instance.errorFun
			);

			// Start sensor notification
			service.DATA && instance.device.disableServiceNotification(
				service.SERVICE,
				service.DATA,
				function() { },
				instance.errorFun
			);
		}

		/**
		 * @description Internal. Helper function to write data to control point
		 * @param control - instance.controls.COMMAND object
		 * @instance
		 * @private
		 */
		instance.controlPoint = function(control)
		{
			instance.device.writeServiceCharacteristic(
				instance.DEVICE_INFO_SERVICE,
				instance.CONTROL_POINT,
				control.DATA,
				function() {},
				instance.errorFun
			);
		}

		/**
	  	 * @description RAW and SFL.
		 * Private. Calculate accelerometer values from raw data
		 * @param data - Uint8Array in g.
		 * @return Object with fields: x, y, z.
		 * @instance
		 * @private
		 */
		function getAccelerometerValues(data)
		{
			var sensitvity = 1;
			switch(instance.configuration.BASIC.ACCELEROMETER_RANGE)
			{
				case instance.enums.ACCELEROMETER_RANGE._2:
					sensitvity = 16384;
					break;
				case instance.enums.ACCELEROMETER_RANGE._4:
					sensitvity = 8192;
					break;
				case instance.enums.ACCELEROMETER_RANGE._8:
					sensitvity = 4096;
					break;
				case instance.enums.ACCELEROMETER_RANGE._16:
					sensitvity = 2048;
					break;
				default:
					// Do nothing
					break;
			}

			// Calculate accelerometer values.
			var ax = (evothings.util.littleEndianToInt16(data, 3) / sensitvity).toFixed(2);
			var ay = (evothings.util.littleEndianToInt16(data, 5) / sensitvity).toFixed(2);
			var az = (evothings.util.littleEndianToInt16(data, 7) / sensitvity).toFixed(2);

			return { x: ax, y: ay, z: az }
		}

		/**
	  	 * @description RAW and SFL.
		 * Private. Calculate gyroscope values from raw data
		 * @param data - Uint8Array in deg/s.
		 * @return Object with fields: x, y, z.
		 * @instance
		 * @private
		 */
		function getGyroscopeValues(data)
		{	
			var sensitvity = 1;
			switch(instance.configuration.BASIC.GYROSCOPE_RANGE)
			{
				case instance.enums.GYROSCOPE_RANGE._2000:
					sensitvity = 16.4;
					break;
				case instance.enums.GYROSCOPE_RANGE._1000:
					sensitvity = 32.8;
					break;
				case instance.enums.GYROSCOPE_RANGE._500d:
					sensitvity = 65.6;
					break;
				case instance.enums.GYROSCOPE_RANGE._250:
					sensitvity = 131.2;
					break;
				case instance.enums.GYROSCOPE_RANGE._125:
					sensitvity = 262.4;
					break;
				default:
					// Do nothing
					break;
			}

			// Calculate gyroscope values.
			var ax = (evothings.util.littleEndianToInt16(data, 3) / sensitvity).toFixed(2);
			var ay = (evothings.util.littleEndianToInt16(data, 5) / sensitvity).toFixed(2);
			var az = (evothings.util.littleEndianToInt16(data, 7) / sensitvity).toFixed(2);

			return { x: ax, y: ay, z: az }
		}

		/**
	  	 * @description RAW and SFL.
		 * Private. Calculate magnetometer values from raw data
		 * @param data - Uint8Array - in micro Tesla.
		 * @return Object with fields: x, y, z.
		 * @instance
		 * @private
		 */
		function getMagnetometerValues(data)
		{
			// Calculate magnetometer values.
			var ax = evothings.util.littleEndianToInt16(data, 3);
			var ay = evothings.util.littleEndianToInt16(data, 5);
			var az = evothings.util.littleEndianToInt16(data, 7);

			return { x: ax, y: ay, z: az }
		}

		/**
	  	 * @description RAW and SFL.
		 * Private. Calculate barometer value from raw data
		 * @param data - Uint8Array.
		 * @return pressure - in hectopascal
		 * @instance
		 * @public
		 */
		function getBarometerValue(data)
		{
			// Calculate pressure value.
			var pressure = (evothings.util.littleEndianToUint32(data, 3) * (1/100)).toFixed(0);

			return pressure;
		}

		/**
		 * @description RAW and SFL.
		 * Private. Calculate humidity value from raw data
		 * @param data - Uint8Array.
		 * @return humidity - in %
		 * @instance
		 * @private
		 */
		function getHumidityValue(data)
		{
			// Calculate humidity value
			var humidity = (evothings.util.littleEndianToUint32(data, 3) * (1/1024)).toFixed(0);

			return humidity;
		}

		/**
		 * @description RAW and SFL.
		 * Private. Calculate temperature value from raw data
		 * @param data - Uint8Array.
		 * @return temperature - in degrees Celcius
		 * @instance
		 * @private
		 */
		function getTemperatureValue(data)
		{
			// Calculate temperature value
			var temperature = (evothings.util.littleEndianToUint32(data, 3) * 0.01).toFixed(2);

			return temperature;
		}

		// Finally, return the IoT Sensor instance object.
		return instance;
	}

})();