// JavaScript code for the TI SensorTag Demo app.

/**
 * Object that holds application data and functions.
 */
var app = {};

/**
 * Data that is plotted on the canvas.
 */
app.dataPoints = [];

/**
 * Timeout (ms) after which a message is shown if the SensorTag wasn't found.
 */
app.CONNECT_TIMEOUT = 3000;

/**
 * Object that holds SensorTag UUIDs.
 */
app.sensortag = {};

app.sensortag.ACCELEROMETER_SERVICE = 'f000aa10-0451-4000-b000-000000000000';
app.sensortag.ACCELEROMETER_DATA = 'f000aa11-0451-4000-b000-000000000000';
app.sensortag.ACCELEROMETER_CONFIG = 'f000aa12-0451-4000-b000-000000000000';
app.sensortag.ACCELEROMETER_PERIOD = 'f000aa13-0451-4000-b000-000000000000';
app.sensortag.ACCELEROMETER_NOTIFICATION = '00002902-0000-1000-8000-00805f9b34fb';

app.sensortag.MAGNETOMETER_SERVICE = 'f000aa30-0451-4000-b000-000000000000';
app.sensortag.MAGNETOMETER_DATA = 'f000aa31-0451-4000-b000-000000000000';
app.sensortag.MAGNETOMETER_CONFIG = 'f000aa32-0451-4000-b000-000000000000';
app.sensortag.MAGNETOMETER_PERIOD = 'f000aa33-0451-4000-b000-000000000000';
app.sensortag.MAGNETOMETER_NOTIFICATION = '00002902-0000-1000-8000-00805f9b34fb';

/**
 * Initialise the application.
 */
app.initialize = function()
{
	document.addEventListener(
		'deviceready',
		function() { evothings.scriptsLoaded(app.onDeviceReady) },
		false);

	// Called when HTML page has been loaded.
	$(document).ready( function()
	{
		// Adjust canvas size when browser resizes
		$(window).resize(app.respondCanvas);

		// Adjust the canvas size when the document has loaded.
		app.respondCanvas();
	});
};

/**
 * Adjust the canvas dimensions based on its container's dimensions.
 */
app.respondCanvas = function()
{
	var canvas = $('#canvas')
	var container = $(canvas).parent()
	canvas.attr('width', $(container).width() ) // Max width
	// Not used: canvas.attr('height', $(container).height() ) // Max height
};

app.onDeviceReady = function()
{
	app.showInfo('Activate the SensorTag and tap Start.');
};

app.showInfo = function(info)
{
	document.getElementById('info').innerHTML = info;
};

app.onStartButton = function()
{
	app.onStopButton();
	app.startScan();
	app.showInfo('Status: Scanning...');
	app.startConnectTimer();
};

app.onStopButton = function()
{
	// Stop any ongoing scan and close devices.
	app.stopConnectTimer();
	evothings.easyble.stopScan();
	evothings.easyble.closeConnectedDevices();
	app.showInfo('Status: Stopped.');
};

app.startConnectTimer = function()
{
	// If connection is not made within the timeout
	// period, an error message is shown.
	app.connectTimer = setTimeout(
		function()
		{
			app.showInfo('Status: Scanning... ' +
				'Please press the activate button on the tag.');
		},
		app.CONNECT_TIMEOUT)
}

app.stopConnectTimer = function()
{
	clearTimeout(app.connectTimer);
}

app.startScan = function()
{
	evothings.easyble.reportDeviceOnce(true);
	evothings.easyble.startScan(
		function(device)
		{
			// Connect if we have found a sensor tag.
			if (app.deviceIsSensorTag(device))
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
};

app.deviceIsSensorTag = function(device)
{
	console.log('device name: ' + device.name);
	return (device != null) &&
		(device.name != null) &&
		(device.name.indexOf('Sensor Tag') > -1 ||
			device.name.indexOf('SensorTag') > -1);
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
			app.showInfo('Status: Connected - reading SensorTag services...');
			app.readServices(device);
		},
		function(errorCode)
		{
			app.showInfo('Connection error: ' + errorCode);
		});
};

