// JavaScript code for the BLE TI SensorTag example app.

// TODO: Shorten long lines, add function comments.

// The BLE plugin object.
var ble = null;

// TODO: Move global function to app object?
var formatFlags = function(name, flags, translation) {
	var str = name+':';
	for (var key in translation) {
		if((flags & key) != 0)
			str += ' '+translation[key];
	}
	return str;
}

var app = {
    // Application Constructor
	initialize: function() {
		this.bindEvents();
	},

	// Bind Event Listeners
	//
	// Bind any events that are required on startup. Common events are:
	// 'load', 'deviceready', 'offline', and 'online'.
	bindEvents: function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);
	},

	// deviceready Event Handler
	//
	// The scope of 'this' is the event. In order to call the 'receivedEvent'
	// function, we must explicity call 'app.receivedEvent(...);'
	onDeviceReady: function() {

		ble = evothings.ble;

		app.receivedEvent('deviceready');

		/*
		app.drawLines([-500,1000,2000]);
		return;
		*/

		app.startStuff();
	},

	startStuff: function() {
		var device = window.sessionStorage.getItem('device');
		var address = window.sessionStorage.getItem('address');

		window.sessionStorage.setItem('device', false);
		window.sessionStorage.setItem('magPeriod', false);
		window.sessionStorage.setItem('magConf', false);
		window.sessionStorage.setItem('magNotification', false);
		window.sessionStorage.setItem('magData', false);

		if(device != null && device != "false") {
			console.log("device: "+device);
			console.log("address: "+address);
			ble.close(device);
		}
		/*
		if(address != null && address != "false") {
			setTimeout(function() { app.connect(address); }, 1000);
			return;
		}
		*/

		ble.stopScan();
		app.startLeScan();
	},
	// Update DOM on a Received Event
	receivedEvent: function(id) {
		console.log('Received Event: ' + id);
	},

	reset: function() {
		console.log("reset");
		app.scanRunning = false;
		app.resetting = true;
		if(app.resetTimeout) { clearTimeout(app.resetTimeout); }
		if(app.scanTimeout) { clearTimeout(app.scanTimeout); }
		if(app.connectTimeout) { clearTimeout(app.connectTimeout); }
		ble.stopScan();
		ble.reset(function() {
			app.resetting = false;
			console.log("reset complete!");
			app.startStuff();
		}, function(err) {
			console.log("reset error: "+err);
		});
		/*app.resetTimeout = setTimeout(function() {
			if(app.resetting) {
				console.log("reset timeout, trying again!");
				app.reset();
			}
		}, 10000);*/
	},

	resetting: false,
	resetTimeout: false,
	scanTimeout: false,
	connectTimeout: false,

	knownDevices: {},

	connectee: false,

	canvas: false,

	scanStarted: false,

	startLeScan: function() {
		console.log('startScan');
		ble.startScan(function(r) {
			app.scanStarted = true;
			//address, rssi, name, scanRecord
			if(app.knownDevices[r.address]) {
				return;
			}
			app.knownDevices[r.address] = r;
			var res = r.address+" "+r.rssi+" "+r.name
			console.log('scan result: ' + res);
			if(r.name == 'SensorTag' && !app.connectee) {
				ble.stopScan();
				window.sessionStorage.setItem('address', r.address);
				app.connect(r.address);
			}
		}, function(errorCode) {
			console.log('startScan error: ' + errorCode);
			app.reset();
		});
		app.scanTimeout = setTimeout(function() {
			if(!app.scanStarted) {
				console.log("scan timeout");
				app.reset();
			}
		}, 10000);
	},

	connect: function(address) {
		console.log('connect('+address+')');
		app.connectee = address;
		ble.connect(address, function(r) {
			console.log('connect '+r.device+' state '+r.state);
			if(!app.connectee) {
				console.log('connection aborted');
				return;
			}
			window.sessionStorage.setItem('device', r.device);
			if(r.state == 2) {	// connected
				app.checkServices(r.device);
			}
		}, function(errorCode) {
			console.log('connect error: ' + errorCode);
			app.reset();
		});
		app.connectTimeout = setTimeout(function() {
			if(window.sessionStorage.getItem('magPeriod') == "false") {
				console.log("connect timeout");
				app.connectee = false;
				app.reset();
			}
		}, 20000);
	},

	startMag: function(device) {
		console.log("startMag");
		app.write('writeCharacteristic', device, 'magPeriod', new Uint8Array([10]));	// 100 ms
		app.write('writeCharacteristic', device, 'magConf', new Uint8Array([1]));	// on
		app.write('writeDescriptor', device, 'magNotification', new Uint8Array([1,0]));	// on
		ble.enableNotification(device, window.sessionStorage.getItem('magData'), function(data) {
			//console.log('byteLength: '+data.byteLength);
			var a = new Int16Array(data);
			//console.log('length: '+a.length);
			//console.log('data: '+a[0]+' '+a[1]+' '+a[2]);
			app.drawLines(a);
		}, function(errorCode) {
			console.log('notification error: '+errorCode);
		});
		console.log("startMag end");
	},

	dataPoints: [
		/*
		[-500,1000,2000],
		[-501,1001,2001],
		[-502,1002,2002],
		[-503,1003,2003],
		*/
	],

	drawLines: function(a) {
		var canvas = document.getElementById('canvas');
		if(!app.canvas) {
			app.canvas = canvas.getContext('2d');
		}
		var d = app.dataPoints;
		var c = app.canvas;

		d.push(a);
		if(d.length > canvas.width) {
			d.splice(0, (d.length - canvas.width));
		}

		c.clearRect(0,0, canvas.width, canvas.height);
		//console.log(canvas.width+' '+canvas.height);

		var magnitude = 10000;

		function calcY(i) {
			return ((i * canvas.height) / (magnitude*2)) + (canvas.height / 2);
		}
		function drawLine(offset, color) {
			c.strokeStyle = color;
			c.beginPath();
			c.moveTo(0, calcY(d[d.length-1][offset]));
			var x = 1;
			for (var i = d.length-2; i >= 0; i--) {
				var y = calcY(d[i][offset]);
				//console.log(i+': '+x+' '+y);
				c.lineTo(x, y);
				x++;
			}
			c.stroke();
		}
		drawLine(0, '#f00');
		drawLine(1, '#0f0');
		drawLine(2, '#00f');
	},

	write: function(writeFunc, device, name, value) {
		ble[writeFunc](device, window.sessionStorage.getItem(name), value, function() {
			console.log(writeFunc+' '+name+' success.');
		}, function(errorCode) {
			console.log(writeFunc+' '+name+' error: '+errorCode);
		});
	},

	checkServices: function(device) {
		/*if(window.sessionStorage.getItem('magData') != false) {
			console.log('connected, restarting measurements...');
			app.startMag(device);
		} else*/ {
			console.log('connected, requesting services...');
			app.services(device);
		}
	},

	services: function(device) {
		var first = true;
		var serviceCount;
		var services = [];
		var finish = function() {
			console.log('finish');
			for(var si in services) {
				var ss = services[si];
				var s = ss.s;
				//console.log('s'+s.handle+': '+s.type+' '+s.uuid+'. '+s.characteristicCount+' chars.');

				for(var ci in ss.c) {
					var cc = ss.c[ci];
					var c = cc.c;
					//console.log(' c'+c.handle+': '+c.uuid+'. '+c.descriptorCount+' desc.');

					if(c.uuid == "f000aa31-0451-4000-b000-000000000000") {
						console.log('magData');
						window.sessionStorage.setItem('magData', c.handle);
					}
					if(c.uuid == "f000aa32-0451-4000-b000-000000000000") {
						console.log('magConf');
						window.sessionStorage.setItem('magConf', c.handle);
					}
					if(c.uuid == "f000aa33-0451-4000-b000-000000000000") {
						console.log('magPeriod');
						window.sessionStorage.setItem('magPeriod', c.handle);
					}

					for(var di in cc.d) {
						var d = cc.d[di];
						//console.log('  d'+d.handle+': '+d.uuid);
						if(c.uuid == "f000aa31-0451-4000-b000-000000000000" &&
							d.uuid == "00002902-0000-1000-8000-00805f9b34fb")
						{
							console.log('magNotification');
							window.sessionStorage.setItem('magNotification', d.handle);
						}

						// This be the human-readable name of the characteristic.
						/*
						if(d.uuid == "00002901-0000-1000-8000-00805f9b34fb") {
							var h = d.handle;
							//console.log("rd "+h);
							// need a function here for the closure, so that variables h, ch, dli retain proper values.
							// without it, all strings would be added to the last descriptor.
							function f(h) {
								ble.readDescriptor(device, h, function(data) {
									var s = ble.fromUtf8(data);
									//console.log("rdw "+h+": "+s);
								},
								function(errorCode) {
									console.log("rdf "+h+": "+errorCode);
								});
							}
							f(h);
						}
						*/
					}
				}
			}
			app.startMag(device);
		};
		ble.services(device, function(s) {
			serviceCount = s.serviceCount;
			if(first) {
				//console.log('s'+s.handle+"/"+serviceCount+" "+s.characteristicCount);
			}
			var service = {s:s, c:[]};
			//msg += 's'+s.handle+': '+s.type+' '+s.uuid+'. '+s.characteristicCount+' chars.'+"\n";
			if(s.characteristicCount == 0) {
				services.push(service);
				if(services.length == serviceCount) {
					console.log('f1');
					finish();
				}
			}
			ble.characteristics(device, s.handle, function(c) {
				//console.log(' c'+c.handle+"/"+s.characteristicCount+" "+c.descriptorCount);
				var characteristic = {c:c, d:[]};
				//msg += ' c'+c.handle+': '+c.uuid+'. '+c.descriptorCount+' desc.'+"\n";
				//dumpFlags('  permissions', c.permissions, ble.permission);
				formatFlags('  properties', c.properties, ble.property);
				formatFlags('  writeType', c.writeType, ble.writeType);
				if(c.descriptorCount == 0) {
					service.c.push(characteristic);
					if(service.c.length == s.characteristicCount) services.push(service);
					if(services.length == serviceCount) {
						console.log('f2');
						finish();
					}
				}
				ble.descriptors(device, c.handle, function(d) {
					//console.log('  d'+d.handle+"/"+c.descriptorCount);
					characteristic.d.push(d);
					//msg += '  d'+d.handle+': '+d.uuid+"\n";
					//dumpFlags('   permissions', d.permissions, ble.permission);
					if(characteristic.d.length == c.descriptorCount) service.c.push(characteristic);
					if(service.c.length == s.characteristicCount) services.push(service);
					if(services.length == serviceCount) {
						console.log('f3');
						finish();
					}
				}, function(errorCode) {
					console.log('  descriptors error: ' + errorCode);
				});
			}, function(errorCode) {
				console.log(' characteristics error: ' + errorCode);
			});
		}, function(errorCode) {
			console.log('services error: ' + errorCode);
		});
	},
};
