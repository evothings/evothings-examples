;(function()
{
	// Connected device.
	var myDevice = null;
	
	// Descriptive name for constant value.
	var DONT_REPORT_DUPLICATES = false;

	var LED_SERVICE = '19b10000-e8f2-537e-4f6c-d104768a1214';
	var LED_ONOFF_CHARACTERISTIC = '19b10001-e8f2-537e-4f6c-d104768a1214';
	
	var ledOnOffCharacteristic = null;
	
	function onConnect()
	{
		bleat.startScan(
			onDeviceFound,
			onScanStarted,
			onError,
			DONT_REPORT_DUPLICATES
		);
	};

	function onScanStarted() 
	{
		showMessage('Scan started');
	}
	
	function onDeviceFound(device) 
	{
		// Is this the Arduino 101?
		if (device.name == 'LED')
		{	
			showMessage('Connecting...');
			
			// Save reference to device.
			myDevice = device;
			
			// Connect.
			device.connect(onConnected, onDisconnected, onError);
		}
	}
		
	function onConnected(device)
	{
		var service = myDevice.services[LED_SERVICE];
		if (service)
		{
			ledOnOffCharacteristic = service.characteristics[LED_ONOFF_CHARACTERISTIC];
			if (ledOnOffCharacteristic)
			{
				showMessage('Connected! Touch buttons to turn LED on/off.');
			}
		}
	}
	
	function onDisconnected()
	{
		showMessage('Device disconnected');
		ledOnOffCharacteristic = null;
	}
	
	function onError(error)
	{
		showMessage(error);
		ledOnOffCharacteristic = null;
	}
	
	// Turn on LED.
	function onLedOn()
	{
	console.log('connected: ' + myDevice.isConnected())
		if (ledOnOffCharacteristic)
			ledOnOffCharacteristic.write(new Uint8Array([1]));
	}

	// Turn off LED.
	function onLedOff()
	{
		if (ledOnOffCharacteristic)
			ledOnOffCharacteristic.write(new Uint8Array([0]));
	}

	function showMessage(info)
	{
		$('#info').text(info);
	}

	// Called when BLE and other native functions are available.
	function onDeviceReady()
	{
		showMessage('Touch the connect button to begin.');
	}
	
	function main()
	{
		document.addEventListener('deviceready', onDeviceReady, false);
		$('#connect').on('click', onConnect);
		$('#ledOn').on('click', onLedOn);
		$('#ledOff').on('click', onLedOff);
	}
	
	main();
})();
