// JavaScript code for the BLE Scan example app.

// Application object.
var app = {};

// Device list.
app.devices = {};

// UI methods.
app.ui = {};

app.initialize = function()
{
	document.addEventListener('deviceready', this.onDeviceReady, false);
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
	evothings.ble.reset();
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
	if (device)
	{
		// Insert the device into table of found devices.
		app.devices[device.address] = device;

		// Display device in UI.
		app.ui.displayDeviceList();
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

		$('#found-devices').append(element);
	});
};

// Display a status message
app.ui.displayStatus = function(message)
{
	$('#scan-status').html(message);
};

app.initialize();
