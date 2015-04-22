/*
Description:

	JavaScript code for the mbed GAP example app.

Credits:

	ARM mbed [-_-]~

	http://mbed.org
*/

/**
 * Object that holds application data and functions.
 */
var app = {};

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
	// report status
	app.showInfo('Tap Start to begin scanning');
};

/**
 * Called when Start button is pressed.
 */
app.onStartButton = function()
{
	// Call stop before you start, just in case something else is running.
	evothings.easyble.stopScan();
	evothings.easyble.closeConnectedDevices();

	// Only report devices once.
	evothings.easyble.reportDeviceOnce(true);

	// Start scanning.
	app.startScan();
	app.showInfo('Scanning...');
};

/**
 * Called when Stop button is pressed.
 */
app.onStopButton = function()
{
	evothings.easyble.stopScan();
	evothings.easyble.closeConnectedDevices();
	app.showInfo('Tap Start to begin scanning');
	$('#found-devices').empty();
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
 * Scan all devices and display them.
 */
app.startScan = function()
{
	evothings.easyble.startScan(
		function(device)
		{
			// Do not show un-named devices.
			if (!device.name) { return }

			// Debug logging.
			console.log('Device Found!')
			console.log(device.name.toString() + ' : ' +
				device.address.toString().split(':').join(''))

			// Add found device to device list.
			// See documentation here for BLE device object fields:
			// http://evothings.com/doc/raw/plugins/com.evothings.ble/com.evothings.module_ble.html
			var element = $(
				'<li style="font-size: 75%">'
				+	'<strong>Address: ' + device.address + '</strong><br />'
				+	'RSSI: ' + device.rssi+ 'dB' + '<br />'
				+	'Name: ' + device.name + '<br />'
				+	'ServiceUUID: ' + device.advertisementData.kCBAdvDataServiceUUIDs + '<br />'
				+	'Manufacturer Data Hex: ' + app.getHexData(
						device.advertisementData.kCBAdvDataManufacturerData)+'<br />'
				+	'Manufacturer Data ASCII: ' + app.hextostring(app.getHexData(
						device.advertisementData.kCBAdvDataManufacturerData)) + '<br />'
				+'	</li>'
			);
			$('#found-devices').append(element);
		},
		function(errorCode)
		{
			app.showInfo('Error: startScan: ' + errorCode + '.');
		});
};

/**
 * Convert hex to ASCII strings.
 */
app.hextostring = function(hex)
{
    // Do not parse undefined data.
    if (hex)
    {
    	var result = '';
    	$.each(('' + hex).match(/../g), function() {
    	    result += String.fromCharCode('0x' + this);
    	});
    	return result;
    }
    else
    {
    	return null;
    }
};

/**
 * Convert base64 to array to hex.
 */
app.getHexData = function(data)
{
	// Sanity check for null/undefined data.
	if (data)
	{
		return evothings.util.typedArrayToHexString(
			evothings.util.base64DecToArr(data));
	}
    else
    {
    	return null;
    }
};

// Initialize the app.
app.initialize();
