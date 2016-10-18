// JavaScript code for the BLE Scan example app.
// The code is inside a closure to avoid polluting the global scope.
;(function()
{

var mobileDevice

// Dictionary of found devices.
var devices = {}

// Timer that updates the displayed list of devices.
var updateTimer = null

function main()
{
	initialize()
}

function initialize()
{
	$(function()
	{
		// When document has loaded we attach FastClick to
		// eliminate the 300 ms delay on click events.
		FastClick.attach(document.body)

		// Event listener for Back button.
		$('.app-back').on('click', function() { history.back() })
	})

	// Event handler called when Cordova plugins have loaded.
	document.addEventListener(
		'deviceready',
		onDeviceReady,
		false)
}

function onDeviceReady()
{
	// Save global device object.
	mobileDevice = device

	// Un-gray buttons.
	$('button.app-start-scan')
		.removeClass('mdl-button--disabled')
		.addClass('mdl-color--green-A700')
	$('button.app-stop-scan')
		.removeClass('mdl-button--disabled')
		.addClass('mdl-color--deep-orange-900')

	// Attach event listeners.
	$('.app-start-scan').on('click', startScan)
	$('.app-stop-scan').on('click', stopScan)
}

function startScan()
{
	// Make sure scan is stopped.
	stopScan()

console.log('start scan')
	// Start scan.
	evothings.easyble.startScan(
		function(device)
		{
			// Device found. Sometimes an RSSI of +127 is reported.
			// We filter out these values here.
			if (device.rssi <= 0)
			{
				// Set timeStamp.
				device.timeStamp = Date.now()

				// Store device in table of found devices.
				devices[device.address] = device
			}
		},
		function(error)
		{
			showMessage('Scan error: ' + error)
console.log('Scan error: ' + JSON.stringify(error))
			stopScan()
		}
	)

	// Start update timer.
	updateTimer = setInterval(updateDeviceList, 500)

	// Update UI.
	$('.mdl-progress').addClass('mdl-progress__indeterminate')
	showMessage('Scan started')
}

function stopScan()
{
console.log('stop scan')

	// Stop scan.
	evothings.easyble.stopScan()

	// Clear devices.
	devices = {}

	// Stop update timer.
	if (updateTimer)
	{
		clearInterval(updateTimer)
		updateTimer = null
	}

	// Update UI.
	$('.mdl-progress').removeClass('mdl-progress__indeterminate')
	$('.app-cards').empty()
	hideDrawerIfVisible()

}

function hideDrawerIfVisible()
{
	if ($('.mdl-layout__drawer').hasClass('mdl-layout__drawer is-visible'))
	{
		document.querySelector('.mdl-layout').MaterialLayout.toggleDrawer()
	}
}

function showMessage(message)
{
	document.querySelector('.mdl-snackbar').MaterialSnackbar.showSnackbar(
	{
		message: message
	})
}

function updateDeviceList()
{
	var timeNow = Date.now();

	$.each(devices, function(key, device)
	{
		// Only show devices that have been updated during the last 10 seconds.
		if (device.timeStamp + 10000 > timeNow)
		{
			 displayDevice(device)
		}
		else
		{
			// Remove inactive device.
			removeDevice(device)
		}
	})
}

function displayDevice(device)
{

	if (device.advertisementData) console.log(mobileDevice.model + ' ' + device.name + ' ' + JSON.stringify(device.advertisementData))

//if (device.advertisementData.kCBAdvDataLocalName != "CC2650 SensorTag") return

	if (!deviceIsDisplayed(device))
	{
		createDevice(device)
	}

	updateDevice(device)
}

function deviceIsDisplayed(device)
{
	var deviceId = '#' + getDeviceDomId(device)
	return !!($(deviceId).length)
}

function updateDevice(device)
{
//console.log(JSON.stringify(device.advertisementData))

	// Map the RSSI value to a width in percent for the indicator.
	var distanceBarValue = 100; // Used when RSSI is zero or greater.
	if (device.rssi < -100) { distanceBarValue = 1; }
	else if (device.rssi < 0) { distanceBarValue = 100 + device.rssi; }

	var deviceId = '#' + getDeviceDomId(device)

	$(deviceId + ' .device-rssi')
		.text(device.rssi)

	$(deviceId + ' .device-distance-bar')
		.css('width', distanceBarValue + 'px')

	if (!device.advertisementData) return

	$(deviceId + ' .device-kCBAdvDataLocalName')
		.text(device.advertisementData.kCBAdvDataLocalName)
	$(deviceId + ' .device-kCBAdvDataTxPowerLevel')
		.text(device.advertisementData.kCBAdvDataTxPowerLevel)
	$(deviceId + ' .device-kCBAdvDataIsConnectable')
		.text(device.advertisementData.kCBAdvDataIsConnectable)
	$(deviceId + ' .device-kCBAdvDataServiceUUIDs')
		.text(JSON.stringify(device.advertisementData.kCBAdvDataServiceUUIDs))
	$(deviceId + ' .device-kCBAdvDataServiceData')
		.text(JSON.stringify(device.advertisementData.kCBAdvDataServiceData))
}

function createDevice(device)
{
	// Create HTML element to display device data.
	var domId = getDeviceDomId(device);
	var element = $(
		'<div id="' + domId + '" class="mdl-card mdl-card--border mdl-shadow--2dp">'
		+	'<div class="mdl-card__title">'
		+		'<h2 class="mdl-card__title-text">Device: ' + device.name + '</h2>'
		+	'</div>'
		+	'<div class="mdl-card__supporting-text">'
		+		'RSSI: <span class="device-rssi"></span><br>'
		+		'kCBAdvDataLocalName: <span class="device-kCBAdvDataLocalName"></span><br>'
		+		'kCBAdvDataServiceUUIDs: <span class="device-kCBAdvDataServiceUUIDs"></span><br>'
		+		'kCBAdvDataServiceData: <span class="device-kCBAdvDataServiceData"></span><br>'
		+		'kCBAdvDataTxPowerLevel: <span class="device-kCBAdvDataTxPowerLevel"></span><br>'
		+		'kCBAdvDataIsConnectable: <span class="device-kCBAdvDataIsConnectable"></span><br>'
		+   	'<div class="device-distance-bar" style="width:0px;height:10px;margin-top:20px;background:rgb(200,200,0)"></div>'
		+	'</div>'
		+ '</div>')

	// Add element.
	$('.app-cards').append(element)
}

function removeDevice(device)
{
	// Remove from UI.
	var deviceId = '#' + getDeviceDomId(device)
	$(deviceId).remove()

	// Delete from model.
	delete devices[devices.address]
}

function getDeviceDomId(device)
{
	return 'device-dom-id-' + device.address.replace(/:/g, "_")
}

/*
// Start the scan. Call the callback function when a device is found.
// Format:
//   callbackFun(deviceInfo, errorCode)
//   deviceInfo: address, rssi, name
//   errorCode: String
app.startScan = function(callbackFun)
{
	app.stopScan();

	evothings.ble.startScan(
		function(device)
		{
			// Report success. Sometimes an RSSI of +127 is reported.
			// We filter out these values here.
			if (device.rssi <= 0)
			{
				callbackFun(device, null);
			}
		},
		function(errorCode)
		{
			// Report error.
			callbackFun(null, errorCode);
		}
	);
};

// Stop scanning for devices.
app.stopScan = function()
{
	evothings.ble.stopScan();
};

// Called when Start Scan button is selected.
app.ui.onStartScanButton = function()
{
	app.startScan(app.ui.deviceFound);
	app.ui.displayStatus('Scanning...');
	app.ui.updateTimer = setInterval(app.ui.displayDeviceList, 500);
};

// Called when Stop Scan button is selected.
app.ui.onStopScanButton = function()
{
	app.stopScan();
	app.devices = {};
	app.ui.displayStatus('Scan Paused');
	app.ui.displayDeviceList();
	clearInterval(app.ui.updateTimer);
};

// Called when a device is found.
app.ui.deviceFound = function(device, errorCode)
{
	if (device)
	{
		// Set timestamp for device (this is used to remove
		// inactive devices).
		device.timeStamp = Date.now();

		// Insert the device into table of found devices.
		app.devices[device.address] = device;
	}
	else if (errorCode)
	{
		app.ui.displayStatus('Scan Error: ' + errorCode);
	}
};

// Display the device list.
app.ui.displayDeviceList = function()
{
	// Clear device list.
	$('#found-devices').empty();

	var timeNow = Date.now();

	$.each(app.devices, function(key, device)
	{
		// Only show devices that are updated during the last 10 seconds.
		if (device.timeStamp + 10000 > timeNow)
		{
			// Map the RSSI value to a width in percent for the indicator.
			var rssiWidth = 100; // Used when RSSI is zero or greater.
			if (device.rssi < -100) { rssiWidth = 0; }
			else if (device.rssi < 0) { rssiWidth = 100 + device.rssi; }

			// Create tag for device data.
			var element = $(
				'<li>'
				+	'<strong>' + device.name + '</strong><br />'
				// Do not show address on iOS since it can be confused
				// with an iBeacon UUID.
				+	(evothings.os.isIOS() ? '' : device.address + '<br />')
				+	device.rssi + '<br />'
				+ 	'<div style="background:rgb(225,0,0);height:20px;width:'
				+ 		rssiWidth + '%;"></div>'
				+ '</li>'
			);

			$('#found-devices').append(element);
		}
	});
};
*/

main()

})();
