// JavaScript code for the Dialog iBeacon example app.

// Application object.
var ibeacon = {};

(function(){

// Regions that define which page to show for each beacon.
var beaconRegions =
[
	{
		id: 'page-ibeacon-elephant',
		uuid:'54392FC4-CB60-AB74-CE8E-7679F8F1B916',
		major: 0,
		minor: 0
	},
	{
		id: 'page-ibeacon-giraffe',
		uuid:'55392FC4-CB60-AB74-CE8E-7679F8F1B916', // Notice the difference in UUID and major/minor
		major: 1,
		minor: 1
	},
	{
		id: 'page-ibeacon-ostrich',
		uuid:'56392FC4-CB60-AB74-CE8E-7679F8F1B916', 
		major: 2,
		minor: 2
	}
];

// Currently displayed page.
var currentPage = 'page-ibeacon-default';

// Check for beacons with an rssi higher than this value
var rssiThreshold = -60; 
var rssiOffset = 20;

// Dictonary of beacons.
var beacons = {};

// Timer that displays a list of beacons.
var timer = null;

// false when scanning is off. true when on.
var isScanning = false;

ibeacon.initialize = function()
{
	document.addEventListener(
		'deviceready',
		function() { evothings.scriptsLoaded(onDeviceReady) },
		false);
}

// Called when Cordova are plugins initialised,
// the iBeacon API is now available.
function onDeviceReady()
{
	// Specify a shortcut for the location manager that
	// has the iBeacon functions.
	window.locationManager = cordova.plugins.locationManager;
	cordova.plugins.locationManager.requestAlwaysAuthorization(); // Required for iOS
}

// Called when button is pressed
ibeacon.startStop = function()
{
	if(isScanning)
	{
		document.getElementById('ibeacon-start-stop').innerHTML = 'START IBEACON';
		stop();
	}
	else
	{
		document.getElementById('ibeacon-start-stop').innerHTML = 'STOP IBEACON';
		start();
	}
};


function start()
{
	isScanning = true;

	// Display default page
	gotoPage(currentPage);
	
	// Start tracking beacons!
	startScanForBeacons();
	
	// Timer that refreshes the display.
	timer = setInterval(updateBeaconList, 2000);
};

function stop()
{
	isScanning = false;
	
	// Cancel timer
	clearInterval(timer);

	// Hide the current page
	hidePage(currentPage);
	currentPage = 'page-ibeacon-default';

	// Clear beacon list
	$('#found-ibeacon-beacons').empty();
	beacons = {};

	// Stop scanning beacons
	stopScanForBeacons();
};


function startScanForBeacons()
{
	// console.log('startScanForBeacons')

	// The delegate object contains iBeacon callback functions.
	var delegate = new cordova.plugins.locationManager.Delegate()

	delegate.didDetermineStateForRegion = function(pluginResult)
	{
		// console.log('didDetermineStateForRegion: ' + JSON.stringify(pluginResult))
	}

	delegate.didStartMonitoringForRegion = function(pluginResult)
	{
		// console.log('didStartMonitoringForRegion:' + JSON.stringify(pluginResult))
	}

	delegate.didRangeBeaconsInRegion = function(pluginResult)
	{

		// didRangeBeaconsInRegion(pluginResult);
		for(var i in pluginResult.beacons)
		{
			// Insert beacon into table of found beacons
			var beacon = pluginResult.beacons[i];
			beacon.identifier = pluginResult.region.identifier; // Store the identifier for future reference
			beacon.timeStamp = Date.now();
			var key = beacon.uuid + ':' + beacon.major + ':' + beacon.minor;
			beacons[key] = beacon;
		}
	}

	// Set the delegate object to use.
	locationManager.setDelegate(delegate);

	// Start monitoring and ranging our beacons.
	for (var r in beaconRegions)
	{
		var region = beaconRegions[r];

		var beaconRegion = new locationManager.BeaconRegion(
			region.id, region.uuid, region.major, region.minor);

		// Start monitoring.
		locationManager.startMonitoringForRegion(beaconRegion)
			.fail(console.error)
			.done();

		// Start ranging.
		locationManager.startRangingBeaconsInRegion(beaconRegion)
			.fail(console.error)
			.done();
	}
}

function updateBeaconList()
{
	removeOldBeacons();
	displayBeacon();
	displayBeaconList()
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

function displayBeacon()
{
	// Clear beacon list
	$('#found-ibeacon-beacons').empty();
	
	var sortedList = getSortedBeaconList(beacons);

	if(sortedList.length == 0)
	{
		gotoPage('page-ibeacon-default');
		return;
	}
	
	var beacon = sortedList[0]; // We want to show extra information for the closest beacon

		// Map the RSSI value to a width in percent for the indicator.
		var rssiWidth = 1; // Used when RSSI is zero or greater.
		if (beacon.rssi < -100) { rssiWidth = 100; }
		else if (beacon.rssi < 0) { rssiWidth = 100 + beacon.rssi; }

	// Create tag to display beacon data.
	var element = $(
		'<li>'
		+	'<strong>UUID</strong>: ' + beacon.uuid + '<br />'
		+	'<strong>Major</strong>: ' + beacon.major + '<br />'
		+	'<strong>Minor</strong>: ' + beacon.minor + '<br />'
		+	'<strong>Proximity</strong>: ' + beacon.proximity + '<br />'
		+	'<strong>RSSI</strong>: ' + beacon.rssi + '<br />'
		+ 	'<div style="background:rgb(255,128,64);height:20px;width:'
		+ 		rssiWidth + '%;"></div>'
		+ '</li>'
	);

	$('#found-ibeacon-beacons').append(element);

	// The region identifier is the page id.
	var pageId = beacon.identifier;

	if (beacon.rssi >= rssiThreshold && currentPage != pageId)
	{
		gotoPage(pageId);
		return;
	}

	// If the beacon represents the current page but is far away,
	// then show the default page.
	if (beacon.rssi < (rssiThreshold - rssiOffset) && currentPage == pageId)
	{
		gotoPage('page-ibeacon-default');
		return;
	}
}

function displayBeaconList()
{
	// Clear beacon list
	$('#found-ibeacon-beacons').empty();

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
			+	'<strong>UUID</strong>: ' + beacon.uuid + '<br />'
			+	'<strong>Major</strong>: ' + beacon.major + '<br />'
			+	'<strong>Minor</strong>: ' + beacon.minor + '<br />'
			+	'<strong>Proximity</strong>: ' + beacon.proximity + '<br />'
			+	'<strong>RSSI</strong>: ' + beacon.rssi + '<br />'
			+ 	'<div style="background:rgb(255,128,64);height:20px;width:'
			+ 		rssiWidth + '%;"></div>'
			+ '</li>'
		);

		$('#found-ibeacon-beacons').append(element);
	});
};

