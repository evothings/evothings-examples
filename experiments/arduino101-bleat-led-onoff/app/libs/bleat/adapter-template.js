/* @license
 *
 * BLE Abstraction Tool: template adapter
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 Rob Moran
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// https://github.com/umdjs/umd
(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['bleat', 'bluetooth.helpers'], factory);
	} else if (typeof exports === 'object') {
		// Node. Does not work with strict CommonJS
		module.exports = function(bleat) {
			return factory(bleat, require('./bluetooth.helpers'));
		};
	} else {
		// Browser globals with support for web workers (root is window)
		factory(root.bleat, root.bleatHelpers);
	}
}(this, function(bleat, helpers) {
	"use strict";

	bleat._addAdapter("<template-name>", {

		// Begin scanning for devices
		startScan: function(
			serviceUUIDs,	// String[] serviceUUIDs		advertised service UUIDs to restrict results by
			foundFn,		// Function(Object deviceInfo)	function called with each discovered deviceInfo
			completeFn,		// Function()					function called when scanning successfully started
			errorFn			// Function(String errorMsg)	function called if error occurs
		) {},

		// Stop scanning for devices
		stopScan: function(
			errorFn			// Function(String errorMsg)	function called if error occurs
		) {},

		// Connect to a device
		connect: function(
			handle,			// String handle				device handle
			connectFn,		// Function()					function called when device connected
			disconnectFn,	// Function()					function called when device disconnected
			errorFn			// Function(String errorMsg)	function called if error occurs
		) {},

		// Disconnect from a device
		disconnect: function(
			handle,			// String handle				device handle
			errorFn			// Function(String errorMsg)	function called if error occurs
		) {},

		// Discover services on a device
		discoverServices: function(
			handle,			// String handle					device handle
			serviceUUIDs,	// String[] serviceUUIDs			service UUIDs to restrict results by
			completeFn,		// Function(Object[] serviceInfo)	function called when discovery completed
			errorFn			// Function(String errorMsg)		function called if error occurs
		) {},

		// Discover included services on a service
		discoverIncludedServices: function(
			handle,			// String handle					service handle
			serviceUUIDs,	// String[] serviceUUIDs			service UUIDs to restrict results by
			completeFn,		// Function(Object[] serviceInfo)	function called when discovery completed
			errorFn			// Function(String errorMsg)		function called if error occurs
		) {},

		// Discover characteristics on a service
		discoverCharacteristics: function(
			handle,					// String handle							service handle
			characteristicUUIDs,	// String[] characteristicUUIDs				characteristic UUIDs to restrict results by
			completeFn,				// Function(Object[] characteristicInfo)	function called when discovery completed
			errorFn					// Function(String errorMsg)				function called if error occurs
		) {},

		// Discover descriptors on a characteristic
		discoverDescriptors: function(
			handle,				// String handle						characteristic handle
			descriptorUUIDs,	// String[] descriptorUUIDs				descriptor UUIDs to restrict results by
			completeFn,			// Function(Object[] descriptorInfo)	function called when discovery completed
			errorFn				// Function(String errorMsg)			function called if error occurs
		) {},

		// Read a characteristic value
		readCharacteristic: function(
			handle,			// String handle				characteristic handle
			completeFn,		// Function(DataView value)		function called when read completes
			errorFn			// Function(String errorMsg)	function called if error occurs
		) {},

		// Write a characteristic value
		writeCharacteristic: function(
			handle,			// String handle				characteristic handle
			value,			// DataView value				value to write
			completeFn,		// Function()					function called when write completes
			errorFn			// Function(String errorMsg)	function called if error occurs
		) {},

		// Enable value change notifications on a characteristic
		enableNotify: function(
			handle,			// String handle				characteristic handle
			notifyFn,		// Function(DataView value)		function called when value changes
			completeFn,		// Function()					function called when notifications enabled
			errorFn			// Function(String errorMsg)	function called if error occurs
		) {},

		// Disable value change notifications on a characteristic
		disableNotify: function(
			handle,			// String handle				characteristic handle
			completeFn,		// Function()					function called when notifications disabled
			errorFn			// Function(String errorMsg)	function called if error occurs
		) {},

		// Read a descriptor value
		readDescriptor: function(
			handle,			// String handle				descriptor handle
			completeFn,		// Function(DataView value)		function called when read completes
			errorFn			// Function(String errorMsg)	function called if error occurs
		) {},

		// Write a descriptor value
		writeDescriptor: function(
			handle,			// String handle				descriptor handle
			value,			// DataView value				value to write
			completeFn,		// Function()					function called when write completes
			errorFn			// Function(String errorMsg)	function called if error occurs
		) {}

	});
}));
