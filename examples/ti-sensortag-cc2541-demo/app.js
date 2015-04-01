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
	//canvas.attr('height', $(container).height() ) // Max height
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
	return (device != null) &&
		(device.name != null) &&
		(device.name.indexOf('Sensor Tag') > -1 ||
			device.name.indexOf('SensorTag') > -1);
};

// Read services for a device.
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
			app.showInfo('Error: Connection failed: ' + errorCode + '.');
			evothings.ble.reset();
			// This can cause an infinite loop...
			//app.connectToDevice(device);
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

// Read accelerometer data.
// http://processors.wiki.ti.com/index.php/SensorTag_User_Guide#Accelerometer_2
// http://processors.wiki.ti.com/index.php/File:BLE_SensorTag_GATT_Server.pdf
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
		app.sensortag.ACCELEROMETER_NOTIFICATION, // Configuration descriptor
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
			var dataArray = new Int8Array(data);
			app.drawLines(dataArray, 100);
		},
		function(errorCode)
		{
			console.log('Error: enableNotification: ' + errorCode + '.');
		});
};

// Read magnetometer data.
// http://processors.wiki.ti.com/index.php/SensorTag_User_Guide#Magnetometer
// http://processors.wiki.ti.com/index.php/File:BLE_SensorTag_GATT_Server.pdf
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
			//console.log('byteLength: '+data.byteLength);
			var dataArray = new Int16Array(data);
			//console.log('length: '+dataArray.length);
			//console.log('data: '+dataArray[0]+' '+dataArray[1]+' '+dataArray[2]);
			app.drawLines(dataArray, 3000);
		},
		function(errorCode)
		{
			console.log('Error: enableNotification: ' + errorCode + '.');
		});
};

// The magnitude param controls how sensitive the plotting
// of data should be.
app.drawLines = function(dataArray, magnitude)
{
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');
	var dataPoints = app.dataPoints;

	// Initialize (static) maximum detected Y value.
	this.magnitude = this.magnitude || 0;

	if (magnitude > this.magnitude)
		this.magnitude = magnitude;

	// Add recent data.
	dataPoints.push(dataArray);
	if (dataPoints.length > canvas.width)
	{
		dataPoints.splice(0, (dataPoints.length - canvas.width));
	}

	var drawLines = this; // Reference to app.drawLines instance.
	function calcY(i)
	{
		if (Math.abs(i) > drawLines.magnitude)
			drawLines.magnitude = Math.abs(i);
		return ((i * canvas.height) / (drawLines.magnitude * 2)) + (canvas.height / 2);
	}

	function drawLine(offset, color)
	{
		context.strokeStyle = color;
		context.beginPath();
		context.moveTo(0, calcY(dataPoints[dataPoints.length-1][offset]));
		var x = 1;
		for (var i = dataPoints.length-2; i >= 0; i--)
		{
			var y = calcY(dataPoints[i][offset]);
			context.lineTo(x, y);
			x++;
		}
		context.stroke();
	}

	// Clear background.
	context.clearRect(0, 0, canvas.width, canvas.height);

	// Draw lines.
	drawLine(0, '#f00');
	drawLine(1, '#0f0');
	drawLine(2, '#00f');
};

// Initialize the app.
app.initialize();