function stopScanForBeacons()
{
	// Stop monitoring and ranging our beacons.
	for (var r in beaconRegions)
	{
		var region = beaconRegions[r];

		var beaconRegion = new locationManager.BeaconRegion(
			region.id, region.uuid, region.major, region.minor);

		// Start monitoring.
		locationManager.stopMonitoringForRegion(beaconRegion)
			.fail(console.error)
			.done();

		// Start ranging.
		locationManager.stopRangingBeaconsInRegion(beaconRegion)
			.fail(console.error)
			.done();
	}
}

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

function gotoPage(pageId)
{
	hidePage(currentPage);
	showPage(pageId);
	currentPage = pageId;
}

function showPage(pageId)
{
	document.getElementById(pageId).style.display = 'block';
}

function hidePage(pageId)
{
	document.getElementById(pageId).style.display = 'none';
}

// Called when the RSSI threshold slider is selected
ibeacon.setRSSIthreshold = function(value)
{
	if(value >= -100 && value <= 0)
	{
		rssiThreshold = value; // we need time in ms
		$('#rssi-threshold').html('RSSI threshold: ' + value);
	}
};

// Called when the RSSI offset slider is selected
ibeacon.setRSSIoffset = function(value)
{
	if(value >= 0 && value <= 50)
	{
		rssiOffset = value; // we need time in ms
		$('#rssi-offset').html('RSSI offset: ' + value);
	}
};

})(); // End of closure

// Initialize iBeacon
ibeacon.initialize()
