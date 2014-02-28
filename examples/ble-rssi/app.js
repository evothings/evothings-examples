// JavaScript code for the BLE RSSI example app.

// Application object.
var app = {};

// Device list.
app.devices = {};

// UI methods.
app.ui = {};

app.initialize = function()
{
	document.addEventListener('deviceready', this.onDeviceReady, false);

	// Important to stop scanning when page reloads/closes!
	window.addEventListener('beforeunload', function(e)
	{
		evothings.ble.reset();
	});
};

app.onDeviceReady = function()
{
	// Not used.
	// Here you can update the UI to say that
	// the device (the phone/tablet) is ready
	// to use BLE and other Cordova functions.
};

// Start the scan. Call the callback function when a device is found.
// Format:
//   callbackFun(deviceInfo, errorCode)
//   deviceInfo: address, rssi, name
//   errorCode: String
app.startScan = function(callbackFun)
{
	app.stopScan();

	evothings.ble.startScan(
		function(device)
		{
			// Report success.
			callbackFun(device, null);
		},
		function(errorCode)
		{
			// Report error.
			callbackFun(null, errorCode);
		}
	);
};

// Stop scanning for devices.
app.stopScan = function()
{
	evothings.ble.stopScan();

	// Disconnect all devices.
	for (var key in app.devices)
	{
		var device = app.devices[key];
		evothings.ble.close(device.handle);
	}

	app.devices = {};
};

// Connect to device.
app.connectToDevice = function(device)
{
	evothings.ble.connect(
		device.address,
		function(deviceInfo)
		{
			if (deviceInfo.state == 2) // Connected
			{
				// Save handle to device.
				device.handle = deviceInfo.deviceHandle;

				// Start polling RSSI.
				app.pollRSSI(device.address, deviceInfo.deviceHandle);
			}
			else if (deviceInfo.state == 0) // Disconnected
			{
				evothings.ble.close(device.handle);
				delete app.devices[device.address];
				app.ui.displayDeviceList();
			}
		},
		function(errorCode)
		{
			// Error connecting device.
			delete app.devices[device.address];
			app.ui.displayDeviceList();
		}
	);
};

// Run a timer to poll the RSSI value until the device gets
// disconnected/unavailable.
app.pollRSSI = function(deviceAddress, deviceHandle)
{
	// You may have to increase interval to 2000 ms if polling breaks.
	var interval = 1000;
	evothings.ble.rssi(
		deviceHandle,
		function(rssi)
		{
			// Update RSSI value.
			var device = app.devices[deviceAddress];
			if (!device)
			{
				evothings.ble.close(deviceHandle);
				return;
			}

			device.rssi = rssi;

			// Update UI.
			app.ui.displayDeviceList();

			// Scan again.
			setTimeout(
				function()
				{
					app.pollRSSI(deviceAddress, deviceHandle);
				},
				interval);
		},
		function(errorCode)
		{
			// RSSI errors may occur now and then, we just ignore them.
		});
};

// Called when Start Scan button is selected.
app.ui.onStartScanButton = function()
{
	app.startScan(app.ui.deviceFound);
	app.ui.displayStatus('Scanning...');
};

// Called when Stop Scan button is selected.
app.ui.onStopScanButton = function()
{
	app.stopScan();
	app.devices = {};
	app.ui.displayStatus('Scan Paused');
	app.ui.displayDeviceList();
};

// Called when a device is found.
app.ui.deviceFound = function(device, errorCode)
{
	// If we get a device not in the list, we add it.
	if (device && !app.devices[device.address])
	{
		// Insert the device into table of found devices.
		app.devices[device.address] = device;

		// Display device in UI.
		app.ui.displayDeviceList();

		// Connect to the device and poll RSSI.
		app.connectToDevice(device);
	}
	else if (errorCode)
	{
		app.ui.displayStatus('Scan Error: ' + errorCode);
	}
};

// Display the device list.
app.ui.displayDeviceList = function()
{
	// Clear device list.
	$('#found-devices').empty();

	var i = 1;
	$.each(app.devices, function(key, device)
	{
		// Compute a display percent width value from signal strength.
		// rssi is a negative value, zero is max signal strength.
		var rssiWidth = Math.max(0, (100 + device.rssi));

		// Set background color for this item.
		var bgcolor = i++ % 2 ? 'rgb(225,225,225)' : 'rgb(245,245,245)';

		// Create a div tag to display sensor data.
		var element = $(
			'<div class="device-info" style="background:' + bgcolor + ';">'
			//'<div class="device-info" style="background:rgb(200,200,200);">'
			+	'<b>' + device.name + '</b><br/>'
			+	device.address + '<br/>'
			+	device.rssi + '<br/>'
			+ 	'<div style="background:rgb(255,0,0);height:20px;width:'
			+ 		rssiWidth + '%;"></div>'
			+ '</div>'
		);

		//element.css('margin-left',  (device.rssi * -2) + 'px');

		$('#found-devices').append(element);
	});
};

// Display a status message
app.ui.displayStatus = function(message)
{
	$('#scan-status').html(message);
};

app.initialize();
