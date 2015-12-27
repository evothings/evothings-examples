(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.nrfeWidgets = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var fn = function (def, parent)
{
  console.log('ble characteristics instantiated');
  def.in = function(msg)
  {
    var deviceHandle = msg.payload.device
    var serviceHandle = msg.payload.handle
    console.log('ble characteristics device = '+deviceHandle+', service = '+serviceHandle)
    if(deviceHandle && serviceHandle && evothings && evothings.ble)
    {
      evothings.ble.characteristics(
        deviceHandle,
        serviceHandle,
        function(characteristics)
        {
          characteristics.forEach(function(ch)
          {
            ch.device = deviceHandle
            ch.service = serviceHandle
          })
          def.out({payload: {characteristics: characteristics}})
        })
    }
  };
};
module.exports = fn;
},{}],2:[function(require,module,exports){

var fn = function (def, parent)
{
  def.in = function(msg)
  {
    if(evothings && evothings.ble)
    {
      console.log('ble-services called for address ' + msg.payload.address);
      evothings.ble.connect(msg.payload.address, function (r)
      {
        var deviceHandle = r.deviceHandle;
        console.log('ble connect ' + r.deviceHandle + ' state ' + r.state);
        if (r.state == 2) // connected
        {
          def.out({payload:{device: deviceHandle}})
        }
      }, function (errorCode)
      {
        console.log('connect error: ' + errorCode);
        def.out({payload: {error: 'connect error: ' + errorCode}});
      });
    }
  };
};
module.exports = fn;
},{}],3:[function(require,module,exports){
var fn = function (def, parent)
{
  def.in = function(msg)
  {
    var deviceHandle = msg.payload.device
    var characteristicHandle = msg.payload.characteristic
    var rv = undefined
    if(deviceHandle && characteristicHandle && evothings && evothings.ble)
    {
      evothings.ble.descriptors(
        deviceHandle,
        characteristicHandle,
        function(descriptors)
        {
          def.out({payload: descriptors})
        })
    }
  };
};
module.exports = fn;
},{}],4:[function(require,module,exports){
var fn = function (def, parent)
{
  def.in = function(msg)
  {
    var deviceHandle = msg.payload.device
    var characteristicHandle = msg.payload.characteristic
    if(deviceHandle && serviceHandle && evothings && evothings.ble)
    {
      evothings.ble.descriptors(
        deviceHandle,
        characteristicHandle,
        function(descriptors)
        {
          def.out({payload: {descriptors:descriptors}})
        })
    }
  };
};
module.exports = fn;
},{}],5:[function(require,module,exports){
var fn = function (def, parent)
{
  console.log('============================================ble read characteristic instantiated');
  def.in = function(msg)
  {
    var deviceHandle = msg.payload.device
    var characteristicHandle = msg.payload.handle
    var rv = undefined
    if(deviceHandle && characteristicHandle && evothings && evothings.ble)
    {
      evothings.ble.readCharacteristic(
        deviceHandle,
        characteristicHandle,
        function(data)
        {
          rv = escape(String.fromCharCode.apply(null, new Uint8Array(data)));
          def.out({payload:{result: rv}})
        },
        function(errorCode)
        {
          rv = errorCode
          def.out({payload:{error: errorCode}})
        }
      )
    }
  };
};
module.exports = fn;
},{}],6:[function(require,module,exports){
var fn = function (def, parent)
{
  def.in = function(msg)
  {
    var deviceHandle = msg.payload.device
    var descriptorHandle = msg.payload.descriptor
    var rv = undefined
    if(deviceHandle && descriptorHandle && evothings && evothings.ble)
    {
      evothings.ble.readDescriptor(
        deviceHandle,
        descriptorHandle,
        function(data)
        {
          def.out({payload: escape(String.fromCharCode.apply(null, new Uint8Array(data)))})
        },
        function(errorCode)
        {
          def.out({payload:{error: errorCode}})
        }
      );
    }
  };
};
module.exports = fn;
},{}],7:[function(require,module,exports){

	var fn = function (def, parent)
	{
		def.in = function(msg)
		{
			if(def.scanning && evothings && evothings.ble)
			{
				console.log('stopping scanning')
				evothings.ble.stopScan();
				def.scanning = false;
			}
			else if (evothings && evothings.ble)
			{
				console.log('starting scanning')
				def.scanning = true;
				evothings.ble.startScan(function(r)
				{
					msg.payload = r;
					def.out(msg);
				});
			}
		};
	};
	module.exports = fn;
},{}],8:[function(require,module,exports){

	var fn = function (def, parent)
	{
		def.in = function(msg)
		{
			var deviceHandle = msg.payload.device;
			if(evothings && evothings.ble && deviceHandle)
			{
					console.log('connected, requesting services...');
					evothings.ble.services(
						deviceHandle,
						function(services)
						{
							console.log('got services')
							services.forEach(function(service)
							{
								service.device = deviceHandle
							})
							def.out({payload:{services: services}})
						})
			}
		};
	};
	module.exports = fn;
},{}],9:[function(require,module,exports){

		var fn = function(def, parent)
		{
			var node = document.createElement('button');
			def.node = node;

			node.className = "mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent";
			node.style.width = "100%";
			node.innerHTML = def.name;

			def.in = function(msg)
			{
				console.log('ohayoo - button got input message');
				console.dir(msg);
				node.innerHTML = msg.payload;
			};

			return node;
		};
		module.exports = fn;
},{}],10:[function(require,module,exports){

	var fn = function (def, parent)
	{
		window.addEventListener("batterystatus", function(info)
		{
			def.out({payload: info});
		}, false);
		window.addEventListener("batterycritical", function(info)
		{
			def.out({payload: info});
		}, false);
		window.addEventListener("batterylow", function(info)
		{
			def.out({payload: info});
		}, false);
	};
	module.exports = fn;
},{}],11:[function(require,module,exports){

	var fn = function (def, parent)
	{
		var onSuccess = function(position)
		{
			def.out({payload:position})
		};
		var onError = function(error)
		{
			def.out({error:error});
		};
		def.in = function(msg)
		{
			navigator.geolocation.getCurrentPosition(onSuccess, onError);
		}
	};
	module.exports = fn;
},{}],12:[function(require,module,exports){

	var fn = function (def, parent)
	{
		def.in = function(msg)
		{
			navigator.vibrate(parseInt(def.vibration));
		}
	};
	module.exports = fn;
},{}],13:[function(require,module,exports){

	var fn = function (def, parent)
	{
		def.in = function (msg)
		{
			var e = msg.payload;
			if (e && e.type == def.event)
			{
				def.out(msg);
			}
		};

	};
	module.exports = fn;
},{}],14:[function(require,module,exports){

	var fn = function (def, parent)
	{
		def.in = function(msg)
		{
			var func = new Function('msg', def.func).bind(def);
			var rv = func(msg);
			def.out(rv);
		};
	};
	module.exports = fn;
},{}],15:[function(require,module,exports){

	var fn = function (def, parent)
	{
		var node = document.createElement('div');
		//node.innerHTML = "fooz";
		def.in = function(msg)
		{
			if(msg && msg.payload)
			{
				//console.log('template got message');
				//console.dir(JSON.stringify(msg.payload));
				//dump(msg.payload);
				//console.log('template is '+def.template);
				node.innerHTML = Mustache.render(def.template, msg.payload)
			}
		};
		console.log('---- creating template '+def.name);
		console.dir(node);
		return node;
	};
	module.exports = fn;
},{}],16:[function(require,module,exports){

	var fn = function (def, parent)
	{
		var node = document.createElement('div');
		node.className = "mdl-cell mdl-cell--4-col mdl-cell--stretch";
		//node.style = "container: 'flex', flexDirection: "+def.direction;
		console.log(JSON.stringify(def));
		node.innerHTML = def.text;
		return node;

	};
	module.exports = fn;
},{}],17:[function(require,module,exports){

	var fn = function (def, parent)
	{
		var node = document.createElement('div');
		node.className = "mdl-cell mdl-cell--4-col mdl-cell--stretch";
		var img = document.createElement('img');
		img.setAttribute('style', def.style);
		node.appendChild(img);
		//node.style = "container: 'flex', flexDirection: "+def.direction;
		console.log('settings img.src to '+def.image+' and style '+def.style);
		img.src = def.image;
		console.log(JSON.stringify(def));
		return node;
	}
	module.exports = fn;
},{}],18:[function(require,module,exports){

},{}],19:[function(require,module,exports){

	var fn = function (def, parent)
	{
		var node = document.createElement('input');
		node.className = "mdl-textfield__input";

		return node;
	};
	module.exports = fn;
},{}],20:[function(require,module,exports){
// File: easyble.js

	// Load script used by this file.
	//evothings.loadScript('libs/evothings/util/util.js');
	var util = require('./util.js')

	/**
	 * @namespace
	 * @description <p>Library for making BLE programming easier.</p>
	 * <p>It is safe practise to call function {@link evothings.scriptsLoaded}
	 * to ensure dependent libraries are loaded before calling functions
	 * in this library.</p>
	 */
	var easyble = {};

	/**
	 * @namespace
	 * @description Error string.
	 */
	easyble.error = {};

	/**
	 * @description BLE device was disconnected.
	 */
	easyble.error.DISCONNECTED = 'EASYBLE_ERROR_DISCONNECTED';

	/**
	 * @description BLE service was not found.
	 */
	easyble.error.SERVICE_NOT_FOUND = 'EASYBLE_ERROR_SERVICE_NOT_FOUND';

	/**
	 * @description BLE characteristic was not found.
	 */
	easyble.error.CHARACTERISTIC_NOT_FOUND = 'EASYBLE_ERROR_CHARACTERISTIC_NOT_FOUND';

	/**
	 * @description BLE descriptor was not found.
	 */
	easyble.error.DESCRIPTOR_NOT_FOUND = 'EASYBLE_ERROR_DESCRIPTOR_NOT_FOUND';

	/**
	 * @private
	 */
	var base64 = cordova.require('cordova/base64');

	/**
	 * Set to true to report found devices only once,
	 * set to false to report continuously.
	 * @private
	 */
	var reportDeviceOnce = false;

	/**
	 * @private
	 */
	var serviceFilter = false;

	/**
	 * Internal properties and functions.
	 * @private
	 */
	var internal = {};

	/**
	 * Internal variable used to track reading of service data.
	 * @private
	 */
	var readCounter = 0;

	/**
	 * Table of discovered devices.
	 * @private
	 */
	internal.knownDevices = {};

	/**
	 * Table of connected devices.
	 * @private
	 */
	internal.connectedDevices = {};

	/**
	 * Set whether to report devices once or continuously during scan.
	 * The default is to report continously.
	 * @param {boolean} reportOnce - Set to true to report found devices only once.
	 * Set to false to report continuously.
	 * @public
	 */
	easyble.reportDeviceOnce = function(reportOnce)
	{
		reportDeviceOnce = reportOnce;
	};

	/**
	 * Set to an Array of UUID strings to enable filtering of devices
	 * found by startScan().
	 * @param services - Array of UUID strings. Set to false to disable filtering.
	 * The default is no filtering. An empty array will cause no devices to be reported.
	 * @public
	 */
	easyble.filterDevicesByService = function(services)
	{
		serviceFilter = services;
	};

	/**
	 * @description Called during scanning when a BLE device is found.
	 * @callback easyble.scanCallback
	 * @param {easyble.EasyBLEDevice} device - EasyBLE device object
	 * found during scanning.
	 */

	/**
	 * @description This callback indicates that an operation was successful,
	 * without specifying and additional information.
	 * @callback easyble.emptyCallback - Callback that takes no parameters.
	 */

	/**
	 * @description This function is called when an operation fails.
	 * @callback easyble.failCallback
	 * @param {string} errorString - A human-readable string that
	 * describes the error that occurred.
	 */

	/**
	 * @description Called when successfully connected to a device.
	 * @callback easyble.connectCallback
	 * @param {easyble.EasyBLEDevice} device - EasyBLE devices object.
	 */

	/**
	 * @description Called when services are successfully read.
	 * @callback easyble.servicesCallback
	 * @param {easyble.EasyBLEDevice} device - EasyBLE devices object.
	 */

	/**
	 * @description Function when data is available.
	 * @callback easyble.dataCallback
	 * @param {ArrayBuffer} data - The data is an array buffer.
	 * Use an ArrayBufferView to access the data.
	 */

	/**
	 * @description Called with RSSI value.
	 * @callback easyble.rssiCallback
	 * @param {number} rssi - A negative integer, the signal strength in decibels.
	 * This value may be 127 which indicates an unknown value.
	 */

	/**
	 * Start scanning for devices.
	 * @param {easyble.scanCallback} - Success function called when a device is found.
	 * Format: success({@link easyble.EasyBLEDevice}).
	 * @param {easyble.failCallback} fail - Error callback: fail(error).
	 * @public
	 * @example
	 *   easyble.startScan(
	 *     function(device)
	 *     {
	 *       console.log('BLE Found device: ' + device.name);
	 *     },
	 *     function(error)
	 *     {
	 *       console.log('BLE Scan error: ' + error);
	 *     });
	 */
	easyble.startScan = function(success, fail)
	{
		easyble.stopScan();
		internal.knownDevices = {};
		evothings.ble.startScan(function(device)
		{
			// Ensure we have advertisementData.
			internal.ensureAdvertisementData(device);

			// Check if the device matches the filter, if we have a filter.
			if(!internal.deviceMatchesServiceFilter(device)) {
				return;
			}

			// Check if we already have got the device.
			var existingDevice = internal.knownDevices[device.address]
			if (existingDevice)
			{
				// Do not report device again if flag is set.
				if (reportDeviceOnce) { return; }

				// Flag not set, report device again.
				existingDevice.rssi = device.rssi;
				existingDevice.name = device.name;
				existingDevice.scanRecord = device.scanRecord;
				existingDevice.advertisementData = device.advertisementData;
				success(existingDevice);
				return;
			}

			// New device, add to known devices.
			internal.knownDevices[device.address] = device;

			// Add methods to the device info object.
			internal.addMethodsToDeviceObject(device);

			// Call callback function with device info.
			success(device);
		},
		function(errorCode)
		{
			fail(errorCode);
		});
	};

	/**
	 * Stop scanning for devices.
	 * @example
	 *   easyble.stopScan();
	 */
	easyble.stopScan = function()
	{
		evothings.ble.stopScan();
	};

	/**
	 * Disconnect and close all connected BLE devices.
	 * @example
	 *   easyble.closeConnectedDevices();
	 */
	easyble.closeConnectedDevices = function()
	{
		for (var key in internal.connectedDevices)
		{
			var device = internal.connectedDevices[key];
			device && device.close();
			internal.connectedDevices[key] = null;
		}
	};

	/**
	 * If device already has advertisementData, does nothing.
	 * If device instead has scanRecord, creates advertisementData.
	 * See ble.js for AdvertisementData reference.
	 * @param device - Device object.
	 * @private
	 */
	internal.ensureAdvertisementData = function(device)
	{
		// If device object already has advertisementData we
		// do not need to parse the scanRecord.
		if (device.advertisementData) { return; }

		// Must have scanRecord yo continue.
		if (!device.scanRecord) { return; }

		// Here we parse BLE/GAP Scan Response Data.
		// See the Bluetooth Specification, v4.0, Volume 3, Part C, Section 11,
		// for details.

		var byteArray = util.base64DecToArr(device.scanRecord);
		var pos = 0;
		var advertisementData = {};
		var serviceUUIDs;
		var serviceData;

		// The scan record is a list of structures.
		// Each structure has a length byte, a type byte, and (length-1) data bytes.
		// The format of the data bytes depends on the type.
		// Malformed scanRecords will likely cause an exception in this function.
		while (pos < byteArray.length)
		{
			var length = byteArray[pos++];
			if (length == 0)
			{
				break;
			}
			length -= 1;
			var type = byteArray[pos++];

			// Parse types we know and care about.
			// Skip other types.

			var BLUETOOTH_BASE_UUID = '-0000-1000-8000-00805f9b34fb'

			// Convert 16-byte Uint8Array to RFC-4122-formatted UUID.
			function arrayToUUID(array, offset)
			{
				var k=0;
				var string = '';
				var UUID_format = [4, 2, 2, 2, 6];
				for (var l=0; l<UUID_format.length; l++)
				{
					if (l != 0)
					{
						string += '-';
					}
					for (var j=0; j<UUID_format[l]; j++, k++)
					{
						string += util.toHexString(array[offset+k], 1);
					}
				}
				return string;
			}

			if (type == 0x02 || type == 0x03) // 16-bit Service Class UUIDs.
			{
				serviceUUIDs = serviceUUIDs ? serviceUUIDs : [];
				for(var i=0; i<length; i+=2)
				{
					serviceUUIDs.push(
						'0000' +
						util.toHexString(
							util.littleEndianToUint16(byteArray, pos + i),
							2) +
						BLUETOOTH_BASE_UUID);
				}
			}
			if (type == 0x04 || type == 0x05) // 32-bit Service Class UUIDs.
			{
				serviceUUIDs = serviceUUIDs ? serviceUUIDs : [];
				for (var i=0; i<length; i+=4)
				{
					serviceUUIDs.push(
						util.toHexString(
							util.littleEndianToUint32(byteArray, pos + i),
							4) +
						BLUETOOTH_BASE_UUID);
				}
			}
			if (type == 0x06 || type == 0x07) // 128-bit Service Class UUIDs.
			{
				serviceUUIDs = serviceUUIDs ? serviceUUIDs : [];
				for (var i=0; i<length; i+=16)
				{
					serviceUUIDs.push(arrayToUUID(byteArray, pos + i));
				}
			}
			if (type == 0x08 || type == 0x09) // Local Name.
			{
				advertisementData.kCBAdvDataLocalName = evothings.ble.fromUtf8(
					new Uint8Array(byteArray.buffer, pos, length));
			}
			if (type == 0x0a) // TX Power Level.
			{
				advertisementData.kCBAdvDataTxPowerLevel =
					util.littleEndianToInt8(byteArray, pos);
			}
			if (type == 0x16) // Service Data, 16-bit UUID.
			{
				serviceData = serviceData ? serviceData : {};
				var uuid =
					'0000' +
					util.toHexString(
						util.littleEndianToUint16(byteArray, pos),
						2) +
					BLUETOOTH_BASE_UUID;
				var data = new Uint8Array(byteArray.buffer, pos+2, length-2);
				serviceData[uuid] = base64.fromArrayBuffer(data);
			}
			if (type == 0x20) // Service Data, 32-bit UUID.
			{
				serviceData = serviceData ? serviceData : {};
				var uuid =
					util.toHexString(
						util.littleEndianToUint32(byteArray, pos),
						4) +
					BLUETOOTH_BASE_UUID;
				var data = new Uint8Array(byteArray.buffer, pos+4, length-4);
				serviceData[uuid] = base64.fromArrayBuffer(data);
			}
			if (type == 0x21) // Service Data, 128-bit UUID.
			{
				serviceData = serviceData ? serviceData : {};
				var uuid = arrayToUUID(byteArray, pos);
				var data = new Uint8Array(byteArray.buffer, pos+16, length-16);
				serviceData[uuid] = base64.fromArrayBuffer(data);
			}
			if (type == 0xff) // Manufacturer-specific Data.
			{
				// Annoying to have to transform base64 back and forth,
				// but it has to be done in order to maintain the API.
				advertisementData.kCBAdvDataManufacturerData =
					base64.fromArrayBuffer(new Uint8Array(byteArray.buffer, pos, length));
			}

			pos += length;
		}
		advertisementData.kCBAdvDataServiceUUIDs = serviceUUIDs;
		advertisementData.kCBAdvDataServiceData = serviceData;
		device.advertisementData = advertisementData;

		/*
		// Log raw data for debugging purposes.

		console.log("scanRecord: "+util.typedArrayToHexString(byteArray));

		console.log(JSON.stringify(advertisementData));
		*/
	}

	/**
	 * Returns true if the device matches the serviceFilter, or if there is no filter.
	 * Returns false otherwise.
	 * @private
	 */
	internal.deviceMatchesServiceFilter = function(device)
	{
		if (!serviceFilter) { return true; }

		var advertisementData = device.advertisementData;
		if (advertisementData)
		{
			if (advertisementData.kCBAdvDataServiceUUIDs)
			{
				for (var i in advertisementData)
				{
					for (var j in serviceFilter)
					{
						if (advertisementData[i].toLowerCase() ==
							serviceFilter[j].toLowerCase())
						{
							return true;
						}
					}
				}
			}
		}
		return false;
	}

	/**
	 * Add functions to the device object to allow calling them
	 * in an object-oriented style.
	 * @private
	 */
	internal.addMethodsToDeviceObject = function(deviceObject)
	{
		/**
		 * This is the BLE DeviceInfo object obtained by calling
		 * evothings.ble.startScan, with additional properties and
		 * functions added. Internal properties are prefixed with two
		 * underscores. Properties are also added to the Characteristic
		 * and Descriptor objects.
		 * @namespace
		 * @alias easyble.EasyBLEDevice
		 */
		var device = deviceObject;

		/**
		 * Match device name.
		 * @param name The name to match.
		 * @return true if device has the given name, false if not.
		 * @example
		 *   device.hasName('MyBLEDevice');
		 */
		device.hasName = function(name)
		{
			var deviceName = device.advertisementData ?
				device.advertisementData.kCBAdvDataLocalName : null;
			if (!deviceName) { return false }
			return 0 == deviceName.indexOf(name);
		};

		/**
		 * Connect to the device.
		 * @param {easyble.connectCallback} success -
		 * Called when connected: success(device).
		 * @param {easyble.failCallback} fail -
		 * Called on error and if a disconnect happens.
		 * Format: error(errorMessage)
		 * @public
		 * @instance
		 * @example
		 *   device.connect(
		 *     function(device)
		 *     {
		 *       console.log('BLE device connected.');
		 *       // TODO: Read services here.
		 *     },
		 *     function(errorCode)
		 *     {
		 *       console.log('BLE connect error: ' + errorCode);
		 *     });
		 */
		device.connect = function(success, fail)
		{
			internal.connectToDevice(device, success, fail);
		};

		/**
		 * Close the device. This disconnects from the BLE device.
		 * @public
		 * @instance
		 * @example
		 * device.close();
		 */
		device.close = function()
		{
			device.deviceHandle && evothings.ble.close(device.deviceHandle);
		};

		/**
		 * Read devices RSSI. Device must be connected.
		 * @param {easyble.rssiCallback} success - Called with RSSI value: success(rssi).
		 * @param {easyble.failCallback} fail - Called on error: fail(error).
		 * @public
		 * @instance
		 */
		device.readRSSI = function(success, fail)
		{
			evothings.ble.rssi(device.deviceHandle, success, fail);
		};

		/**
		 * Read services, characteristics and descriptors for the
		 * specified service UUIDs.
		 * <strong>Services must be read be able to access characteristics and
		 * descriptors</strong>. Call this function before reading and writing
		 * characteristics/descriptors.
		 * @param serviceUUIDs - array of UUID strings, if null all
		 * services are read (this can be time-consuming compared to
		 * reading selected services).
		 * @param {easyble.servicesCallback} success -
		 * Called when services are read: success(device).
		 * @param {easyble.failCallback} fail - error callback: error(errorMessage)
		 * @public
		 * @instance
		 * @example
		 *   device.readServices(
		 *     null, // Read all services
		 *     function(device)
		 *     {
		 *       console.log('BLE Services available.');
		 *       // TODO: Read/write/enable notifications here.
		 *     },
		 *     function(errorCode)
		 *     {
		 *       console.log('BLE readServices error: ' + errorCode);
		 *     });
		 */
		device.readServices = function(serviceUUIDs, success, fail)
		{
			internal.readServices(device, serviceUUIDs, success, fail);
		};

		/**
		 * Read value of characteristic.
		 * @param {string} characteristicUUID - UUID of characteristic to read.
		 * @param {easyble.dataCallback} success - Success callback: success(data).
		 * @param {easyble.failCallback} fail - Error callback: fail(error).
		 * @public
		 * @instance
		 * @example
		 *   device.readCharacteristic(
		 *     characteristicUUID,
		 *     function(data)
		 *     {
		 *       console.log('BLE characteristic data: ' + evothings.ble.fromUtf8(data));
		 *     },
		 *     function(errorCode)
		 *     {
		 *       console.log('BLE readCharacteristic error: ' + errorCode);
		 *     });
		 */
		device.readCharacteristic = function(characteristicUUID, success, fail)
		{
			internal.readCharacteristic(device, characteristicUUID, success, fail);
		};

		/**
		* Read value of a specific characteristic.
		* @param {string} serviceUUID - UUID of service in which the characteristic is found.
		* @param {string} characteristicUUID - UUID of characteristic to read.
		* @param {easyble.dataCallback} success - Success callback: success(data).
		* @param {easyble.failCallback} fail - Error callback: fail(error).
		* @public
		* @instance
		* @example
		*   device.readServiceCharacteristic(
		*     serviceUUID,
		*     characteristicUUID,
		*     function(data)
		*     {
		*       console.log('BLE characteristic data: ' + evothings.ble.fromUtf8(data));
		*     },
		*     function(errorCode)
		*     {
		*       console.log('BLE readServiceCharacteristic error: ' + errorCode);
		*     });
		*/
		device.readServiceCharacteristic = function(serviceUUID, characteristicUUID, success, fail)
		{
			internal.readServiceCharacteristic(device, serviceUUID, characteristicUUID, success, fail);
		};

		/**
		 * Read value of descriptor.
		 * @param {string} characteristicUUID - UUID of characteristic for descriptor.
		 * @param {string} descriptorUUID - UUID of descriptor to read.
		 * @param {easyble.dataCallback} success - Success callback: success(data).
		 * @param {easyble.failCallback} fail - Error callback: fail(error).
		 * @public
		 * @instance
		 * @example
		 *   device.readDescriptor(
		 *     characteristicUUID,
		 *     descriptorUUID,
		 *     function(data)
		 *     {
		 *       console.log('BLE descriptor data: ' + evothings.ble.fromUtf8(data));
		 *     },
		 *     function(errorCode)
		 *     {
		 *       console.log('BLE readDescriptor error: ' + errorCode);
		 *     });
		 */
		device.readDescriptor = function(characteristicUUID, descriptorUUID, success, fail)
		{
			internal.readDescriptor(device, characteristicUUID, descriptorUUID, success, fail);
		};

		/**
		* Read value of a specific descriptor.
		* @param {string} serviceUUID - UUID of service in which the characteristic is found.
		* @param {string} characteristicUUID - UUID of characteristic for descriptor.
		* @param {string} descriptorUUID - UUID of descriptor to read.
		* @param {easyble.dataCallback} success - Success callback: success(data).
		* @param {easyble.failCallback} fail - Error callback: fail(error).
		* @public
		* @instance
		* @example
		*   device.readServiceDescriptor(
		*     serviceUUID,
		*     characteristicUUID,
		*     descriptorUUID,
		*     function(data)
		*     {
		*       console.log('BLE descriptor data: ' + evothings.ble.fromUtf8(data));
		*     },
		*     function(errorCode)
		*     {
		*       console.log('BLE readServiceDescriptor error: ' + errorCode);
		*     });
		*/
		device.readServiceDescriptor = function(serviceUUID, characteristicUUID, descriptorUUID, success, fail)
		{
			internal.readServiceDescriptor(device, serviceUUID, characteristicUUID, descriptorUUID, success, fail);
		};

		/**
		 * Write value of characteristic.
		 * @param {string} characteristicUUID - UUID of characteristic to write to.
		 * @param {ArrayBufferView} value - Value to write.
		 * @param {easyble.emptyCallback} success - Success callback: success().
		 * @param {easyble.failCallback} fail - Error callback: fail(error).
		 * @public
		 * @instance
		 * @example
		 *   device.writeCharacteristic(
		 *     characteristicUUID,
		 *     new Uint8Array([1]), // Write byte with value 1.
		 *     function()
		 *     {
		 *       console.log('BLE characteristic written.');
		 *     },
		 *     function(errorCode)
		 *     {
		 *       console.log('BLE writeCharacteristic error: ' + errorCode);
		 *     });
		 */
		device.writeCharacteristic = function(characteristicUUID, value, success, fail)
		{
			internal.writeCharacteristic(device, characteristicUUID, value, success, fail);
		};

		/**
		* Write value of a specific characteristic.
		* @param {string} serviceUUID - UUID of service in which the characteristic is found.
		* @param {string} characteristicUUID - UUID of characteristic to write to.
		* @param {ArrayBufferView} value - Value to write.
		* @param {easyble.emptyCallback} success - Success callback: success().
		* @param {easyble.failCallback} fail - Error callback: fail(error).
		* @public
		* @instance
		* @example
		*   device.writeServiceCharacteristic(
		*     serviceUUID,
		*     characteristicUUID,
		*     new Uint8Array([1]), // Write byte with value 1.
		*     function()
		*     {
		*       console.log('BLE characteristic written.');
		*     },
		*     function(errorCode)
		*     {
		*       console.log('BLE writeServiceCharacteristic error: ' + errorCode);
		*     });
		*/
		device.writeServiceCharacteristic = function(serviceUUID, characteristicUUID, value, success, fail)
		{
			internal.writeServiceCharacteristic(device, serviceUUID, characteristicUUID, value, success, fail);
		};

		/**
		 * Write value of descriptor.
		 * @param {string} characteristicUUID - UUID of characteristic for descriptor.
		 * @param {string} descriptorUUID - UUID of descriptor to write to.
		 * @param {ArrayBufferView} value - Value to write.
		 * @param {easyble.emptyCallback} success - Success callback: success().
		 * @param {easyble.failCallback} fail - Error callback: fail(error).
		 * @public
		 * @instance
		 * @example
		 *   device.writeDescriptor(
		 *     characteristicUUID,
		 *     descriptorUUID,
		 *     new Uint8Array([1]), // Write byte with value 1.
		 *     function()
		 *     {
		 *       console.log('BLE descriptor written.');
		 *     },
		 *     function(errorCode)
		 *     {
		 *       console.log('BLE writeDescriptor error: ' + errorCode);
		 *     });
		 */
		device.writeDescriptor = function(characteristicUUID, descriptorUUID, value, success, fail)
		{
			internal.writeDescriptor(device, characteristicUUID, descriptorUUID, value, success, fail);
		};

		/**
		* Write value of a specific descriptor.
		* @param {string} serviceUUID - UUID of service in which the characteristic is found.
		* @param {string} characteristicUUID - UUID of characteristic for descriptor.
		* @param {string} descriptorUUID - UUID of descriptor to write to.
		* @param {ArrayBufferView} value - Value to write.
		* @param {easyble.emptyCallback} success - Success callback: success().
		* @param {easyble.failCallback} fail - Error callback: fail(error).
		* @public
		* @instance
		* @example
		*   device.writeServiceDescriptor(
		*     serviceUUID,
		*     characteristicUUID,
		*     descriptorUUID,
		*     new Uint8Array([1]), // Write byte with value 1.
		*     function()
		*     {
		*       console.log('BLE descriptor written.');
		*     },
		*     function(errorCode)
		*     {
		*       console.log('BLE writeServiceDescriptor error: ' + errorCode);
		*     });
		*/
		device.writeServiceDescriptor = function(serviceUUID, characteristicUUID, descriptorUUID, value, success, fail)
		{
			internal.writeServiceDescriptor(device, serviceUUID, characteristicUUID, descriptorUUID, value, success, fail);
		};

		/**
		 * Subscribe to characteristic value updates. The success function
		 * will be called repeatedly whenever there is new data available.
		 * @param {string} characteristicUUID - UUID of characteristic to subscribe to.
		 * @param {easyble.dataCallback} success - Success callback: success(data).
		 * @param {easyble.failCallback} fail - Error callback: fail(error).
		 * @public
		 * @instance
		 * @example
		 * device.enableNotification(
		 *   characteristicUUID,
		 *   function(data)
		 *   {
		 *     console.log('BLE characteristic data: ' + evothings.ble.fromUtf8(data));
		 *   },
		 *   function(errorCode)
		 *   {
		 *     console.log('BLE enableNotification error: ' + errorCode);
		 *   });
		 */
		device.enableNotification = function(characteristicUUID, success, fail)
		{
			internal.enableNotification(device, characteristicUUID, success, fail);
		};

		device.enableServiceNotification = function(serviceUUID, characteristicUUID, success, fail)
		{
			internal.enableServiceNotification(device, serviceUUID, characteristicUUID, success, fail);
		};

		/**
		 * Unsubscribe from characteristic updates to stop notifications.
		 * @param characteristicUUID - UUID of characteristic to unsubscribe from
		 * @param {easyble.emptyCallback} success - Success callback: success()
		 * @param {easyble.failCallback} fail - Error callback: fail(error)
		 * @public
		 * @instance
		 * @example
		 *  device.disableNotification(
		 *    characteristicUUID,
		 *    function()
		 *    {
		 *      console.log('BLE characteristic notification disabled');
		 *    },
		 *    function(errorCode)
		 *    {
		 *      console.log('BLE disableNotification error: ' + errorCode);
		 *    });
		 */
		device.disableNotification = function(characteristicUUID, success, fail)
		{
			internal.disableNotification(device, characteristicUUID, success, fail);
		};

		device.disableServiceNotification = function(serviceUUID, characteristicUUID, success, fail)
		{
			internal.disableServiceNotification(device, serviceUUID, characteristicUUID, success, fail);
		};
	};

	/**
	 * Connect to a device.
 	 * Called from easyble.EasyBLEDevice.
	 * @private
	 */
	internal.connectToDevice = function(device, success, fail)
	{
		evothings.ble.connect(device.address, function(connectInfo)
		{
			if (connectInfo.state == 2) // connected
			{
				device.deviceHandle = connectInfo.deviceHandle;
				device.__uuidMap = {};
				device.__serviceMap = {};
				internal.connectedDevices[device.address] = device;

				success(device);
			}
			else if (connectInfo.state == 0) // disconnected
			{
				internal.connectedDevices[device.address] = null;

				// TODO: Perhaps this should be redesigned, as disconnect is
				// more of a status change than an error? What do you think?
				fail && fail(easyble.error.DISCONNECTED);
			}
		},
		function(errorCode)
		{
			fail(errorCode);
		});
	};

	/**
	 * Obtain device services, them read characteristics and descriptors
	 * for the services with the given uuid(s).
	 * If serviceUUIDs is null, info is read for all services.
 	 * Called from easyble.EasyBLEDevice.
	 * @private
	 */
	internal.readServices = function(device, serviceUUIDs, success, fail)
	{
		// Read services.
		evothings.ble.services(
			device.deviceHandle,
			function(services)
			{
				// Array that stores services.
				device.__services = [];

				for (var i = 0; i < services.length; ++i)
				{
					var service = services[i];
					service.uuid = service.uuid.toLowerCase();
					device.__services.push(service);
					device.__uuidMap[service.uuid] = service;
				}

				internal.readCharacteristicsForServices(
					device, serviceUUIDs, success, fail);
			},
			function(errorCode)
			{
				fail(errorCode);
			});
	};

	/**
	 * Read characteristics and descriptors for the services with the given uuid(s).
	 * If serviceUUIDs is null, info for all services are read.
	 * Internal function.
 	 * Called from easyble.EasyBLEDevice.
	 * @private
	 */
	internal.readCharacteristicsForServices = function(device, serviceUUIDs, success, fail)
	{
		var characteristicsCallbackFun = function(service)
		{
			// Array with characteristics for service.
			service.__characteristics = [];

			return function(characteristics)
			{
				--readCounter; // Decrements the count added by services.
				readCounter += characteristics.length;
				for (var i = 0; i < characteristics.length; ++i)
				{
					var characteristic = characteristics[i];
					characteristic.uuid = characteristic.uuid.toLowerCase();
					service.__characteristics.push(characteristic);
					device.__uuidMap[characteristic.uuid] = characteristic;
					device.__serviceMap[service.uuid + ':' + characteristic.uuid] = characteristic;

					// Read descriptors for characteristic.
					evothings.ble.descriptors(
						device.deviceHandle,
						characteristic.handle,
						descriptorsCallbackFun(service, characteristic),
						function(errorCode)
						{
							fail(errorCode);
						});
				}
			};
		};

 		/**
	 	 * @private
	 	 */
		var descriptorsCallbackFun = function(service, characteristic)
		{
			// Array with descriptors for characteristic.
			characteristic.__descriptors = [];

			return function(descriptors)
			{
				--readCounter; // Decrements the count added by characteristics.
				for (var i = 0; i < descriptors.length; ++i)
				{
					var descriptor = descriptors[i];
					descriptor.uuid = descriptor.uuid.toLowerCase();
					characteristic.__descriptors.push(descriptor);
					device.__uuidMap[characteristic.uuid + ':' + descriptor.uuid] = descriptor;
					device.__serviceMap[service.uuid + ':' + characteristic.uuid + ':' + descriptor.uuid] = descriptor;
				}
				if (0 == readCounter)
				{
					// Everything is read.
					success(device);
				}
			};
		};

		// Initialize read counter.
		readCounter = 0;

		if (null != serviceUUIDs)
		{
			// Read info for service UUIDs.
			readCounter = serviceUUIDs.length;
			for (var i = 0; i < serviceUUIDs.length; ++i)
			{
				var uuid = serviceUUIDs[i].toLowerCase();
				var service = device.__uuidMap[uuid];
				if (!service)
				{
					fail(easyble.error.SERVICE_NOT_FOUND + ' ' + uuid);
					return;
				}

				// Read characteristics for service. Will also read descriptors.
				evothings.ble.characteristics(
					device.deviceHandle,
					service.handle,
					characteristicsCallbackFun(service),
					function(errorCode)
					{
						fail(errorCode);
					});
			}
		}
		else
		{
			// Read info for all services.
			readCounter = device.__services.length;
			for (var i = 0; i < device.__services.length; ++i)
			{
				// Read characteristics for service. Will also read descriptors.
				var service = device.__services[i];
				evothings.ble.characteristics(
					device.deviceHandle,
					service.handle,
					characteristicsCallbackFun(service),
					function(errorCode)
					{
						fail(errorCode);
					});
			}
		}
	};

 	/**
 	 * Called from easyble.EasyBLEDevice.
	 * @private
	 */
	internal.readCharacteristic = function(device, characteristicUUID, success, fail)
	{
		characteristicUUID = characteristicUUID.toLowerCase();

		var characteristic = device.__uuidMap[characteristicUUID];
		if (!characteristic)
		{
			console.log('easyble.readCharacteristic char not found')
			console.log(JSON.stringify(device.__uuidMap))
			fail(easyble.error.CHARACTERISTIC_NOT_FOUND + ' ' +	characteristicUUID);
			return;
		}

		evothings.ble.readCharacteristic(
			device.deviceHandle,
			characteristic.handle,
			success,
			fail);
	};

	/**
	* Called from easyble.EasyBLEDevice.
	* @private
	*/
	internal.readServiceCharacteristic = function(device, serviceUUID, characteristicUUID, success, fail)
	{
		var key = serviceUUID.toLowerCase() + ':' + characteristicUUID.toLowerCase();

		var characteristic = device.__serviceMap[key];
		if (!characteristic)
		{
			console.log('easyble.readServiceCharacteristic char not found')
			console.log(JSON.stringify(device.__serviceMap))
			fail(easyble.error.CHARACTERISTIC_NOT_FOUND + ' ' + key);
			return;
		}

		evothings.ble.readCharacteristic(
			device.deviceHandle,
			characteristic.handle,
			success,
			fail);
	};

 	/**
 	 * Called from easyble.EasyBLEDevice.
	 * @private
	 */
	internal.readDescriptor = function(device, characteristicUUID, descriptorUUID, success, fail)
	{
		characteristicUUID = characteristicUUID.toLowerCase();
		descriptorUUID = descriptorUUID.toLowerCase();

		var descriptor = device.__uuidMap[characteristicUUID + ':' + descriptorUUID];
		if (!descriptor)
		{
			fail(easyble.error.DESCRIPTOR_NOT_FOUND + ' ' + descriptorUUID);
			return;
		}

		evothings.ble.readDescriptor(
			device.deviceHandle,
			descriptor.handle,
			value,
			function()
			{
				success();
			},
			function(errorCode)
			{
				fail(errorCode);
			});
	};

	/**
	* Called from easyble.EasyBLEDevice.
	* @private
	*/
	internal.readServiceDescriptor = function(device, serviceUUID, characteristicUUID, descriptorUUID, success, fail)
	{
		var key = serviceUUID.toLowerCase() + ':' + characteristicUUID.toLowerCase() + ':' + descriptorUUID.toLowerCase();

		var descriptor = device.__serviceMap[key];
		if (!descriptor)
		{
			fail(easyble.error.DESCRIPTOR_NOT_FOUND + ' ' + key);
			return;
		}

		evothings.ble.readDescriptor(
			device.deviceHandle,
			descriptor.handle,
			success,
			fail);
	};

 	/**
 	 * Called from easyble.EasyBLEDevice.
	 * @private
	 */
	internal.writeCharacteristic = function(device, characteristicUUID, value, success, fail)
	{
		characteristicUUID = characteristicUUID.toLowerCase();

		var characteristic = device.__uuidMap[characteristicUUID];
		if (!characteristic)
		{
			console.log('easyble.writeCharacteristic char not found')
			for(var p in device.__uuidMap)
			{
				var char = device.__uuidMap[p]
				console.log(p+' -> '+JSON.stringify(char))
			}
			fail(easyble.error.CHARACTERISTIC_NOT_FOUND + ' ' +	characteristicUUID);
			return;
		}

		evothings.ble.writeCharacteristic(
			device.deviceHandle,
			characteristic.handle,
			value,
			function()
			{
				success();
			},
			function(errorCode)
			{
				fail(errorCode);
			});
	};

	/**
	* Called from easyble.EasyBLEDevice.
	* @private
	*/
	internal.writeServiceCharacteristic = function(device, serviceUUID, characteristicUUID, value, success, fail)
	{
		var key = serviceUUID.toLowerCase() + ':' + characteristicUUID.toLowerCase();

		var characteristic = device.__serviceMap[key];
		if (!characteristic)
		{
			console.log('easyble.writeServiceCharacteristic char not found')
			console.log(JSON.stringify(device.__serviceMap))
			fail(easyble.error.CHARACTERISTIC_NOT_FOUND + ' ' + key);
			return;
		}

		evothings.ble.writeCharacteristic(
			device.deviceHandle,
			characteristic.handle,
			value,
			success,
			fail);
	};

 	/**
 	 * Called from easyble.EasyBLEDevice.
	 * @private
	 */
	internal.writeDescriptor = function(
		device, characteristicUUID, descriptorUUID, value, success, fail)
	{
		characteristicUUID = characteristicUUID.toLowerCase();
		descriptorUUID = descriptorUUID.toLowerCase();

		var descriptor = device.__uuidMap[characteristicUUID + ':' + descriptorUUID];
		if (!descriptor)
		{
			fail(easyble.error.DESCRIPTOR_NOT_FOUND + ' ' + descriptorUUID);
			return;
		}

		evothings.ble.writeDescriptor(
			device.deviceHandle,
			descriptor.handle,
			value,
			function()
			{
				success();
			},
			function(errorCode)
			{
				fail(errorCode);
			});
	};

	/**
	* Called from easyble.EasyBLEDevice.
	* @private
	*/
	internal.writeServiceDescriptor = function(device, serviceUUID, characteristicUUID, descriptorUUID, value, success, fail)
	{
		var key = serviceUUID.toLowerCase() + ':' + characteristicUUID.toLowerCase() + ':' + descriptorUUID.toLowerCase();

		var descriptor = device.__serviceMap[key];
		if (!descriptor)
		{
			fail(easyble.error.DESCRIPTOR_NOT_FOUND + ' ' + key);
			return;
		}

		evothings.ble.writeDescriptor(
			device.deviceHandle,
			descriptor.handle,
			value,
			success,
			fail);
	};

 	/**
 	 * Called from easyble.EasyBLEDevice.
	 * @private
	 */
	internal.enableNotification = function(device, characteristicUUID, success, fail)
	{
		characteristicUUID = characteristicUUID.toLowerCase();

		var characteristic = device.__uuidMap[characteristicUUID];
		if (!characteristic)
		{
			fail(easyble.error.CHARACTERISTIC_NOT_FOUND + ' ' +
				characteristicUUID);
			return;
		}

		evothings.ble.enableNotification(
			device.deviceHandle,
			characteristic.handle,
			success,
			fail);
	};

	/**
	* Called from easyble.EasyBLEDevice.
	* @private
	*/
	internal.enableServiceNotification = function(device, serviceUUID, characteristicUUID, success, fail)
	{
		var key = serviceUUID.toLowerCase() + ':' + characteristicUUID.toLowerCase();

		var characteristic = device.__serviceMap[key];
		if (!characteristic)
		{
			console.log('easyble.enableServiceNotification char not found')
			console.log(JSON.stringify(device.__serviceMap))
			fail(easyble.error.CHARACTERISTIC_NOT_FOUND + ' ' + key);
			return;
		}

		evothings.ble.enableNotification(
			device.deviceHandle,
			characteristic.handle,
			success,
			fail);
	};

 	/**
 	 * Called from easyble.EasyBLEDevice.
	 * @private
	 */
	internal.disableNotification = function(device, characteristicUUID, success, fail)
	{
		characteristicUUID = characteristicUUID.toLowerCase();

		var characteristic = device.__uuidMap[characteristicUUID];
		if (!characteristic)
		{
			fail(easyble.error.CHARACTERISTIC_NOT_FOUND + ' ' +
				characteristicUUID);
			return;
		}

		evothings.ble.disableNotification(
			device.deviceHandle,
			characteristic.handle,
			success,
			fail);
	};

	/**
	* Called from easyble.EasyBLEDevice.
	* @private
	*/
	internal.disableServiceNotification = function(device, serviceUUID, characteristicUUID, success, fail)
	{
		var key = serviceUUID.toLowerCase() + ':' + characteristicUUID.toLowerCase();

		var characteristic = device.__serviceMap[key];
		if (!characteristic)
		{
			console.log('easyble.disableServiceNotification char not found')
			console.log(JSON.stringify(device.__serviceMap))
			fail(easyble.error.CHARACTERISTIC_NOT_FOUND + ' ' + key);
			return;
		}

		evothings.ble.disableNotification(
			device.deviceHandle,
			characteristic.handle,
			success,
			fail);
	};

	/**
	 * Prints and object for debugging purposes.
	 * @deprecated. Defined here for backwards compatibility.
	 * Use evothings.printObject().
	 * @public
	 */
	easyble.printObject = evothings.printObject;

 	/**
 	 * Reset the BLE hardware. Can be time consuming.
	 * @public
	 */
	easyble.reset = function()
	{
		evothings.ble.reset();
	};

module.exports = easyble
},{"./util.js":25}],21:[function(require,module,exports){
// Documentation for TI SensorTag CC2541:
// http://processors.wiki.ti.com/index.php/SensorTag_User_Guide
// http://processors.wiki.ti.com/index.php/File:BLE_SensorTag_GATT_Server.pdf

	//evothings.tisensortag.ble.CC2541 = {}
var tisensortagble = require('./tisensortag-ble')
var util = require('./util')

	/**
	 * @namespace
	 * @description Internal implementation of JavaScript library for the TI SensorTag CC2541.
	 * @alias evothings.tisensortag.ble.CC2541
	 */
	var sensortag = {}

	//evothings.tisensortag.ble.CC2541 = sensortag

	/**
	 * Create a SensorTag CC2541 instance.
	 * @returns {@link evothings.tisensortag.SensorTagInstance}
	 * @private
	 */
	sensortag.addInstanceMethods = function(anInstance)
	{
		/**
		 * @namespace
		 * @alias evothings.tisensortag.SensorTagInstanceBLE_CC2541
		 * @description SensorTag CC2541 instance object.
		 * @public
		 */
		var instance = anInstance

		// Add generic BLE instance methods.
		tisensortagble.addInstanceMethods(instance)

		/**
		 * The device model.
		 * @instance
		 * @public
		 */
		instance.deviceModel = 'CC2541'

		/**
		 * Determine if a BLE device is a SensorTag CC2541.
		 * Checks for the CC2541 using the advertised name.
		 * @instance
		 * @public
		 */
		instance.deviceIsSensorTag = function(device)
		{
			return (device != null) &&
				(device.advertisementData != null) &&
				(device.advertisementData.kCBAdvDataLocalName ==
					'SensorTag')
		}

		/**
		 * Public. Set the accelerometer notification callback.
		 * @param fun - success callback called repeatedly: fun(data)
		 * @param interval - accelerometer rate in milliseconds.
		 * @instance
		 * @public
		 */
		instance.accelerometerCallback = function(fun, interval)
		{
			instance.accelerometerFun = fun
			instance.accelerometerConfig = [1] // on
			instance.accelerometerInterval = interval
			instance.requiredServices.push(instance.ACCELEROMETER.SERVICE)

			return instance
		}

		/**
		 * Public. Set the gyroscope notification callback.
		 * @param fun - success callback called repeatedly: fun(data)
		 * @param interval - gyroscope rate in milliseconds.
		 * @param axes - the axes to enable ((z << 2) | (y << 1) | x)
		 * Axis parameter values are:
		 * 1 = X only, 2 = Y only,
		 * 3 = X and Y, 4 = Z only,
		 * 5 = X and Z, 6 = Y and Z,
		 * 7 = X, Y and Z.
		 * @instance
		 * @public
		 */
		instance.gyroscopeCallback = function(fun, interval, axes)
		{
			if ('undefined' == typeof axes)
			{
				axes = 7 // 7 = enable all axes
			}
			instance.gyroscopeFun = fun
			instance.gyroscopeConfig = [axes]
			instance.gyroscopeInterval = Math.max(100, interval)
			instance.requiredServices.push(instance.GYROSCOPE.SERVICE)

			return instance
		}

		/**
		 * Public. Set the magnetometer notification callback.
		 * @param fun - success callback called repeatedly: fun(data)
		 * @param interval - magnetometer rate in milliseconds.
		 * @instance
		 * @public
		 */
		instance.magnetometerCallback = function(fun, interval)
		{
			instance.magnetometerFun = fun
			instance.magnetometerConfig = [1] // on
			instance.magnetometerInterval = interval
			instance.requiredServices.push(instance.MAGNETOMETER.SERVICE)

			return instance
		}

		/**
		 * Internal.
		 * @instance
		 * @private
		 */
		instance.activateSensorsImpl = function()
		{
			// Debug logging.
			//console.log('-------------------- SERVICES --------------------')
			//sensortag.logServices(instance.device)
			//console.log('---------------------- END -----------------------')

			instance.temperatureOn()
			instance.humidityOn()
			instance.barometerOn()
			instance.accelerometerOn()
			instance.magnetometerOn()
			instance.gyroscopeOn()
			instance.keypressOn()
		}

		/**
		 * SensorTag CC2541.
		 * Public. Turn on accelerometer notification.
		 * @instance
		 * @public
		 */
		instance.accelerometerOn = function()
		{
			instance.sensorOn(
				instance.ACCELEROMETER,
				instance.accelerometerConfig,
				instance.accelerometerInterval,
				instance.accelerometerFun
			)

			return instance
		}

		/**
		 * SensorTag CC2541.
		 * Public. Turn off accelerometer notification.
		 * @instance
		 * @public
		 */
		instance.accelerometerOff = function()
		{
			instance.sensorOff(instance.ACCELEROMETER)

			return instance
		}

		/**
		 * SensorTag CC2541.
		 * Public. Turn on gyroscope notification.
		 * @instance
		 * @public
		 */
		instance.gyroscopeOn = function()
		{
			instance.sensorOn(
				instance.GYROSCOPE,
				instance.gyroscopeConfig,
				instance.gyroscopeInterval,
				instance.gyroscopeFun
			)

			return instance
		}

		/**
		 * Public. Turn off gyroscope notification (SensorTag CC2541).
		 * @instance
		 * @public
		 */
		instance.gyroscopeOff = function()
		{
			instance.sensorOff(instance.GYROSCOPE)

			return instance
		}

		/**
		 * Public. Turn on magnetometer notification (SensorTag CC2541).
		 * @instance
		 * @public
		 */
		instance.magnetometerOn = function()
		{
			instance.sensorOn(
				instance.MAGNETOMETER,
				instance.magnetometerConfig,
				instance.magnetometerInterval,
				instance.magnetometerFun
			)

			return instance
		}

		/**
		 * Public. Turn off magnetometer notification (SensorTag CC2541).
		 * @instance
		 * @public
		 */
		instance.magnetometerOff = function()
		{
			instance.sensorOff(instance.MAGNETOMETER)

			return instance
		}

		/**
		 * SensorTag CC2541.
		 * Public. Turn on barometer notification.
		 * @instance
		 * @public
		 */
		instance.barometerOn = function()
		{
			// First fetch barometer calibration data,
			// then enable the barometer.
			instance.barometerCalibrate(function()
			{
				instance.sensorOn(
					instance.BAROMETER,
					instance.barometerConfig,
					instance.barometerInterval,
					instance.barometerFun
				)
			})

			return instance
		}

		/**
		 * SensorTag CC2541.
		 * Private. Enable barometer calibration mode.
		 * @instance
		 * @private
		 */
		instance.barometerCalibrate = function(callback)
		{
			console.log('cc2541 barometerCalibrate called')
			instance.device.writeCharacteristic(
				instance.BAROMETER.CONFIG,
				new Uint8Array([2]),
				function()
				{
					instance.device.readCharacteristic(
						instance.BAROMETER.CALIBRATION,
						function(data)
						{
							data = new Uint8Array(data)
							instance.barometerCalibrationData =
							[
								util.littleEndianToUint16(data, 0),
								util.littleEndianToUint16(data, 2),
								util.littleEndianToUint16(data, 4),
								util.littleEndianToUint16(data, 6),
								util.littleEndianToInt16(data, 8),
								util.littleEndianToInt16(data, 10),
								util.littleEndianToInt16(data, 12),
								util.littleEndianToInt16(data, 14)
							]
							callback()
						},
						function(error)
						{
							console.log('CC2541 Barometer calibration failed: ' + error)
						})
				},
				instance.errorFun)

			return instance
		}

		/**
		 * SensorTag CC2541.
		 * Calculate accelerometer values from raw data.
		 * @param data - an Uint8Array.
		 * @return Object with fields: x, y, z.
		 * @instance
		 * @public
		 */
		instance.getAccelerometerValues = function(data)
		{
			// Set divisor based on firmware version.
			var divisors = {x: 16.0, y: -16.0, z: 16.0}

			// Calculate accelerometer values.
			var ax = util.littleEndianToInt8(data, 0) / divisors.x
			var ay = util.littleEndianToInt8(data, 1) / divisors.y
			var az = util.littleEndianToInt8(data, 2) / divisors.z

			// Return result.
			return { x: ax, y: ay, z: az }
		}

		/**
		 * SensorTag CC2541.
		 * Calculate gyroscope values from raw data.
		 * @param data - an Uint8Array.
		 * @return Object with fields: x, y, z.
		 * @instance
		 * @public
		 */
		instance.getGyroscopeValues = function(data)
		{
			// Calculate gyroscope values. NB: x,y,z has a weird order.
			var gy = -util.littleEndianToInt16(data, 0) * 500.0 / 65536.0
			var gx =  util.littleEndianToInt16(data, 2) * 500.0 / 65536.0
			var gz =  util.littleEndianToInt16(data, 4) * 500.0 / 65536.0

			// Return result.
			return { x: gx, y: gy, z: gz }
		}

		/**
		 * SensorTag CC2541.
		 * Calculate magnetometer values from raw data.
		 * @param data - an Uint8Array.
		 * @return Object with fields: x, y, z.
		 * @instance
		 * @public
		 */
		instance.getMagnetometerValues = function(data)
		{
			// Magnetometer values (Micro Tesla).
			var mx = util.littleEndianToInt16(data, 0) * (2000.0 / 65536.0) * -1
			var my = util.littleEndianToInt16(data, 2) * (2000.0 / 65536.0) * -1
			var mz = util.littleEndianToInt16(data, 4) * (2000.0 / 65536.0)

			// Return result.
			return { x: mx, y: my, z: mz }
		}

		/**
		 * SensorTag CC2541.
		 * Calculate barometer values from raw data.
		 * @instance
		 * @public
		 */
		instance.getBarometerValues = function(data)
		{
			var t = util.littleEndianToInt16(data, 0)
			var p = util.littleEndianToUint16(data, 2)
			var c = instance.barometerCalibrationData

			var S = c[2] + ((c[3] * t) / 131072) + ((c[4] * (t * t)) / 17179869184.0)
			var O = (c[5] * 16384.0) + (((c[6] * t) / 8)) + ((c[7] * (t * t)) / 524288.0)
			var Pa = (((S * p) + O) / 16384.0)
			var pInterpreted = Pa / 100.0

			return { pressure: pInterpreted }
		}

		/**
		 * Calculate temperature values from raw data.
		 * @param data - an Uint8Array.
		 * @return Object with fields: ambientTemperature, targetTemperature.
		 * @instance
		 * @public
		 */
		instance.getTemperatureValues = function(data)
		{
			// Calculate ambient temperature (Celsius).
			var ac = util.littleEndianToUint16(data, 2) / 128.0

			// Calculate target temperature (Celsius, based on ambient).
			var Vobj2 = util.littleEndianToInt16(data, 0) * 0.00000015625
			var Tdie = ac + 273.15
			var S0 =  6.4E-14	// calibration factor
			var a1 =  1.750E-3
			var a2 = -1.678E-5
			var b0 = -2.940E-5
			var b1 = -5.700E-7
			var b2 =  4.630E-9
			var c2 = 13.4
			var Tref = 298.15
			var S = S0 * (1 + a1 * (Tdie - Tref) + a2 * Math.pow((Tdie - Tref), 2))
			var Vos = b0 + b1 * (Tdie - Tref) + b2 * Math.pow((Tdie - Tref), 2)
			var fObj = (Vobj2 - Vos) + c2 * Math.pow((Vobj2 - Vos), 2)
			var tObj = Math.pow(Math.pow(Tdie, 4 ) + (fObj / S), 0.25)
			var tc = tObj - 273.15

			// Return result.
			return { ambientTemperature: ac, targetTemperature: tc }
		}

		/**
		 * Public. Checks if the Temperature sensor is available.
		 * @preturn true if available, false if not.
		 * @instance
		 * @public
		 */
		instance.isTemperatureAvailable = function()
		{
			return true
		}

		/**
		 * Public. Checks if the accelerometer sensor is available.
		 * @preturn true if available, false if not.
		 * @instance
		 * @public
		 */
		instance.isAccelerometerAvailable = function()
		{
			return true
		}

		/**
		 * Public. Checks if the humidity sensor is available.
		 * @preturn true if available, false if not.
		 * @instance
		 * @public
		 */
		instance.isHumidityAvailable = function()
		{
			return true
		}

		/**
		 * Public. Checks if the magnetometer sensor is available.
		 * @preturn true if available, false if not.
		 * @instance
		 * @public
		 */
		instance.isMagnetometerAvailable = function()
		{
			return true
		}

		/**
		 * Public. Checks if the barometer sensor is available.
		 * @preturn true if available, false if not.
		 * @instance
		 * @public
		 */
		instance.isBarometerAvailable = function()
		{
			return true
		}

		/**
		 * Public. Checks if the gyroscope sensor is available.
		 * @preturn true if available, false if not.
		 * @instance
		 * @public
		 */
		instance.isGyroscopeAvailable = function()
		{
			return true
		}

		/**
		 * Public. Checks if the keypress sensor is available.
		 * @preturn true if available, false if not.
		 * @instance
		 * @public
		 */
		instance.isKeypressAvailable = function()
		{
			return true
		}

		// Finally, return the SensorTag instance object.
		return instance
	}


module.exports = sensortag
},{"./tisensortag-ble":23,"./util":25}],22:[function(require,module,exports){

	//tisensortagble.CC2650 = {}
	var tisensortagble = require('./tisensortag-ble')

	/**
	 * @namespace
	 * @description Internal implementation of JavaScript library for the TI SensorTag CC2650.
	 * @alias tisensortagble.CC2650
	 */
	var sensortag = {}

	//tisensortagble.CC2650 = sensortag

	/**
	 * Create a SensorTag CC2650 instance.
	 * @returns {@link evothings.tisensortag.SensorTagInstanceBLE_CC2650}
	 * @private
	 */
	sensortag.addInstanceMethods = function(anInstance)
	{
		/**
		 * @namespace
		 * @alias evothings.tisensortag.SensorTagInstanceBLE_CC2650
		 * @description SensorTag CC2650 instance object.
		 * @public
		 */
		var instance = anInstance

		// Add generic BLE instance methods.
		tisensortagble.addInstanceMethods(instance)

		/**
		 * The device model.
		 * @instance
		 * @public
		 */
		instance.deviceModel = 'CC2650'

		/**
		 * Determine if a BLE device is a SensorTag CC2650.
		 * Checks for the CC2650 using the advertised name.
		 * @instance
		 * @public
		 */
		instance.deviceIsSensorTag = function(device)
		{
			return (device != null) &&
				(device.advertisementData != null) &&
				(device.advertisementData.kCBAdvDataLocalName ==
					'CC2650 SensorTag')
		}

		/**
		 * Public. Set the accelerometer notification callback.
		 * @param fun - success callback called repeatedly: fun(data)
		 * @param interval - accelerometer rate in milliseconds.
		 * @instance
		 * @public
		 */
		instance.accelerometerCallback = function(fun, interval)
		{
			instance.accelerometerFun = fun

			// Enable movement callback.
			instance.setupCatchAllMovementCallback(interval)

			return instance
		}

		/**
		 * Public. Set the gyroscope notification callback.
		 * Enables all axes.
		 * @param fun - success callback called repeatedly: fun(data)
		 * @param interval - gyroscope rate in milliseconds.
		 * @instance
		 * @public
		 */
		instance.gyroscopeCallback = function(fun, interval)
		{
			instance.gyroscopeFun = fun

			// Enable movement callback.
			instance.setupCatchAllMovementCallback(interval)

			return instance
		}

		/**
		 * Public. Set the magnetometer notification callback.
		 * @param fun - success callback called repeatedly: fun(data)
		 * @param interval - magnetometer rate in milliseconds.
		 * @instance
		 * @public
		 */
		instance.magnetometerCallback = function(fun, interval)
		{
			instance.magnetometerFun = fun

			// Enable movement callback.
			instance.setupCatchAllMovementCallback(interval)

			return instance
		}

		/**
		 * Private. Setup the movement sensor to call accelerometer,
		 * gyroscope and magnetometer callbacks.
		 * @param fun - success callback called repeatedly: fun(data)
		 * @param interval - magnetometer rate in milliseconds.
		 * @instance
		 * @private
		 */
		instance.setupCatchAllMovementCallback = function(interval)
		{
			// Only do this once.
			if (instance.catchAllMovementCallbackEnabled) { return }
			instance.catchAllMovementCallbackEnabled = true

			// Call all of the movement service's callbacks
			// (accelerometer, gyroscope, magnetometer)

 			// Set the config that turns on the needed sensors.
			// magnetometer on: 64 (1000000) (seems to not work in ST2 FW 0.89)
			// 3-axis acc. on: 56 (0111000)
			// 3-axis gyro on: 7 (0000111)
			// 3-axis acc. + 3-axis gyro on: 63 (0111111)
			// 3-axis acc. + 3-axis gyro + magnetometer on: 127 (1111111)
			instance.movementCallback(
				function(data)
				{
					instance.accelerometerFun && instance.accelerometerFun(data)
					instance.magnetometerFun && instance.magnetometerFun(data)
					instance.gyroscopeFun && instance.gyroscopeFun(data)
				},
				interval,
				127)
		}

		/**
		 * SensorTag CC2650.
		 * Public. Set the movement notification callback.
		 * Movement callbacks are routed back to accelerometer,
		 * gyroscope, and magnetometer callbacks.
		 * @param fun - Success callback called repeatedly: fun(data)
		 * @param interval - Sensor rate in milliseconds.
		 * @param sensors - Set the config that turns on the needed sensors:<br/>
		 * Magnetometer on: 64 (1000000) (seems to not work in ST2 FW 0.89)<br/>
		 * 3-axis acc. on: 56 (0111000)<br/>
		 * 3-axis gyro on: 7 (0000111)<br/>
		 * 3-axis acc. + 3-axis gyro on: 63 (0111111)<br/>
		 * 3-axis acc. + 3-axis gyro + magnetometer on: 127 (1111111)<br/>
		 * @instance
		 * @public
		 */
		instance.movementCallback = function(fun, interval, sensors)
		{
			// Callback for all movement sensors (accelerometer, gyroscope, magnetometer).
			instance.movementFun = fun

 			// Set the config that turns on the needed sensors.
			instance.movementConfig = [sensors, 0]
			instance.movementInterval = interval
			instance.requiredServices.push(instance.MOVEMENT.SERVICE)

			return instance
		}

		/**
		 * Public. Set the luxometer notification callback.
		 * @param fun - success callback called repeatedly: fun(data)
		 * @param interval - luxometer rate in milliseconds.
		 */
		instance.luxometerCallback = function(fun, interval)
		{
			instance.luxometerFun = fun
			instance.luxometerConfig = [1] // on
			instance.luxometerInterval = Math.max(1000, interval)
			instance.requiredServices.push(instance.LUXOMETER.SERVICE)

			return instance
		}

		/**
		 * SensorTag CC2650.
		 * Internal.
		 * @instance
		 * @private
		 */
		instance.activateSensorsImpl = function()
		{
			// Debug logging.
			//console.log('-------------------- SERVICES --------------------')
			//sensortag.logServices(instance.device)
			//console.log('---------------------- END -----------------------')

			instance.temperatureOn()
			instance.humidityOn()
			instance.barometerOn()
			instance.luxometerOn()
			instance.movementOn()
			instance.keypressOn()
		}

		/**
		 * SensorTag CC2650.
		 * Public. Turn on barometer notification.
		 * @instance
		 * @public
		 */
		instance.barometerOn = function()
		{
			instance.sensorOn(
				instance.BAROMETER,
				instance.barometerConfig,
				instance.barometerInterval,
				instance.barometerFun
			)

			return instance
		}

		/**
		 * SensorTag CC2650.
		 * Public. Turn on movement notification (SensorTag 2).
		 * @instance
		 * @public
		 */
		instance.movementOn = function()
		{
			instance.sensorOn(
				instance.MOVEMENT,
				instance.movementConfig,
				instance.movementInterval,
				instance.movementFun
			)

			return instance
		}

		/**
		 * SensorTag CC2650.
		 * Public. Turn off movement notification (SensorTag 2).
		 * @instance
		 * @public
		 */
		instance.movementOff = function()
		{
			instance.sensorOff(instance.MOVEMENT)

			return instance
		}

		/**
		 * SensorTag CC2650.
		 * Public. Turn on luxometer notification.
		 * @instance
		 * @public
		 */
		instance.luxometerOn = function()
		{
			instance.sensorOn(
				instance.LUXOMETER,
				instance.luxometerConfig,
				instance.luxometerInterval,
				instance.luxometerFun
			)

			return instance
		}

		/**
		 * SensorTag CC2650.
		 * Public. Turn off luxometer notification.
		 * @instance
		 * @public
		 */
		instance.luxometerOff = function()
		{
			instance.sensorOff(instance.LUXOMETER)

			return instance
		}

		/**
		 * SensorTag CC2650.
		 * Calculate temperature values from raw data.
		 * @param data - an Uint8Array.
		 * @return Object with fields: ambientTemperature, targetTemperature.
		 * @instance
		 * @public
		 */
		instance.getTemperatureValues = function(data)
		{
			// Calculate ambient temperature (Celsius).
			var ac = evothings.util.littleEndianToUint16(data, 2) / 128.0

			// Calculate target temperature (Celsius).
			var tc = evothings.util.littleEndianToInt16(data, 0)
			tc = (tc >> 2) * 0.03125

			// Return result.
			return { ambientTemperature: ac, targetTemperature: tc }
		}

		/**
		 * SensorTag CC2650.
		 * Calculate accelerometer values from raw data.
		 * @param data - an Uint8Array.
		 * @return Object with fields: x, y, z.
		 * @instance
		 * @public
		 */
		instance.getAccelerometerValues = function(data)
		{
			var divisors = {x: -16384.0, y: 16384.0, z: -16384.0}

			// Calculate accelerometer values.
			var ax = evothings.util.littleEndianToInt16(data, 6) / divisors.x
			var ay = evothings.util.littleEndianToInt16(data, 8) / divisors.y
			var az = evothings.util.littleEndianToInt16(data, 10) / divisors.z

			// Return result.
			return { x: ax, y: ay, z: az }
		}

		/**
		 * SensorTag CC2650.
		 * Calculate gyroscope values from raw data.
		 * @param data - an Uint8Array.
		 * @return Object with fields: x, y, z.
		 * @instance
		 * @public
		 */
		instance.getGyroscopeValues = function(data)
		{
			// Calculate gyroscope values.
			var gx = evothings.util.littleEndianToInt16(data, 0) * 255.0 / 32768.0
			var gy = evothings.util.littleEndianToInt16(data, 2) * 255.0 / 32768.0
			var gz =  evothings.util.littleEndianToInt16(data, 4) * 255.0 / 32768.0

			// Return result.
			return { x: gx, y: gy, z: gz }
		}

		/**
		 * SensorTag CC2650.
		 * Calculate barometer values from raw data.
		 * @instance
		 * @public
		 */
		instance.getBarometerValues = function(data)
		{
			var p = evothings.util.littleEndianToUint16(data, 2)

			// Extraction of pressure value, based on sfloatExp2ToDouble from
			// BLEUtility.m in Texas Instruments TI BLE SensorTag iOS app
			// source code.
			// TODO: Move to util.js
			var mantissa = p & 0x0FFF
			var exponent = p >> 12

			magnitude = Math.pow(2, exponent)
			output = (mantissa * magnitude)

			var pInterpreted = output / 10000.0

			return { pressure: pInterpreted }
		}

		/**
		 * SensorTag CC2650.
		 * Calculate magnetometer values from raw data.
		 * @param data - an Uint8Array.
		 * @return Object with fields: x, y, z.
		 * @instance
		 * @public
		 */
		instance.getMagnetometerValues = function(data)
		{
			// Magnetometer values (Micro Tesla).
			var mx = evothings.util.littleEndianToInt16(data, 12) * (4912.0 / 32768.0)
			var my = evothings.util.littleEndianToInt16(data, 14) * (4912.0 / 32768.0)
			var mz = evothings.util.littleEndianToInt16(data, 16) * (4912.0 / 32768.0)

			// Return result.
			return { x: mx, y: my, z: mz }
		}

		/**
		 * SensorTag CC2650.
		 * Calculate luxometer values from raw data.
		 * @param data - an Uint8Array.
		 * @return Light level in lux units.
		 * @instance
		 * @public
		 */
		instance.getLuxometerValue = function(data)
		{
			// Calculate the light level.
			var value = evothings.util.littleEndianToUint16(data, 0)

			// Extraction of luxometer value, based on sfloatExp2ToDouble
			// from BLEUtility.m in Texas Instruments TI BLE SensorTag
			// iOS app source code.
			// TODO: move to util.js
			var mantissa = value & 0x0FFF
			var exponent = value >> 12

			magnitude = Math.pow(2, exponent)
			output = (mantissa * magnitude)

			var lux = output / 100.0

			// Return result.
			return lux
		}

		/**
		 * Public. Checks if the Temperature sensor is available.
		 * @preturn true if available, false if not.
		 * @instance
		 * @public
		 */
		instance.isTemperatureAvailable = function()
		{
			return true
		}

		/**
		 * Public. Checks if the accelerometer sensor is available.
		 * @preturn true if available, false if not.
		 * @instance
		 * @public
		 */
		instance.isAccelerometerAvailable = function()
		{
			return true
		}

		/**
		 * Public. Checks if the humidity sensor is available.
		 * @preturn true if available, false if not.
		 * @instance
		 * @public
		 */
		instance.isHumidityAvailable = function()
		{
			return true
		}

		/**
		 * Public. Checks if the magnetometer sensor is available.
		 * @preturn true if available, false if not.
		 * @instance
		 * @public
		 */
		instance.isMagnetometerAvailable = function()
		{
			return true
		}

		/**
		 * Public. Checks if the barometer sensor is available.
		 * @preturn true if available, false if not.
		 * @instance
		 * @public
		 */
		instance.isBarometerAvailable = function()
		{
			return true
		}

		/**
		 * Public. Checks if the gyroscope sensor is available.
		 * @preturn true if available, false if not.
		 * @instance
		 * @public
		 */
		instance.isGyroscopeAvailable = function()
		{
			return true
		}

		/**
		 * Public. Checks if movement sensor is available that
		 * combines accelerometer, gyroscope, and magnetometer.
		 * @preturn true if available, false if not.
		 * @instance
		 * @public
		 */
		instance.isMovementAvailable = function()
		{
			return true
		}

		/**
		 * Public. Checks if the luxometer sensor is available.
		 * @preturn true if available, false if not.
		 * @instance
		 * @public
		 */
		instance.isLuxometerAvailable = function()
		{
			return true
		}

		/**
		 * Public. Checks if the keypress sensor is available.
		 * @preturn true if available, false if not.
		 * @instance
		 * @public
		 */
		instance.isKeypressAvailable = function()
		{
			return true
		}

		// Finally, return the SensorTag instance object.
		return instance
	}

module.exports = sensortag

},{"./tisensortag-ble":23}],23:[function(require,module,exports){
// Shared functions for BLE TI SensorTags.

var easyble = require('./easyble')
var util = require('./util')

	/**
	 * @namespace
	 * @description JavaScript library for the TI SensorTag.
	 * @alias evothings.tisensortag.ble
	 * @public
	 */
	var sensortag = {}

	// Add object to namespace.
	//evothings.tisensortag.ble = sensortag

	/**
	 * @namespace
	 * @description Status constants.
	 * @alias evothings.tisensortag.ble.status
	 * @public
	 */
	var status = {}

	// Add to namespace. This trick is needed for JSDoc,
	// cannot use sensortag.status below, docs do not
	// generate properly in this case.
	sensortag.status = status

	/**
	 * @description Scanning is ongoing.
	 * @public
	 */
	status.SCANNING = 'SCANNING'

	/**
	 * @description Found SensorTag device.
	 * @public
	 */
	status.SENSORTAG_FOUND = 'SENSORTAG_FOUND'

	/**
	 * @description Scanning timed out, no device found.
	 * @public
	 */
	status.SENSORTAG_NOT_FOUND = 'SENSORTAG_NOT_FOUND'

	/**
	 * @description Connecting to physical device.
	 * @public
	 */
	status.CONNECTING = 'CONNECTING'

	/**
	 * @description Connected to physical device.
	 * @public
	 */
	status.CONNECTED = 'CONNECTED'

	/**
	 * @description Reading info about the device.
	 * @public
	 */
	status.READING_DEVICE_INFO = 'READING_DEVICE_INFO'

	/**
	 * @description Info about the device is available.
	 * @public
	 */
	status.DEVICE_INFO_AVAILABLE = 'DEVICE_INFO_AVAILABLE'

	/**
	 * @description Reading services of the device.
	 * @public
	 */
	status.READING_SERVICES = 'READING_SERVICES'

	/**
	 * @description SensorTag device is connected and sensors are avaliable.
	 * @public
	 */
	status.SENSORTAG_ONLINE = 'SENSORTAG_ONLINE'

	/**
	 * @namespace
	 * @description Error constants. There are additional
	 * error strings reported by the cordova-ble plugin
	 * and the easyble.js library.
	 * @alias evothings.tisensortag.ble.error
	 * @public
	 */
	var error = {}

	// Add to namespace. This trick is needed for JSDoc,
	// cannot use sensortag.error below, docs do not
	// generate properly in this case.
	sensortag.error = error

	/**
	 * @description Scan failed.
	 * @public
	 */
	error.SCAN_FAILED = 'SCAN_FAILED'

	/**
	 * Public. Create a SensorTag instance.
	 * @returns {@link evothings.tisensortag.SensorTagInstanceBLE}
	 * @private
	 */
	sensortag.addInstanceMethods = function(anInstance)
	{
		/**
		 * @namespace
		 * @alias evothings.tisensortag.SensorTagInstanceBLE
		 * @description Abstract SensorTag instance object.
		 * This object specifies the interface common to Bluetooth Smart
		 * SensorTags.
		 * @public
		 */
		var instance = anInstance

		// UUIDs for services, characteristics, and descriptors.
		instance.NOTIFICATION_DESCRIPTOR = '00002902-0000-1000-8000-00805f9b34fb'

		instance.DEVICEINFO_SERVICE = '0000180a-0000-1000-8000-00805f9b34fb'
		instance.FIRMWARE_DATA = '00002a26-0000-1000-8000-00805f9b34fb'
		instance.MODELNUMBER_DATA = '00002a24-0000-1000-8000-00805f9b34fb'

		instance.TEMPERATURE = {
			SERVICE: 'f000aa00-0451-4000-b000-000000000000',
			DATA: 'f000aa01-0451-4000-b000-000000000000',
			CONFIG: 'f000aa02-0451-4000-b000-000000000000',
			// Missing in HW rev. 1.2 (FW rev. 1.5)
			PERIOD: 'f000aa03-0451-4000-b000-000000000000',
		}

		instance.HUMIDITY = {
			SERVICE: 'f000aa20-0451-4000-b000-000000000000',
			DATA: 'f000aa21-0451-4000-b000-000000000000',
			CONFIG: 'f000aa22-0451-4000-b000-000000000000',
			PERIOD: 'f000aa23-0451-4000-b000-000000000000',
		}

		instance.BAROMETER = {
			SERVICE: 'f000aa40-0451-4000-b000-000000000000',
			DATA: 'f000aa41-0451-4000-b000-000000000000',
			CONFIG: 'f000aa42-0451-4000-b000-000000000000',
			CALIBRATION: 'f000aa43-0451-4000-b000-000000000000',
			PERIOD: 'f000aa44-0451-4000-b000-000000000000',
		}

		// Only in SensorTag CC2541.
		instance.ACCELEROMETER = {
			SERVICE: 'f000aa10-0451-4000-b000-000000000000',
			DATA: 'f000aa11-0451-4000-b000-000000000000',
			CONFIG: 'f000aa12-0451-4000-b000-000000000000',
			PERIOD: 'f000aa13-0451-4000-b000-000000000000',
		}

		// Only in SensorTag CC2541.
		instance.MAGNETOMETER = {
			SERVICE: 'f000aa30-0451-4000-b000-000000000000',
			DATA: 'f000aa31-0451-4000-b000-000000000000',
			CONFIG: 'f000aa32-0451-4000-b000-000000000000',
			PERIOD: 'f000aa33-0451-4000-b000-000000000000',
		}

		// Only in SensorTag CC2541.
		instance.GYROSCOPE = {
			SERVICE: 'f000aa50-0451-4000-b000-000000000000',
			DATA: 'f000aa51-0451-4000-b000-000000000000',
			CONFIG: 'f000aa52-0451-4000-b000-000000000000',
			PERIOD: 'f000aa53-0451-4000-b000-000000000000',
		}

		// Only in SensorTag CC2650.
		instance.LUXOMETER = {
			SERVICE: 'f000aa70-0451-4000-b000-000000000000',
			DATA: 'f000aa71-0451-4000-b000-000000000000',
			CONFIG: 'f000aa72-0451-4000-b000-000000000000',
			PERIOD: 'f000aa73-0451-4000-b000-000000000000',
		}

		// Only in SensorTag CC2650.
		instance.MOVEMENT = {
			SERVICE: 'f000aa80-0451-4000-b000-000000000000',
			DATA: 'f000aa81-0451-4000-b000-000000000000',
			CONFIG: 'f000aa82-0451-4000-b000-000000000000',
			PERIOD: 'f000aa83-0451-4000-b000-000000000000',
		}

		instance.KEYPRESS = {
			SERVICE: '0000ffe0-0000-1000-8000-00805f9b34fb',
			DATA: '0000ffe1-0000-1000-8000-00805f9b34fb',
		}

		/**
		 * Internal. Services used by the application.
		 * @instance
		 * @private
		 */
		instance.requiredServices = []

		/**
		 * Both CC2541 and CC2650.
		 * Public. Set the humidity temperature callback.
		 * @param fun - success callback called repeatedly: fun(data)
		 * @param interval - humidity rate in milliseconds.
		 * @instance
		 * @public
		 */
		instance.temperatureCallback = function(fun, interval)
		{
			instance.temperatureFun = fun
			instance.temperatureConfig = [1] // on
			instance.temperatureInterval = Math.max(300, interval)
			instance.requiredServices.push(instance.TEMPERATURE.SERVICE)

			return instance
		}

		/**
		 * Both CC2541 and CC2650.
		 * Public. Set the humidity notification callback.
		 * @param fun - success callback called repeatedly: fun(data)
		 * @param interval - humidity rate in milliseconds.
		 * @instance
		 * @public
		 */
		instance.humidityCallback = function(fun, interval)
		{
			instance.humidityFun = fun
			instance.humidityConfig = [1] // on
			instance.humidityInterval = Math.max(100, interval)
			instance.requiredServices.push(instance.HUMIDITY.SERVICE)

			return instance
		}

		/**
		 * Both CC2541 and CC2650.
		 * Public. Set the barometer notification callback.
		 * @param fun - success callback called repeatedly: fun(data)
		 * @param interval - barometer rate in milliseconds.
		 * @instance
		 * @public
		 */
		instance.barometerCallback = function(fun, interval)
		{
			instance.barometerFun = fun
			instance.barometerConfig = [1] // on
			instance.barometerInterval = Math.max(100, interval)
			instance.requiredServices.push(instance.BAROMETER.SERVICE)

			return instance
		}

		/**
		 * Both CC2541 and CC2650.
		 * Public. Set the keypress notification callback.
		 * @param fun - success callback called when a key is pressed: fun(data)
		 * @instance
		 * @public
		 */
		instance.keypressCallback = function(fun)
		{
			instance.keypressFun = fun
			instance.requiredServices.push(instance.KEYPRESS.SERVICE)

			return instance
		}

		/**
		 * Determine if a BLE device is a SensorTag.
		 * This version checks the general case using
		 * the advertised name.
		 * Specific versions for CC2541 and CC2650 uses
		 * advertisement data to determine tag type.
		 * @instance
		 * @public
		 */
		instance.deviceIsSensorTag = function(device)
		{
			return (device != null) &&
				(device.name != null) &&
				(device.name.indexOf('Sensor Tag') > -1 ||
					device.name.indexOf('SensorTag') > -1)
		}

		/**
		 * Public. Connect to the nearest physical SensorTag device.
		 * @instance
		 * @public
		 * @deprecated Use evothings.tiseonsortag.ble.connectToNearestDevice
		 */
		instance.connectToClosestDevice = function()
		{
			return instance.connectToNearestDevice()
		}

		/**
		 * Public. Connect to the nearest physical SensorTag device.
		 * For this to work reliably SensorTags should be at least a
		 * couple of meters apart.
		 * @param scanTimeMilliseconds The time to scan for nearby
		 * SensorTags (optional, defaults to 3 seconds).
		 * @instance
		 * @public
		 */
		instance.connectToNearestDevice = function(scanTimeMilliseconds)
		{
			instance.callStatusCallback(sensortag.status.SCANNING)
			instance.disconnectDevice()
			easyble.stopScan()
			easyble.reportDeviceOnce(false)

			var nearestDevice = null
			var strongestRSSI = -1000
			var scanTimeoutStarted = false
			var noTagFoundTimer = null

			// Timer that connects to the nearest SensorTag efter the
			// specified timeout.
			function startConnectTimer()
			{
				// Set timeout period.
				scanTimeMilliseconds = (('undefined' == typeof scanTimeMilliseconds)
					? 1000 // Default scan time is 3 seconds
					: scanTimeMilliseconds) // Use user-set value

				// Start timer.
				setTimeout(
					function() {
						if (nearestDevice)
						{
							easyble.stopScan()
							instance.callStatusCallback(
								sensortag.status.SENSORTAG_FOUND)
							instance.connectToDevice(nearestDevice)
						}
					},
					scanTimeMilliseconds)
			}

			// Timer that times out if no tag at all is found.
			// Period is set to 10 seconds.
			function startNoTagFoundTimer(device)
			{
				// Set scan timeout period.
				var timeOut = 10000

				// Start timer.
				noTagFoundTimer = setTimeout(
					function() {
						if (!nearestDevice)
						{
							easyble.stopScan()
							instance.callStatusCallback(
								sensortag.status.SENSORTAG_NOT_FOUND)
						}
					},
					timeOut)
			}

			function stopNoTagFoundTimer()
			{
				clearTimeout(noTagFoundTimer)
			}

			// Called when a device is found during scanning.
			function deviceFound(device)
			{
				// Update the device if it is nearest so far
				// and the RRSI value is valid. 127 is an invalid
				// (unknown) RSSI value reported occasionally.
				// deviceIsSensorTag is implemented in CC2541 and
				// CC2650 object code.
				if (device.rssi != 127 && instance.deviceIsSensorTag(device))
				{
					//console.log('deviceFound: ' + device.name)

					if (device.rssi > strongestRSSI)
					{
						// If this is the first SensorTag found,
						// start the timer that makes the connection.
						if (!nearestDevice)
						{
							stopNoTagFoundTimer()
							startConnectTimer()
						}

						nearestDevice = device
						strongestRSSI = device.rssi
					}
				}
			}

			function scanError(errorCode)
			{
				instance.callErrorCallback(sensortag.error.SCAN_FAILED)
			}

			// Start timer that reports if no tag at all was found.
			startNoTagFoundTimer()

			// Start scanning.
			easyble.startScan(deviceFound, scanError)

			return instance
		}

		/**
		 * Start scanning for physical devices.
		 * @param foundCallback Function called when a SensorTag
		 * is found. It has the form foundCallback(device) where
		 * is a an object representing a BLE device object. You can
		 * inspect the device fields to determine properties such as
		 * RSSI, name etc. You can call deviceIsSensorTag(device) to
		 * determine if this is a  SensorTag of the same type as the
		 * instance object.
		 * To connect to a SensorTag call connectToDevice(device).
		 * @instance
		 * @public
		 */
		instance.startScanningForDevices = function(foundCallback)
		{
			instance.callStatusCallback(sensortag.status.SCANNING)
			instance.disconnectDevice()
			easyble.stopScan()
			easyble.reportDeviceOnce(false)

			// Called when a device is found during scanning.
			function deviceFound(device)
			{
				// 127 is an invalid (unknown) RSSI value reported occasionally.
				if (device.rssi != 127)
				{
					foundCallback(device)
				}
			}

			function scanError(errorCode)
			{
				instance.callErrorCallback(sensortag.error.SCAN_FAILED)
			}

			// Start scanning.
			easyble.startScan(deviceFound, scanError)

			return instance
		}

		/**
		 * Stop scanning for physical devices.
		 * @instance
		 * @public
		 */
		instance.stopScanningForDevices = function()
		{
			instance.callStatusCallback(sensortag.status.SENSORTAG_NOT_FOUND)

			easyble.stopScan()

			return instance
		}

		/**
		 * Connect to a SensorTag BLE device.
		 * @param device A Bluetooth Low Energy device object.
		 * @instance
		 * @public
		 */
		instance.connectToDevice = function(device)
		{
			console.log('tisensortag-ble connecting to device')
			console.log(JSON.stringify(device))
			instance.device = device
			instance.callStatusCallback(sensortag.status.CONNECTING)
			instance.device.connect(
				function(device)
				{
					instance.callStatusCallback(sensortag.status.CONNECTED)
					instance.readDeviceInfo()
				},
				instance.errorFun)
		}

		/**
		 * Public. Disconnect from the physical device.
		 * @instance
		 * @public
		 */
		instance.disconnectDevice = function()
		{
			if (instance.device)
			{
				instance.device.close()
				instance.device = null
			}

			return instance
		}

		/**
		 * Internal. When connected we read device info and services.
		 * @instance
		 * @private
		 */
		instance.readDeviceInfo = function()
		{
			function readDeviceInfoService()
			{
				// Notify that status is reading device info.
				instance.callStatusCallback(sensortag.status.READING_DEVICE_INFO)

				// Read device information service.
				instance.device.readServices(
					[instance.DEVICEINFO_SERVICE],
					gotDeviceInfoService,
					instance.errorFun)
			}

			function gotDeviceInfoService(device)
			{
				// Reading of model is disabled. See comment below.
				//readModelNumber()
				readFirmwareVersion()
			}

			/*
			Commented out unused code.

			The value we get from the MODELNUMBER_DATA charaterictic
			does not seem to be consistent.

			We instead set model number in tisensortag-ble-cc2541.js
			and tisensortag-ble-cc2650.js

			function readModelNumber()
			{
				// Read model number.
				instance.device.readCharacteristic(
					instance.MODELNUMBER_DATA,
					gotModelNumber,
					instance.errorFun)
			}

			function gotModelNumber(data)
			{
				// Set model number.
				var modelNumber = evothings.ble.fromUtf8(data)
				console.log('devicemodel: ' + modelNumber)
				if (-1 !== modelNumber.indexOf('CC2650'))
				{
					instance.deviceModel = 'CC2650'
				}
				else
				{
					instance.deviceModel = 'CC2541'
				}

				// Next read firmware version.
				readFirmwareVersion()
			}
			*/

			function readFirmwareVersion()
			{
				instance.device.readServiceCharacteristic(
					instance.DEVICEINFO_SERVICE,
					instance.FIRMWARE_DATA,
					gotFirmwareVersion,
					instance.errorFun)
			}

			function gotFirmwareVersion(data)
			{
				// Set firmware string.
				var fw = evothings.ble.fromUtf8(data)
				instance.firmwareString = fw.match(/\d+\.\d+\S?\b/g)[0] || ''

				// Notify that device info is available.
				instance.callStatusCallback(sensortag.status.DEVICE_INFO_AVAILABLE)

				// Read services requested by the application.
				readRequestedServices()
			}

			function readRequestedServices()
			{
				// Notify that status is reading services.
				instance.callStatusCallback(sensortag.status.READING_SERVICES)

				// Read services requested by the application.
				instance.device.readServices(
					instance.requiredServices,
					instance.activateSensors,
					instance.errorFun)
			}

			// Start by reading model number. Then read other
			// data successively.
			readDeviceInfoService()
		}

		/**
		 * Internal.
		 * @instance
		 * @private
		 */
		instance.activateSensors = function()
		{
			// Debug logging.
			//console.log('-------------------- SERVICES --------------------')
			//sensortag.logServices(instance.device)
			//console.log('---------------------- END -----------------------')

			// Call implementation method in sub module.
			instance.activateSensorsImpl()

			instance.callStatusCallback(sensortag.status.SENSORTAG_ONLINE)
		}

		/**
		 * Both CC2541 and CC2650.
		 * Public. Turn on IR temperature notification.
		 * @instance
		 * @public
		 */
		instance.temperatureOn = function()
		{
			instance.sensorOn(
				instance.TEMPERATURE,
				instance.temperatureConfig,
				instance.temperatureInterval,
				instance.temperatureFun
			)

			return instance
		}

		/**
		 * Both CC2541 and CC2650.
		 * Public. Turn off IR temperature notification.
		 * @instance
		 * @public
		 */
		instance.temperatureOff = function()
		{
			instance.sensorOff(instance.TEMPERATURE)

			return instance
		}

		/**
		 * Both CC2541 and CC2650.
		 * Public. Turn on humidity notification.
		 * @instance
		 * @public
		 */
		instance.humidityOn = function()
		{
			instance.sensorOn(
				instance.HUMIDITY,
				instance.humidityConfig,
				instance.humidityInterval,
				instance.humidityFun
			)

			return instance
		}

		/**
		 * Both CC2541 and CC2650.
		 * Public. Turn off humidity notification.
		 * @instance
		 * @public
		 */
		instance.humidityOff = function()
		{
			instance.sensorOff(instance.HUMIDITY)

			return instance
		}

		/**
		 * Public. Turn on barometer notification.
		 * @instance
		 * @public
		 */
		instance.barometerOn = function()
		{
			// Implemented in sub modules.

			return instance
		}

		/**
		 * Both CC2541 and CC2650.
		 * Public. Turn off barometer notification.
		 * @instance
		 * @public
		 */
		instance.barometerOff = function()
		{
			instance.sensorOff(instance.BAROMETER)

			return instance
		}

		/**
		 * Both CC2541 and CC2650.
		 * Public. Turn on keypress notification.
		 * @instance
		 * @public
		 */
		instance.keypressOn = function()
		{
			instance.sensorOn(
				instance.KEYPRESS,
				null, // Not used.
				null, // Not used.
				instance.keypressFun
			)

			return instance
		}

		/**
		 * Both CC2541 and CC2650.
		 * Public. Turn off keypress notification.
		 * @instance
		 * @public
		 */
		instance.keypressOff = function()
		{
			instance.sensorOff(instance.KEYPRESS)

			return instance
		}

		/**
		 * Public. Used internally as a helper function for turning on
		 * sensor notification. You can call this function from the
		 * application to enable sensors using custom parameters.
		 * For advanced use.
		 * @instance
		 * @public
		 */
		instance.sensorOn = function(
			service,
			configValue,
			periodValue,
			notificationFunction)
		{
			// Only start sensor if a notification function has been set.
			if (!notificationFunction) { return }

			// Set sensor configuration to ON.
			// If configValue is provided, service.CONFIG must be set.
			configValue && instance.device.writeServiceCharacteristic(
				service.SERVICE,
				service.CONFIG,
				new Uint8Array(configValue),
				function() {},
				instance.errorFun)

			// Set sensor update period.
			periodValue && instance.device.writeServiceCharacteristic(
				service.SERVICE,
				service.PERIOD,
				new Uint8Array([periodValue / 10]),
				function() {},
				instance.errorFun)

			// Set sensor notification to ON.
			service.DATA && instance.device.writeServiceDescriptor(
				service.SERVICE,
				service.DATA,
				instance.NOTIFICATION_DESCRIPTOR,
				new Uint8Array([1,0]),
				function() {
					// Make sure value got written correctly.
					// Also test readServiceDescriptor().
					instance.device.readServiceDescriptor(service.SERVICE, service.DATA, instance.NOTIFICATION_DESCRIPTOR, function(data) {
						//console.log('BLE descriptor data: ' + instance.dataToString(data))
					}, function(errorCode)
					{
						console.log('BLE readServiceDescriptor error: ' + errorCode)
					})
				},
				instance.errorFun)

			// Start sensor notification.
			service.DATA && instance.device.enableServiceNotification(
				service.SERVICE,
				service.DATA,
				function(data) { notificationFunction(new Uint8Array(data)) },
				instance.errorFun)

			return instance
		}

		instance.dataToString = function(data)
		{
			var str = '['
			data = new Uint8Array(data)
			for(var i=0; i<data.length; i++) {
				if(i > 0)
					str += ','
				str += data[i]
			}
			str += ']'
			return str
		}

		/**
		 * Helper function for turning off sensor notification.
		 * @instance
		 * @public
		 */
		instance.sensorOff = function(service)
		{
			// TODO: Check that sensor notification function is set.

			// Set sensor configuration to OFF
			service.CONFIG && instance.device.writeServiceCharacteristic(
				service.SERVICE,
				service.CONFIG,
				new Uint8Array([0]),
				function() {},
				instance.errorFun)

			// Set sensor notification to OFF.
			service.DATA && instance.device.writeServiceDescriptor(
				service.SERVICE,
				service.DATA,
				instance.NOTIFICATION_DESCRIPTOR,
				new Uint8Array([0,0]),
				function() {
					// Make sure value got written correctly.
					// Also test readServiceDescriptor().
					instance.device.readServiceDescriptor(service.SERVICE, service.DATA, instance.NOTIFICATION_DESCRIPTOR, function(data) {
						//console.log('BLE descriptor data: ' + instance.dataToString(data))
					}, function(errorCode)
					{
						console.log('BLE readServiceDescriptor error: ' + errorCode)
					})
				},
				instance.errorFun)

			service.DATA && instance.device.disableServiceNotification(
				service.SERVICE,
				service.DATA,
				function() {
					//console.log("disableServiceNotification success")
				},
				instance.errorFun)

			return instance
		}

		/**
		 * Calculate humidity values from raw data.
		 * @param data - an Uint8Array.
		 * @return Object with fields: humidityTemperature, relativeHumidity.
		 * @instance
		 * @public
		 */
		instance.getHumidityValues = function(data)
		{
			// Calculate the humidity temperature (Celsius).
			var tData = util.littleEndianToInt16(data, 0)
			var tc = -46.85 + 175.72 / 65536.0 * tData

			// Calculate the relative humidity.
			var hData = (util.littleEndianToInt16(data, 2) & ~0x03)
			var h = -6.0 + 125.00 / 65536.0 * hData

			// Return result.
			return { humidityTemperature: tc, relativeHumidity: h }
		}

		// Finally, return the SensorTag instance object.
		return instance
	}

module.exports = sensortag

},{"./easyble":20,"./util":25}],24:[function(require,module,exports){
// File: tisensortag.js
var tisensortagble = require('./tisensortag-ble')
var CC2541 = require('./tisensortag-ble-cc2541')
var CC2650 = require('./tisensortag-ble-cc2650')

/**
 * @namespace
 * @description Top-level object that holds generic functions and sub-modules.
 * @public
 */
var tisensortag = {}

/**
 * Constant identifying the CC2650 Bluetooth Smart SensorTag.
 * @public
 */
tisensortag.CC2650_BLUETOOTH_SMART = 'CC2650 Bluetooth Smart'

/**
 * Constant identifying the CC2541 Bluetooth Smart SensorTag.
 * @public
 */
tisensortag.CC2541_BLUETOOTH_SMART = 'CC2541 Bluetooth Smart'

/**
 * Public. Create a SensorTag instance.
 * @param {string} type String with type of tag. Use constants
 * tisensortag.CC2650_BLUETOOTH_SMART and
 * tisensortag.CC2541_BLUETOOTH_SMART.
 * @returns {@link tisensortag.SensorTagInstance} or null
 * if an object of the requested type cannot be created.
 * @public
 */
tisensortag.createInstance = function(type)
{
	// TODO: Update this function as new models are added.
	var factory = undefined
	// Get a factory object that will add in specific methods.
	if (tisensortag.CC2541_BLUETOOTH_SMART == type)
	{
		factory = CC2541
	}
	else if (tisensortag.CC2650_BLUETOOTH_SMART == type)
	{
		factory = CC2650
	}
	else
	{
		return null
	}

	// Create abstract instance.
	var instance = tisensortag.createGenericInstance()

	// Add specific implementation.
	return factory.addInstanceMethods(instance)
}

/**
 * Create an object with functions common to all SensorTag models.
 * This object specifies the public interface for SensorTag instances.
 * @public
 */
tisensortag.createGenericInstance = function()
{
	/**
	 * @namespace
	 * @alias tisensortag.SensorTagInstance
	 * @description Abstract SensorTag instance object that defines a common interface.
	 * @public
	 */
	var instance = {}

	/**
	 * Internal. Default error handler function.
	 * @instance
	 * @private
	 */
	instance.errorFun = function(error)
	{
		console.log('SensorTag error: ' + error)
	}

	/**
	 * Internal. Default status handler function.
	 * @instance
	 * @private
	 */
	instance.statusFun = function(status)
	{
		console.log('SensorTag status: ' + status)
	}

	/**
	 * Public. Set the IR temperature notification callback.
	 * @param fun - success callback called repeatedly: fun(data)
	 * @param interval - update rate in milliseconds (min 300ms)
	 * @instance
	 * @public
	 */
	instance.temperatureCallback = function(fun, interval)
	{
		return instance
	}

	/**
	 * Public. Set the accelerometer notification callback.
	 * @param fun - success callback called repeatedly: fun(data)
	 * @param interval - accelerometer rate in milliseconds.
	 * @instance
	 * @public
	 */
	instance.accelerometerCallback = function(fun, interval)
	{
		return instance
	}

	/**
	 * Public. Set the humidity notification callback.
	 * @param fun - success callback called repeatedly: fun(data)
	 * @param interval - humidity rate in milliseconds.
	 * @instance
	 * @public
	 */
	instance.humidityCallback = function(fun, interval)
	{
		return instance
	}

	/**
	 * Public. Set the magnetometer notification callback.
	 * @param fun - success callback called repeatedly: fun(data)
	 * @param interval - magnetometer rate in milliseconds.
	 * @instance
	 * @public
	 */
	instance.magnetometerCallback = function(fun, interval)
	{
		return instance
	}

	/**
	 * Public. Set the barometer notification callback.
	 * @param fun - success callback called repeatedly: fun(data)
	 * @param interval - barometer rate in milliseconds.
	 * @instance
	 * @public
	 */
	instance.barometerCallback = function(fun, interval)
	{
		return instance
	}

	/**
	 * Public. Set the gyroscope notification callback.
	 * @param fun - success callback called repeatedly: fun(data)
	 * @param interval - gyroscope rate in milliseconds.
	 * @param axes - (optional) the axes to enable ((z << 2) | (y << 1) | x)
	 * Only available on SensorTag CC2541.
	 * Axis parameter values are:
	 * 1 = X only, 2 = Y only,
	 * 3 = X and Y, 4 = Z only,
	 * 5 = X and Z, 6 = Y and Z,
	 * 7 = X, Y and Z.
	 * @instance
	 * @public
	 */
	instance.gyroscopeCallback = function(fun, interval, axes)
	{
		return instance
	}

	/**
	 * Public. Set the luxometer notification callback.
	 * @param fun - success callback called repeatedly: fun(data)
	 * @param interval - luxometer rate in milliseconds.
	 */
	instance.luxometerCallback = function(fun, interval)
	{
		return instance
	}

	/**
	 * Public. Set the keypress notification callback.
	 * @param fun - success callback called when a key is pressed: fun(data)
	 * @instance
	 * @public
	 */
	instance.keypressCallback = function(fun)
	{
		return instance
	}

	/**
	 * Public. Set the error handler function.
	 * @param fun - error callback: fun(error)
	 * @instance
	 * @public
	 */
	instance.errorCallback = function(fun)
	{
		instance.errorFun = fun

		return instance
	}

	/**
	 * Public. Set the status handler function.
	 * @param fun - callback: fun(status)
	 * @instance
	 * @public
	 */
	instance.statusCallback = function(fun)
	{
		instance.statusFun = fun

		return instance
	}

	/**
	 * Public. Call the error handler function.
	 * @instance
	 * @public
	 */
	instance.callErrorCallback = function(error)
	{
		instance.errorFun && instance.errorFun(error)
	}

	/**
	 * Public. Call the status handler function.
	 * @instance
	 * @public
	 */
	instance.callStatusCallback = function(status)
	{
		instance.statusFun && instance.statusFun(status)
	}

	/**
	 * Public. Get device model number.
	 * @instance
	 * @public
	 */
	instance.getDeviceModel = function()
	{
		return instance.deviceModel
	}

	/**
	 * Public. Get firmware string.
	 * @instance
	 * @public
	 */
	instance.getFirmwareString = function()
	{
		return instance.firmwareString
	}

	/**
	 * Public. Checks if the Temperature sensor is available.
	 * @preturn true if available, false if not.
	 * @instance
	 * @public
	 */
	instance.isTemperatureAvailable = function()
	{
		return instance
	}

	/**
	 * Public. Checks if the accelerometer sensor is available.
	 * @preturn true if available, false if not.
	 * @instance
	 * @public
	 */
	instance.isAccelerometerAvailable = function()
	{
		return false
	}

	/**
	 * Public. Checks if the humidity sensor is available.
	 * @preturn true if available, false if not.
	 * @instance
	 * @public
	 */
	instance.isHumidityAvailable = function()
	{
		return false
	}

	/**
	 * Public. Checks if the magnetometer sensor is available.
	 * @preturn true if available, false if not.
	 * @instance
	 * @public
	 */
	instance.isMagnetometerAvailable = function()
	{
		return false
	}

	/**
	 * Public. Checks if the barometer sensor is available.
	 * @preturn true if available, false if not.
	 * @instance
	 * @public
	 */
	instance.isBarometerAvailable = function()
	{
		return false
	}

	/**
	 * Public. Checks if the gyroscope sensor is available.
	 * @preturn true if available, false if not.
	 * @instance
	 * @public
	 */
	instance.isGyroscopeAvailable = function()
	{
		return false
	}

	/**
	 * Public. Checks if movement sensor is available that
	 * combines accelerometer, gyroscope, and magnetometer.
	 * @preturn true if available, false if not.
	 * @instance
	 * @public
	 */
	instance.isMovementAvailable = function()
	{
		return false
	}

	/**
	 * Public. Checks if the luxometer sensor is available.
	 * @preturn true if available, false if not.
	 * @instance
	 * @public
	 */
	instance.isLuxometerAvailable = function()
	{
		return false
	}

	/**
	 * Public. Checks if the keypress sensor is available.
	 * @preturn true if available, false if not.
	 * @instance
	 * @public
	 */
	instance.isKeypressAvailable = function()
	{
		return false
	}

	/**
	 * Public. Turn on temperature notification.
	 * @instance
	 * @public
	 */
	instance.temperatureOn = function()
	{
		return instance
	}

	/**
	 * Public. Turn off temperature notification.
	 * @instance
	 * @public
	 */
	instance.temperatureOff = function()
	{
		return instance
	}

	/**
	 * Public. Turn on accelerometer notification (SensorTag 1).
	 * @instance
	 * @public
	 */
	instance.accelerometerOn = function()
	{
		return instance
	}

	/**
	 * Public. Turn off accelerometer notification (SensorTag 1).
	 * @instance
	 * @public
	 */
	instance.accelerometerOff = function()
	{
		return instance
	}

	/**
	 * Public. Turn on humidity notification.
	 * @instance
	 * @public
	 */
	instance.humidityOn = function()
	{
		return instance
	}

	/**
	 * Public. Turn off humidity notification.
	 * @instance
	 * @public
	 */
	instance.humidityOff = function()
	{
		return instance
	}

	/**
	 * Public. Turn on magnetometer notification.
	 * @instance
	 * @public
	 */
	instance.magnetometerOn = function()
	{
		return instance
	}

	/**
	 * Public. Turn off magnetometer notification (SensorTag 1).
	 * @instance
	 * @public
	 */
	instance.magnetometerOff = function()
	{
		return instance
	}

	/**
	 * Public. Turn on barometer notification.
	 * @instance
	 * @public
	 */
	instance.barometerOn = function()
	{
		return instance
	}

	/**
	 * Public. Turn off barometer notification.
	 * @instance
	 * @public
	 */
	instance.barometerOff = function()
	{
		return instance
	}

	/**
	 * Public. Turn on gyroscope notification (SensorTag 1).
	 * @instance
	 * @public
	 */
	instance.gyroscopeOn = function()
	{
		return instance
	}

	/**
	 * Public. Turn off gyroscope notification (SensorTag 1).
	 * @instance
	 * @public
	 */
	instance.gyroscopeOff = function()
	{
		return instance
	}


	/**
	 * Public. Turn on luxometer notification.
	 */
	instance.luxometerOn = function()
	{
		return instance
	}

	/**
	 * Public. Turn off luxometer notification.
	 */
	instance.luxometerOff = function()
	{
		return instance
	}

	/**
	 * Public. Turn on keypress notification.
	 * @instance
	 * @public
	 */
	instance.keypressOn = function()
	{
		return instance
	}

	/**
	 * Public. Turn off keypress notification.
	 * @instance
	 * @public
	 */
	instance.keypressOff = function()
	{
		return instance
	}

	/**
	 * Convert Celsius to Fahrenheit.
	 * @param celsius Temperature in Celsius.
	 * @returns Temperature converted to Fahrenheit.
	 * @public
	 */
	instance.celsiusToFahrenheit = function(celsius)
	{
		return (celsius * 9 / 5) + 32
	}

	return instance
}

// Load TI SensorTag library components.
/*
evothings.loadScripts(
[
	'libs/evothings/easyble/easyble.js',
	'libs/evothings/tisensortag/tisensortag-ble.js',    // Abstract object for BLE tags
	'libs/evothings/tisensortag/tisensortag-ble-cc2541.js', // Specific object for CC2541
	'libs/evothings/tisensortag/tisensortag-ble-cc2650.js'  // Specific object for CC2650
])
*/

module.exports = tisensortag
},{"./tisensortag-ble":23,"./tisensortag-ble-cc2541":21,"./tisensortag-ble-cc2650":22}],25:[function(require,module,exports){
// File: util.js

evothings = window.evothings || {};

/**
 * @namespace
 * @author Aaron Ardiri
 * @author Fredrik Eldh
 * @description Utilities for byte arrays.
 */
var util = {};

	/**
	 * Interpret byte buffer as little endian 8 bit integer.
	 * Returns converted number.
	 * @param {ArrayBuffer} data - Input buffer.
	 * @param {number} offset - Start of data.
	 * @return Converted number.
	 * @public
	 */
	util.littleEndianToInt8 = function(data, offset)
	{
		var x = util.littleEndianToUint8(data, offset)
		if (x & 0x80) x = x - 256
		return x
	}

	/**
	 * Interpret byte buffer as unsigned little endian 8 bit integer.
	 * Returns converted number.
	 * @param {ArrayBuffer} data - Input buffer.
	 * @param {number} offset - Start of data.
	 * @return Converted number.
	 * @public
	 */
	util.littleEndianToUint8 = function(data, offset)
	{
		return data[offset]
	}

	/**
	 * Interpret byte buffer as little endian 16 bit integer.
	 * Returns converted number.
	 * @param {ArrayBuffer} data - Input buffer.
	 * @param {number} offset - Start of data.
	 * @return Converted number.
	 * @public
	 */
	util.littleEndianToInt16 = function(data, offset)
	{
		return (util.littleEndianToInt8(data, offset + 1) << 8) +
			util.littleEndianToUint8(data, offset)
	}

	/**
	 * Interpret byte buffer as unsigned little endian 16 bit integer.
	 * Returns converted number.
	 * @param {ArrayBuffer} data - Input buffer.
	 * @param {number} offset - Start of data.
	 * @return Converted number.
	 * @public
	 */
	util.littleEndianToUint16 = function(data, offset)
	{
		return (util.littleEndianToUint8(data, offset + 1) << 8) +
			util.littleEndianToUint8(data, offset)
	}

	/**
	 * Interpret byte buffer as unsigned little endian 32 bit integer.
	 * Returns converted number.
	 * @param {ArrayBuffer} data - Input buffer.
	 * @param {number} offset - Start of data.
	 * @return Converted number.
	 * @public
	 */
	util.littleEndianToUint32 = function(data, offset)
	{
		return (util.littleEndianToUint8(data, offset + 3) << 24) +
			(util.littleEndianToUint8(data, offset + 2) << 16) +
			(util.littleEndianToUint8(data, offset + 1) << 8) +
			util.littleEndianToUint8(data, offset)
	}


	/**
	 * Interpret byte buffer as signed big endian 16 bit integer.
	 * Returns converted number.
	 * @param {ArrayBuffer} data - Input buffer.
	 * @param {number} offset - Start of data.
	 * @return Converted number.
	 * @public
	 */
	util.bigEndianToInt16 = function(data, offset)
	{
		return (util.littleEndianToInt8(data, offset) << 8) +
			util.littleEndianToUint8(data, offset + 1)
	}

	/**
	 * Interpret byte buffer as unsigned big endian 16 bit integer.
	 * Returns converted number.
	 * @param {ArrayBuffer} data - Input buffer.
	 * @param {number} offset - Start of data.
	 * @return Converted number.
	 * @public
	 */
	util.bigEndianToUint16 = function(data, offset)
	{
		return (util.littleEndianToUint8(data, offset) << 8) +
			util.littleEndianToUint8(data, offset + 1)
	}

	/**
	 * Interpret byte buffer as unsigned big endian 32 bit integer.
	 * Returns converted number.
	 * @param {ArrayBuffer} data - Input buffer.
	 * @param {number} offset - Start of data.
	 * @return Converted number.
	 * @public
	 */
	util.bigEndianToUint32 = function(data, offset)
	{
		return (util.littleEndianToUint8(data, offset) << 24) +
			(util.littleEndianToUint8(data, offset + 1) << 16) +
			(util.littleEndianToUint8(data, offset + 2) << 8) +
			util.littleEndianToUint8(data, offset + 3)
	}

	/**
	 * Converts a single Base64 character to a 6-bit integer.
	 * @private
	 */
	function b64ToUint6(nChr) {
		return nChr > 64 && nChr < 91 ?
				nChr - 65
			: nChr > 96 && nChr < 123 ?
				nChr - 71
			: nChr > 47 && nChr < 58 ?
				nChr + 4
			: nChr === 43 ?
				62
			: nChr === 47 ?
				63
			:
				0;
	}

	/**
	 * Decodes a Base64 string. Returns a Uint8Array.
	 * nBlocksSize is optional.
	 * @param {String} sBase64
	 * @param {int} nBlocksSize
	 * @return {Uint8Array}
	 * @public
	 */
	util.base64DecToArr = function(sBase64, nBlocksSize) {
		var sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, "");
		var nInLen = sB64Enc.length;
		var nOutLen = nBlocksSize ?
			Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize
			: nInLen * 3 + 1 >> 2;
		var taBytes = new Uint8Array(nOutLen);

		for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
			nMod4 = nInIdx & 3;
			nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
			if (nMod4 === 3 || nInLen - nInIdx === 1) {
				for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
					taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
				}
				nUint24 = 0;
			}
		}

		return taBytes;
	}

	/**
	 * Returns the integer i in hexadecimal string form,
	 * with leading zeroes, such that
	 * the resulting string is at least byteCount*2 characters long.
	 * @param {int} i
	 * @param {int} byteCount
	 * @public
	 */
	util.toHexString = function(i, byteCount) {
		var string = (new Number(i)).toString(16);
		while(string.length < byteCount*2) {
			string = '0'+string;
		}
		return string;
	}

	/**
	 * Takes a ArrayBuffer or TypedArray and returns its hexadecimal representation.
	 * No spaces or linebreaks.
	 * @param data
	 * @public
	 */
	util.typedArrayToHexString = function(data) {
		// view data as a Uint8Array, unless it already is one.
		if(data.buffer) {
			if(!(data instanceof Uint8Array))
				data = new Uint8Array(data.buffer);
		} else if(data instanceof ArrayBuffer) {
			data = new Uint8Array(data);
		} else {
			throw "not an ArrayBuffer or TypedArray.";
		}
		var str = '';
		for(var i=0; i<data.length; i++) {
			str += util.toHexString(data[i], 1);
		}
		return str;
	}

