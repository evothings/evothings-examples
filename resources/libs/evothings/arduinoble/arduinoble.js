// File: arduinoble.js

evothings.loadScript('libs/evothings/easyble/easyble.js')

/** @namespace
* @author Mikael Kindborg
* @description Functions for communicating with an Arduino BLE shield.
*
* @todo This is a very simple library that has only write capability,
* read and notification functions should be added.
*
* @todo Add functions to set the BLE name used to identify the BLE shield
* and add function to set the write characteristic UUID.
*
* @example
evothings.arduinoble.connect(
	'arduinoble', // Name of BLE shield.
	function(device)
	{
		console.log('connected!');
		device.writeDataArray(new Uint8Array([1]));
		evothings.arduinoble.close();
	},
	function(errorCode)
	{
		console.log('Error: ' + errorCode);
	});
*/

// Object that exposes the Arduino BLE API.
evothings.arduinoble = {};
(function()
{
	// Internal functions.
	var internal = {};

	/** Stop any ongoing scan and disconnect all devices. */
	evothings.arduinoble.close = function()
	{
		evothings.easyble.stopScan();
		evothings.easyble.closeConnectedDevices();
	};

	/** Connect to a BLE-shield.
	* @param {evothings.arduinoble.win} win - Success callback: win(device)
	* @param {function} fail - Error callback: fail(errorCode)
	*/
	evothings.arduinoble.connect = function(deviceName, win, fail)
	{
		evothings.easyble.startScan(
			function(device)
			{
				if (device.name == deviceName)
				{
					evothings.easyble.stopScan();
					internal.connectToDevice(device, win, fail);
				}
			},
			function(errorCode)
			{
				fail(errorCode);
			});
	};

	/** Called when you've connected to an Arduino BLE shield.
	* @callback evothings.arduinoble.win
	* @param {evothings.arduinoble.device} device - The connected BLE shield.
	*/

	/** Info about an Arduino BLE shield.
	* @typedef {Object} evothings.arduinoble.device
	* @property {evothings.arduinoble.writeDataArray} writeDataArray
	*/

	/** Write data to an Arduino BLE shield.
	* @callback evothings.arduinoble.writeDataArray
	* @param {Uint8Array} uint8array - The data to be written.
	*/

	internal.connectToDevice = function(device, win, fail)
	{
		device.connect(
			function(device)
			{
				// Get services info.
				internal.getServices(device, win, fail);
			},
			function(errorCode)
			{
				fail(errorCode);
			});
	};

	internal.getServices = function(device, win, fail)
	{
		device.readServices(
			null, // null means read info for all services
			function(device)
			{
				internal.addMethodsToDeviceObject(device);
				win(device);
			},
			function(errorCode)
			{
				fail(errorCode);
			});
	};

	internal.addMethodsToDeviceObject = function(device)
	{
		device.writeDataArray = function(uint8array)
		{
			device.writeCharacteristic(
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
