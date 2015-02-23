// File: easyble.js

// We assume the "evothings" library was loaded first.

// Load dependent script.
evothings.loadScript('libs/evothings/util/util.js');

/**
 * @namespace
 * @author Mikael Kindborg
 * @description Library for making BLE programming easier.
 */
evothings.easyble = {};
(function()
{
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
	 * Set to true to report found devices only once.
	 * Set to false to report continuously.
	 * The default is to report continously.
	 * @public
	 */
	evothings.easyble.reportDeviceOnce = function(reportOnce)
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
	evothings.easyble.filterDevicesByService = function(services)
	{
		serviceFilter = services;
	};

	/**
	 * Start scanning for devices.
	 * @param win - Success function called when a device is found.
	 * Format: win(device) - device is of type {@link evothings.easyble.DeviceInstance}
	 * @param fail - Error function.
	 * Format: fail(errorMessage) - errorMessage is of type string
	 * @public
	 */
	evothings.easyble.startScan = function(win, fail)
	{
		evothings.easyble.stopScan();
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
				win(existingDevice);
				return;
			}

			// New device, add to known devices.
			internal.knownDevices[device.address] = device;

			// Add methods to the device info object.
			internal.addMethodsToDeviceObject(device);

			// Call callback function with device info.
			win(device);
		},
		function(errorCode)
		{
			fail(errorCode);
		});
	};

	/**
	 * Stop scanning for devices.
	 */
	evothings.easyble.stopScan = function()
	{
		evothings.ble.stopScan();
	};

	/**
	 * Close all connected devices.
	 */
	evothings.easyble.closeConnectedDevices = function()
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

		var byteArray = evothings.util.base64DecToArr(device.scanRecord);
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
						string += evothings.util.toHexString(array[offset+k], 1);
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
						evothings.util.toHexString(
							evothings.util.littleEndianToUint16(byteArray, pos + i),
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
						evothings.util.toHexString(
							evothings.util.littleEndianToUint32(byteArray, pos + i),
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
					evothings.util.littleEndianToInt8(byteArray, pos);
			}
			if (type == 0x16) // Service Data, 16-bit UUID.
			{
				serviceData = serviceData ? serviceData : {};
				var uuid =
					'0000' +
					evothings.util.toHexString(
						evothings.util.littleEndianToUint16(byteArray, pos),
						2) +
					BLUETOOTH_BASE_UUID;
				var data = new Uint8Array(byteArray.buffer, pos+2, length-2);
				serviceData[uuid] = base64.fromArrayBuffer(data);
			}
			if (type == 0x20) // Service Data, 32-bit UUID.
			{
				serviceData = serviceData ? serviceData : {};
				var uuid =
					evothings.util.toHexString(
						evothings.util.littleEndianToUint32(byteArray, pos),
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

		console.log("scanRecord: "+evothings.util.typedArrayToHexString(byteArray));

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
		 * This object is the DeviceInfo object obtained by calling
		 * evothings.ble.startScan, with additional properties and
		 * functions added. Internal properties are prefixed with two
		 * underscores. Properties are also added to the Characteristic
		 * and Descriptor objects.
		 * @namespace
		 * @alias evothings.easyble.DeviceInstance
		 */
		var device = deviceObject;

		/**
		 * Connect to the device.
		 * @public
		 * @instance
		 */
		device.connect = function(win, fail)
		{
			internal.connectToDevice(device, win, fail);
		};

		/**
		 * Close the device.
		 * @public
		 * @instance
		 */
		device.close = function()
		{
			device.deviceHandle && evothings.ble.close(device.deviceHandle);
		};

		/**
		 * Read devices RSSI. Device must be connected.
		 * @public
		 * @instance
		 */
		device.readRSSI = function(win, fail)
		{
			evothings.ble.rssi(device.deviceHandle, win, fail);
		};

		/**
		 * Read all service info for the specified service UUIDs.
		 * Services must be read be able to access characteristics and
		 * descriptors. Call this function before reading and writing
		 * characteristics/descriptors.
		 * @param serviceUUIDs - array of UUID strings, if null all
		 * services are read (this can be time-consuming compared to
		 * reading selected services)
		 * @param win - success callback function called when
		 * services are read, format win()
		 * @param fail - error callback, format error(errorMessage)
		 * @public
		 * @instance
		 */
		device.readServices = function(serviceUUIDs, win, fail)
		{
			internal.readServices(device, serviceUUIDs, win, fail);
		};

		/**
		 * Read value of characteristic.
		 * @public
		 * @instance
		 */
		device.readCharacteristic = function(characteristicUUID, win, fail)
		{
			internal.readCharacteristic(device, characteristicUUID, win, fail);
		};

		/**
		 * Read value of descriptor.
		 * @public
		 * @instance
		 */
		device.readDescriptor = function(characteristicUUID, descriptorUUID, win, fail)
		{
			internal.readDescriptor(device, characteristicUUID, descriptorUUID, win, fail);
		};

		/**
		 * Write value of characteristic.
		 * @public
		 * @instance
		 */
		device.writeCharacteristic = function(characteristicUUID, value, win, fail)
		{
			internal.writeCharacteristic(device, characteristicUUID, value, win, fail);
		};

		/**
		 * Write value of descriptor.
		 * @public
		 * @instance
		 */
		device.writeDescriptor = function(characteristicUUID, descriptorUUID, value, win, fail)
		{
			internal.writeDescriptor(device, characteristicUUID, descriptorUUID, value, win, fail);
		};

		/**
		 * Subscribe to characteristic value updates.
		 * @public
		 * @instance
		 */
		device.enableNotification = function(characteristicUUID, win, fail)
		{
			internal.enableNotification(device, characteristicUUID, win, fail);
		};

		/**
		 * Unsubscribe from characteristic updates.
		 * @public
		 * @instance
		 */
		device.disableNotification = function(characteristicUUID, win, fail)
		{
			internal.disableNotification(device, characteristicUUID, win, fail);
		};
	};

	/**
	 * Connect to a device.
 	 * Called from evothings.easyble.DeviceObject.
	 * @private
	 */
	internal.connectToDevice = function(device, win, fail)
	{
		evothings.ble.connect(device.address, function(connectInfo)
		{
			if (connectInfo.state == 2) // connected
			{
				device.deviceHandle = connectInfo.deviceHandle;
				device.__uuidMap = {};
				internal.connectedDevices[device.address] = device;

				win(device);
			}
			else if (connectInfo.state == 0) // disconnected
			{
				internal.connectedDevices[device.address] = null;
				// TODO: How to signal disconnect?
				// Call error callback?
				// Additional callback? (connect, disconnect, fail)
				// Additional parameter on win callback with connect state?
				// (Last one is the best option I think).
				fail && fail('disconnected');
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
 	 * Called from evothings.easyble.DeviceObject.
	 * @private
	 */
	internal.readServices = function(device, serviceUUIDs, win, fail)
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
					device, serviceUUIDs, win, fail);
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
 	 * Called from evothings.easyble.DeviceObject.
	 * @private
	 */
	internal.readCharacteristicsForServices = function(device, serviceUUIDs, win, fail)
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

					// Read descriptors for characteristic.
					evothings.ble.descriptors(
						device.deviceHandle,
						characteristic.handle,
						descriptorsCallbackFun(characteristic),
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
		var descriptorsCallbackFun = function(characteristic)
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
				}
				if (0 == readCounter)
				{
					// Everything is read.
					win(device);
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
					fail('Service not found: ' + uuid);
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
 	 * Called from evothings.easyble.DeviceObject.
	 * @private
	 */
	internal.readCharacteristic = function(device, characteristicUUID, win, fail)
	{
		characteristicUUID = characteristicUUID.toLowerCase();

		var characteristic = device.__uuidMap[characteristicUUID];
		if (!characteristic)
		{
			fail('Characteristic not found: ' + characteristicUUID);
			return;
		}

		evothings.ble.readCharacteristic(
			device.deviceHandle,
			characteristic.handle,
			win,
			fail);
	};

 	/**
 	 * Called from evothings.easyble.DeviceObject.
	 * @private
	 */
	internal.readDescriptor = function(device, characteristicUUID, descriptorUUID, win, fail)
	{
		characteristicUUID = characteristicUUID.toLowerCase();
		descriptorUUID = descriptorUUID.toLowerCase();

		var descriptor = device.__uuidMap[characteristicUUID + ':' + descriptorUUID];
		if (!descriptor)
		{
			fail('Descriptor not found: ' + descriptorUUID);
			return;
		}

		evothings.ble.readDescriptor(
			device.deviceHandle,
			descriptor.handle,
			value,
			function()
			{
				win();
			},
			function(errorCode)
			{
				fail(errorCode);
			});
	};

 	/**
 	 * Called from evothings.easyble.DeviceObject.
	 * @private
	 */
	internal.writeCharacteristic = function(device, characteristicUUID, value, win, fail)
	{
		characteristicUUID = characteristicUUID.toLowerCase();

		var characteristic = device.__uuidMap[characteristicUUID];
		if (!characteristic)
		{
			fail('Characteristic not found: ' + characteristicUUID);
			return;
		}

		evothings.ble.writeCharacteristic(
			device.deviceHandle,
			characteristic.handle,
			value,
			function()
			{
				win();
			},
			function(errorCode)
			{
				fail(errorCode);
			});
	};

 	/**
 	 * Called from evothings.easyble.DeviceObject.
	 * @private
	 */
	internal.writeDescriptor = function(
		device, characteristicUUID, descriptorUUID, value, win, fail)
	{
		characteristicUUID = characteristicUUID.toLowerCase();
		descriptorUUID = descriptorUUID.toLowerCase();

		var descriptor = device.__uuidMap[characteristicUUID + ':' + descriptorUUID];
		if (!descriptor)
		{
			fail('Descriptor not found: ' + descriptorUUID);
			return;
		}

		evothings.ble.writeDescriptor(
			device.deviceHandle,
			descriptor.handle,
			value,
			function()
			{
				win();
			},
			function(errorCode)
			{
				fail(errorCode);
			});
	};

 	/**
 	 * Called from evothings.easyble.DeviceObject.
	 * @private
	 */
	internal.enableNotification = function(device, characteristicUUID, win, fail)
	{
		characteristicUUID = characteristicUUID.toLowerCase();

		var characteristic = device.__uuidMap[characteristicUUID];
		if (!characteristic)
		{
			fail('Characteristic not found: ' + characteristicUUID);
			return;
		}

		evothings.ble.enableNotification(
			device.deviceHandle,
			characteristic.handle,
			win,
			fail);
	};

 	/**
 	 * Called from evothings.easyble.DeviceObject.
	 * @private
	 */
	internal.disableNotification = function(device, characteristicUUID, win, fail)
	{
		characteristicUUID = characteristicUUID.toLowerCase();

		var characteristic = device.__uuidMap[characteristicUUID];
		if (!characteristic)
		{
			fail('Characteristic not found: ' + characteristicUUID);
			return;
		}

		evothings.ble.disableNotification(
			device.deviceHandle,
			characteristic.handle,
			win,
			fail);
	};

	/**
	 * @deprecated. Defined here for backwards compatibility.
	 * Use evothings.printObject().
	 * @public
	 */
	evothings.easyble.printObject = evothings.printObject;

 	/**
	 * @public
	 */
	evothings.easyble.reset = function()
	{
		evothings.ble.reset();
	};
})();
