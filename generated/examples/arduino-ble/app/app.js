// JavaScript code for the Arduino BLE example app.

/**
 * The BLE plugin is loaded asynchronously so the ble
 * variable is set in the onDeviceReady handler.
 */
var ble = null;

/**
 * Called when HTML page has been loaded.
 */
$(document).ready( function()
{
	// Adjust canvas size when browser resizes
	$(window).resize( respondCanvas );

	// Adjust the canvas size when the document has loaded.
	respondCanvas();
});

/**
 * Adjust the canvas dimensions based on its container's dimensions.
 */
function respondCanvas()
{
	var canvas = $('#canvas');
	var container = $(canvas).parent();
	canvas.attr('width', $(container).width() ); // Max width
	//canvas.attr('height', $(container).height() ); // Max height
}

/**
 * Application object that holds data and functions used by the app.
 */
var app =
{
	// Discovered devices.
	knownDevices: {},

	// Reference to the device we are connecting to.
	connectee: null,

	// Handle to the connected device.
	deviceHandle: null,

	// Handles to characteristics and descriptor for reading and
	// writing data from/to the Arduino using the BLE shield.
	characteristicRead: null,
	characteristicWrite: null,
	descriptorNotification: null,

	// Data that is plotted on the canvas.
	dataPoints: [],

	initialize: function()
	{
		document.addEventListener(
			'deviceready',
			function() { evothings.scriptsLoaded(app.onDeviceReady) },
			false);
	},

	displayStatus: function(status)
	{
		if(document.getElementById('status').innerHTML == status)
			return;
		console.log('Status: '+status);
		document.getElementById('status').innerHTML = status
	},

	// Called when device plugin functions are ready for use.
	onDeviceReady: function()
	{
		ble = evothings.ble; // Evothings BLE plugin

		app.startScan();
	},

	startScan: function()
	{
		app.displayStatus('Scanning...');
		evothings.ble.startScan(
			function(deviceInfo)
			{
				if (app.knownDevices[deviceInfo.address])
				{
					return;
				}
				console.log('found device: ' + deviceInfo.name);
				app.knownDevices[deviceInfo.address] = deviceInfo;
				if (deviceInfo.name == 'arduinoble' && !app.connectee)
				{
					console.log('Found arduinoble');
					connectee = deviceInfo;
					app.connect(deviceInfo.address);
				}
			},
			function(errorCode)
			{
				app.displayStatus('startScan error: ' + errorCode);
			});
	},

	connect: function(address)
	{
		evothings.ble.stopScan();
		app.displayStatus('Connecting...');
		evothings.ble.connect(
			address,
			function(connectInfo)
			{
				if (connectInfo.state == 2) // Connected
				{
					app.deviceHandle = connectInfo.deviceHandle;
					app.getServices(connectInfo.deviceHandle);
				}
				else
				{
					app.displayStatus('Disconnected');
				}
			},
			function(errorCode)
			{
				app.displayStatus('connect error: ' + errorCode);
			});
	},

	on: function()
	{
		app.write(
			'writeCharacteristic',
			app.deviceHandle,
			app.characteristicWrite,
			new Uint8Array([1])); // 1 = on
	},

	off: function()
	{
		app.write(
			'writeCharacteristic',
			app.deviceHandle,
			app.characteristicWrite,
			new Uint8Array([0])); // 0 = off
	},

	write: function(writeFunc, deviceHandle, handle, value)
	{
		if (handle)
		{
			ble[writeFunc](
				deviceHandle,
				handle,
				value,
				function()
				{
					console.log(writeFunc + ': ' + handle + ' success.');
				},
				function(errorCode)
				{
					console.log(writeFunc + ': ' + handle + ' error: ' + errorCode);
				});
		}
	},

	startReading: function(deviceHandle)
	{
		app.displayStatus('Enabling notifications...');

		// Turn notifications on.
		app.write(
			'writeDescriptor',
			deviceHandle,
			app.descriptorNotification,
			new Uint8Array([1,0]));

		// Start reading notifications.
		evothings.ble.enableNotification(
			deviceHandle,
			app.characteristicRead,
			function(data)
			{
				app.displayStatus('Active');
				app.drawLines([new DataView(data).getUint16(0, true)]);
			},
			function(errorCode)
			{
				app.displayStatus('enableNotification error: ' + errorCode);
			});
	},

	drawLines: function(dataArray)
	{
		var canvas = document.getElementById('canvas');
		var context = canvas.getContext('2d');
		var dataPoints = app.dataPoints;

		dataPoints.push(dataArray);
		if (dataPoints.length > canvas.width)
		{
			dataPoints.splice(0, (dataPoints.length - canvas.width));
		}

		var magnitude = 1024;

		function calcY(i)
		{
			return (i * canvas.height) / magnitude;
		}

		function drawLine(offset, color)
		{
			context.strokeStyle = color;
			context.beginPath();
			context.moveTo(0, calcY(dataPoints[dataPoints.length-1][offset]));
			var x = 1;
			for (var i = dataPoints.length - 2; i >= 0; i--)
			{
				var y = calcY(dataPoints[i][offset]);
				context.lineTo(x, y);
				x++;
			}
			context.stroke();
		}

		context.clearRect(0, 0, canvas.width, canvas.height);
		drawLine(0, '#f00');
	},

	getServices: function(deviceHandle)
	{
		app.displayStatus('Reading services...');

		evothings.ble.readAllServiceData(deviceHandle, function(services)
		{
			// Find handles for characteristics and descriptor needed.
			for (var si in services)
			{
				var service = services[si];

				for (var ci in service.characteristics)
				{
					var characteristic = service.characteristics[ci];

					if (characteristic.uuid == '713d0002-503e-4c75-ba94-3148f18d941e')
					{
						app.characteristicRead = characteristic.handle;
					}
					else if (characteristic.uuid == '713d0003-503e-4c75-ba94-3148f18d941e')
					{
						app.characteristicWrite = characteristic.handle;
					}

					for (var di in characteristic.descriptors)
					{
						var descriptor = characteristic.descriptors[di];

						if (characteristic.uuid == '713d0002-503e-4c75-ba94-3148f18d941e' &&
							descriptor.uuid == '00002902-0000-1000-8000-00805f9b34fb')
						{
							app.descriptorNotification = descriptor.handle;
						}
					}
				}
			}

			if (app.characteristicRead && app.characteristicWrite && app.descriptorNotification)
			{
				console.log('RX/TX services found.');
				app.startReading(deviceHandle);
			}
			else
			{
				app.displayStatus('ERROR: RX/TX services not found!');
			}
		},
		function(errorCode)
		{
			app.displayStatus('readAllServiceData error: ' + errorCode);
		});
	},

	openBrowser: function(url)
	{
		window.open(url, '_system', 'location=yes')
	}
};
// End of app object.

// Initialise app.
app.initialize();
