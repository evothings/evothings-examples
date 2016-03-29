// JavaScript code for the Microbit Demo app.

/**
 * Object that holds application data and functions.
 */
var app = {};

/**
 * Data that is plotted on the canvas.
 */
app.dataPoints = [];

/**
 * Timeout (ms) after which a message is shown if the Microbit wasn't found.
 */
app.CONNECT_TIMEOUT = 3000;

/**
 * Object that holds Microbit UUIDs.
 */
app.microbit = {};

app.microbit.ACCELEROMETER_SERVICE = 'e95d0753-251d-470a-a062-fa1922dfa9a8';
app.microbit.ACCELEROMETER_DATA = 'e95dca4b-251d-470a-a062-fa1922dfa9a8';
app.microbit.ACCELEROMETER_PERIOD = 'e95dfb24-251d-470a-a062-fa1922dfa9a8';
app.microbit.MAGNETOMETER_SERVICE = 'e95df2d8-251d-470a-a062-fa1922dfa9a8';
app.microbit.MAGNETOMETER_DATA = 'e95dfb11-251d-470a-a062-fa1922dfa9a8';
app.microbit.MAGNETOMETER_PERIOD = 'e95d386c-251d-470a-a062-fa1922dfa9a8';
app.microbit.MAGNETOMETER_BEARING = 'e95d9715-251d-470a-a062-fa1922dfa9a8';
app.microbit.BUTTON_SERVICE = 'e95d9882-251d-470a-a062-fa1922dfa9a8';
app.microbit.BUTTON_A = 'e95dda90-251d-470a-a062-fa1922dfa9a8';
app.microbit.BUTTON_B = 'e95dda91-251d-470a-a062-fa1922dfa9a8';
app.microbit.TEMPERATURE_SERVICE = 'e95d6100-251d-470a-a062-fa1922dfa9a8';
app.microbit.TEMPERATURE_DATA = 'e95d9250-251d-470a-a062-fa1922dfa9a8';
app.microbit.TEMPERATURE_PERIOD = 'e95d1b25-251d-470a-a062-fa1922dfa9a8';

app.microbit.DEVICE_INFO_SERVICE = '0000180a-0000-1000-8000-00805f9b34fb';
app.microbit.DEVICE_MODEL = '00002a24-0000-1000-8000-00805f9b34fb';
app.microbit.SERIAL_NUMBER = '00002a25-0000-1000-8000-00805f9b34fb';
app.microbit.FIRMWARE_REVISION = '00002a26-0000-1000-8000-00805f9b34fb';
//app.microbit.HARDWARE_REVISION = '00002a27-0000-1000-8000-00805f9b34fb';
//app.microbit.SOFTWARE_REVISION = '00002a28-0000-1000-8000-00805f9b34fb';
//app.microbit.MANUFACTURER = '00002a29-0000-1000-8000-00805f9b34fb';

var BLE_NOTIFICATION_UUID = '00002902-0000-1000-8000-00805f9b34fb';

/**
 * Initialise the application.
 */
app.initialize = function()
{
	document.addEventListener(
		'deviceready',
		function() { evothings.scriptsLoaded(app.onDeviceReady) },
		false);
}

function onConnect(context) {
	// Once a connection has been made, make a subscription and send a message.
	console.log("Client Connected");
	console.log(context);
}

app.onDeviceReady = function()
{
	app.showInfo('Activate the Microbit and tap Start.');
	//app.onStartButton();
}

app.showInfo = function(info)
{
	document.getElementById('Status').innerHTML = info;
}

app.onStartButton = function()
{
	app.onStopButton();
	app.startScan();
	app.showInfo('Status: Scanning...');
	app.startConnectTimer();
}

app.onStopButton = function()
{
	// Stop any ongoing scan and close devices.
	app.stopConnectTimer();
	evothings.easyble.stopScan();
	evothings.easyble.closeConnectedDevices();
	app.showInfo('Status: Stopped.');
}

