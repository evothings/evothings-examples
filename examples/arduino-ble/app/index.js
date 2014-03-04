// JavaScript code for the Arduino BLE example app.

/** BLE plugin, is loaded asynchronously so the
	variable is redefined in the onDeviceReady handler. */
var ble = null;

$(document).ready( function()
{
	// Adjust canvas size when browser resizes
	$(window).resize( respondCanvas );

	// Adjust the canvas size when the document has loaded.
	respondCanvas();
});

/* Adjust the canvas dimensions based on its container dimensions. */
function respondCanvas()
{
	// Get the canvas & context
	var c = $('#canvas');
	var ct = c.get(0).getContext('2d');
	var container = $(c).parent();

	c.attr('width', $(container).width() ); //max width
	c.attr('height', $(container).height() ); //max height

	// Call a function to redraw other content (texts, images etc)
}

// TODO: Move global function to app object?
var formatFlags = function(name, flags, translation)
{
	var str = name+':';
	for (var key in translation)
	{
		if ((flags & key) != 0)
			str += ' '+translation[key];
	}
	return str;
}

var app = {
	// Application Constructor
	initialize: function()
	{
		console.log("initialize");
		this.bindEvents(); // add required event listeners
	},
	/** Bind Event Listeners

		Bind any events that are required on startup. Common events are:
		'load', 'deviceready', 'offline', and 'online'. */
	bindEvents: function()
	{
		document.addEventListener('deviceready', this.onDeviceReady, false);

		// Important reset BLE when page reloads/closes!
		window.addEventListener('beforeunload', function(e)
		{
			evothings.ble.stopScan();
			if(app.deviceHandle) {
				evothings.ble.close(app.deviceHandle);
			}
		});
	},
	/** deviceready Event Handler

		The scope of 'this' is the event. In order to call the 'receivedEvent'
		function, we must explicity call 'app.receivedEvent(...);' */
	onDeviceReady: function()
	{
		app.receivedEvent('deviceready');

		ble = evothings.ble; // EvoThings BLE plugin

		/*if (window.sessionStorage.getItem('deviceState') == 2)
		{
			app.checkServices(window.sessionStorage.getItem('deviceHandle'));
			return;
		}*/

		//console.log("testCharConversion");
		// once this passes, we can startLeScan().
		//app.testCharConversion();
		//console.log("resetting...");
		ble.stopScan();
		window.sessionStorage.setItem('deviceHandle', false);
		window.sessionStorage.setItem('rx', false);
		window.sessionStorage.setItem('tx', false);
		//ble.reset(function() {
			//console.log("reset complete!");
			console.log("startLeScan");
			app.startLeScan();
		//}, function(err) {
			//console.log("reset error: "+err);
		//});
	},
	// Update DOM on a Received Event
	receivedEvent: function(id)
	{
		console.log('Received Event: ' + id);
	},

	knownDevices: {},

	connectee: false,

	deviceHandle: false,

	startLeScan: function()
	{
		console.log('startScan');
		ble.startScan(function(r)
		{
			// address, rssi, name, scanRecord
			if (app.knownDevices[r.address])
			{
				return;
			}
			app.knownDevices[r.address] = r;
			var res = r.address+" "+r.rssi+" "+r.name
			console.log('scan result: ' + res);
			if (r.name == 'BLE Shield' && !app.connectee)
			{
				connectee = r;
				app.connect(r.address, r.name);
			}
		}, function(errorCode) {
			console.log('startScan error: ' + errorCode);
		});
	},

	connect: function(address, name)
	{
		ble.stopScan();
		console.log('connect('+address+')');
		ble.connect(address, function(r)
		{
			console.log('connect '+r.deviceHandle+' state '+r.state);
			window.sessionStorage.setItem('deviceHandle', r.deviceHandle);
			window.sessionStorage.setItem('connectState', r.state);
			if (r.state == 2)
			{ // connected
				app.deviceHandle = r.deviceHandle;
				app.checkServices(r.deviceHandle);
			}
		}, function(errorCode)
		{
			console.log('connect error: ' + errorCode);
		});
	},

	on: function()
	{
		console.log("on");
		app.write('writeCharacteristic', app.deviceHandle, 'rx', new Uint8Array([33]));
		console.log("on end");
	},

	off: function()
	{
		console.log("off");
		app.write('writeCharacteristic', app.deviceHandle, 'rx', new Uint8Array([0]));
		console.log("off end");
	},

	write: function(writeFunc, deviceHandle, name, value)
	{
		ble[writeFunc](deviceHandle, window.sessionStorage.getItem(name), value, function()
		{
			console.log(writeFunc+' '+name+' success.');
		}, function(errorCode) {
			console.log(writeFunc+' '+name+' error: '+errorCode);
		});
	},

	checkServices: function(deviceHandle)
	{
		console.log('connected, requesting services...');
		app.getServices(deviceHandle);
	},

	canvas: false,
	dataPoints: [
	],

	drawLines: function(a)
	{
		var canvas = document.getElementById('canvas');
		if (!app.canvas)
		{
			app.canvas = canvas.getContext('2d');
		}
		var d = app.dataPoints;
		var c = app.canvas;

		d.push(a);
		if (d.length > canvas.width)
		{
			d.splice(0, (d.length - canvas.width));
		}

		c.clearRect(0,0, canvas.width, canvas.height);
		//console.log(canvas.width+' '+canvas.height);

		var magnitude = 1024;

		function calcY(i)
		{
			return ((i * canvas.height) / (magnitude*2)) + (canvas.height / 2);
		}
		function drawLine(offset, color)
		{
			c.strokeStyle = color;
			c.beginPath();
			c.moveTo(0, calcY(d[d.length-1][offset]));
			var x = 1;
			for (var i = d.length-2; i >= 0; i--)
			{
				var y = calcY(d[i][offset]);
				//console.log(i+': '+x+' '+y);
				c.lineTo(x, y);
				x++;
			}
			c.stroke();
		}
		drawLine(0, '#f00');
		//drawLine(1, '#0f0');
		//drawLine(2, '#00f');
	},

	startReading: function(deviceHandle)
	{
		app.write('writeDescriptor', deviceHandle, 'txNotification', new Uint8Array([1,0]));	// on
		ble.enableNotification(deviceHandle, window.sessionStorage.getItem('tx'), function(data)
		{
			app.drawLines([new DataView(data).getUint16(0, true)]);
		}, function(errorCode)
		{
			console.log(enableNotification+' error: '+errorCode);
		});
	},

	getServices: function(deviceHandle)
	{
		console.log('deviceHandle: '+deviceHandle);
		var haveTx=false, haveRx=false, haveNotification=false;
		ble.readAllServiceData(deviceHandle, function(services)
		{
			for(var si in services) {
				var s = services[si];
				for(var ci in s.characteristics) {
					var c = s.characteristics[ci];
					//dumpFlags('  permissions', c.permissions, ble.permission);
					formatFlags('  properties', c.properties, ble.property);
					formatFlags('  writeType', c.writeType, ble.writeType);

					// See if this c is one of the ones we want.
					if (c.uuid == "713d0002-503e-4c75-ba94-3148f18d941e")
					{
						console.log('tx');	// we read from this one
						window.sessionStorage.setItem('tx', c.handle);
						haveTx = true;
					}
					if (c.uuid == "713d0003-503e-4c75-ba94-3148f18d941e")
					{
						console.log('rx');	// we write to this one
						window.sessionStorage.setItem('rx', c.handle);
						haveRx = true;
					}

					for(var di in c.descriptors) {
						var d = c.descriptors[di];
						//console.log('  d'+d.handle+"/"+descriptors.length);
						//msg += '  d'+d.handle+': '+d.uuid+"\n";
						//dumpFlags('   permissions', d.permissions, ble.permission);

						// See if this descriptor is the one we want.
						if (c.uuid == "713d0002-503e-4c75-ba94-3148f18d941e" &&
							d.uuid == "00002902-0000-1000-8000-00805f9b34fb")
						{
							console.log('txNotification');
							window.sessionStorage.setItem('txNotification', d.handle);
							haveNotification = true;
						}
					}
				}
			}

			if(haveTx && haveRx && haveNotification) {
				console.log('tx/rx services found.');
				app.startReading(deviceHandle);
			} else {
				console.log('ERROR: tx/rx services not found!');
			}
		}, function(errorCode)
		{
			console.log('readAllServiceData error: ' + errorCode);
		});
	},
};
