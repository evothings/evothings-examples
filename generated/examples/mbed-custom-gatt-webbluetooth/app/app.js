/*
Description:

	JavaScript code for the mbed GATT Web Bluetooth example app.

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

app.device = null;
app.gattServer = null;

app.ledServiceUUID = '0000a000-0000-1000-8000-00805f9b34fb';
app.ledReadCharacteristicUUID = '0000a001-0000-1000-8000-00805f9b34fb';
app.ledWriteCharacteristicUUID = '0000a002-0000-1000-8000-00805f9b34fb';

app.ledService = null;
app.ledReadCharacteristic = null;
app.ledWriteCharacteristic = null;

/**
 * Initialise the application.
 */
app.initialize = function()
{
	document.addEventListener(
		'deviceready',
		app.onDeviceReady,
		false);
};

/**
 * When low level initialization is complete, this function is called.
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
app.connect = function()
{
	// Disconnect if connected.
	if (app.gattServer && app.gattServer.connected)
	{
		app.gattServer.disconnect();
	}

	app.showInfo('Status: Scanning...');

	// Find and connect to device and get characteristics for LED read/write.
	bleat.requestDevice({
		//filters:[{ services:[ '0xf000aa10' ] }]
		filters:[{ name: app.deviceName }]
	})
	.then(device => {
		app.showInfo('Status: Found device: ' + device.name);
		// Connect to device.
		return device.gatt.connect();
	})
	.then(server => {
		app.showInfo('Status: Connected');
		// Save gatt server.
		app.gattServer = server;
		// Get LED service.
		return app.gattServer.getPrimaryService(app.ledServiceUUID);
	})
	.then(service => {
		// Save LED service.
		app.ledService = service
		// Get LED read characteristic.
		return app.ledService.getCharacteristic(app.ledReadCharacteristicUUID);
	})
	.then(characteristic => {
		// Save LED read characteristic.
		app.ledReadCharacteristic = characteristic
		// Get LED write characteristic.
		return app.ledService.getCharacteristic(app.ledWriteCharacteristicUUID);
	})
	.then(characteristic => {
		app.showInfo('Status: Ready');
		// Save LED write characteristic.
		app.ledWriteCharacteristic = characteristic
	})
	.catch(error => {
		app.showInfo(error);
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

	// Connect to device.
	app.connect();
};

/**
 * Toggle the LED on/off.
 */
app.onToggleButton = function()
{

	// Read LED status from the device.
	app.ledReadCharacteristic.readValue().then(data => {

		// Toggle status.
		var ledStatus = data.getUint8(0);
		if (ledStatus == app.ledON)
		{
			app.showInfo('Status: LED OFF');
			$('#toggleButton').removeClass('green');
			$('#toggleButton').addClass('red');
			ledStatus = app.ledOFF;
		}
		else if (ledStatus == app.ledOFF)
		{
			app.showInfo('Status: LED ON');
			$('#toggleButton').removeClass('red');
			$('#toggleButton').addClass('green');
			ledStatus = app.ledON;
		}

		// Write new LED status to device.
		app.ledWriteCharacteristic.writeValue(new Uint8Array([ledStatus]));
	});
}

// Initialize the app.
app.initialize();
