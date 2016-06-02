// File: iotsensor.js

"use strict"; 

// Load Dialog IoT Sensor library components.
evothings.loadScripts(
[
	'libs/evothings/easyble/easyble.js',
	'libs/evothings/dialog-iotsensor/iotsensor-ble.js', // Abstract object for BLE IoT sensors
	'libs/evothings/dialog-iotsensor/iotsensor-sfl.js', // Specific object for SFL
	'libs/evothings/dialog-iotsensor/iotsensor-raw.js', // Specific object for RAW
	'libs/evothings/dialog-iotsensor/iotsensor-settings.js' // Abstract object for BLE IoT sensor settings
]);

/**
 * @namespace
 * @description Top-level object that holds generic functions and sub-modules.
 * @public
 */
evothings.iotsensor = {};

/**
 * Constant identifying the IoT Sensor SFL project.
 * @public
 */
evothings.iotsensor.SFL = 'IoT-DK-SFL';

/**
 * Constant identifying the IoT Sensor RAW project.
 * @public
 */
evothings.iotsensor.RAW = 'IoT-DK-RAW';

/**
 * Public. Create an IoT Sensor instance.
 * @param {string} type String with type of sensor. <br />
 * Use constants {@link evothings.iotsensor.SFL} and {@link evothings.iotsensor.RAW}.
 * @returns {@link evothings.iotsensor.instance} or null
 * if an object of the requested type cannot be created.
 * @example
 * // Create a new IoT Sensor SFL instance
 * var iotsensor = evothings.iotsensor.createInstance(evothings.iotsensor.SFL);
 * @public
 */
evothings.iotsensor.createInstance = function(type)
{
 	switch(type)
 	{
 		case evothings.iotsensor.SFL:
 			var factory = evothings.iotsensor.ble.SFL;
 			break;
 		case evothings.iotsensor.RAW:
 			var factory = evothings.iotsensor.ble.RAW;
 			break;
 		default:
 			return null;
 	}

 	// Create abstract instance.
	var instance = evothings.iotsensor.createGenericInstance();

 	// Add specific implementation
	return factory.addInstanceMethods(instance);
}

/**
 * Create an object with functions common to all IoT Sensor models.
 * This object specifies the public interface for IoT Sensor instances.
 * @private
 */
