/*
File: arduino-ble.js
Author: Mikael Kindborg
Description: Functions for communicating with an Arduino BLE shield.

TODO: This is a very simple library that has only write capability,
read and notification functions should be added.

TODO: Add functions to set the BLE name used to identify the BLE shield
and add function to set the write characteristic UUID.

Example of use:

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

evothings.loadScript('libs/evothings/easyble/easyble.js')

if (!window.evothings) { window.evothings = {} }
evothings.arduinoble = (function()
{
	// Arduino BLE object.
	var arduinoble = {};

	// Internal functions.
	var internal = {};

	// Stops any ongoing scan and disconnects all devices.
	arduinoble.close = function()
	{
		evothings.easyble.stopScan();
		evothings.easyble.closeConnectedDevices();
	};

	// Connect to a BLE-shield.
	// Success callback: win(device)
	// Error callback: fail(errorCode)
	arduinoble.connect = function(deviceName, win, fail)
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

	return arduinoble;
})();