app.startConnectTimer = function()
{
	// If connection is not made within the timeout
	// period, an error message is shown.
	app.connectTimer = setTimeout(
		function()
		{
			app.showInfo('Status: Scanning... ' +
				'Please start the Microbit.');
		},
		app.CONNECT_TIMEOUT)
}

app.stopConnectTimer = function()
{
	clearTimeout(app.connectTimer);
}

app.startScan = function()
{
	evothings.easyble.startScan(
		function(device)
		{
			// Connect if we have found an Microbit.
			if (app.deviceIsMicrobit(device))
			{
				app.showInfo('Status: Device found: ' + device.name + '.');
				evothings.easyble.stopScan();
				app.connectToDevice(device);
				app.stopConnectTimer();
			}
		},
		function(errorCode)
		{
			app.showInfo('Error: startScan: ' + errorCode + '.');
		});
}

app.deviceIsMicrobit = function(device)
{
	console.log('device name: ' + device.name);
	return (device != null) &&
		(device.name != null) &&
		((device.name.indexOf('MicroBit') > -1) ||
			(device.name.indexOf('micro:bit') > -1));
};

/**
 * Read services for a device.
 */
app.connectToDevice = function(device)
{
	app.showInfo('Connecting...');
	device.connect(
		function(device)
		{
			app.showInfo('Status: Connected - reading Microbit services...');
			app.readServices(device);
		},
		function(errorCode)
		{
			app.showInfo('Error: Connection failed: ' + errorCode + '.');
			evothings.ble.reset();
			// This can cause an infinite loop...
			//app.connectToDevice(device);
		});
}

app.readServices = function(device)
{
	device.readServices(
		[
		app.microbit.ACCELEROMETER_SERVICE,
		app.microbit.MAGNETOMETER_SERVICE,
		app.microbit.TEMPERATURE_SERVICE,
		app.microbit.BUTTON_SERVICE,
		app.microbit.DEVICE_INFO_SERVICE,
		],
		app.startNotifications,
		function(errorCode)
		{
			console.log('Error: Failed to read services: ' + errorCode + '.');
		});
}

app.writeCharacteristic = function(device, characteristicUUID, value) {
	device.writeCharacteristic(
		characteristicUUID,
		new Uint8Array(value),
		function()
		{
			console.log('writeCharacteristic '+characteristicUUID+' ok.');
		},
		function(errorCode)
		{
			// This error will happen on iOS, since this descriptor is not
			// listed when requesting descriptors. On iOS you are not allowed
			// to use the configuration descriptor explicitly. It should be
			// safe to ignore this error.
			console.log('Error: writeCharacteristic: ' + errorCode + '.');
		});
}

app.writeNotificationDescriptor = function(device, characteristicUUID)
{
	device.writeDescriptor(
		characteristicUUID,
		BLE_NOTIFICATION_UUID,
		new Uint8Array([1,0]),
		function()
		{
			console.log('writeDescriptor '+characteristicUUID+' ok.');
		},
		function(errorCode)
		{
			// This error will happen on iOS, since this descriptor is not
			// listed when requesting descriptors. On iOS you are not allowed
			// to use the configuration descriptor explicitly. It should be
			// safe to ignore this error.
			console.log('Error: writeDescriptor: ' + errorCode + '.');
		});
}

/**
 * Read accelerometer data.
 * FirmwareManualBaseBoard-v1.5.x.pdf
 */