app.readServices = function(device)
{
	device.readServices(
		[
		app.sensortag.ACCELEROMETER_SERVICE, // Accelerometer service UUID.
		app.sensortag.MAGNETOMETER_SERVICE,  // Magnetometer service UUID.
		],
		// Function that monitors accelerometer data.
		app.startAccelerometerNotification,
		// Use this function to monitor magnetometer data
		// (comment out the above line if you try this).
		//app.startMagnetometerNotification,
		function(errorCode)
		{
			console.log('Error: Failed to read services: ' + errorCode + '.');
		});
};

/**
 * Read accelerometer data.
 * http://processors.wiki.ti.com/index.php/SensorTag_User_Guide#Accelerometer_2
 * http://processors.wiki.ti.com/index.php/File:BLE_SensorTag_GATT_Server.pdf
 */
app.startAccelerometerNotification = function(device)
{
	app.showInfo('Status: Starting accelerometer notification...');

	// Set accelerometer configuration to ON.
	device.writeCharacteristic(
		app.sensortag.ACCELEROMETER_CONFIG,
		new Uint8Array([1]),
		function()
		{
			console.log('Status: writeCharacteristic ok.');
		},
		function(errorCode)
		{
			console.log('Error: writeCharacteristic: ' + errorCode + '.');
		});

	// Set accelerometer period to 100 ms.
	device.writeCharacteristic(
		app.sensortag.ACCELEROMETER_PERIOD ,
		new Uint8Array([10]),
		function()
		{
			console.log('Status: writeCharacteristic ok.');
		},
		function(errorCode)
		{
			console.log('Error: writeCharacteristic: ' + errorCode + '.');
		});

	// Set accelerometer notification to ON.
	device.writeDescriptor(
		app.sensortag.ACCELEROMETER_DATA,
		app.sensortag.ACCELEROMETER_NOTIFICATION, // Notification descriptor.
		new Uint8Array([1,0]),
		function()
		{
			console.log('Status: writeDescriptor ok.');
		},
		function(errorCode)
		{
			// This error will happen on iOS, since this descriptor is not
			// listed when requesting descriptors. On iOS you are not allowed
			// to use the configuration descriptor explicitly. It should be
			// safe to ignore this error.
			console.log('Error: writeDescriptor: ' + errorCode + '.');
		});

	// Start accelerometer notification.
	device.enableNotification(
		app.sensortag.ACCELEROMETER_DATA,
		function(data)
		{
			app.showInfo('Status: Data stream active - accelerometer');
			var dataArray = new Uint8Array(data);
			var values = app.getAccelerometerValues(dataArray);
			app.drawDiagram(values);
		},
		function(errorCode)
		{
			console.log('Error: enableNotification: ' + errorCode + '.');
		});
};

/**
 * Calculate accelerometer values from raw data for SensorTag 2.
 * @param data - an Uint8Array.
 * @return Object with fields: x, y, z.
 */
app.getAccelerometerValues = function(data)
{
	// TODO: Set divisor based on firmware version.
	var divisors = {x: 16.0, y: -16.0, z: 16.0}

	// Calculate accelerometer values.
	var ax = evothings.util.littleEndianToInt8(data, 0) / divisors.x;
	var ay = evothings.util.littleEndianToInt8(data, 1) / divisors.y;
	var az = evothings.util.littleEndianToInt8(data, 2) / divisors.z;

	// Return result.
	return { x: ax, y: ay, z: az };
};

/**
 * Read magnetometer data.
 * http://processors.wiki.ti.com/index.php/SensorTag_User_Guide#Magnetometer
 * http://processors.wiki.ti.com/index.php/File:BLE_SensorTag_GATT_Server.pdf
 */
