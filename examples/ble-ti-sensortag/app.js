// JavaScript code for the BLE TI SensorTag example app.

// Object that holds application data and functions.
var app = {};

// Data that is plotted on the canvas.
app.dataPoints = [];

// Initialise the application.
app.initialize = function()
{
	document.addEventListener('deviceready', app.onDeviceReady, false);

	// Important reset BLE when page reloads/closes!
	window.addEventListener('beforeunload', function(e)
	{
		evothings.ble.reset();
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
	app.startScan();
};

app.onStopButton = function()
{
	// Reset BLE plugin.
	evothings.ble.reset();

	// Reset device.
	app.device = null;
};

app.startScan = function()
{
	easyble.startScan(
		function(deviceInfo)
		{
			app.showInfo('Device found:' + deviceInfo.name);

			// Connect if we have found a sensor tag.
			if (app.deviceIsSensorTag(deviceInfo))
			{
				easyble.stopScan();
				app.connectToDevice(deviceInfo);
			}
		},
		function(errorCode)
		{
			console.log('startScan error: ' + errorCode);
			//app.reset();
		});
};

app.deviceIsSensorTag = function(deviceInfo)
{
	return (deviceInfo != null) &&
		(deviceInfo.name != null) &&
		(deviceInfo.name.indexOf('Sensor Tag') > -1 ||
			deviceInfo.name.indexOf('SensorTag') > -1);
};

// Read services for a device.
app.connectToDevice = function(deviceInfo)
{
	deviceInfo.connectToDevice(
		app.checkServices,
		function(errorCode)
		{
			console.log('Connect error: ' + errorCode);
		});
};

app.checkServices = function(deviceInfo)
{
	deviceInfo.readServicesForDevice(
		function(deviceInfo)
		{
			deviceInfo.readCharacteristicsForServices(
				['f000aa10-0451-4000-b000-000000000000',
				 'f000aa30-0451-4000-b000-000000000000'],
				app.startMagnetometerNotification,
				//app.startAccelerometerNotification,
				function(errorCode)
				{
					console.log('Error reading characteristics: ' + errorCode);
				});
		},
		function(errorCode)
		{
			console.log('Error reading services: ' + errorCode);
		});
};

// Read magnetometer data using a notification.
// http://processors.wiki.ti.com/index.php/SensorTag_User_Guide#Magnetometer
app.startMagnetometerNotification = function(deviceInfo)
{
	//app.printObject(deviceInfo);

	// Set mag period to 100 ms.
	deviceInfo.writeCharacteristic(
		'f000aa33-0451-4000-b000-000000000000',
		new Uint8Array([10]));

	// Set mag conf to ON.
	deviceInfo.writeCharacteristic(
		'f000aa32-0451-4000-b000-000000000000',
		new Uint8Array([1]));

	// Causes crash on iOS, see this thread:
	// http://stackoverflow.com/questions/13561136/corebluetooth-writevaluefordescriptor-issue
	// Set mag notification to ON.
	deviceInfo.writeDescriptor(
		'00002902-0000-1000-8000-00805f9b34fb',
		new Uint8Array([1,0]));

	// Start notification of mag data.
	deviceInfo.enableNotification(
		'f000aa31-0451-4000-b000-000000000000',
		function(data)
		{
			//console.log('byteLength: '+data.byteLength);
			var dataArray = new Int16Array(data);
			//console.log('length: '+dataArray.length);
			//console.log('data: '+dataArray[0]+' '+dataArray[1]+' '+dataArray[2]);
			app.drawLines(dataArray);
		},
		function(errorCode)
		{
			console.log('enableNotification error: ' + errorCode);
		});
};

app.drawLines = function(dataArray)
{
	var canvas = document.getElementById('canvas');
	//if (!app.drawingContent)
	{
		app.drawingContext = canvas.getContext('2d');
	}

	var dataPoints = app.dataPoints;
	var context = app.drawingContext;

	dataPoints.push(dataArray);
	if (dataPoints.length > canvas.width)
	{
		dataPoints.splice(0, (dataPoints.length - canvas.width));
	}

	context.clearRect(0, 0, canvas.width, canvas.height);
	//console.log(canvas.width+' '+canvas.height);

	var magnitude = 5000;

	function calcY(i)
	{
		return ((i * canvas.height) / (magnitude*2)) + (canvas.height / 2);
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
			//console.log(i+': '+x+' '+y);
			context.lineTo(x, y);
			x++;
		}
		context.stroke();
	}

	drawLine(0, '#f00');
	drawLine(1, '#0f0');
	drawLine(2, '#00f');
};

// Initialize the app.
app.initialize();

/*
// If you would want to read accelerometer data, here is a function for that.
// http://processors.wiki.ti.com/index.php/SensorTag_User_Guide#Accelerometer_2
app.startAccelerometerNotification = function(deviceInfo)
{
	//app.printObject(deviceInfo);

	// Set accelerometer configuration to ON.
	deviceInfo.writeCharacteristic(
		'f000aa12-0451-4000-b000-000000000000',
		new Uint8Array([1]));

	// Set accelerometer period to 100 ms.
	deviceInfo.writeCharacteristic(
		'f000aa13-0451-4000-b000-000000000000',
		new Uint8Array([10]));

	// Causes crash on iOS, see this thread:
	// http://stackoverflow.com/questions/13561136/corebluetooth-writevaluefordescriptor-issue
	// Set mag notification to ON.
	deviceInfo.writeDescriptor(
		'00002902-0000-1000-8000-00805f9b34fb',
		new Uint8Array([1,0]));

	// Start accelerometer notification.
	deviceInfo.enableNotification(
		'f000aa11-0451-4000-b000-000000000000',
		function(data)
		{
			//console.log('byteLength: '+data.byteLength);
			var dataArray = new Int8Array(data);
			//console.log('length: '+dataArray.length);
			console.log('data: '+dataArray[0]+' '+dataArray[1]+' '+dataArray[2]);
			app.drawLines(dataArray);
		},
		function(errorCode)
		{
			console.log('enableNotification error: ' + errorCode);
		});
};
*/
