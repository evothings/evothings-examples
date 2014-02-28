// Library for making BLE programming easier.

// Object that holds BLE data and functions.
var easyble = (function()
{
	var easyble = {};

	easyble.knownDevices = {};

	easyble.startScan = function(win, fail)
	{
		easyble.stopScan();
		evothings.ble.startScan(function(deviceInfo)
		{
			// Check if we already have got the device.
			if (easyble.knownDevices[deviceInfo.address])
			{
				return;
			}

			// Add the device to known devices, so that we do not handle it again.
			easyble.knownDevices[deviceInfo.address] = deviceInfo;

			// Add methods to the device info object.
			easyble.addMethodsToDeviceInfoObject(deviceInfo);

			// Call callback function with device info.
			win(deviceInfo);
		},
		function(errorCode)
		{
			fail(errorCode);
		});
	};

	// This allows calling methods on the deviceInfo object
	// in an object-oriented style.
	easyble.addMethodsToDeviceInfoObject = function(deviceInfo)
	{
		deviceInfo.connectToDevice = function(win, fail)
		{
			easyble.connectToDevice(deviceInfo, win, fail);
		};

		deviceInfo.closeDevice = function()
		{
			easyble.closeDevice(deviceInfo);
		};

		deviceInfo.readServicesForDevice = function(win, fail)
		{
			easyble.readServicesForDevice(deviceInfo, win, fail);
		};

		deviceInfo.readCharacteristicsForServices = function(serviceUUIDs, win, fail)
		{
			easyble.readCharacteristicsForServices(deviceInfo, serviceUUIDs, win, fail);
		};

		deviceInfo.readCharacteristic = function(characteristicUUID, win, fail)
		{
			easyble.readCharacteristic(deviceInfo, characteristicUUID, win, fail);
		};

		deviceInfo.readDescriptor = function(descriptorUUID, win, fail)
		{
			easyble.readDescriptor(deviceInfo, descriptorUUID, win, fail);
		};

		deviceInfo.writeCharacteristic = function(characteristicUUID, value, win, fail)
		{
			easyble.writeCharacteristic(deviceInfo, characteristicUUID, value, win, fail);
		};

		deviceInfo.writeDescriptor = function(descriptorUUID, value, win, fail)
		{
			easyble.writeDescriptor(deviceInfo, descriptorUUID, value, win, fail);
		};

		deviceInfo.enableNotification = function(characteristicUUID, win, fail)
		{
			easyble.enableNotification(deviceInfo, characteristicUUID, win, fail);
		};

		deviceInfo.disableNotification = function(characteristicUUID, win, fail)
		{
			easyble.disableNotification(deviceInfo, characteristicUUID, win, fail);
		};
	};

	easyble.stopScan = function()
	{
		evothings.ble.stopScan();
		easyble.knownDevices = {};
	};

	easyble.connectToDevice = function(deviceInfo, win, fail)
	{
		evothings.ble.connect(deviceInfo.address, function(connectInfo)
		{
			if (connectInfo.state == 2) // connected
			{
				deviceInfo.deviceHandle = connectInfo.deviceHandle;
				deviceInfo.uuidMap = {};

				win(deviceInfo);
			}
		},
		function(errorCode)
		{
			fail(errorCode);
		});
	};

	easyble.closeDevice = function(deviceInfo)
	{
		evothings.ble.close(deviceInfo.handle);
	};

	easyble.readServicesForDevice = function(deviceInfo, win, fail)
	{
		// Array that stores services.
		deviceInfo.services = [];

		// Read services.
		evothings.ble.services(
			deviceInfo.deviceHandle,
			function(services)
			{
				for (var i = 0; i < services.length; ++i)
				{
					var service = services[i];
					deviceInfo.services.push(service);
					deviceInfo.uuidMap[service.uuid] = service;
				}
				win(deviceInfo);
			},
			function(errorCode)
			{
				fail(errorCode);
			});
	};

	/**
	 * Read characteristics and descriptors for the services with the given uuid(s).
	 * If serviceUUIDs is null, info for all services are read.
	 */
	easyble.readCharacteristicsForServices = function(deviceInfo, serviceUUIDs, win, fail)
	{
		var readCounter = 0;

		var characteristicsCallbackFun = function(service)
		{
			// Array with characteristics for service.
			service.characteristics = [];

			return function(characteristics)
			{
				--readCounter;
				readCounter += characteristics.length;
				for (var i = 0; i < characteristics.length; ++i)
				{
					var characteristic = characteristics[i];
					service.characteristics.push(characteristic);
					deviceInfo.uuidMap[characteristic.uuid] = characteristic;

					// Read descriptors for characteristic.
					evothings.ble.descriptors(
						deviceInfo.deviceHandle,
						characteristic.handle,
						descriptorsCallbackFun(characteristic),
						function(errorCode)
						{
							fail(errorCode);
						});
				}
			};
		};

		var descriptorsCallbackFun = function(characteristic)
		{
			// Array with descriptors for characteristic.
			characteristic.descriptors = [];

			return function(descriptors)
			{
				--readCounter;
				for (var i = 0; i < descriptors.length; ++i)
				{
					var descriptor = descriptors[i];
					characteristic.descriptors.push(descriptor);
					deviceInfo.uuidMap[descriptor.uuid] = descriptor;
				}
				if (0 == readCounter)
				{
					// Everything is read.
					win(deviceInfo);
				}
			};
		};

		if (null != serviceUUIDs)
		{
			// Read info for service UUIDs.
			for (var i = 0; i < serviceUUIDs.length; ++i)
			{
				var uuid = serviceUUIDs[i];
				var service = deviceInfo.uuidMap[uuid];
				if (!service)
				{
					fail('Service not found: ' + uuid);
					return;
				}

				// Read characteristics for service. Will also read descriptors.
				evothings.ble.characteristics(
					deviceInfo.deviceHandle,
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
			for (var i = 0; i < deviceInfo.services.length; ++i)
			{
				// Read characteristics for service. Will also read descriptors.
				evothings.ble.characteristics(
					deviceInfo.deviceHandle,
					service.handle,
					characteristicsCallbackFun(service),
					function(errorCode)
					{
						fail(errorCode);
					});
			}
		}
	};

	easyble.readCharacteristic = function(deviceInfo, characteristicUUID, win, fail)
	{
		var characteristic = deviceInfo.uuidMap[characteristicUUID];
		if (!characteristic)
		{
			fail && fail('Characteristic not found: ' + characteristicUUID);
			return;
		}

		evothings.ble.readCharacteristic(
			deviceInfo.deviceHandle,
			characteristic.handle,
			win,
			fail);
	};

	easyble.readDescriptor = function(deviceInfo, descriptorUUID, win, fail)
	{
		var descriptor = deviceInfo.uuidMap[descriptorUUID];
		if (!descriptor)
		{
			fail && fail('Descriptor not found: ' + descriptorUUID);
			return;
		}

		evothings.ble.readDescriptor(
			deviceInfo.deviceHandle,
			descriptor.handle,
			value,
			function()
			{
				win && win();
			},
			function(errorCode)
			{
				fail && fail(errorCode);
			});
	};

	easyble.writeCharacteristic = function(deviceInfo, characteristicUUID, value, win, fail)
	{
		var characteristic = deviceInfo.uuidMap[characteristicUUID];
		if (!characteristic)
		{
			fail && fail('Characteristic not found: ' + characteristicUUID);
			return;
		}

		evothings.ble.writeCharacteristic(
			deviceInfo.deviceHandle,
			characteristic.handle,
			value,
			function()
			{
				win && win();
			},
			function(errorCode)
			{
				fail && fail(errorCode);
			});
	};

	easyble.writeDescriptor = function(deviceInfo, descriptorUUID, value, win, fail)
	{
		var descriptor = deviceInfo.uuidMap[descriptorUUID];
		if (!descriptor)
		{
			fail && fail('Descriptor not found: ' + descriptorUUID);
			return;
		}

		evothings.ble.writeDescriptor(
			deviceInfo.deviceHandle,
			descriptor.handle,
			value,
			function()
			{
				win && win();
			},
			function(errorCode)
			{
				fail && fail(errorCode);
			});
	};

	easyble.enableNotification = function(deviceInfo, characteristicUUID, win, fail)
	{
		var characteristic = deviceInfo.uuidMap[characteristicUUID];
		if (!characteristic)
		{
			fail && fail('Characteristic not found: ' + characteristicUUID);
			return;
		}

		evothings.ble.enableNotification(
			deviceInfo.deviceHandle,
			characteristic.handle,
			win,
			fail);
	};

	easyble.disableNotification = function(deviceInfo, characteristicUUID, win, fail)
	{
		var characteristic = deviceInfo.uuidMap[characteristicUUID];
		if (!characteristic)
		{
			fail && fail('Characteristic not found: ' + characteristicUUID);
			return;
		}

		evothings.ble.disableNotification(
			deviceInfo.deviceHandle,
			characteristic.handle,
			win,
			fail);
	};

	// For debugging. Example call:
	//   easyble.printObject(deviceInfo, console.log);
	easyble.printObject = function(obj, printFun)
	{
		function print(obj, level)
		{
			var indent = new Array(level + 1).join('  ');
			for (var prop in obj)
			{
				if (obj.hasOwnProperty(prop))
				{
					var value = obj[prop];
					if (typeof value == 'object')
					{
						printFun(indent + prop + ':');
						print(value, level + 1);
					}
					else
					{
						printFun(indent + prop + ': ' + value);
					}
				}
			}
		}
		print(obj, 0);
	};

	return easyble;
})();
