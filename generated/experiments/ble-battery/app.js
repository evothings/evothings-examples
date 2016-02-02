// JavaScript code for the app.

// Object that holds application data and functions.
var app = {};

// Data that is plotted on the canvas.
app.dataPoints = [];

// Initialise the application.
app.initialize = function()
{
	document.addEventListener('deviceready', app.onDeviceReady, false);
};

app.testCanvas = function() {
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');

	context.strokeStyle = '#f00';
	context.beginPath();
	context.moveTo(0, 0);
	context.lineTo(100, 100);
	context.stroke();
};

app.onDeviceReady = function()
{
	app.showInfo('Activate the SensorTag and tap Start');
	//app.testCanvas();
	app.onStartButton();
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
		'0000180f-0000-1000-8000-00805f9b34fb', // Battery service UUID.
		],
		// Function that monitors battery data.
		app.startBatteryNotification,
		function(errorCode)
		{
			console.log('Error reading services: ' + errorCode);
		});
};

// Read battery data using a notification.
// https://developer.bluetooth.org/gatt/services/Pages/ServiceViewer.aspx?u=org.bluetooth.service.battery_service.xml
// https://developer.bluetooth.org/gatt/characteristics/Pages/CharacteristicViewer.aspx?u=org.bluetooth.characteristic.battery_level.xml
app.startBatteryNotification = function(device)
{
	app.showInfo('Starting battery notification');

	// Set battery notification to ON.
	device.writeDescriptor(
		'00002a19-0000-1000-8000-00805f9b34fb', // Characteristic for battery data
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

	// Start notification of battery data.
	app.readData(device);
	/*
	// Start notification of battery data.
	device.enableNotification(
		'00002a19-0000-1000-8000-00805f9b34fb',
		function(data)
		{
			app.showInfo('Data stream active - battery');
			console.log('byteLength: '+data.byteLength);
			var dataArray = new Uint8Array(data);
			console.log('length: '+dataArray.length);
			console.log('data: '+dataArray[0]);
			app.drawLines(dataArray, 100);
		},
		function(errorCode)
		{
			console.log('enableNotification error: ' + errorCode);
		});
	*/
};

app.counter = 0;
app.lastValue = -1;

app.readData = function(device) {
	device.readCharacteristic(
		'00002a19-0000-1000-8000-00805f9b34fb',
		function(data)
		{
			app.showInfo('found battery data - '+app.counter);
			//console.log('byteLength: '+data.byteLength);
			var dataArray = new Uint8Array(data);
			//console.log('length: '+dataArray.length);
			app.counter = app.counter + 1;
			var value = dataArray[0];
			if(value != app.lastValue) {
				console.log('data '+app.counter+': '+value);
				app.lastValue = value;
			}
			app.drawLines(dataArray, 120);
			setTimeout(app.readData, 100, device);
		},
		function(errorCode)
		{
			console.log('readCharacteristic error: ' + errorCode);
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
};

// Initialize the app.
app.initialize();
