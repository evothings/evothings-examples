// File: rfduinoble.js

// Load dependent library EasyBLE.
evothings.loadScript('libs/evothings/easyble/easyble.js')

/**
 * @namespace
 * @author Patrik D.
 * @description <p>Functions for communicating with an RFduino board.</p>
 * <p>It is safe practise to call function {@link evothings.scriptsLoaded}
 * to ensure dependent libraries are loaded before calling functions
 * in this library.</p>
 */
evothings.rfduinoble = {};

;(function()
{
	// Internal functions.
	var internal = {};

	/**
	 * Stops any ongoing scan and disconnects any connected devices.
	 * @public
	 */
	evothings.rfduinoble.close = function()
	{
		evothings.easyble.stopScan();
		evothings.easyble.closeConnectedDevices();
	};

	/**
	 * Called when you have connected to the board.
	 * @callback evothings.rfduinoble.connectsuccess
	 * @param {evothings.rfduinoble.RFduinoBLEDevice} device -
	 * The connected BLE shield.
	 */

	/**
	 * Connect to an RFduino board.
	 * @param {evothings.rfduinoble.connectsuccess} success -
	 * Success callback: success(device)
	 * @param {function} fail - Error callback: fail(errorCode)
	 * @public
	 */
	evothings.rfduinoble.connect = function(deviceName, success, fail)
	{
		evothings.easyble.startScan(
			function(device)
			{
				console.log('found device: ' + device.name);
				if (device.name == deviceName)
				{
					evothings.easyble.stopScan();
					console.log('connectToDevice');
					internal.connectToDevice(device, success, fail);
				}
			},
			function(errorCode)
			{
				fail(errorCode);
			});
	};

	/**
	 * Connect to the device.
	 * @private
	 */
	internal.connectToDevice = function(device, success, fail)
	{
		device.connect(
			function(device)
			{
				// Get services info.
				internal.getServices(device, success, fail);
			},
			function(errorCode)
			{
				fail(errorCode);
			});
	};

	/**
	 * Read all services from the device.
	 * @private
	 */
	internal.getServices = function(device, success, fail)
	{
		device.readServices(
			null, // null means read info for all services
			function(device)
			{
				internal.addMethodsToDeviceObject(device);
				success(device);
			},
			function(errorCode)
			{
				fail(errorCode);
			});
	};

	/**
	 * Add instance methods to the device object.
	 * @private
	 */
	internal.addMethodsToDeviceObject = function(device)
	{
		/**
		 * Object that holds info about an RFduino device.
		 * @namespace evothings.rfduinoble.RFduinoBLEDevice
		 */

		/**
		 * @function writeDataArray
		 * @description Write data to an RFduino.
		 * @param {Uint8Array} uint8array - The data to be written.
		 * @memberof evothings.rfduinoble.RFduinoBLEDevice
		 * @instance
		 * @public
		 */
		device.writeDataArray = function(uint8array)
		{
			device.writeCharacteristic(
				'00002222-0000-1000-8000-00805f9b34fb',
				uint8array,
				function()
				{
					console.log('writeCharacteristic success');
				},
				function(errorCode)
				{
					console.log('writeCharacteristic error: ' + errorCode);
				});
		};
	};
})();
