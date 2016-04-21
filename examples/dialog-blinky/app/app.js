var app = (function()
{
	// Application object
	var app = {};

	// Discovered devices
	var devices = {};

	// Reference to the device we are connecting to
	var connectee = null;

	// Handle to the connected device
	var deviceHandle = null;

	// Variables used to control the LED
	var blinkSpeedVal = 50;
	var ledStatus = 0;

	// Store characteristics as UUID/Characteristic map
	var characteristics = {};

	// Timer that updates the device list and removes inactive
	// devices in case no devices are found by scan.
	var updateTimer = null;

	// UUID's used to control the button & LED
	var SERVICE_UUID	= 'edfec62e-9910-0bac-5241-d8bda6932a2f';
	var CHAR_LED 	= '5a87b4ef-3bfa-76a8-e642-92933c31434f';
	var CHAR_BLINK 	= '8b7f8ebb-661d-c594-e511-4dd564cbb0d8';
	var CHAR_BUTTON = '6c290d2e-1c03-aca1-ab48-a9b908bae79e';
	var NOTIFICATION_DESCRIPTOR	= '00002902-0000-1000-8000-00805f9b34fb';

	var scanTime = 25000; // default scan time in ms

	// Wait for all libraries to have loaded
	app.initialize = function()
	{
		document.addEventListener(
			'deviceready',
			function() { evothings.scriptsLoaded(onDeviceReady) },
			false);
	};

	// Display a scan status message
	function displayConnectStatus(message)
	{
		console.log(message);
		document.getElementById('scan-status').innerHTML = message;
	};

	function onDeviceReady()
	{
		window.location = '#';
	};

	// Called when Start Scan button is selected.
	app.onStartScanButton = function()
	{
		displayConnectStatus('Scanning for Bluetooth devices...');

		// Start scanning for devices.
		// If a device is found, set the timestamp and
		// insert the device into the array of devices
		evothings.easyble.startScan(
			function(device)
			{		
				// Set timestamp for device (this is used to remove
				// inactive devices).
				device.timeStamp = Date.now();

				// Insert the device into table of found devices.
				devices[device.address] = device;
			},
			function(error)
			{
				console.log('Scan error: ' + error);
			}
		);

		// Update the device list every 500ms
		updateTimer = setInterval(displayDeviceList, 500);

		// Automatically stop scanning after a certain time 
		setTimeout(
			function() 
			{
				evothings.easyble.stopScan();
				displayConnectStatus('Not Connected');
				clearInterval(updateTimer);
			}, 
			scanTime
		); 
	};

	// Called when Disconnect button is pressed.
	app.onDisconnectButton = function()
	{
		connectee.close(); // Disconnect device
		devices = {}; // Remove all previously found devices
		displayConnectStatus('Disconnected');
		displayDeviceList();

		window.location = '#'; // Return to 'home' screen
	};

	// Display the device list
	function displayDeviceList()
	{
		// Clear device list
		document.getElementById('found-devices').innerHTML = '';

		for(address in devices)
		{
			var device = devices[address];

			// Only show devices that are updated during the last 10 seconds
			if(device.timeStamp + 10000 > Date.now())
			{
				addDeviceToView(device);
			}
		}

	}

	function addDeviceToView(device)
	{
		var rssiWidth = 100; // Used when RSSI is zero or greater
		if (device.rssi < -100) { rssiWidth = 0; }
		else if (device.rssi < 0) { rssiWidth = 100 + device.rssi; }

		// Create tag for device data.
		var element = 
			'<li >'
			+	'<strong>' + device.name + '</strong> <br />'
			// Do not show address on iOS since it can be confused
			// with an iBeacon UUID.
			+	(evothings.os.isIOS() ? '' : device.address + '<br />')
			+	'<button onclick="app.connect(\'' + device.address + '\')" class="red">CONNECT</button> <br />'
			+ 	 device.rssi 
			+ 	'<div style="background:rgb(225,0,0);height:20px;width:'
			+ 		rssiWidth + '%;">'
			+ 	'</div>'
			+ '</li>';

		document.getElementById('found-devices').innerHTML += element;
	}

	
	app.connect = function(address) 
	{
		var device = devices[address];
		
		if(device === undefined)
		{
			return;
		}

		evothings.easyble.stopScan();

		displayConnectStatus('Connecting to: ' + device.name);

		connectee = device; // Store device for future use

		device.connect(
			function(success)
			{	
				displayConnectStatus('Connected to: ' + device.name);
				
				// No longer update the list of found devices
				clearInterval(updateTimer); 

				// Read service characteristics. When finished,
				// call enableButtonNotification
				device.readServices(
					[SERVICE_UUID],
					enableButtonNotification,
					function(error)
					{
						console.log('Error reading services: ' + error);
					}
				);
				window.location = '#connected';
			},
			function(error)
			{
				window.location = '#';
				displayConnectStatus('Connect error: '+ error);
			}
		);
	};

	function enableButtonNotification(device)
	{
		// Enable notifications
		device.writeServiceDescriptor(
			SERVICE_UUID,
			CHAR_BUTTON,
			NOTIFICATION_DESCRIPTOR,
			new Uint8Array([1, 0]),
			function() 
			{
				// success
			},
			function(error)
			{ 
				console.log('Error writing service descriptor: '  + error);
			}
		);
		
		// Start notifications
		device.enableServiceNotification(
			SERVICE_UUID,
			CHAR_BUTTON,
			function(data)
			{
				// Called every time new data is available.
				var bg = document.getElementById('connected');
				bg.style.backgroundColor = randomHexColor();
			},
			function(error)
			{
				console.log('Error enabling notification: ' + error);
			}
		);
	}

	// Called when Toggle button is pressed
	app.toggle = function() 
	{
		ledStatus = !ledStatus; // Invert LED (on/off)

	   	connectee.writeServiceCharacteristic(
	    	SERVICE_UUID,
	     	CHAR_LED,
	     	new Uint8Array([ledStatus]),
	     	function()
	     	{
	       		// success
	     	},
	     	function(error)
	     	{
	      		console.log('BLE write error (toggle): ' + error);
			}
		);
	};

	// Called when Blink button/slider is pressed
	app.blink = function(value)
	{	
		if(value != null)
		{
			blinkSpeedVal = 100 - value;
		}
		
	   	connectee.writeServiceCharacteristic(
	    	SERVICE_UUID,
	     	CHAR_BLINK,
	     	new Uint8Array([blinkSpeedVal]),
	     	function()
	     	{
	       		// success
	     	},
	     	function(error)
	     	{
	      		console.log('BLE write error (blink): ' + error);
			}
		);
		
	   	var el = document.getElementById('speed-status');
	   	el.innerHTML = ' LED speed ' + (100-blinkSpeedVal) + '%';
	};

	// Called when the Scan time slider is selected
	app.setScanTime = function(value)
	{
		scanTime = value * 1000; // we need time in ms

	   	var el = document.getElementById('scan-time');
	   	el.innerHTML = 'Bluetooth scan time: ' + value + ' seconds';
	};

	function randomHexColor()
	{
		var hex = (Math.random()*0xFFFFFF<<0).toString(16);
 		return '#'+ ('000000' + hex).slice(-6);
	}

	return app;

})();

// Initialise app.
app.initialize();