app.startNotifications = function(device)
{
	app.showInfo('Status: Starting notifications...');

	app.readDeviceInfo(device);

	// Set notifications to ON.
	app.writeNotificationDescriptor(device, app.microbit.ACCELEROMETER_DATA);
	app.writeNotificationDescriptor(device, app.microbit.MAGNETOMETER_DATA);
	app.writeNotificationDescriptor(device, app.microbit.MAGNETOMETER_BEARING);
	app.writeNotificationDescriptor(device, app.microbit.TEMPERATURE_DATA);
	app.writeNotificationDescriptor(device, app.microbit.BUTTON_A);
	app.writeNotificationDescriptor(device, app.microbit.BUTTON_B);

	// Set sensor period to 160 ms.
	var periodDataBuffer = new ArrayBuffer(2);
	new DataView(periodDataBuffer).setUint16(0, 160, true);
	//app.writeCharacteristic(device, app.microbit.ACCELEROMETER_PERIOD, periodDataBuffer);
	//app.writeCharacteristic(device, app.microbit.MAGNETOMETER_PERIOD, periodDataBuffer);

	// Start accelerometer notification.
	device.enableNotification(
		app.microbit.ACCELEROMETER_DATA,
		app.handleAccelerometerValues,
		function(errorCode)
		{
			console.log('Error: enableNotification: ' + errorCode + '.');
		});

	// Start magnetometer notification.
	device.enableNotification(
		app.microbit.MAGNETOMETER_DATA,
		app.handleMagnetometerValues,
		function(errorCode)
		{
			console.log('Error: enableNotification: ' + errorCode + '.');
		});

	// Start magnetometer bearing notification.
	device.enableNotification(
		app.microbit.MAGNETOMETER_BEARING,
		app.handleMagnetometerBearing,
		function(errorCode)
		{
			console.log('Error: enableNotification: ' + errorCode + '.');
		});

	// Start magnetometer bearing notification.
	device.enableNotification(
		app.microbit.TEMPERATURE_DATA,
		app.handleTemperatureData,
		function(errorCode)
		{
			console.log('Error: enableNotification: ' + errorCode + '.');
		});

	// Start magnetometer bearing notification.
	device.enableNotification(
		app.microbit.BUTTON_A,
		app.handleButtonA,
		function(errorCode)
		{
			console.log('Error: enableNotification: ' + errorCode + '.');
		});

	// Start magnetometer bearing notification.
	device.enableNotification(
		app.microbit.BUTTON_B,
		app.handleButtonB,
		function(errorCode)
		{
			console.log('Error: enableNotification: ' + errorCode + '.');
		});
}

app.readDeviceInfo = function(device)
{
	app.readCharacteristic(device, app.microbit.DEVICE_MODEL, 'DeviceModel');
	app.readCharacteristic(device, app.microbit.SERIAL_NUMBER, 'SerialNumber');
	app.readCharacteristic(device, app.microbit.FIRMWARE_REVISION, 'FirmwareRevision');
	//app.readCharacteristic(device, app.microbit.HARDWARE_REVISION, 'HardwareRevision');
	//app.readCharacteristic(device, app.microbit.SOFTWARE_REVISION, 'SoftwareRevision');
	//app.readCharacteristic(device, app.microbit.MANUFACTURER, 'Manufacturer');
	app.readCharacteristicUint16(device, app.microbit.ACCELEROMETER_PERIOD, 'Acc period');
	app.readCharacteristicUint16(device, app.microbit.MAGNETOMETER_PERIOD, 'Mag period');
	app.readCharacteristicUint16(device, app.microbit.TEMPERATURE_PERIOD, 'Tem period');
}

// http://www.onicos.com/staff/iz/amuse/javascript/expert/utf.txt
/* utf.js - utf-8 <=> UTF-16 conversion
*
* Copyright (C) 1999 Masanao Izumo <iz@onicos.co.jp>
* Version: 1.1
* LastModified: Nov 27 2015
* This library is free. You can redistribute it and/or modify it.
*/
function utf8ArrayToStr(array, errorHandler) {
	var out, i, len, c;
	var char2, char3;
	array = new Uint8Array(array);
	out = "";
	len = array.length;
	i = 0;
	while(i < len) {
		c = array[i++];
		switch(c >> 4) {
		case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
			// 0xxxxxxx
			out += String.fromCharCode(c);
			break;
		case 12: case 13:
			// 110x xxxx 10xx xxxx
			char2 = array[i++];
			out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
			break;
		case 14:
			// 1110 xxxx 10xx xxxx 10xx xxxx
			char2 = array[i++];
			char3 = array[i++];
			out += String.fromCharCode(((c & 0x0F) << 12) |
			((char2 & 0x3F) << 6) |
			((char3 & 0x3F) << 0));
			break;
		default:
			if(errorHandler)
				out = errorHandler(out, c)
			else
				throw "Invalid UTF-8!";
		}
	}
	return out;
}