evothings.iotsensor.createGenericInstance = function()
{
	/**
	 * @namespace
	 * @alias evothings.iotsensor.instance
	 * @description Abstract IoTSensor instance object that defines a common interface.
	 * @public
	 */
	var instance = {}

	/**
	 * @description Internal. Default error handler function.
	 * @instance
	 * @private
	 */
	instance.errorFun = function(error)
	{
		console.log(evothings.iotsensor.currentTime() + ' IoT Sensor error: ' + error);
	}

	/**
	 * @description Internal. Default status handler function.
	 * @instance
	 * @private
	 */
	instance.statusFun = function(status)
	{
		console.log(evothings.iotsensor.currentTime() + ' IoT Sensor status: ' + status);
	}

	/**
	 * @description <strong>RAW and SFL</strong> <br /> Set the accelerometer notification callback. This function is called everytime new data is available. <br />
	 * Data is returned in g (x, y, z)
	 * @param {function} callbackFun - Callback called with accelerometer data: callbackFun(data).
	 * @instance
	 * @example
	 * iotsensor.accelerometerCallback(
	 * 	function(data)
	 * 	{
	 * 		console.log('Accelerometer data: ' 
	 * 					+ data.x + 'g '
	 * 					+ data.y + 'g '
	 * 					+ data.z + 'g');
	 * 	}
	 * );
	 * @public
	 */
	instance.accelerometerCallback = function(callbackFun)
	{
		return instance;
	}

	/**
	 * @description <strong>RAW and SFL</strong> <br /> Set the gyroscope notification callback. This function is called everytime new data is available. <br />
	 * Data is returned in degrees per second (x, y, z)
	 * @param {function} callbackFun - Callback called with gyroscope data: callbackFun(data).
	 * @instance
	 * @example
	 * iotsensor.gyroscopeCallback(
	 * 	function(data)
	 * 	{
	 * 		console.log('Gyroscope data: ' 
	 * 					+ data.x + 'degrees per second '
	 * 					+ data.y + 'degrees per second '
	 * 					+ data.z + 'degrees per second');
	 * 	}
	 * );
	 * @public
	 */
	instance.gyroscopeCallback = function(callbackFun)
	{
		return instance;
	}

	/**
	 * @description <strong>RAW and SFL</strong> <br /> Set the magnetometer notification callback. This function is called everytime new data is available.<br />
	 * Data is returned in micro Tesla (x, y, z)
	 * @param {function} callbackFun - Callback called with magnetometer data: callbackFun(data).
	 * @instance
	 * @example
	 * iotsensor.magnetometerCallback(
	 * 	function(data)
	 * 	{
	 * 		console.log('Magnetometer data: ' 
	 * 					+ data.x + 'µT '
	 * 					+ data.y + 'µT '
	 * 					+ data.z + 'µT');
	 * 	}
	 * );
	 * @public
	 */
	instance.magnetometerCallback = function(callbackFun)
	{
		return instance;
	}

	/**
	 * @description <strong>RAW and SFL</strong> <br /> Set the barometer notification callback. This function is called everytime new data is available. <br />
	 * Data is returned in Pascal (whole number)
	 * @param {function} callbackFun - Callback called with barometer data: callbackFun(data).
	 * @instance
	 * @example
	 * iotsensor.barometerCallback(
	 * 	function(data)
	 * 	{
	 * 		console.log('Barometer data: ' + data + 'Pa');
	 * 	}
	 * );
	 * @public
	 */
	instance.barometerCallback = function(callbackFun)
	{
		return instance;
	}

	/**
	 * @description <strong>RAW and SFL</strong> <br /> Set the temperature notification callback. This function is called everytime new data is available.<br />
	 * Data is returned in degrees Celcius (2 decimals)
	 * @param {function} callbackFun - Callback called with temperature data: callbackFun(data).
	 * @instance
	 * @example
	 * iotsensor.temperatureCallback(
	 * 	function(data)
	 * 	{
	 * 		console.log('Temperature data: ' + data + '°C');
	 * 	}
	 * );
	 * @public
	 */
	instance.temperatureCallback = function(callbackFun)
	{
		return instance;
	}

	/**
	 * @description <strong>RAW and SFL</strong> <br /> Set the humidity notification callback. This function is called everytime new data is available. <br />
	 * Data is returned in % (whole number)
	 * @param {function} callbackFun - Callback called with humidity data: callbackFun(data).
	 * @instance
	 * @example
	 * iotsensor.humidityCallback(
	 * 	function(data)
	 * 	{
	 * 		console.log('Humidity data: ' + data + '%');
	 * 	}
	 * );
	 * @public
	 */
	instance.humidityCallback = function(callbackFun)
	{
		return instance;
	}

	/**
	 * @description <strong>SFL only</strong> <br /> Set the sensor fusion notification callback. This function is called everytime new data is available. <br />
	 * Data is returned in 4 axis (w, x, y, z)
	 * @param {function} callbackFun - Callback called with sensor fusion data: callbackFun(data).
	 * @instance
	 * @example
	 * iotsensor.sflCallback(
	 * 	function(data)
	 * 	{
	 * 		console.log('Sensor fusion data: ' 
	 * 					+ data.w + ' '
	 * 					+ data.x + ' '
	 * 					+ data.y + ' '
	 * 					+ data.z);
	 * 	}
	 * );
	 * @public
	 */
	instance.sflCallback = function(callbackFun)
	{
		return instance;
	}

	/**
	 * @description Set the error handler function. <br />
	 * If no errorCallback is set, the default handler will be called:
	 * <pre>console.log(evothings.iotsensor.currentTime() + ' IoT Sensor error: ' + error);</pre>
	 * @param {function} errorFun - Callback called with error: errorFun(error)
	 * @instance
	 * @public
	 */
	instance.errorCallback = function(errorFun)
	{
		instance.errorFun = errorFun;
		return instance;
	}

	/**
	 * @description Set the status handler function. <br />
	 * If no statusCallback is set, the default handler will be called:
	 * <pre>console.log(evothings.iotsensor.currentTime() + ' IoT Sensor status: ' + status);</pre>
	 * @param {function} statusFun - Callback called with status: statusFun(status);
	 * @instance
	 * @public
	 */
	instance.statusCallback = function(statusFun)
	{
		instance.statusFun = statusFun;
		return instance;
	}

	/**
	 * @description Call the error handler function.
	 * @instance
	 * @private
	 */
	instance.callErrorCallback = function(error)
	{
		instance.errorFun && instance.errorFun(error);
	}

	/**
	 * @description Call the status handler function.
	 * @instance
	 * @private
	 */
	instance.callStatusCallback = function(status)
	{
		instance.statusFun && instance.statusFun(status);
	}

	/**
	 * @description Return the device model
	 * @returns {string}
	 * @instance
	 * @example
	 * var model = iotsensor.getDeviceModel();
	 * console.log('Device model ' + model);
	 * @public
	 */
	instance.getDeviceModel = function()
	{
		return instance.deviceModel;
	}	

	/**
	 * @description Return the firmware version on the device
	 * @returns {string}
	 * @instance
	 * @example
	 * var version = iotsensor.getFirmwareString();
	 * console.log('Firmware version: ' + version);
	 * @public
	 */
	instance.getFirmwareString = function()
	{
		return instance.firmwareString;
	}

	/**
	 * @description Checks if the accelerometer is available.
	 * @return {boolean}
	 * @instance
	 * @example
	 * // Check if accelerometer is available
	 * if(iotsensor.isAccelerometerAvailable())
	 * {
	 * 	iotsensor.accelerometerOn();
	 * }
	 * @public
	 */
	instance.isAccelerometerAvailable = function()
	{
		return (instance.ACCELEROMETER.AVAILABLE === 1 ? true : false);
	}

	/**
	 * @description Checks if the gyroscope is available.
	 * @return {boolean}
	 * @instance
	 * @example
	 * // Check if gyroscope is available
	 * if(iotsensor.isGyroscopeAvailable())
	 * {
	 * 	iotsensor.gyroscopeOn();
	 * }
	 * @public
	 */
	instance.isGyroscopeAvailable = function()
	{
		return (instance.GYROSCOPE.AVAILABLE === 1 ? true : false);
	}

	/**
	 * @description Checks if the magnetometer is available.
	 * @return {boolean}
	 * @instance
	 * @example
	 * // Check if magnetometer is available
	 * if(iotsensor.isMagnetometerAvailable())
	 * {
	 * 	iotsensor.magnetometerOn();
	 * }
	 * @public
	 */
	instance.isMagnetometerAvailable = function()
	{
		return (instance.MAGNETOMETER.AVAILABLE === 1 ? true : false);
	}

	/**
	 * @description Checks if the barometer is available.
	 * @return {boolean}
	 * @instance
	 * @example
	 * // Check if barometer is available
	 * if(iotsensor.isBarometerAvailable())
	 * {
	 * 	iotsensor.barometerOn();
	 * }
	 * @public
	 */
	instance.isBarometerAvailable = function()
	{
		return (instance.BAROMETER.AVAILABLE === 1 ? true : false);
	}

	/**
	 * @description Checks if the humidity sensor is available.
	 * @return {boolean}
	 * @instance
	 * @example
	 * // Check if humidity sensor is available
	 * if(iotsensor.isHumidityAvailable())
	 * {
	 * 	iotsensor.humidityOn();
	 * }
	 * @public
	 */
	instance.isHumidityAvailable = function()
	{
		return (instance.HUMIDITY.AVAILABLE === 1 ? true : false);
	}	

	/**
	 * @description Checks if the temperature sensor is available.
	 * @return {boolean}
	 * @instance
	 * @example
	 * // Check if temperature sensor is available
	 * if(iotsensor.isTemperatureAvailable())
	 * {
	 * 	iotsensor.temperatureOn();
	 * }
	 * @public
	 */
	instance.isTemperatureAvailable = function()
	{
		return (instance.TEMPERATURE.AVAILABLE === 1 ? true : false);
	}

	/**
	 * @description Checks if Sensor Fusion is available.
	 * @return {boolean}
	 * @instance
	 * @example
	 * // Check if sensor fusion is available
	 * if(iotsensor.isSflAvailable())
	 * {
	 * 	iotsensor.sflOn();
	 * }
	 * @public
	 */
	instance.isSflAvailable = function()
	{
		return (instance.SFL.AVAILABLE === 1 ? true : false);
	}

	/**
	 * @description <strong>RAW and SFL</strong> <br /> Turn on accelerometer notification.
	 * <pre>Make sure the callback function is set before turning on the sensor</pre>
	 * @instance
	 * @example
	 * iotsensor.accelerometerOn();
	 * @public
	 */
	instance.accelerometerOn = function()
	{
		return instance;
	}

	/**
	 * @description <strong>RAW and SFL</strong> <br /> Turn off accelerometer notification.
	 * @instance
	 * @example
	 * iotsensor.accelerometerOff();
	 * @public
	 */
	instance.accelerometerOff = function()
	{
		return instance;
	}

	/**
	 * @description <strong>RAW and SFL</strong> <br /> Turn on gyroscope notification.
	 * <pre>Make sure the callback function is set before turning on the sensor</pre>
	 * @instance
	 * @example
	 * iotsensor.gyroscopeOn();
	 * @public
	 */
	instance.gyroscopeOn = function()
	{
		return instance;
	}

	/**
	 * @description <strong>RAW and SFL</strong> <br /> Turn off gyroscope notification.
	 * @instance
	 * @example
	 * iotsensor.gyroscopeOff();
	 * @public
	 */
	instance.gyroscopeOff = function()
	{
		return instance;
	}

	/**
	 * @description <strong>RAW and SFL</strong> <br /> Turn on magnetometer notification.
	 * <pre>Make sure the callback function is set before turning on the sensor</pre>
	 * @instance
	 * @example
	 * iotsensor.magnetometerOn();
	 * @public
	 */
	instance.magnetometerOn = function()
	{
		return instance;
	}

	/**
	 * @description <strong>RAW and SFL</strong> <br /> Turn off magnetometer notification.
	 * @instance
	 * @example
	 * iotsensor.magnetometerOff();
	 * @public
	 */
	instance.magnetometerOff = function()
	{
		return instance;
	}

	/**
	 * @description <strong>RAW and SFL</strong> <br /> Turn on barometer notification.
	 * <pre>Make sure the callback function is set before turning on the sensor</pre>
	 * @instance
	 * @example
	 * iotsensor.barometerOn();
	 * @public
	 */
	instance.barometerOn = function()
	{
		return instance;
	}

	/**
	 * @description <strong>RAW and SFL</strong> <br /> Turn off barometer notification.
	 * @instance
	 * @example
	 * iotsensor.barometerOff();
	 * @public
	 */
	instance.barometerOff = function()
	{
		return instance;
	}

	/**
	 * @description <strong>RAW and SFL</strong> <br /> Turn on temperature notification.
	 * <pre>Make sure the callback function is set before turning on the sensor</pre>
	 * @instance
	 * @example
	 * iotsensor.temperatureOn();
	 * @public
	 */
	instance.temperatureOn = function()
	{
		return instance;
	}

	/**
	 * @description <strong>RAW and SFL</strong> <br /> Turn off temperature notification.
	 * @instance
	 * @example
	 * iotsensor.temperatureOff();
	 * @public
	 */
	instance.temperatureOff = function()
	{
		return instance;
	}

	/**
	 * @description <strong>RAW and SFL</strong> <br /> Turn on humimdity notification.
	 * <pre>Make sure the callback function is set before turning on the sensor</pre>
	 * @instance
	 * @example
	 * iotsensor.humidityOn();
	 * @public
	 */
	instance.humidityOn = function()
	{
		return instance;
	}

	/**
	 * @description <strong>RAW and SFL</strong> <br /> Turn off humidity notification.
	 * @instance
	 * @example
	 * iotsensor.humidityOff();
	 * @public
	 */
	instance.humidityOff = function()
	{
		return instance;
	}

	/**
	 * @description <strong>SFL only</strong> <br /> Turn on sensor fusion notification.
	 * <pre>Make sure the callback function is set before turning on sensor fusion</pre>
	 * @instance
	 * @example
	 * iotsensor.sflOn();
	 * @public
	 */
	instance.sflOn = function()
	{
		return instance;
	}

	/**
	 * @description <strong>SFL only</strong> <br /> Turn off sensor fusion notification.
	 * @instance
	 * @example
	 * iotsensor.sflOff();
	 * @public
	 */
	instance.sflOff = function()
	{
		return instance;
	}

	/**
	 * @description <strong>RAW and SFL</strong> <br /> Turn off all sensors.
	 * @instance
	 * @example
	 * iotsensor.disableAllSensors();
	 * @public
	 */
	 instance.disableAllSensors = function()
	 {
	 	return instance;
	 }

	return instance;
}

/**
 * @description Returns current time using new Date() in a readable string
 * @returns {string} - Current time in hh:MM:SS.sss format
 * @example
 * var time = evothings.iotsensor.currentTime();
 * console.log('Current time: ' + time);
 * @public
 */
evothings.iotsensor.currentTime = function()
{
	var date = new Date();
	return (('0' + date.getHours()).slice(-2)
				 + ':' + ('0' + date.getMinutes()).slice(-2)
				 + ':' + ('0' + date.getSeconds()).slice(-2)
				 + '.' + ('00' + date.getMilliseconds()).slice(-3));
}
