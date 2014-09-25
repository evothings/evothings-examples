/*
File: rfduino-ble.js
Author: Mikael Kindborg, modified by Patrik D.
Description: Functions for communicating with an RFDuino.

TODO: This is a very simple library that has only write capability,
read and notification functions should be added.

Example of use:

rfduinoble.connect(
	function(device)
	{
		console.log('connected!');
		device.writeDataArray(new Uint8Array([1]));
		rfduinoble.close();
	},
	function(errorCode)
	{
		console.log('Error: ' + errorCode);
	});
*/

// Object that exposes the RFduino BLE API.
var rfduinoble = (function()
{
	// RFDuino BLE object.
	var rfduinoble = {};

	// Internal functions.
	var internal = {};

	// Stops any ongoing scan and disconnects all devices.
	rfduinoble.close = function()
	{
		easyble.stopScan();
		easyble.closeConnectedDevices();
	};

	// Connect to an RFduino.
	// Success callback: win(device)
	// Error callback: fail(errorCode)
	rfduinoble.connect = function(win, fail)
	{
		easyble.startScan(
			function(device)
			{
				hyper.log("found device "+device.name);
				if (device.name == 'RFDuino')
				{
					easyble.stopScan();
					hyper.log("connectToDevice");
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

	return rfduinoble;
})();
