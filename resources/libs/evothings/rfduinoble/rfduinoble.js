/*
File: rfduinoble.js
Author: Patrik D.
Description: Functions for communicating with an RFduino.
*/

// Object that exposes the RFduino BLE API.

if (!window.evothings) { window.evothings = {} }
evothings.rfduinoble = (function()
{
	// RFduino BLE object.
	var rfduinoble = {};

	// Internal functions.
	var internal = {};

	// Stops any ongoing scan and disconnects all devices.
	rfduinoble.close = function()
	{
		evothings.easyble.stopScan();
		evothings.easyble.closeConnectedDevices();
	};

	// Connect to an RFduino.
	// Success callback: win(device)
	// Error callback: fail(errorCode)
	rfduinoble.connect = function(deviceName, win, fail)
	{
		evothings.easyble.startScan(
			function(device)
			{
				console.log("found device: " + device.name);
				if (device.name == deviceName)
				{
					evothings.easyble.stopScan();
					console.log("connectToDevice");
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
				"00002222-0000-1000-8000-00805f9b34fb",
				uint8array,
				function()
				{
					console.log("writeCharacteristic success");
				},
				function(errorCode)
				{
					console.log("writeCharacteristic error: " + errorCode);
				});
		};
	};

	return rfduinoble;
})();
