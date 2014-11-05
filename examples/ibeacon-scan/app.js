var app = (function()
{
	// Application object.
	var app = {};

	// Add your own beacon UUIDs to this list.
	var regions =
	[
		{uuid:'B9407F30-F5F8-466E-AFF9-25556B57FE6D'},
		{uuid:'F7826DA6-4FA2-4E98-8024-BC5B71E0893E'},
		{uuid:'8DEEFBB9-F738-4297-8040-96668BB44281'},
		{uuid:'A0B13730-3A9A-11E3-AA6E-0800200C9A66'},
		{uuid:'A4950001-C5B1-4B44-B512-1370F02D74DE'},
		{uuid:'B9407F30-F5F8-466E-AFF9-25556B57FE6D'}
	];

	// Dictionary of beacons.
	var beacons = {};

	app.initialize = function()
	{
		document.addEventListener('deviceready', onDeviceReady, false);
	};

	function onDeviceReady()
	{
		// Specify a shortcut for the location manager holding the iBeacon functions.
		window.locationManager = cordova.plugins.locationManager;

		// Start tracking beacons!
		startScan();
	}

	function startScan()
	{
		// The delegate object contains iBeacon callback functions.
		var delegate = locationManager.delegate.implement(
		{
			didDetermineStateForRegion: function(pluginResult)
			{
				//console.log('didDetermineStateForRegion: ' + JSON.stringify(pluginResult))
			},

			didStartMonitoringForRegion: function(pluginResult)
			{
				//console.log('didStartMonitoringForRegion:' + JSON.stringify(pluginResult))
			},

			didRangeBeaconsInRegion: function(pluginResult)
			{
				//console.log('didRangeBeaconsInRegion: ' + JSON.stringify(pluginResult))
				for (var i in pluginResult.beacons)
				{
					// Insert beacon into table of found beacons.
					var beacon = pluginResult.beacons[i];
					beacon.timeStamp = Date.now();
					var key = beacon.uuid + ':' + beacon.major + ':' + beacon.minor;
					beacons[key] = beacon;
				}

				displayBeaconList(beacons);
			}
		})

		// Set the delegate object to use.
		locationManager.setDelegate(delegate);

		// Request permission from user to access location info.
		// This is needed on iOS 8.
		locationManager.requestAlwaysAuthorization();

		// Start monitoring and ranging beacons.
		for (var i in regions)
		{
			var beaconRegion = new locationManager.BeaconRegion(
				i + 1,
				regions[i].uuid);

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

	function displayBeaconList(beacons)
	{
		// Clear beacon list.
		$('#found-beacons').empty();

		var timeNow = Date.now();

		// Update beacon list.
		$.each(beacons, function(key, beacon)
		{
			// Only show beacons that are updated during the last 60 seconds.
			if (beacon.timeStamp + 60000 > timeNow)
			{
				// Valid RSSI values should less than zero.
				var rssiWidth = 0;
				if (beacon.rssi < 0)
				{
					rssiWidth = 100 + beacon.rssi;
				}

				// Create tag to display beacon data.
				var element = $(
					'<li>'
					+	'<strong>UUID: ' + beacon.uuid + '</strong><br />'
					+	'Major: ' + beacon.major + '<br />'
					+	'Minor: ' + beacon.minor + '<br />'
					+	'Proximity: ' + beacon.proximity + '<br />'
					+	'RSSI: ' + beacon.rssi + '<br />'
					+ 	'<div style="background:rgb(0,255,0);height:20px;width:'
					+ 		rssiWidth + '%;"></div>'
					+ '</li>'
				);

				$('#found-beacons').append(element);
			}
		});
	}

	return app;
})();

app.initialize();
