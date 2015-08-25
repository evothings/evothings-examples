// This library scans for Eddystone beacons and translates their
// advertisements into user-friendly variables.
// The protocol specification is available at:
// https://github.com/google/eddystone

// prerequisites
evothings.loadScripts([
	'libs/evothings/easyble/easyble.js',
])

evothings.eddystone = {};

(function() {
// constants
var BLUETOOTH_BASE_UUID = '-0000-1000-8000-00805f9b34fb';

// false when scanning is off. true when on.
var isScanning = false;

/** Starts scanning for Eddystone devices.
* <p>Found devices and errors will be reported to the supplied callbacks.</p>
* <p>Will keep scanning indefinitely until you call stopScan().</p>
* To conserve energy, call stopScan() as soon as you've found the device you're looking for.
* <p>Calling this function while scanning is in progress will fail.</p>
*
* @param {scanCallback} win
* @param {failCallback} fail
*/
evothings.eddystone.startScan = function(win, fail) {
	// If scanning is already in progress, fail.
	if(isScanning) {
		fail("Scanning already in progress!");
		return;
	}

	isScanning = true;

	// The device object given in this callback is reused by easyble.
	// Therefore we can store data in it and expect to have the data still be there
	// on the next callback with the same device.
	evothings.easyble.startScan(function(device) {
		// A device might be an Eddystone if it has advertisementData...
		var ad = device.advertisementData;
		if(!ad) return;
		// With serviceData...
		var sd = ad.kCBAdvDataServiceData;
		if(!sd) return;
		// And the 0xFEAA service.
		var base64data = sd['0000feaa'+BLUETOOTH_BASE_UUID];
		if(!base64data) return;
		var byteArray = evothings.util.base64DecToArr(base64data);

		// If the data matches one of the Eddystone frame formats,
		// we can forward it to the user.
		if(parseFrameUID(device, byteArray, win, fail)) return;
		if(parseFrameURL(device, byteArray, win, fail)) return;
		if(parseFrameTLM(device, byteArray, win, fail)) return;

	}, function(error) {
		fail(error);
	});
}

/** This function is a parameter to startScan() and is called when a new device is discovered.
* @callback scanCallback
* @param {EddystoneDevice} device
*/

/** Object representing a BLE device. Inherits from evothings.easyble.EasyBLEDevice.
* All uninherited properties are optional; they may be missing.
* @typedef {Object} EddystoneDevice
* @property {string} url - An Internet URL.
* @property {number} txPower - A signed integer, the signal strength in decibels, factory-measured at a range of 0 meters.
* @property {Uint8Array} nid - 10-byte namespace ID.
* @property {Uint8Array} bid - 6-byte beacon ID.
* @property {number} voltage - Device's battery voltage, in millivolts, or 0 (zero) if device is not battery-powered.
* @property {number} temperature - Device's ambient temperature in 256:ths of degrees Celcius, or 0x8000 if device has no thermometer.
* @property {number} adv_cnt - Count of advertisement frames sent since device's startup.
* @property {number} dsec_cnt - Time since device's startup, in deci-seconds (10 units equals 1 second).
*/

/** Stop scanning for Eddystone devices.
*/
evothings.eddystone.stopScan = function() {
	evothings.easyble.stopScan();
	isScanning = false;
}

// Return true on frame type recognition, false otherwise.
function parseFrameUID(device, data, win, fail) {
	if(data[0] != 0x00) return false;
	// The UID frame has 18 bytes + 2 bytes reserved for future use
	// https://github.com/google/eddystone/tree/master/eddystone-uid
	// Check that we got at least 18 bytes.
	if(data.byteLength < 18) {
		fail("UID frame: invalid byteLength: "+data.byteLength);
		return true;
	}
	device.txPower = evothings.util.littleEndianToInt8(data, 1);
	device.nid = data.subarray(2, 12);  // Namespace ID.
	device.bid = data.subarray(12, 18); // Beacon ID.
	win(device);
	return true;
}

function parseFrameURL(device, data, win, fail) {
	if(data[0] != 0x10) return false;
	if(data.byteLength < 4) {
		fail("URL frame: invalid byteLength: "+data.byteLength);
		return true;
	}
	device.txPower = evothings.util.littleEndianToInt8(data, 1);
	var url;
	// URL scheme prefix
	switch(data[2]) {
		case 0: url = 'http://www.'; break;
		case 1: url = 'https://www.'; break;
		case 2: url = 'http://'; break;
		case 3: url = 'https://'; break;
		default: fail("URL frame: invalid prefix: "+data[2]); return true;
	}
	// Process each byte in sequence.
	var i = 3;
	while(i < data.byteLength) {
		var c = data[i];
		// A byte is either a top-domain shortcut, or a printable ascii character.
		if(c < 14) {
			switch(c) {
				case 0: url += '.com/'; break;
				case 1: url += '.org/'; break;
				case 2: url += '.edu/'; break;
				case 3: url += '.net/'; break;
				case 4: url += '.info/'; break;
				case 5: url += '.biz/'; break;
				case 6: url += '.gov/'; break;
				case 7: url += '.com'; break;
				case 8: url += '.org'; break;
				case 9: url += '.edu'; break;
				case 10: url += '.net'; break;
				case 11: url += '.info'; break;
				case 12: url += '.biz'; break;
				case 13: url += '.gov'; break;
			}
		} else if(c < 32 || c >= 127) {
			// Unprintables are not allowed.
			fail("URL frame: invalid character: "+data[2]);
			return true;
		} else {
			url += String.fromCharCode(c);
		}

		i += 1;
	}
	device.url = url;
	win(device);
	return true;
}

function parseFrameTLM(device, data, win, fail) {
	if(data[0] != 0x20) return false;
	if(data[1] != 0x00) {
		fail("TLM frame: unknown version: "+data[1]);
		return true;
	}
	if(data.byteLength != 14) {
		fail("TLM frame: invalid byteLength: "+data.byteLength);
		return true;
	}

	device.voltage = evothings.util.bigEndianToUint16(data, 2);

	var temp = evothings.util.bigEndianToUint16(data, 4);
	if(temp == 0x8000)
		device.temperature = 0x8000;
	else
		device.temperature = evothings.util.bigEndianToInt16(data, 4) / 256.0;

	device.adv_cnt = evothings.util.bigEndianToUint32(data, 6);
	device.dsec_cnt = evothings.util.bigEndianToUint32(data, 10);

	win(device);
	return true;
}

})();