app.readCharacteristicUint16 = function(device, uuid, name)
{
	device.readCharacteristic(uuid, function(data)
	{
		console.log(name+': '+evothings.util.littleEndianToUint16(new Uint8Array(data), 0));
	},
	function(errorCode)
	{
		console.log('Error: readCharacteristic: ' + errorCode + '.');
	});
}

app.readCharacteristic = function(device, uuid, spanID)
{
	device.readCharacteristic(uuid, function(data)
	{
		var str = utf8ArrayToStr(data, function(out, c) {
			return out+'['+c+']';
		});
		console.log(spanID+': '+str);
		app.value(spanID, str);
	},
	function(errorCode)
	{
		console.log('Error: readCharacteristic: ' + errorCode + '.');
	});
}

app.value = function(elementId, value)
{
	document.getElementById(elementId).innerHTML = value;
}

app.handleAccelerometerValues = function(data)
{
	var values = app.parseAccelerometerValues(new Uint8Array(data));
	app.value('Accelerometer', values.x+', '+values.y+', '+values.z);
}

/**
 * Calculate accelerometer values from raw data for Microbit.
 * @param data - an Uint8Array.
 * @return Object with fields: x, y, z.
 */
app.parseAccelerometerValues = function(data)
{
	// We want to scale the values to +/- 1.
	// Documentation says: "Values are in the range +/-1000 milli-newtons, little-endian."
	// Actual maximum values is measured to be 2048.
	var divisor = 2048;

	// Calculate accelerometer values.
	var rawX = evothings.util.littleEndianToInt16(data, 0);
	var rawY = evothings.util.littleEndianToInt16(data, 2);
	var rawZ = evothings.util.littleEndianToInt16(data, 4);
	var ax = rawX / divisor;
	var ay = rawY / divisor;
	var az = rawZ / divisor;

	/*
	// log raw values every now and then
	var now = new Date().getTime();	// current time in milliseconds since 1970.
	if(!app.lastLog || now > app.lastLog + 1000) {
		console.log([rawX, rawY, rawZ]);
		//console.log(evothings.util.typedArrayToHexString(data));
		app.lastLog = now;
	}
	*/

	// Return result.
	return { x: rawX, y: rawY, z: rawZ };
}

app.handleMagnetometerValues = function(data)
{
	var values = app.parseMagnetometerValues(new Uint8Array(data));
	app.value('MagnetometerAxes', values.x+', '+values.y+', '+values.z);
}

app.parseMagnetometerValues = function(data)
{
	var values = {
		x: evothings.util.littleEndianToUint16(data, 0),
		y: evothings.util.littleEndianToUint16(data, 2),
		z: evothings.util.littleEndianToUint16(data, 2),
	}
	return values;
}

app.handleMagnetometerBearing = function(data)
{
	data = new Uint8Array(data);
	// log raw values every now and then
	var now = new Date().getTime();	// current time in milliseconds since 1970.
	if(!app.lastLog || now > app.lastLog + 1000) {
		console.log(evothings.util.typedArrayToHexString(data));
		app.lastLog = now;
	}

	var value = evothings.util.littleEndianToUint16(data, 0);
	app.value('MagnetometerBearing', value);
}

app.handleTemperatureData = function(data)
{
	app.value('Temperature', evothings.util.littleEndianToInt8(new Uint8Array(data), 0)+' °C');
}

app.handleButtonA = function(data)
{
	app.value('ButtonA', evothings.util.littleEndianToInt8(new Uint8Array(data), 0));
}

app.handleButtonB = function(data)
{
	app.value('ButtonB', evothings.util.littleEndianToInt8(new Uint8Array(data), 0));
}


// Initialize the app.
app.initialize();
