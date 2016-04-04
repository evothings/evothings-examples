//
// Copyright 2016, Evothings AB
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
// C.H.I.P - System Information
// version: 0.1 - 2016-01-29
//

document.addEventListener(
	'deviceready',
	function() { evothings.scriptsLoaded(app.initialize) },
	false);

var app = {};

app.SYSTEMINFORMATIONSERVICE = 'ff51b30e-d7e2-4d93-8842-a7c4a57dfb07';

app.CHARACTERISTICS = {
						'ff51b30e-d7e2-4d93-8842-a7c4a57dfb08' : printMemory,
						'ff51b30e-d7e2-4d93-8842-a7c4a57dfb09' : printUptime,
						'ff51b30e-d7e2-4d93-8842-a7c4a57dfb10' : printLoadAverage
						};


app.initialize = function() {

	app.connected = false;
};

app.startScan = function() {

	app.disconnect();

	console.log('Scanning started...');

	app.devices = {};

	var htmlString =
		'<img src="img/loader_small.gif" style="display:inline; vertical-align:middle">' +
		'<p style="display:inline">   Scanning...</p>';

	$('#scanResultView').append($(htmlString));

	$('#scanResultView').show();

	function onScanSuccess(device) {

		if (device.name != null) {

			app.devices[device.address] = device;

			console.log('Found: ' + device.name + ', ' + device.address + ', ' + device.rssi);

			var htmlString =
				'<div class="deviceContainer" onclick="app.connectTo(\'' +
					device.address + '\')">' +
				'<p class="deviceName">' + device.name + '</p>' +
				'<p class="deviceAddress">' + device.address + '</p>' +
				'</div>';

			$('#scanResultView').append($(htmlString));
		}
	};

	function onScanFailure(errorCode) {

		// Show an error message to the user
		app.disconnect('Failed to scan for devices.');

		// Write debug information to console.
		console.log('Error ' + errorCode);
	};

	evothings.easyble.reportDeviceOnce(true);
	evothings.easyble.startScan(onScanSuccess, onScanFailure);

	$('#startView').hide();
};

app.receivedMessage = function(data) {

	if (app.connected) {

		// Convert data to String
		var message = String.fromCharCode.apply(null, new Uint8Array(data));

		// Update conversation
		app.updateConversation(message, true);

		console.log('Message received: ' + message);
	}
	else {

		// Disconnect and show an error message to the user.
		app.disconnect('Disconnected');

		// Write debug information to console
		console.log('Error - No device connected.');
	}
};


app.setLoadingLabel = function(message) {

	console.log(message);
	$('#loadingStatus').text(message);
};

app.connectTo = function(address) {

	device = app.devices[address];

	$('#loadingView').show();

	app.setLoadingLabel('Trying to connect to ' + device.name);

	function onConnectSuccess(device) {

		function onServiceSuccess(device) {

			// Application is now connected
			app.connected = true;
			app.device = device;

			console.log('Connected to ' + device.name);

			var htmlString = '<h2>' + device.name + '</h2>';

			$('#hostname').append($(htmlString));

			$('#scanResultView').hide();
			$('#loadingView').hide();
			$('#systemInformationView').show();

			Object.keys(app.CHARACTERISTICS).map(
				function(characteristic){

					device.readCharacteristic(
						characteristic,
						app.CHARACTERISTICS[characteristic],
						function(error){

							console.log('Error occured')
						});
			});
		}

		function onServiceFailure(errorCode) {

			// Disconnect and show an error message to the user.
			app.disconnect('Wrong device!');

			// Write debug information to console.
			console.log('Error reading services: ' + errorCode);
		}

		app.setLoadingLabel('Identifying services...');

		// Connect to the appropriate BLE service
		device.readServices(
			[app.SYSTEMINFORMATIONSERVICE],
			onServiceSuccess,
			onServiceFailure
		);
	}

	function onConnectFailure(errorCode) {

		app.disconnect('Disconnected from device');

		// Show an error message to the user
		console.log('Error ' + errorCode);
	}

	// Stop scanning
	evothings.easyble.stopScan();

	// Connect to our device
	console.log('Identifying service for communication');
	device.connect(onConnectSuccess, onConnectFailure);
};


app.disconnect = function(errorMessage) {

	if (errorMessage) {

		navigator.notification.alert(errorMessage, function() {});
	}

	app.connected = false;
	app.device = null;

	// Stop any ongoing scan and close devices.
	evothings.easyble.stopScan();
	evothings.easyble.closeConnectedDevices();

	console.log('Disconnected');

	$('#scanResultView').empty();
	$('#hostname').empty();
	$('#memory').empty();
	$('#uptime').empty();
	$('#loadaverage').empty();

	$('#loadingView').hide();
	$('#scanResultView').hide();
	$('#systemInformationView').hide();

	$('#startView').show();
};

function convertDataToObject(data) {

	return JSON.parse(String.fromCharCode.apply(null, new Uint8Array(data)))
}

function printUptime(data) {

	var uptime  = convertDataToObject(data).uptime;

	var days = Math.floor(uptime / 86400);
	uptime -= days * 86400;

	var hours = Math.floor(uptime / 3600) % 24;
	uptime -= hours * 3600;

	var minutes = Math.floor(uptime / 60) % 60;

	var htmlString = '<p>' + 'Uptime: ' + days + ' days, ' + hours + ':' + (minutes > 9 ? '' : '0') + minutes + '</p>';

	$('#uptime').append($(htmlString));
};

function printMemory(data) {

	var freeMemory  = convertDataToObject(data).freeMemory;
	var totalMemory  = convertDataToObject(data).totalMemory;

	var htmlString = '<p>' +'Free memory: ' + freeMemory + '/' + totalMemory + '</p>';

	$('#memory').append($(htmlString));
};

function printLoadAverage(data) {

	function colorLoad(load) {

		var color = '';

		if(load < 0.7) {

			color = 'color_wavegreen';
		}
		else if(load >= 1) {

			color = 'color_softred';
		}
		else {

			color = 'color_brightlight';
		}

		return '<span class="' + color + '">' + load + '</span>';
	}

	var dataObject = convertDataToObject(data);

	Object.keys(dataObject).map(function(load) {

		dataObject[load] = colorLoad(dataObject[load]);
	});

	var htmlString = '<p>' +'Load average: ' + dataObject.oneMin + ', ' + dataObject.fiveMin + ', ' + dataObject.fifteenMin + '</p>';
					;
	$('#loadaverage').append($(htmlString));
}
