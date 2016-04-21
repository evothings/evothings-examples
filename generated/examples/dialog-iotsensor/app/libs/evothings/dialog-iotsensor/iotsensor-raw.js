// Specific object for RAW
// TODO: Add more info about RAW here

;(function() 
{
	"use strict"; 
	
	evothings.iotsensor.ble.RAW = {};

	/**
	 * @namespace
	 * @description Internal implementation of JavaScript library for the IoT Sensor RAW project.
	 * @alias evothings.iotsensor.ble.RAW
	 */
	var iotsensor = {};

	evothings.iotsensor.ble.RAW = iotsensor;

	/**
	 * Create an IoT Sensor RAW instance
	 * @returns {@link evothings.iotsensor.instance_ble_raw}
	 * @private
	 */
	iotsensor.addInstanceMethods = function(anInstance)
	{

		/**
		 * @namespace
		 * @alias evothings.iotsensor.instance_ble_raw
		 * @description IoT Sensor RAW instance object.
		 * @private
		 */
		var instance = evothings.iotsensor.settings.addInstanceMethods(anInstance);

		// Add generic BLE instance methods.
		evothings.iotsensor.ble.addInstanceMethods(instance);

		/**
		 * Device model
		 * @instance
		 * @public
		 */
		instance.deviceModel = 'RAW';

		/**
		 * @description Determine if a BLE device is an IoT Sensor RAW. <br />
		 * Checks for the IoT Sensor using the name.
		 * @instance
		 * @public
		 */
		instance.isIoTSensor = function(device)
		{
			return (device != null) &&
				(device.name != null) &&
				(device.name == 'IoT-DK-RAW');
		}

		// Finally return the IoT Sensor instance object
		return instance;
	}


})();