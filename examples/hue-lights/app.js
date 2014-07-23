// JavaScript code for the "Philips Hue Demo" example app.

/** Application object. */
var app = {};

/** User name (you can change this, must be at least 10 characters). */
app.user = 'evo1234567';

/** Default light. */
app.lightId = 1;

/** IP-address of the Hue Bridge. */
app.bridgeIP = null;

/**
 * Define colors that the lights can be configured with.
 * The colour buttons are set to these colours.
 */
app.hueColors = [
	{'hue':1000,  'bri':75, 'sat':250},
	{'hue':10000, 'bri':75, 'sat':250},
	{'hue':30000, 'bri':75, 'sat':250}
];

/**
 * Called when the page has finished loading.
 */
$(function()
{
	// Display the selected default light.
	$('#lightButton' + app.lightId).prop('checked', true)

	// Initialize the colors of the color setting buttons
	// to their corresponding light colors.
	app.changeButtonColors();
});

/**
 * Convert HSB to HSL as a CSS color value
 * TODO: correct conversion algorithm.
 * See issue: https://github.com/evothings/EvoThingsExamples/issues/17
 */
app.getCSSHSL = function(hsl)
{
	return 'hsl(' + (360 * hsl.hue / 65535) + ',' +
			Math.round(100 * hsl.sat / 255) + '%,' +
			Math.round(100 * hsl.bri / 255) + '%)';
};

/**
 * Set the background color of each color setting buttons
 * to the corresponding light color.
 */
app.changeButtonColors = function()
{
	for (var i in app.hueColors)
	{
		// Do not change the buttons background color, to keep a consistent
		// style and corporate identity. Preview light color in some other way.
		/*$('#btn_color_' + (parseInt(i)+1))
			.css('background', app.getCSSHSL(app.hueColors[i]))
			.css('borderColor', app.getCSSHSL(app.hueColors[i]));*/
	}
};

/**
 * You can manually lookup the ip-address of the Hue Bridge
 * using these commands (ping detectes the Hue Bridge):
 *   ping 255.255.255.255
 * followed by (arp lists detected clients):
 *   arp -a
 * Look at the MAC-address under the Hue Bridge and find the
 * matching ip-address in the arp listing.
 */
app.getHueBridgeIpAddress = function()
{
	return app.bridgeIP || $('#HueBridgeIpAddress').val();
};

/**
 * Store the Hue Bridge IP and update the UI's text field.
 */
app.setHueBridgeIpAddress = function(ipAddress)
{
	app.bridgeIP = ipAddress;
	$('#HueBridgeIpAddress').val(app.bridgeIP);
};

/**
 * Auto Connect button handler.
 */
app.connectAuto = function()
{
	// Try to find the local IP address of the Hue Bridge
	// and determine whether we are already authorized to
	// control its lights.
	app.fetchBridgeIP(
		function(ipaddress)
		{
			app.setHueBridgeIpAddress(ipaddress);
			app.connect();

			// Not used.
			/*app.checkConnection(
				function()
				{
					// If the connection test passes, update the UI
					// to show that we are connected to the Hue Bridge.
					$('#status').html('Connected');
				},
				function() { });*/
		});
};

/**
 * Connect to IP button handler.
 */
app.connectToIP = function()
{
	app.connect();
};

/**
 * Get the local IP address of the Hue Bridge.
 */
app.fetchBridgeIP = function(successFun, failFun)
{
	$.getJSON('http://www.meethue.com/api/nupnp', function(data)
	{
		if (data[0] && data[0].hasOwnProperty('internalipaddress'))
		{
			successFun && successFun(data[0].internalipaddress);
		}
		else
		{
			failFun && failFun('Could not find ipaddress');
		}
	}).fail(failFun);
};

/**
 * Tests the connection to the Hue Bridge by sending a request to it.
 */
app.checkConnection = function(successFun, failFun)
{
	$.ajax({
		type: 'GET',
		dataType: 'json',
		url: 'http://' +
			app.getHueBridgeIpAddress() +'/api/' +
			app.user + '/config',
		success: successFun,
		error: function(a, err) { failFun(err) }
	});
};

/**
 * Connect to the Hue Bridge by registering the user.
 */
app.connect = function()
{
	$('#status').html('Connecting...')
	app.registerUser(
		app.user,
		function(json)
		{
			console.log(json[0]);
			if (json[0].error)
			{
				$('#status').html(json[0].error.description)
			}
			else if (json[0].success)
			{
				$('#status').html('Connected');
			}
			else
			{
				$('#status').html('Something went wrong')
			}
		},
		function()
		{
			$('#status').html('Could not find Hue Bridge')
		});
};

/**
 * Sends an authorization request to the Hue Bridge.
 */
app.registerUser = function(userName, successFun, failFun)
{
	var data = {"devicetype":"test user", "username":userName}
	$.ajax({
		type: 'POST',
		dataType: 'json',
		timeout: 3000,
		url: 'http://' + app.getHueBridgeIpAddress() +'/api/',
		data: JSON.stringify(data),
		success: function(data) { successFun(data) },
		error: function(a, err) { failFun(err) }
	});
};

app.selectLight = function(lightId)
{
	app.lightId = lightId;
};

app.lightOn = function()
{
	app.lightSetState(app.lightId, {"on":true});
};

app.lightOff = function()
{
	app.lightSetState(app.lightId, {"on":false});
};

app.lightsSetColor1 = function()
{
	app.lightSetState(app.lightId, app.hueColors[0]);
};

app.lightsSetColor2 = function()
{
	app.lightSetState(app.lightId, app.hueColors[1]);
};

app.lightsSetColor3 = function()
{
	app.lightSetState(app.lightId, app.hueColors[2]);
};

app.lightsEffectOn = function()
{
	app.lightSetState(app.lightId, {"effect":"colorloop"});
};

app.lightsEffectOff = function()
{
	app.lightSetState(app.lightId, {"effect":"none"});
};

/**
 * Sets a light's state by sending a request to the Hue Bridge.
 */
app.lightSetState = function(lightId, state)
{
	$.ajax({
		type: 'PUT',
		dataType: 'json',
		url: 'http://' + app.getHueBridgeIpAddress() +'/api/' +
			app.user + '/lights/' + lightId + '/state',
		data: JSON.stringify(state),
		success: function(data) { },
		error: function(a, err) { }
	});
};
