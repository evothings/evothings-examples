// File: arduinoble.js

// Load library EasyBLE.
evothings.loadScript('libs/evothings/easyble/easyble.js');

/**
 * @namespace
 * @author Mikael Kindborg
 * @description <p>Functions for communicating with an Arduino BLE shield.</p>
 * <p>It is safe practise to call function {@link evothings.scriptsLoaded}
 * to ensure dependent libraries are loaded before calling functions
 * in this library.</p>
 *
 * @todo This is a very simple library that has only write capability,
 * read and notification functions should be added.
 *
 * @todo Add function to set the write characteristic UUID to make
 * the code more generic.
 */
evothings.arduinoble = {};

;(function()
{
	// Internal functions.
	var internal = {};

	/**
	 * Stop any ongoing scan and disconnect all devices.
	 * @public
	 */
	evothings.arduinoble.close = function()
	{
		evothings.easyble.stopScan();
		evothings.easyble.closeConnectedDevices();
	};

	/**
	 * Called when you've connected to an Arduino BLE shield.
	 * @callback evothings.arduinoble.connectsuccess
	 * @param {evothings.arduinoble.ArduinoBLEDevice} device -
	 * The connected BLE shield.
	 */

	/**
	 * Connect to a BLE-shield.
	 * @param deviceName BLE name if the shield.
	 * @param {evothings.arduinoble.connectsuccess} success -
	 * Success callback: success(device)
	 * @param {function} fail - Error callback: fail(errorCode)
	 * @example
	 * evothings.arduinoble.connect(
	 *   'arduinoble', // Name of BLE shield.
	 *   function(device)
	 *   {
	 *     console.log('connected!');
	 *     device.writeDataArray(new Uint8Array([1]));
	 *     evothings.arduinoble.close();
	 *   },
	 *   function(errorCode)
	 *   {
	 *     console.log('Error: ' + errorCode);
	 *   });
	 * @public
	 */
	evothings.arduinoble.connect = function(deviceName, success, fail)
	{
		evothings.easyble.startScan(
			function(device)
			{
				if (device.name == deviceName)
				{
					evothings.easyble.stopScan();
					internal.connectToDevice(device, success, fail);
				}
			},
			function(errorCode)
			{
				fail(errorCode);
			});
	};

	/**
	 * Connect to the BLE shield.
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
		 * Object that holds info about an Arduino BLE shield.
		 * @namespace evothings.arduinoble.ArduinoBLEDevice
		 */

		/**
		 * @function writeDataArray
		 * @description Write data to an Arduino BLE shield.
		 * @param {Uint8Array} uint8array - The data to be written.
		 * @memberof evothings.arduinoble.ArduinoBLEDevice
		 * @instance
		 * @public
		 */
		device.writeDataArray = function(uint8array)
		{
			device.writeCharacteristic(
				// TODO: Make this possible to set.
				'713d0003-503e-4c75-ba94-3148f18d941e',
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
