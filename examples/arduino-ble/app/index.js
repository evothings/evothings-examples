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
	},
	/** deviceready Event Handler

		The scope of 'this' is the event. In order to call the 'receivedEvent'
		function, we must explicity call 'app.receivedEvent(...);' */
	onDeviceReady: function()
	{
		app.receivedEvent('deviceready');

		ble = evothings.ble; // EvoThings BLE plugin

		if (window.sessionStorage.getItem('deviceState') == 2)
		{
			app.checkServices(window.sessionStorage.getItem('device'));
			return;
		}

		//console.log("testCharConversion");
		// once this passes, we can startLeScan().
		//app.testCharConversion();
		//console.log("resetting...");
		ble.stopScan();
		window.sessionStorage.setItem('device', false);
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

	device: false,

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
			console.log('connect '+r.device+' state '+r.state);
			window.sessionStorage.setItem('device', r.device);
			window.sessionStorage.setItem('connectState', r.state);
			if (r.state == 2)
			{ // connected
				app.device = r.device;
				app.checkServices(r.device);
			}
		}, function(errorCode)
		{
			console.log('connect error: ' + errorCode);
		});
	},

	on: function()
	{
		console.log("on");
		app.write('writeCharacteristic', app.device, 'rx', new Uint8Array([33]));
		console.log("on end");
	},

	off: function()
	{
		console.log("off");
		app.write('writeCharacteristic', app.device, 'rx', new Uint8Array([0]));
		console.log("off end");
	},

	write: function(writeFunc, device, name, value)
	{
		ble[writeFunc](device, window.sessionStorage.getItem(name), value, function()
		{
			console.log(writeFunc+' '+name+' success.');
		}, function(errorCode) {
			console.log(writeFunc+' '+name+' error: '+errorCode);
		});
	},

	checkServices: function(device)
	{
		console.log('connected, requesting services...');
		app.getServices(device);
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

	startReading: function(device)
	{
		app.write('writeDescriptor', device, 'txNotification', new Uint8Array([1,0]));	// on
		ble.enableNotification(device, window.sessionStorage.getItem('tx'), function(data)
		{
			app.drawLines([new DataView(data).getUint16(0, true)]);
		}, function(errorCode)
		{
			console.log(enableNotification+' error: '+errorCode);
		});
	},

	getServices: function(device)
	{
		var first = true;
		var serviceCount;
		var services = [];
		var finish = function()
		{
			console.log('finish');
			for (var si in services)
			{
				var ss = services[si];
				var s = ss.s;
				//console.log('s'+s.handle+': '+s.type+' '+s.uuid+'. '+s.characteristicCount+' chars.');

				for (var ci in ss.c)
				{
					var cc = ss.c[ci];
					var c = cc.c;
					//console.log(' c'+c.handle+': '+c.uuid+'. '+c.descriptorCount+' desc.');

					if (c.uuid == "713d0002-503e-4c75-ba94-3148f18d941e")
					{
						console.log('tx');	// we read from this one
						window.sessionStorage.setItem('tx', c.handle);
					}
					if (c.uuid == "713d0003-503e-4c75-ba94-3148f18d941e")
					{
						console.log('rx');	// we write to this one
						window.sessionStorage.setItem('rx', c.handle);
					}
					for (var di in cc.d)
					{
						var d = cc.d[di];
						if (c.uuid == "713d0002-503e-4c75-ba94-3148f18d941e" &&
							d.uuid == "00002902-0000-1000-8000-00805f9b34fb")
						{
							console.log('txNotification');
							window.sessionStorage.setItem('txNotification', d.handle);
						}
					}
				}
			}
			app.startReading(device);
		};
		ble.services(device, function(s)
		{
			serviceCount = s.serviceCount;
			if (first) {
				//console.log('s'+s.handle+"/"+serviceCount+" "+s.characteristicCount);
			}
			var service = {s:s, c:[]};
			//msg += 's'+s.handle+': '+s.type+' '+s.uuid+'. '+s.characteristicCount+' chars.'+"\n";
			if (s.characteristicCount == 0)
			{
				services.push(service);
				if (services.length == serviceCount)
				{
					console.log('f1');
					finish();
				}
			}
			ble.characteristics(device, s.handle, function(c)
			{
				//console.log(' c'+c.handle+"/"+s.characteristicCount+" "+c.descriptorCount);
				var characteristic = {c:c, d:[]};
				//msg += ' c'+c.handle+': '+c.uuid+'. '+c.descriptorCount+' desc.'+"\n";
				//dumpFlags('  permissions', c.permissions, ble.permission);
				formatFlags('  properties', c.properties, ble.property);
				formatFlags('  writeType', c.writeType, ble.writeType);
				if (c.descriptorCount == 0)
				{
					service.c.push(characteristic);
					if (service.c.length == s.characteristicCount) services.push(service);
					if (services.length == serviceCount)
					{
						console.log('f2');
						finish();
					}
				}
				ble.descriptors(device, c.handle, function(d)
				{
					//console.log('  d'+d.handle+"/"+c.descriptorCount);
					characteristic.d.push(d);
					//msg += '  d'+d.handle+': '+d.uuid+"\n";
					//dumpFlags('   permissions', d.permissions, ble.permission);
					if (characteristic.d.length == c.descriptorCount)
						service.c.push(characteristic);
					if (service.c.length == s.characteristicCount)
						services.push(service);
					if (services.length == serviceCount) {
						console.log('f3');
						finish();
					}
				}, function(errorCode)
				{
					console.log('  descriptors error: ' + errorCode);
				});
			}, function(errorCode)
			{
				console.log(' characteristics error: ' + errorCode);
			});
		}, function(errorCode)
		{
			console.log('services error: ' + errorCode);
		});
	},
};