module.exports = util

},{}],26:[function(require,module,exports){

		var fn = function(def, parent)
		{
			var node = document.createElement('div');
			node.className="mdl-grid";
			node.setAttribute('style', def.style);
			console.log('page style = '+def.style)
			node.style.height = "100%";
			node.style.flexDirection = def.direction || 'col';
			return node;
		};
		module.exports = fn;
},{}],27:[function(require,module,exports){

	var fn = function (def, parent)
	{
		var node = document.createElement('div');
		node.className = "mdl-cell mdl-cell--4-col mdl-cell--stretch";
		//node.style.marginLeft = "0";
		//node.style = "container: 'flex', flexDirection: "+def.direction;
		console.log(JSON.stringify(def));

		var tdef = def.picklist.split(',');
		var idproperty = def.idproperty || 'name'

		var table = document.createElement('table');
		table.className = "mdl-data-table mdl-js-data-table  mdl-shadow--2dp";
		if(def.style)
		{
			node.setAttribute('style', def.style);
		}
		else
		{

			node.style.width = "100%";
			node.style.maxHeight = "200px";
			node.style.overflowY = "scroll";
			node.style.margin = "0";
		}

		var thead = document.createElement('thead');
		table.appendChild(thead);
		var thtr = document.createElement('tr');

		thead.appendChild(thtr);
		tdef.forEach(function(colname)
		{
			var th = document.createElement('th');
			th.style.background = "#ddd";
			th.style.fontWeight = "bold";
			th.className="mdl-data-table__cell--non-numeric";
			th.style.width = "100%";
			th.innerHTML = '<strong>'+colname+'</strong>';
			thtr.appendChild(th);
		});
		var tbody = document.createElement('tbody');
		table.appendChild(tbody);

		var seenitems = []

		var addRow = function(item)
		{
			console.log(JSON.stringify(item));
			if (item && item[idproperty] && !seenitems[item[idproperty]])
			{
				console.log('adding new row for item ' + item[idproperty]);
				seenitems[item[idproperty]] = item;
				var tr = document.createElement('tr');
				tbody.appendChild(tr);
				tdef.forEach(function (p)
				{
					var td = document.createElement('td');
					td.className = "mdl-data-table__cell--non-numeric";
					td.innerHTML = item[p];
					tr.appendChild(td);
				});
				tr.addEventListener('click', function (e)
				{
					var p = {payload: item};
					console.log('sending item ' + JSON.stringify(p));
					def.out(p);
				});
			}
		};

		def.in = function(msg)
		{
			if(msg && msg.payload)
			{
				var item = msg.payload;
				//console.log("---------------------- picklist population");
				if(item.forEach)
				{
					console.log('picklist got array. iterating..')
					item.forEach(function(e)
					{
						addRow(e)
					})
				}
				else
				{
					addRow(item)
				}
			}
		};

		//-----------------------
		node.appendChild(table);
		return node;
	};
	module.exports = fn;
},{}],28:[function(require,module,exports){

		var fn = function(def, parent)
		{
			var node = document.createElement('div');
			node.className = "mdl-cell mdl-cell--4-col mdl-cell--stretch";
			node.setAttribute('style',def.style);
			console.log('section style = '+def.style)
			return node;
		};
		module.exports = fn;
},{}],29:[function(require,module,exports){

console.dir(window.nrfeWidgets);
},{}],30:[function(require,module,exports){
var tisensortag = require('./lib/tisensortag')
var tisensortagble = require('./lib/tisensortag-ble')
var easyble = require('./lib/easyble')


var fn = function (def, parent)
{
  console.log('ti sensor tag initialized.................................')
  console.log(JSON.stringify(def))
  var sensortag = undefined

  var sensors = ['temperature', 'humidity', 'barometer', 'accelerometer', 'gyroscope', 'magnetometer', 'keypress']


  function initialiseSensorTag()
  {
    if(def.sensortype = "CC2541")
    {
      console.log('initializing sensor tag of type '+tisensortag.CC2541_BLUETOOTH_SMART)
      sensortag = tisensortag.createInstance(tisensortag.CC2541_BLUETOOTH_SMART)
    }
    else if(def.sensortype = "CC2650")
    {
      console.log('initializing sensor tag of type '+tisensortag.CC2650_BLUETOOTH_SMART)
      sensortag = tisensortag.createInstance(tisensortag.CC2650_BLUETOOTH_SMART)
    }

    // Set up callbacks and sensors.
    sensortag.statusCallback(statusHandler).errorCallback(errorHandler)

    sensors.forEach(function(sensor)
    {
      if(def[sensor])
      {
        sensortag[sensor+'Callback'](function(data)
        {
          var out = {}
          out.payload = {}
          out.payload[sensor] = data
          def.out(out)
        },def.pollinterval || 100)
      }
    })
  }


  function statusHandler(status)
  {
    console.log('ti sensor status: '+status)
    def.out({payload:{status: status}})
  }

  function errorHandler(error)
  {
    console.log('ti sensor error: '+error)
    if (easyble.error.DISCONNECTED == error)
    {
      //displayStatus('Disconnected')
      def.out({payload:{error: error}})
    }
    else
    {
      //displayStatus('Error: ' + error)
    }
  }

  function accelerometerHandler(data)
  {
    var values = sensortag.getAccelerometerValues(data)
    //console.log('ti sensor accelerometer data : '+data)
    var dx = values.x * 50
    var dy = values.y * 50 * -1
    //moveSprite(dx, dy)
    def.out({payload:{accelerometer: data}})
  }

  //--------------------------------------------------------------------------------

  def.in = function(msg)
  {
    var device = msg.payload
    if(device && evothings && evothings.ble)
    {
      if(!def.connected)
      {
        def.connected = true
        if (def.connectdirect)
        {
          sensortag.connectToNearestDevice()
        }
        else if (msg.payload && msg.payload.device)
        {
          sensortag.connectToDevice(msg.payload.device)
        }
        else
        {
          def.out({payload: {error: 'Not connecting to nearest, but no address defined'}})
        }
      }
      else
      {
        sensortag.disconnectDevice()
        console.log('ti sensor tag disconnected')
        def.connected = false
      }
    }
  };

  if(!def.initialized)
  {
    def.initialized = true
    initialiseSensorTag()
  }

};
module.exports = fn;
},{"./lib/easyble":20,"./lib/tisensortag":24,"./lib/tisensortag-ble":23}],31:[function(require,module,exports){

var widgets =
{
	page: require("./page"),
	bleservices: require("./bleservices"),
	blecharacteristics: require("./blecharacteristics"),
	blereadcharacteristic: require("./blereadcharacteristic"),
	bledesccriptors: require("./bledescriptors"),
	blescan: require("./blescan"),
	bleconnect: require("./bleconnect"),
	button: require("./button"),
	cdbattery: require("./cdbattery"),
	cdgeolocation: require("./cdgeolocation"),
	cdvibration: require("./cdvibration"),
	event: require("./event"),
	fefunction: require("./fefunction"),
	image: require("./image"),
	input: require("./input"),
	picklist: require("./picklist"),
	section: require("./section"),
	fetemplate: require("./fetemplate"),
	html: require("./html"),
	tisensor: require('./tisensor')
}
module.exports = widgets
},{"./blecharacteristics":1,"./bleconnect":2,"./bledescriptors":4,"./blereadcharacteristic":5,"./blescan":7,"./bleservices":8,"./button":9,"./cdbattery":10,"./cdgeolocation":11,"./cdvibration":12,"./event":13,"./fefunction":14,"./fetemplate":15,"./html":16,"./image":17,"./input":19,"./page":26,"./picklist":27,"./section":28,"./tisensor":30}]},{},[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,26,27,28,29,30,31])(31)
});