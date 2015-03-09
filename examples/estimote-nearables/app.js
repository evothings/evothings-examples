var app = (function()
{
	// Application object.
	var app = {};

	// Dictionary of nearables.
	var nearablesDictionary = {};

	// Timer that displays list of nearables.
	var updateTimer = null;

	app.initialize = function()
	{
		document.addEventListener('deviceready', onDeviceReady, false);
	};

	function onDeviceReady()
	{
		// Only start scanning for Nearables on iOS.
		if (evothings.os.isIOS())
		{
			// Start tracking nearables!
			startScan();

			// Display refresh timer.
			updateTimer = setInterval(displayNearableList, 1000);
		}
	}

	function startScan()
	{
		function onNearablesRanged(nearables)
		{
			//console.log('onNearablesRanged: ' + JSON.stringify(nearables))
			for (var i in nearables)
			{
				// Insert nearable into table of found nearables.
				// Filter out nearables with invalid RSSI values.
				var nearable = nearables[i];
				if (nearable.rssi < 0)
				{
					nearable.timeStamp = Date.now();
					var key = nearable.identifier;
					nearablesDictionary[key] = nearable;
				}
			}
		}

		function onError(errorMessage)
		{
			console.log('Ranging nearables did fail: ' + errorMessage);
		}

		// Start ranging nearables.
		estimote.nearables.startRangingForType(
			estimote.nearables.NearableTypeAll,
			onNearablesRanged,
			onError);
	}

	function displayNearableList()
	{
		// Clear nearables list.
		$('#found-nearables').empty();

		// Update nearables list.
		var timeNow = Date.now();
		$.each(nearablesDictionary, function(key, nearable)
		{
			// Only show nearables that are updated during the last 60 seconds.
			if (nearable.timeStamp + 60000 > timeNow)
			{
				// Create tag to display nearable data.
				var element = $(
					'<li>'
					+	typeNameHTML(nearable)
					+	'Id: ' + nearable.identifier + '<br />'
					+	'Temperature: ' + nearable.temperature + '<br />'
					+	isMovingHTML(nearable)
					+	zoneHTML(nearable)
					+	rssiHTML(nearable)
					+ '</li>'
				);

				$('#found-nearables').append(element);
			}
		});
	}

	function typeNameHTML(nearable)
	{
		var type = nearable.nameForType;
		var name = type.charAt(0).toUpperCase() + type.slice(1);
		return 'Type: ' + name + '<br />';
	}

	function isMovingHTML(nearable)
	{
		return 'Is moving: ' + (nearable.isMoving ? 'Yes' : 'No') + '<br />';
	}

	function zoneHTML(nearable)
	{
		var zone = nearable.zone;
		if (!zone) { return ''; }

		var zoneNames = [
			'Unknown',
			'Immediate',
			'Near',
			'Far'];

		return 'Zone: ' + zoneNames[zone] + '<br />';
	}

	function rssiHTML(nearable)
	{
		// Map the RSSI value to a width in percent for the indicator.
		var rssiWidth = 1; // Used when RSSI is zero or greater.
		if (nearable.rssi < -100)
		{
			rssiWidth = 100;
		}
		else if (nearable.rssi < 0)
		{
			rssiWidth = 100 + nearable.rssi;
		}
		// Scale values since they tend to be a bit low.
		rssiWidth *= 1.5;

		var html =
			'RSSI: ' + nearable.rssi + '<br />'
			+ '<div style="background:rgb(0,0,155);height:20px;width:'
			+ 		rssiWidth + '%;"></div>'

		return html;
	}

	return app;
})();

app.initialize();
