// JavaScript code for the BLE TI SensorTag example app.

// Object that holds application data and functions.
var app = {};

// Data that is plotted on the canvas.
app.dataPoints = [];

// Initialise the application.
app.initialize = function()
{
	document.addEventListener('deviceready', app.onDeviceReady, false);

	// Important close devices or reset BLE when page reloads!
	window.hyper && window.hyper.onReload(function()
	{
		app.onStopButton();

		// Alternatively reset BLE, this takes some
		// time on Android, but might be needed.
		//evothings.ble.reset();
	});
};

app.onDeviceReady = function()
{
	app.showInfo('Activate the SensorTag and tap Start');
};

app.showInfo = function(info)
{
	document.getElementById('info').innerHTML = info;
};

app.onStartButton = function()
{
	app.onStopButton();
	app.startScan();
	app.showInfo('Starting');
};

app.onStopButton = function()
{
	// Stop any ongoing scan and close devices.
	easyble.stopScan();
	easyble.closeConnectedDevices();
	app.showInfo('Stopped');
};

app.startScan = function()
{
	easyble.startScan(
		function(device)
		{
			// Connect if we have found a sensor tag.
			if (app.deviceIsSensorTag(device))
			{
				app.showInfo('Device found: ' + device.name);
				easyble.stopScan();
				app.connectToDevice(device);
			}
		},
		function(errorCode)
		{
			app.showInfo('startScan error: ' + errorCode);
			//app.reset();
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
	device.connect(
		function(device)
		{
			app.showInfo('Connected - reading SensorTag services');
			app.readServices(device);
		},
		function(errorCode)
		{
			app.showInfo('Connect error: ' + errorCode);
			evothings.ble.reset();
			// This can cause an infinite loop...
			//app.connectToDevice(device);
		});
};

app.readServices = function(device)
{
	device.readServices(
		[
		'f000aa10-0451-4000-b000-000000000000', // Accelerometer service UUID.
		'f000aa30-0451-4000-b000-000000000000'  // Magnetometer service UUID.
		],
		// Function that monitors magnetometer data.
		app.startMagnetometerNotification,
		// Use this function to monitor accelerometer data
		// (comment out the above line if you try this).
		//app.startAccelerometerNotification,
		function(errorCode)
		{
			console.log('Error reading services: ' + errorCode);
		});
};

// Read magnetometer data using a notification.
// http://processors.wiki.ti.com/index.php/SensorTag_User_Guide#Magnetometer
// http://processors.wiki.ti.com/index.php/File:BLE_SensorTag_GATT_Server.pdf
app.startMagnetometerNotification = function(device)
{
	app.showInfo('Starting notification');

	// Set magnetometer to ON.
	device.writeCharacteristic(
		'f000aa32-0451-4000-b000-000000000000',
		new Uint8Array([1]),
		function()
		{
			console.log('writeCharacteristic 1 ok');
		},
		function(errorCode)
		{
			console.log('writeCharacteristic 1 error: ' + errorCode);
		});

	// Set update period to 100 ms (10 == 100 ms).
	device.writeCharacteristic(
		'f000aa33-0451-4000-b000-000000000000',
		new Uint8Array([10]),
		function()
		{
			console.log('writeCharacteristic 2 ok');
		},
		function(errorCode)
		{
			console.log('writeCharacteristic 2 error: ' + errorCode);
		});

	// Set magnetometer notification to ON.
	device.writeDescriptor(
		'f000aa31-0451-4000-b000-000000000000', // Characteristic for magnetometer data
		'00002902-0000-1000-8000-00805f9b34fb', // Configuration descriptor
		new Uint8Array([1,0]),
		function()
		{
			console.log('writeDescriptor ok');
		},
		function(errorCode)
		{
			// This error will happen on iOS, since this descriptor is not
			// listed when requesting descriptors. On iOS you are not allowed
			// to use the configuration descriptor explicitly. It should be
			// safe to ignore this error.
			console.log('writeDescriptor error: ' + errorCode);
		});

	// Start notification of magnetometer data.
	device.enableNotification(
		'f000aa31-0451-4000-b000-000000000000',
		function(data)
		{
			//console.log('byteLength: '+data.byteLength);
			var dataArray = new Int16Array(data);
			//console.log('length: '+dataArray.length);
			//console.log('data: '+dataArray[0]+' '+dataArray[1]+' '+dataArray[2]);
			app.drawLines(dataArray, 3000);
		},
		function(errorCode)
		{
			console.log('enableNotification error: ' + errorCode);
		});
};

// The magnitude param controls how sensitive the plotting
// of data should be.
app.drawLines = function(dataArray, magnitude)
{
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');
	var dataPoints = app.dataPoints;

	// Add recent data.
	dataPoints.push(dataArray);
	if (dataPoints.length > canvas.width)
	{
		dataPoints.splice(0, (dataPoints.length - canvas.width));
	}

	function calcY(i)
	{
		return ((i * canvas.height) / (magnitude * 2)) + (canvas.height / 2);
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

// If you would want to read accelerometer data, here is a function for that.
// http://processors.wiki.ti.com/index.php/SensorTag_User_Guide#Accelerometer_2
// http://processors.wiki.ti.com/index.php/File:BLE_SensorTag_GATT_Server.pdf
app.startAccelerometerNotification = function(device)
{
	app.showInfo('Starting notification');

	// Set accelerometer configuration to ON.
	device.writeCharacteristic(
		'f000aa12-0451-4000-b000-000000000000',
		new Uint8Array([1]));

	// Set accelerometer period to 100 ms.
	device.writeCharacteristic(
		'f000aa13-0451-4000-b000-000000000000',
		new Uint8Array([10]));

	// Set accelerometer notification to ON.
	device.writeDescriptor(
		'f000aa11-0451-4000-b000-000000000000', // Characteristic for accelerometer data
		'00002902-0000-1000-8000-00805f9b34fb', // Configuration descriptor
		new Uint8Array([1,0]));

	// Start accelerometer notification.
	device.enableNotification(
		'f000aa11-0451-4000-b000-000000000000',
		function(data)
		{
			//console.log('byteLength: '+data.byteLength);
			var dataArray = new Int8Array(data);
			//console.log('length: '+dataArray.length);
			//console.log('data: '+dataArray[0]+' '+dataArray[1]+' '+dataArray[2]);
			app.drawLines(dataArray, 100);
		},
		function(errorCode)
		{
			console.log('enableNotification error: ' + errorCode);
		});
};
