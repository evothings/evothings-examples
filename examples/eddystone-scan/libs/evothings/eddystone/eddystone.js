// File: eddystone.js

// This library scans for Eddystone beacons and translates their
// advertisements into user-friendly variables.
// The protocol specification is available at:
// https://github.com/google/eddystone

;(function() {

// prerequisites
evothings.loadScripts([
	'libs/evothings/easyble/easyble.js',
])

/**
 * @namespace
 * @description <p>Library for Eddystone beacons.</p>
 * <p>It is safe practise to call function {@link evothings.scriptsLoaded}
 * to ensure dependent libraries are loaded before calling functions
 * in this library.</p>
 */
evothings.eddystone = {};

// constants
var BLUETOOTH_BASE_UUID = '-0000-1000-8000-00805f9b34fb';

// false when scanning is off. true when on.
var isScanning = false;

/**
 * @description Starts scanning for Eddystone devices.
 * <p>Found devices and errors will be reported to the supplied callbacks.</p>
 * <p>Will keep scanning indefinitely until you call stopScan().</p>
 * <p>To conserve energy, call stopScan() as soon as you've found the device
 * you're looking for.</p>
 * <p>Calling startScan() while scanning is in progress will produce an error.</p>
 *
 * @param {evothings.eddystone.scanCallback} - Success function called
 * when a beacon is found.
 * @param {evothings.eddystone.failCallback} - Error callback: fail(error).
 *
 * @public
 *
 * @example
 *   evothings.eddystone.startScan(
 *     function(beacon)
 *     {
 *       console.log('Found beacon: ' + beacon.url);
 *     },
 *     function(error)
 *     {
 *       console.log('Scan error: ' + error);
 *     });
 */
evothings.eddystone.startScan = function(scanCallback, failCallback)
{
	// Internal callback variable names.
	var win = scanCallback;
	var fail = failCallback;

	// If scanning is already in progress, fail.
	if(isScanning)
	{
		fail("Scanning already in progress!");
		return;
	}

	isScanning = true;

	// The device object given in this callback is reused by easyble.
	// Therefore we can store data in it and expect to have the data still be there
	// on the next callback with the same device.
	evothings.easyble.startScan(
		// Scan for Eddystone Service UUID.
		// This enables background scanning on iOS (and Android).
		['0000FEAA-0000-1000-8000-00805F9B34FB'],
		function(device)
		{
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
		},
		function(error)
		{
			fail(error);
		});
}

/**
 * @description This function is a parameter to startScan() and
 * is called when a beacons is discovered/updated.
 * @callback evothings.eddystone.scanCallback
 * @param {evothings.eddystone.EddystoneDevice} beacon - Beacon
 * found during scanning.
 */

/**
 * @description This function is called when an operation fails.
 * @callback evothings.eddystone.failCallback
 * @param {string} errorString - A human-readable string that
 * describes the error that occurred.
 */

/**
 * @description Object representing a BLE device. Inherits from
 * {@link evothings.easyble.EasyBLEDevice}.
 * Which properties are available depends on which packets types broadcasted
 * by the beacon. Properties may be undefined. Typically properties are populated
 * as scanning processes.
 * @typedef {Object} evothings.eddystone.EddystoneDevice
 * @property {string} url - An Internet URL.
 * @property {number} txPower - A signed integer, the signal strength in decibels,
 * factory-measured at a range of 0 meters.
 * @property {Uint8Array} nid - 10-byte namespace ID.
 * @property {Uint8Array} bid - 6-byte beacon ID.
 * @property {number} voltage - Device's battery voltage, in millivolts,
 * or 0 (zero) if device is not battery-powered.
 * @property {number} temperature - Device's ambient temperature in 256:ths of
 * degrees Celcius, or 0x8000 if device has no thermometer.
 * @property {number} adv_cnt - Count of advertisement frames sent since device's startup.
 * @property {number} dsec_cnt - Time since device's startup, in deci-seconds
 * (10 units equals 1 second).
*/

/**
 * @description Stop scanning for Eddystone devices.
 * @public
 * @example
 *   evothings.eddystone.stopScan();
 */
evothings.eddystone.stopScan = function()
{
	evothings.easyble.stopScan();
	isScanning = false;
}

/**
 * @description Calculate the accuracy (distance in meters) of the beacon.
 * <p>The beacon distance calculation uses txPower at 1 meters, but the
 * Eddystone protocol reports the value at 0 meters. 41dBm is the signal
 * loss that occurs over 1 meter, this value is subtracted by default
 * from the reported txPower. You can tune the calculation by adding
 * or subtracting to param txPower.<p>
 * <p>Note that the returned distance value is not accurate, and that
 * it fluctuates over time. Sampling/filtering over time is recommended
 * to obtain a stable value.<p>
 * @public
 * @param txPower The txPower of the beacon.
 * @param rssi The RSSI of the beacon, subtract or add to this value to
 * tune the dBm strength. 41dBm is subtracted from this value in the
 * distance algorithm used by calculateAccuracy.
 * @return Distance in meters, or null if unable to compute distance
 * (occurs for example when txPower or rssi is undefined).
 * @example
 *   // Note that beacon.txPower and beacon.rssi many be undefined,
 *   // in which case calculateAccuracy returns null. This happens
 *   // before txPower and rssi have been reported by the beacon.
 *   var distance = evothings.eddystone.calculateAccuracy(
 *       beacon.txPower, beacon.rssi);
 */
evothings.eddystone.calculateAccuracy = function(txPower, rssi)
{
	if (!rssi || rssi >= 0 || !txPower)
	{
		return null
	}

	// Algorithm
	// http://developer.radiusnetworks.com/2014/12/04/fundamentals-of-beacon-ranging.html
	// http://stackoverflow.com/questions/21338031/radius-networks-ibeacon-ranging-fluctuation

	// The beacon distance formula uses txPower at 1 meters, but the Eddystone
	// protocol reports the value at 0 meters. 41dBm is the signal loss that
	// occurs over 1 meter, so we subtract that from the reported txPower.
	var ratio = rssi * 1.0 / (txPower - 41)
	if (ratio < 1.0)
	{
		return Math.pow(ratio, 10)
	}
	else
	{
		var accuracy = (0.89976) * Math.pow(ratio, 7.7095) + 0.111
		return accuracy
	}
}

/**
 * Create a low-pass filter.
 * @param cutOff The filter cut off value.
 * @return Object with two functions: filter(value), value()
 * @example
 *   // Create filter with cut off 0.8
 *   var lowpass = evothings.eddystone.createLowPassFilter(0.8)
 *   // Filter value (returns current filter value)
 *   distance = lowpass.filter(distance)
 *   // Get current value
 *   distance = lowpass.value()
 */
evothings.eddystone.createLowPassFilter = function(cutOff, state)
{
	// Filter cut off.
	if (undefined === cutOff) { cutOff = 0.8 }

	// Current value of the filter.
	if (undefined === state) { state = 0.0 }

	// Return object with filter functions.
	return {
		// This function will filter the given value.
		// Returns the current value of the filter.
		filter: function(value)
		{
			state =
				(value * (1.0 - cutOff)) +
				(state * cutOff)
			return state
		},
		// This function returns the current value of the filter.
		value: function()
		{
			return state
		}
	}
}

// Return true on frame type recognition, false otherwise.
function parseFrameUID(device, data, win, fail)
{
	if(data[0] != 0x00) return false;

	// The UID frame has 18 bytes + 2 bytes reserved for future use
	// https://github.com/google/eddystone/tree/master/eddystone-uid
	// Check that we got at least 18 bytes.
	if(data.byteLength < 18)
	{
		fail("UID frame: invalid byteLength: "+data.byteLength);
		return true;
	}

	device.txPower = evothings.util.littleEndianToInt8(data, 1);
	device.nid = data.subarray(2, 12);  // Namespace ID.
	device.bid = data.subarray(12, 18); // Beacon ID.

	win(device);

	return true;
}

function parseFrameURL(device, data, win, fail)
{
	if(data[0] != 0x10) return false;

	if(data.byteLength < 4)
	{
		fail("URL frame: invalid byteLength: "+data.byteLength);
		return true;
	}

	device.txPower = evothings.util.littleEndianToInt8(data, 1);

	// URL scheme prefix
	var url;
	switch(data[2]) {
		case 0: url = 'http://www.'; break;
		case 1: url = 'https://www.'; break;
		case 2: url = 'http://'; break;
		case 3: url = 'https://'; break;
		default: fail("URL frame: invalid prefix: "+data[2]); return true;
	}

	// Process each byte in sequence.
	var i = 3;
	while(i < data.byteLength)
	{
		var c = data[i];
		// A byte is either a top-domain shortcut, or a printable ascii character.
		if(c < 14)
		{
			switch(c)
			{
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
		}
		else if(c < 32 || c >= 127)
		{
			// Unprintables are not allowed.
			fail("URL frame: invalid character: "+data[2]);
			return true;
		}
		else
		{
			url += String.fromCharCode(c);
		}

		i += 1;
	}

	// Set URL field of the device.
	device.url = url;

	win(device);

	return true;
}

function parseFrameTLM(device, data, win, fail)
{
	if(data[0] != 0x20) return false;

	if(data[1] != 0x00)
	{
		fail("TLM frame: unknown version: "+data[1]);

		return true;
	}

	if(data.byteLength != 14)
	{
		fail("TLM frame: invalid byteLength: "+data.byteLength);

		return true;
	}

	device.voltage = evothings.util.bigEndianToUint16(data, 2);

	var temp = evothings.util.bigEndianToUint16(data, 4);
	if(temp == 0x8000)
	{
		device.temperature = 0x8000;
	}
	else
	{
		device.temperature = evothings.util.bigEndianToInt16(data, 4) / 256.0;
	}

	device.adv_cnt = evothings.util.bigEndianToUint32(data, 6);
	device.dsec_cnt = evothings.util.bigEndianToUint32(data, 10);

	win(device);

	return true;
}

})();
