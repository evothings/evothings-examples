// JavaScript code for the BLE Scan example app.

// Application object.
var app = {};

// Device list.
app.devices = {};

// Track if scanning is ongoing.
app.isScanning = false;

// Time for last scan event. This is useful for
// when the device does not support continuos scan.
app.lastScanEvent = 0;

// UI methods.
app.ui = {};

app.initialize = function()
{
	document.addEventListener('deviceready', this.onDeviceReady, false);

	// Important to stop scanning when page reloads/closes!
	window.addEventListener('beforeunload', function(e)
	{
		app.stopScan();
	});
};

app.onDeviceReady = function()
{
	// Not used.
};

// Start the scan. Call the callback function when a device is found.
// Format:
//   callbackFun(deviceInfo, errorCode)
//   deviceInfo: address, rssi, name
//   errorCode: String
app.startScan = function(callbackFun)
{
	app.stopScan();
	app.callbackFun = callbackFun;
	app.isScanning = true;
	app.lastScanEvent = new Date();
	app.runScanTimer();
	evothings.ble.startScan(
		function(device)
		{
			// Device found, update scan timer.
			app.lastScanEvent = new Date();

			// Time stamp used to remove devices from the display list.
			device.timestamp = Date.now();

			// Insert the device into table of found devices.
			app.devices[device.address] = device;

			// Remove old devices.
			app.removeOldDevices();

			// Report success.
			app.callbackFun(device, null);
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
	app.isScanning = false;
};

// Run a timer to restart scan in case the device does
// not automatically perform continuous scan.
app.runScanTimer = function()
{
	if (app.isScanning)
	{
		var scanInterval = 5000;
		var timeSinceLastScan = new Date() - app.lastScanEvent;
		if (timeSinceLastScan > scanInterval)
		{
			if (app.scanTimer) { clearTimeout(app.scanTimer); }
			app.startScan(app.callbackFun);
		}
		app.scanTimer = setTimeout(app.runScanTimer, scanInterval);
	}
};

// Remove entries that have timed out. The idea is that
// devices that are no longer in range or have stopped
// advertising should be removed from the list.
app.removeOldDevices = function()
{
	var timeout = Date.now() - 10000;
	$.each(app.devices, function(key, device)
	{
		if (device.timestamp < timeout)
		{
			delete app.devices[key];
		}
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
app.ui.deviceFound = function(deviceInfo, errorCode)
{
	if (deviceInfo)
	{
		app.ui.displayDeviceList();
	}
	else if (errorCode)
	{
		app.ui.displayStatus('Scan Error: ' + errorCode);
	}
};

// Display the device list.
app.ui.displayDeviceList = function(deviceInfo, errorCode)
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
