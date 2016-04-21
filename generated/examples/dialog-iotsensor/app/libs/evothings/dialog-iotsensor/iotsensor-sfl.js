// Specific object for SFL
// TODO: Add more info about SFL here

;(function() 
{
	"use strict"; 
	
	evothings.iotsensor.ble.SFL = {};

	/**
	 * @namespace
	 * @description Internal implementation of JavaScript library for the IoT Sensor SFL project.
	 * @alias evothings.iotsensor.ble.SLF
	 */
	var iotsensor = {};

	evothings.iotsensor.ble.SFL = iotsensor;

	/**
	 * Create an IoT Sensor SFL instance
	 * @returns {@link evothings.iotsensor.instance_ble_sfl}
	 * @private
	 */
	iotsensor.addInstanceMethods = function(anInstance)
	{

		/**
		 * @namespace
		 * @alias evothings.iotsensor.instance_ble_sfl
		 * @description IoT Sensor SFL instance object.
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
		instance.deviceModel = 'SFL';

		/**
		 * @description Determine if a BLE device is an IoT Sensor SFL. <br />
		 * Checks for the IoT Sensor using the name.
		 * @instance
		 * @public
		 */
		instance.isIoTSensor = function(device)
		{
			return (device != null) &&
				(device.name != null) &&
				(device.name == 'IoT-DK-SFL');
		}

		/**
		 * @description SFL only. Implementation of {@link evothings.iotsensor.instance#sflCallback}
		 * @instance
		 * @private
		 */
		instance.sflCallback = function(callbackFun)
		{
			instance.sflFun = callbackFun;
			instance.SFL.dataFun = getSflValues;
			return instance;
		}

		/**
		 * @description SFL only. Implementation of {@link evothings.iotsensor.instance#sflOn}
		 * @instance
		 * @private
		 */
		instance.sflOn = function()
		{
			instance.sensorOn(
				instance.SFL,
				instance.sflFun
			);
			return instance;
		}	

		/**
		 * @description SFL only. Implementation of {@link evothings.iotsensor.instance#sflOn}
		 * @instance
		 * @private
		 */
		instance.sflOff = function()
		{
			instance.sensorOff(instance.SFL);
			return instance;
		}

		/**
	  	 * @description SFL only.
		 * Private. Calculate sensor fusion values from raw data
		 * @param data - Uint8Array.
		 * @return Object with fields: w, x, y, z.
		 * @instance
		 * @private
		 */
		function getSflValues(data)
		{
			// Calculate accelerometer values.
			var wx = evothings.util.littleEndianToInt16(data, 3);
			var ax = evothings.util.littleEndianToInt16(data, 5);
			var ay = evothings.util.littleEndianToInt16(data, 7);
			var az = evothings.util.littleEndianToInt16(data, 9);

			return { w: wx, x: ax, y: ay, z: az }
		}
		
		// Finally return the IoT Sensor instance object
		return instance;
	}


})();