app.startMagnetometerNotification = function(device)
{
	app.showInfo('Status: Starting magnetometer notification...');

	// Set magnetometer to ON.
	device.writeCharacteristic(
		app.sensortag.MAGNETOMETER_CONFIG,
		new Uint8Array([1]),
		function()
		{
			console.log('Status: writeCharacteristic 1 ok.');
		},
		function(errorCode)
		{
			console.log('Error: writeCharacteristic 1 error: ' + errorCode + '.');
		});

	// Set update period to 100 ms (10 == 100 ms).
	device.writeCharacteristic(
		app.sensortag.MAGNETOMETER_PERIOD,
		new Uint8Array([10]),
		function()
		{
			console.log('Status: writeCharacteristic 2 ok.');
		},
		function(errorCode)
		{
			console.log('Error: writeCharacteristic 2 error: ' + errorCode + '.');
		});

	// Set magnetometer notification to ON.
	device.writeDescriptor(
		app.sensortag.MAGNETOMETER_DATA,
		app.sensortag.MAGNETOMETER_NOTIFICATION, // Notification descriptor.
		new Uint8Array([1,0]),
		function()
		{
			console.log('Status: writeDescriptor ok.');
		},
		function(errorCode)
		{
			// This error will happen on iOS, since this descriptor is not
			// listed when requesting descriptors. On iOS you are not allowed
			// to use the configuration descriptor explicitly. It should be
			// safe to ignore this error.
			console.log('Error: writeDescriptor: ' + errorCode + '.');
		});

	// Start notification of magnetometer data.
	device.enableNotification(
		app.sensortag.MAGNETOMETER_DATA,
		function(data)
		{
			app.showInfo('Status: Data stream active - magnetometer');
			var dataArray = new Uint8Array(data);
			var values = app.getMagnetometerValues(dataArray);
			app.drawDiagram(normalizeMagnetometerValues(values));
		},
		function(errorCode)
		{
			console.log('Error: enableNotification: ' + errorCode + '.');
		});

	// Value used to normalize magnetometer values.
	magnetometerMax = 0;

	function normalizeMagnetometerValues(values)
	{
		magnetometerMax = Math.max(Math.abs(values.x), magnetometerMax);
		magnetometerMax = Math.max(Math.abs(values.y), magnetometerMax);
		magnetometerMax = Math.max(Math.abs(values.z), magnetometerMax);

		return {
			x: values.x / magnetometerMax,
			y: values.y / magnetometerMax,
			z: values.z / magnetometerMax
			};
	}
};

/**
 * Calculate magnetometer values from raw data.
 * @param data - an Uint8Array.
 * @return Object with fields: x, y, z.
 * @instance
 * @public
 */
app.getMagnetometerValues = function(data)
{
	// Magnetometer values (Micro Tesla).
	var mx = evothings.util.littleEndianToInt16(data, 0) * (2000.0 / 65536.0) * -1;
	var my = evothings.util.littleEndianToInt16(data, 2) * (2000.0 / 65536.0) * -1;
	var mz = evothings.util.littleEndianToInt16(data, 4) * (2000.0 / 65536.0);

	// Return result.
	return { x: mx, y: my, z: mz };
};

/**
 * Plot diagram of sensor values.
 * Values plotted are expected to be between -1 and 1
 * and in the form of objects with fields x, y, z.
 */
app.drawDiagram = function(values)
{
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');

	// Add recent values.
	app.dataPoints.push(values);

	// Remove data points that do not fit the canvas.
	if (app.dataPoints.length > canvas.width)
	{
		app.dataPoints.splice(0, (app.dataPoints.length - canvas.width));
	}

	// Value is an accelerometer reading between -1 and 1.
	function calcDiagramY(value)
	{
		// Return Y coordinate for this value.
		var diagramY =
			((value * canvas.height) / 2)
			+ (canvas.height / 2);
		return diagramY;
	}

	function drawLine(axis, color)
	{
		context.strokeStyle = color;
		context.beginPath();
		var lastDiagramY = calcDiagramY(
			app.dataPoints[app.dataPoints.length-1][axis]);
		context.moveTo(0, lastDiagramY);
		var x = 1;
		for (var i = app.dataPoints.length - 2; i >= 0; i--)
		{
			var y = calcDiagramY(app.dataPoints[i][axis]);
			context.lineTo(x, y);
			x++;
		}
		context.stroke();
	}

	// Clear background.
	context.clearRect(0, 0, canvas.width, canvas.height);

	// Draw lines.
	drawLine('x', '#f00');
	drawLine('y', '#0f0');
	drawLine('z', '#00f');
};

// Initialize the app.
app.initialize();
