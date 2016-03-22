// File: nordic-nRF51-ble.js

evothings.loadScript('libs/evothings/easyble/easyble.js')

/**
 * @namespace
 * @author Aaron Ardiri
 * @description Functions for communicating with a Nordic BLE device.
 *
 * @example
evothings.nRF51_ble.connect(
	'nRF51-DK', // BLE name
	function(device)
	{
		console.log('connected!');
		device.writeDataArray(new Uint8Array([1]));
		evothings.nRF51_ble.close();
	},
	function(errorCode)
	{
		console.log('Error: ' + errorCode);
	});
*/

// Object that exposes the nRF51-DK BLE API.
evothings.nRF51_ble = {};
(function()
{
	// Internal functions.
	var internal = {};

	/** Stops any ongoing scan and disconnects all devices. */
	evothings.nRF51_ble.close = function()
	{
		evothings.easyble.stopScan();
		evothings.easyble.closeConnectedDevices();
	};

	/** Connect to a BLE-shield.
	* @param win - Success callback: win(device)
	* @param fail - Error callback: fail(errorCode)
	*/
	evothings.nRF51_ble.connect = function(deviceName, win, fail)
	{
		evothings.easyble.startScan(
			function(device)
			{
				console.log('found device: ' + device.name);
				if (device.hasName(deviceName))
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
				'6e524635-312d-444b-206c-656420202020',
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

			// Enable notification support (required on Android)
			device.writeDescriptor(
				'6e524635-312d-444b-2062-7574746f6e20',
				'00002902-0000-1000-8000-00805f9b34fb',
				new Uint8Array([1,0]),
				function() {
					console.log('writeDescriptor success');
				}, function(errorCode) {
					console.log('writeDescriptor error: ' + errorCode);
				});

			device.enableNotification(
				'6e524635-312d-444b-2062-7574746f6e20',
				callback,
				function(errorCode)
				{
					console.log('enableNotification error: ' + errorCode);
			});
		};
	};
})();
