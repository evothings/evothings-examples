// JavaScript code for the Lightblue Bean example app.

var util = evothings.util;
var bean = evothings.bean;

/**
 * Application object that holds data and functions used by the app.
 */
var app =
{
	initialize: function() {
		document.addEventListener('deviceready', app.onDeviceReady, false);
	},

	fail: function(error) {
		console.log("fail: "+error);
		var span = document.getElementById('status');
		span.innerHTML = "failed";
	},

	// Called when device plugin functions are ready for use.
	onDeviceReady: function() {
		var span = document.getElementById('status');
		bean.observeConnectionState(function(state) {
			console.log(state);
			span.innerHTML = state;
		});

		bean.connectToFirstDevice(function() {
			// set up serial comms
			bean.startSerialRead(app.handleSerialRead, app.fail);
			app.serialWrite();
		}, app.fail);
	},

	bytesToHexString: function(data) {
		var hex = '';
		for(var i=0; i<data.byteLength; i++) {
			hex += (data[i] >> 4).toString(16);
			hex += (data[i] & 0xF).toString(16);
		}
		return hex;
	},

	handleSerialRead: function(data) {
		//console.log(data.byteLength + " bytes.");
		// dump raw data
		var hex = app.bytesToHexString(data);
		console.log('SerialRead: ' + hex + " ("+evothings.ble.fromUtf8(data)+")");
	},

	computeCRC16: function(data) {
		var crc = 0xFFFF;

		for (var i=0; i<data.length; i++) {
			var byte = data[i];
			crc = (((crc >> 8) & 0xff) | (crc << 8)) & 0xFFFF;
			crc ^= byte;
			crc ^= ((crc & 0xff) >> 4) & 0xFFFF;
			crc ^= ((crc << 8) << 4) & 0xFFFF;
			crc ^= (((crc & 0xff) << 4) << 1) & 0xFFFF;
		}

		return crc;
	},

	serialWrite: function() {
		var data = new Uint8Array([0x01]);
		app.serialWriteData(data);
	},

	serialWriteString: function(string) {
		var data = new Uint8Array(evothings.ble.toUtf8(string));
		app.serialWriteData(data);
	},

	serialWriteData: function(data) {
		bean.serialWrite(
			data,
			function() {
				console.log("write success");
				// Send data. When commented out evaluate app.serialWrite()
				// in the Workbench Tools window to send data.
				/*if(app.writeCount < 5) {
					app.writeCount++;
					setTimeout(function(){app.serialWrite()}, 1000);
				}*/
			},
			app.fail);
	},
};
// End of app object.

// Initialise app.
app.initialize();
