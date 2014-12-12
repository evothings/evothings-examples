//
// Copyright 2014, Evothings AB
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// LightBlue Bean - Basic
// version: 1.0 - 2014-10-28
//
// This implementation makes it possible to connect to a LightBlue Bean
// and control the LED. It also fetches the temperature from the board.
//
// The LightBlue Bean needs to run the arduino sketch example named
// LightBlue Bean - Basic

document.addEventListener('deviceready', function() { app.initialize() }, false);

var app = {};

app.UUID_SCRATCHSERVICE = 'a495ff20-c5b1-4b44-b512-1370f02d74de';

app.getScratchCharacteristicUUID = function(scratchNumber)
{
	return ['a495ff21-c5b1-4b44-b512-1370f02d74de',
		'a495ff22-c5b1-4b44-b512-1370f02d74de',
		'a495ff23-c5b1-4b44-b512-1370f02d74de',
		'a495ff24-c5b1-4b44-b512-1370f02d74de',
		'a495ff25-c5b1-4b44-b512-1370f02d74de'][scratchNumber - 1];
};

app.initialize = function()
{
	app.connected = false;
};

app.deviceIsLightBlueBeanWithBleId = function(device, bleId)
{
	return ((device != null) && (device.name != null) && (device.name == bleId));
};

app.connect = function(user)
{
	var BLEId = document.getElementById('BLEId').value;

	app.showInfo('Trying to connect to "' + BLEId + '"');

	app.disconnect(user);

	function onScanSuccess(device)
	{
		function onConnectSuccess(device)
		{
			function onServiceSuccess(device)
			{
				// Update user interface
				app.showInfo('Connected to <i>' + BLEId + '</i>');
				document.getElementById('BLEButton').innerHTML = 'Disconnect';
				document.getElementById('BLEButton').onclick = new Function('app.disconnect()');
				document.getElementById('ledControl').style.display = 'block';
				document.getElementById('temperatureDisplay').style.display = 'block';

				// Application is now connected
				app.connected = true;
				app.device = device;

				// Fetch current LED values.
				app.synchronizeLeds();

				// Create an interval timer to periocally read temperature.
				app.interval = setInterval(function() { app.readTemperature(); }, 500);
			}

			function onServiceFailure(errorCode)
			{
				// Show an error message to the user
				app.showInfo('Error reading services: ' + errorCode);
			}

			// Connect to the appropriate BLE service
			device.readServices(
				[app.UUID_SCRATCHSERVICE],
				onServiceSuccess,
				onServiceFailure);
		};

		function onConnectFailure(errorCode)
		{
			// Show an error message to the user
			app.showInfo('Error ' + errorCode);
		}

		console.log('Found device: ' + device.name);

		// Connect if we have found a LightBlue Bean with the name from input (BLEId)
		var found= app.deviceIsLightBlueBeanWithBleId(
			device,
			document.getElementById('BLEId').value);
		if (found)
		{
			// Update user interface
			app.showInfo('Found "' + device.name + '"');

			// Stop scanning
			evothings.easyble.stopScan();

			// Connect to our device
			app.showInfo('Identifying service for communication');
			device.connect(onConnectSuccess, onConnectFailure);
		}
	}

	function onScanFailure(errorCode)
	{
		// Show an error message to the user
		app.showInfo('Error: ' + errorCode);
		evothings.easyble.stopScan();
	}

	// Update the user interface
	app.showInfo('Scanning...');

	// Start scanning for devices
	evothings.easyble.startScan(onScanSuccess, onScanFailure);
};

app.disconnect = function(user)
{
	// If timer configured, clear.
	if (app.interval)
	{
		clearInterval(app.interval);
	}

	app.connected = false;
	app.device = null;

	// Hide user inteface
	document.getElementById('ledControl').style.display = 'none';
	document.getElementById('temperatureDisplay').style.display = 'none';

	// Stop any ongoing scan and close devices.
	evothings.easyble.stopScan();
	evothings.easyble.closeConnectedDevices();

	// Update user interface
	app.showInfo('Not connected');
	document.getElementById('BLEButton').innerHTML = 'Connect';
	document.getElementById('BLEButton').onclick = new Function('app.connect()');
};

app.readTemperature = function()
{
	function onDataReadSuccess(data)
	{
		var temperatureData = new Uint8Array(data);
		var temperature = temperatureData[0];
		console.log('Temperature read: ' + temperature + ' C');
		document.getElementById('temperature').innerHTML = temperature;
	}

	function onDataReadFailure(errorCode)
	{
		console.log('Failed to read temperature with error: ' + errorCode);
		app.disconnect();
	}

	app.readDataFromScratch(2, onDataReadSuccess, onDataReadFailure);
};

app.synchronizeLeds = function()
{
	function onDataReadSuccess(data)
	{
		var ledData = new Uint8Array(data);

		document.getElementById('redLed').value = ledData[0];
		document.getElementById('greenLed').value = ledData[1];
		document.getElementById('blueLed').value = ledData[2];

		console.log('Led synchronized.');
	}

	function onDataReadFailure(errorCode)
	{
		console.log('Failed to synchronize leds with error: ' + errorCode);
		app.disconnect();
	}

	app.readDataFromScratch(1, onDataReadSuccess, onDataReadFailure);
};

app.sendLedUpdate = function()
{
	if (app.connected)
	{
		// Fetch LED values from UI
		redLed = document.getElementById('redLed').value;
		greenLed = document.getElementById('greenLed').value;
		blueLed = document.getElementById('blueLed').value;

		// Print out fetched LED values
		console.log('redLed: ' + redLed + ', greenLed: ' + greenLed + ', blueLed: ' + blueLed);

		// Create packet to send
		data = new Uint8Array([redLed, greenLed, blueLed]);

		// Callbacks
		function onDataWriteSuccess()
		{
			console.log('Succeded to write data.');
		}

		function onDataWriteFailure(errorCode)
		{
			console.log('Failed to write data with error: ' + errorCode);
			app.disconnect();
		};

		app.writeDataToScratch(1, data, onDataWriteSuccess, onDataWriteFailure);
	}
	else
	{
		redLed = document.getElementById('redLed').value = 0;
		greenLed = document.getElementById('greenLed').value = 0;
		blueLed = document.getElementById('blueLed').value = 0;
	}
};

app.writeDataToScratch = function(scratchNumber, data, succesCallback, failCallback)
{
	if (app.connected)
	{
		console.log('Trying to write data to scratch ' + scratchNumber);
		app.device.writeCharacteristic(
			app.getScratchCharacteristicUUID(scratchNumber),
			data,
			succesCallback,
			failCallback);
	}
	else
	{
		console.log('Not connected to device, cant write data to scratch.');
	}
};

app.readDataFromScratch = function(scratchNumber, successCallback, failCallback)
{
	if (app.connected)
	{
		console.log('Trying to read data from scratch ' + scratchNumber);
		app.device.readCharacteristic(
			app.getScratchCharacteristicUUID(scratchNumber),
			successCallback,
			failCallback);
	}
	else
	{
		console.log('Not connected to device, cant read data from scratch.');
	}
};

app.showInfo = function(info)
{
	console.log(info);
	document.getElementById('BLEStatus').innerHTML = info;
};
