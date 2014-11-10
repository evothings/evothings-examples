/*
File: nordic-ble.js
Author: Mikael Kindborg
Description: Functions for communicating with a Nordic BLE device.

TODO: This is a very simple library that has only write capability,
read and notification functions should be added.

Example of use:

     nordicble.connect(
         function(device)
         {
         	console.log('connected!');
         	device.writeDataArray(new Uint8Array([1]));
         	nordicble.close();
         },
         function(errorCode)
         {
         	console.log('Error: ' + errorCode);
         });
*/

// Object that exposes the Nordic BLE API.
var nordicble = (function()
{
	// Nordic BLE object.
	var nordicble = {};

	// Internal functions.
	var internal = {};

	// Stops any ongoing scan and disconnects all devices.
	nordicble.close = function()
	{
		easyble.stopScan();
		easyble.closeConnectedDevices();
	};

	// Connect to a BLE-shield.
	// Success callback: win(device)
	// Error callback: fail(errorCode)
	nordicble.connect = function(win, fail)
	{
		easyble.startScan(
			function(device)
			{
				console.log('found '+device.name);
				if (device.name == 'LedButtonDemo')
				{
					easyble.stopScan();
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
				console.log('connected!');
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
				'00001525-1212-efde-1523-785feabcd123',
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

		device.setNotification = function(callback)
		{
			console.log('setNotification');

			// Must write this descriptor value to enable enableNotification().
			// Yes, it's weird.
			// Without it, enableNotification() fails silently;
			// we never get the data we should be getting.
			device.writeDescriptor('00001524-1212-efde-1523-785feabcd123',
				'00002902-0000-1000-8000-00805f9b34fb',
				new Uint8Array([1,0]),
				function() {
					console.log('writeDescriptor success');
				}, function(errorCode) {
					console.log('writeDescriptor error: ' + errorCode);
				});

			device.enableNotification('00001524-1212-efde-1523-785feabcd123',
				callback,
				function(errorCode) {
					console.log('enableNotification error: ' + errorCode);
				});
		};
	};

	return nordicble;
})();
