// JavaScript code for the Dialog Eddystone example app.

// Application object
var eddystone = {};

(function(){

// Dictionary of beacons.
var beacons = {};

// Timer that displays list of beacons.
var timer = null;

// Regions that define which page to show for each beacon.
// Since iOS does not expose any MAC addresses we distinguish Eddystone beacons by NID
var beaconData = {
	'25 d5 9d 55 df ec 62 e6 13 56':'page-eddystone-elephant',
	'26 d5 9d 55 df ec 62 e6 13 56':'page-eddystone-giraffe', // Note the first byte
	'27 d5 9d 55 df ec 62 e6 13 56':'page-eddystone-ostrich'
};

// Currently displayed page.
var currentPage = 'page-eddystone-default';

// Check for beacons with an rssi higher than this value
var rssiThreshold = -60; 
var rssiOffset = 20;

// false when scanning is off. true when on.
var isScanning = false;

eddystone.initialize = function()
{
	document.addEventListener(
		'deviceready',
		function() { evothings.scriptsLoaded(onDeviceReady) },
		false);
};

function onDeviceReady()
{
	// Not used.
	// Here you can update the UI to say that
	// the device (the phone/tablet) is ready
	// to use BLE and other Cordova functions.
};

// Called when button is pressed
eddystone.startStop = function()
{
	if(isScanning)
	{
		document.getElementById('eddystone-start-stop').innerHTML = 'START EDDYSTONE';
		stop();
	}
	else
	{
		document.getElementById('eddystone-start-stop').innerHTML = 'STOP EDDYSTONE';
		start();
	}
};

function start()
{
	isScanning = true;

	// Display default page
	gotoPage(currentPage);

	// Start tracking beacons!
	setTimeout(startScan, 500);
	
	// Timer that refreshes the display.
	timer = setInterval(updateBeaconList, 2000);
};

function stop()
{
	isScanning = false;

	// Stop tracking beacons
	evothings.eddystone.stopScan();

	// Cancel timer
	clearInterval(timer);

	// Clear beacon list
	$('#found-eddystone-beacons').empty();
	beacons = {};

	// Clear screen
	hidePage(currentPage);
	currentPage = 'page-eddystone-default';
};

function startScan()
{
	console.log('Scan in progress.');
	evothings.eddystone.startScan(
		function(beacon)
		{
			// Update beacon data.
			// Only store beacons that are already defined
			if(beaconData[uint8ArrayToString(beacon.nid)]) 
			{
				beacon.timeStamp = Date.now();
				beacons[beacon.address] = beacon;
			}
		},
		function(error)
		{
			console.log('Eddystone scan error: ' + error);
		});
};

// Map the RSSI value to a value between 1 and 100.
function mapBeaconRSSI(rssi)
{
	if (rssi >= 0) return 1; // Unknown RSSI maps to 1.
	if (rssi < -100) return 100; // Max RSSI
	return 100 + rssi;
};

function getSortedBeaconList(beacons)
{
	var beaconList = [];
	for (var key in beacons)
	{	
		beaconList.push(beacons[key]);
	}

	beaconList.sort(function(beacon1, beacon2)
	{
		return mapBeaconRSSI(beacon1.rssi) < mapBeaconRSSI(beacon2.rssi);
	});
	return beaconList;
};

function updateBeaconList()
{
	removeOldBeacons();
	displayBeacon();
	displayBeaconList();
};

function removeOldBeacons()
{
	var timeNow = Date.now();
	for (var key in beacons)
	{
		// Only show beacons updated during the last 12.5 seconds.
		var beacon = beacons[key];
		if ((timeNow - beacon.timeStamp) > 12500)
		{
			delete beacons[key];
		}
	}
};


function displayBeaconList()
{
	// Clear beacon list
	$('#found-eddystone-beacons').empty();

	var sortedList = getSortedBeaconList(beacons);

	// Update beacon list.
	$.each(sortedList, function(key, beacon)
	{
		// Map the RSSI value to a width in percent for the indicator.
		var rssiWidth = 1; // Used when RSSI is zero or greater.
		if (beacon.rssi < -100) { rssiWidth = 100; }
		else if (beacon.rssi < 0) { rssiWidth = 100 + beacon.rssi; }

		// Create tag to display beacon data.
		var element = $(
			'<li>'
			+	'<strong>Name</strong>: ' + beacon.name + '<br />'
			+	'<strong>MAC Address</strong>: ' + beacon.address + '<br />'
			+	'<strong>URL</strong>: ' + beacon.url + '<br />'
			+	'<strong>NID</strong>: ' + uint8ArrayToString(beacon.nid)+ '<br />'
			+	'<strong>BID</strong>: ' + uint8ArrayToString(beacon.bid) + '<br />'
			+	'<strong>Voltage</strong>: ' + beacon.url + '<br />'
			+	'<strong>Temperature</strong>: ' + beacon.temperature + '<br />'
			+	'<strong>RSSI</strong>: ' + beacon.rssi + '<br />'
			+ 	'<div style="background:rgb(128,64,255);height:20px;width:'
			+ 		rssiWidth + '%;"></div>'
			+ '</li>'
		);

		$('#found-eddystone-beacons').append(element);
	});
};

function displayBeacon()
{
	var sortedList = getSortedBeaconList(beacons);

	if(sortedList.length == 0)
	{
		gotoPage('page-eddystone-default');
		return;
	}

	var beacon = sortedList[0]; // We only care about the closest one
	// console.log('Eddystone: ' + beacon.address + ' RSSI: ' + beacon.rssi);

	var pageId = beaconData[uint8ArrayToString(beacon.nid)];

	// If the beacon is close and represents a new page, then show the page.
	if(beacon.rssi >= rssiThreshold && currentPage != pageId)
	{
		gotoPage(pageId); 
		return;
	}

	// If the beacon represents the current page but is far away,
	// then show the default page.
	if (beacon.rssi < (rssiThreshold - rssiOffset) && currentPage == pageId)
	{
		gotoPage('page-eddystone-default');
		return;
	}

};

function uint8ArrayToString(uint8Array)
{
	function format(x)
	{
		var hex = x.toString(16);
		return hex.length < 2 ? '0' + hex : hex;
	}

	var result = '';
	var sep = '';
	for (var i = 0; i < uint8Array.length; ++i)
	{
		result += sep + format(uint8Array[i]);
		sep = ' ';
	}
	return result;

};

function gotoPage(pageId)
{
	hidePage(currentPage);
	showPage(pageId);
	currentPage = pageId;
};

function showPage(pageId)
{
	document.getElementById(pageId).style.display = 'block';
};

function hidePage(pageId)
{
	document.getElementById(pageId).style.display = 'none';
};

// Called when the RSSI threshold slider is selected
eddystone.setRSSIthreshold = function(value)
{
	if(value >= -100 && value <= 0)
	{
		rssiThreshold = value; // we need time in ms
		$('#rssi-threshold').html('RSSI threshold: ' + value);
	}
};

// Called when the RSSI offset slider is selected
eddystone.setRSSIoffset = function(value)
{
	if(value >= 0 && value <= 50)
	{
		rssiOffset = value; // we need time in ms
		$('#rssi-offset').html('RSSI offset: ' + value);
	}
};

})(); // End of closure.

// Initialize eddystone
eddystone.initialize();
