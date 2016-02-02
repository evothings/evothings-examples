/*
Description:

	JavaScript code for the mbed GATT example app.

Credits:

	ARM mbed [-_-]~

	http://mbed.org
*/

/**
 * Object that holds application data and functions.
 */
var app = {};

/**
 * Name of device to connect to.
 */
app.deviceName = 'ChangeMe!!'

/**
 * LED defines (inverted).
 */
app.ledOFF = 1;
app.ledON  = 0;

/**
 * Connected device.
 */
app.device = null;

/**
 * Initialise the application.
 */
app.initialize = function()
{
	document.addEventListener(
		'deviceready',
		function() { evothings.scriptsLoaded(app.onDeviceReady) },
		false);
};

/**
 * When low level initialization complete, this function is called.
 */
app.onDeviceReady = function()
{
	// Report status.
	app.showInfo('Enter BLE device name and tap Connect');

	// Show the saved device name, if any.
	var name = localStorage.getItem('deviceName');
	if (name)
	{
		app.deviceName = name;
	}
	$('#deviceName').val(app.deviceName);
};

/**
 * Print debug info to console and application UI.
 */
app.showInfo = function(info)
{
	document.getElementById('info').innerHTML = info;
	console.log(info);
};

/**
 * Scan for device and connect.
 */
app.startScan = function()
{
	evothings.easyble.startScan(
		function(device)
		{
			// Do not show un-named devices.
			var deviceName = device.advertisementData ?
				device.advertisementData.kCBAdvDataLocalName : null
			if (!device.name) { return }

			// Print "name : mac address" for every device found.
			console.log(device.name + ' : ' + device.address.toString().split(':').join(''))

			// If my device is found connect to it.
			if (device.hasName(app.deviceName))
			{
				app.showInfo('Status: Device found: ' + deviceName);
				evothings.easyble.stopScan();
				app.connectToDevice(device);
			}
		},
		function(error)
		{
			app.showInfo('Error: startScan: ' + error);
		});
};

/**
 * Read services for a device.
 */
app.connectToDevice = function(device)
{
	app.showInfo('Status: Connecting...');
	device.connect(
		function(device)
		{
			app.device = device;
			app.showInfo('Status: Connected');
			app.readServices(app.device);
		},
		function(errorCode)
		{
			app.showInfo('Error: Connection failed: ' + errorCode);
		});
};

/**
 * Dump all information on named device to the console
 */
app.readServices = function(device)
{
	// Read all services.
	device.readServices(
		null,
		function()
		{
			console.log("readServices success");

			// Debug logging of all services, characteristics and descriptors
			// reported by the BLE board.
			app.logAllServices(app.device);
		},
		function(error)
		{
			console.log('Error: Failed to read services: ' + error);
		});
};

/**
 * when low level initialization complete,
 * this function is called
 */
app.onConnectButton = function()
{
	// Get device name from text field.
	app.deviceName = $('#deviceName').val();

	// Save it for next time we use the app.
	localStorage.setItem('deviceName', app.deviceName);

	// Call stop before you start, just in case something else is running.
	evothings.easyble.stopScan();
	evothings.easyble.closeConnectedDevices();

	// Only report devices once.
	evothings.easyble.reportDeviceOnce(true);

	// Start scanning.
	app.startScan();
	app.showInfo('Status: Scanning...');
};

/**
 * Toggle the LED on/off.
 */
app.onToggleButton = function()
{
	app.device.readCharacteristic(
		'0000a001-0000-1000-8000-00805f9b34fb',
		function(data)
		{
			var view = new Uint8Array(data);
			var led = new Uint8Array(1);
			if(view[0] == app.ledON)
			{
				$('#toggleButton').removeClass('green');
				$('#toggleButton').addClass('red');
				led[0] = app.ledOFF;
			}
			else if (view[0] == app.ledOFF)
			{
				$('#toggleButton').removeClass('red');
				$('#toggleButton').addClass('green');
				led[0] = app.ledON;
			}
			app.device.writeCharacteristic(
				'0000a002-0000-1000-8000-00805f9b34fb',
				led,
				function() { console.log('LED toggled successfully!') },
				function(error) { console.log('LED toggle failed: ' + error) });

		},
		function(error)
		{
			console.log('Error: Read characteristic failed: ' + error);
		});
}

/**
 * Debug logging of found services, characteristics and descriptors.
 */
app.logAllServices = function(device)
{
	// Here we simply print found services, characteristics,
	// and descriptors to the debug console in Evothings Workbench.

	// Notice that the fields prefixed with "__" are arrays that
	// contain services, characteristics and notifications found
	// in the call to device.readServices().

	// Print all services.
	console.log('Found services:');
	for (var serviceUUID in device.__services)
	{
		var service = device.__services[serviceUUID];
		console.log('  service: ' + service.uuid);

		// Print all characteristics for service.
		for (var characteristicUUID in service.__characteristics)
		{
			var characteristic = service.__characteristics[characteristicUUID];
			console.log('    characteristic: ' + characteristic.uuid);

			// Print all descriptors for characteristic.
			for (var descriptorUUID in characteristic.__descriptors)
			{
				var descriptor = characteristic.__descriptors[descriptorUUID];
				console.log('      descriptor: ' + descriptor.uuid);
			}
		}
	}
};

// Initialize the app.
app.initialize();
