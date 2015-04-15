// Documentation for TI SensorTag CC2541:
// http://processors.wiki.ti.com/index.php/SensorTag_User_Guide
// http://processors.wiki.ti.com/index.php/File:BLE_SensorTag_GATT_Server.pdf

;(function()
{
	evothings.tisensortag.ble.CC2541 = {}

	/**
	 * @namespace
	 * @description JavaScript library for the TI SensorTag.
	 * @alias evothings.tisensortag.ble.CC2541
	 */
	var sensortag = {}

	evothings.tisensortag.ble.CC2541 = sensortag

	/**
	 * Public. Create a SensorTag CC2541 instance.
	 * @returns {@link evothings.tisensortag.SensorTagInstance}
	 * @public
	 */
	sensortag.addInstanceMethods = function(anInstance)
	{
console.log('addInstanceMethods cc2541: ' + anInstance)
		/**
		 * @namespace
		 * @alias evothings.tisensortag.SensorTagInstance
		 * @description Internal. Variable holding the sensor tag instance object.
		 * @public
		 */
		var instance = anInstance

		// Add generic BLE instance methods.
		evothings.tisensortag.ble.addInstanceMethods(instance)

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
			instance.requiredServices.push(instance.ACCELEROMETER_SERVICE)

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
			instance.gyroscopeFun = fun
			instance.gyroscopeConfig = [axes]
			instance.gyroscopeInterval = Math.max(100, interval)
			instance.requiredServices.push(instance.GYROSCOPE_SERVICE)

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
			instance.requiredServices.push(instance.MAGNETOMETER_SERVICE)

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

console.log('activateSensorsImpl')
			instance.irTemperatureOn()
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

console.log('accelerometerOn ' + instance.accelerometerFun)
			instance.sensorOn(
				instance.ACCELEROMETER_CONFIG,
				instance.accelerometerConfig,
				instance.ACCELEROMETER_PERIOD,
				instance.accelerometerInterval,
				instance.ACCELEROMETER_DATA,
				instance.ACCELEROMETER_NOTIFICATION,
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
			instance.sensorOff(instance.ACCELEROMETER_DATA)

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
				instance.GYROSCOPE_CONFIG,
				instance.gyroscopeConfig,
				instance.GYROSCOPE_PERIOD,
				instance.gyroscopeInterval,
				instance.GYROSCOPE_DATA,
				instance.GYROSCOPE_NOTIFICATION,
				instance.gyroscopeFun
			)

			return instance
		}

		/**
		 * Public. Turn off gyroscope notification (SensorTag 1).
		 * @instance
		 * @public
		 */
		instance.gyroscopeOff = function()
		{
			instance.sensorOff(instance.GYROSCOPE_DATA)

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
				instance.MAGNETOMETER_CONFIG,
				instance.magnetometerConfig,
				instance.MAGNETOMETER_PERIOD,
				instance.magnetometerInterval,
				instance.MAGNETOMETER_DATA,
				instance.MAGNETOMETER_NOTIFICATION,
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
			instance.sensorOff(instance.MAGNETOMETER_DATA)

			return instance
		}

		/**
		 * Public. Turn on barometer notification.
		 * @todo Add calibration.
		 * @instance
		 * @public
		 */
		instance.barometerOn = function()
		{
			instance.sensorOn(
				instance.BAROMETER_CONFIG,
				instance.barometerConfig,
				instance.BAROMETER_PERIOD,
				instance.barometerInterval,
				instance.BAROMETER_DATA,
				instance.BAROMETER_NOTIFICATION,
				instance.barometerFun
			)

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
			var ax = evothings.util.littleEndianToInt8(data, 0) / divisors.x
			var ay = evothings.util.littleEndianToInt8(data, 1) / divisors.y
			var az = evothings.util.littleEndianToInt8(data, 2) / divisors.z

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
			var gy = -evothings.util.littleEndianToInt16(data, 0) * 500.0 / 65536.0
			var gx =  evothings.util.littleEndianToInt16(data, 2) * 500.0 / 65536.0
			var gz =  evothings.util.littleEndianToInt16(data, 4) * 500.0 / 65536.0

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
			var mx = evothings.util.littleEndianToInt16(data, 0) * (2000.0 / 65536.0) * -1
			var my = evothings.util.littleEndianToInt16(data, 2) * (2000.0 / 65536.0) * -1
			var mz = evothings.util.littleEndianToInt16(data, 4) * (2000.0 / 65536.0)

			// Return result.
			return { x: mx, y: my, z: mz }
		}

		/**
		 * SensorTag CC2541.
		 * Calculate barometer values from raw data.
		 * @todo Implement SensorTag CC2541 calibration.
		 * @instance
		 * @public
		 */
		instance.getBarometerValues = function(data)
		{
			var t = evothings.util.littleEndianToInt16(data, 0)
			var p = evothings.util.littleEndianToUint16(data, 2)
			var c = instance.barometerCalibrationData

			var S = c[2] + ((c[3] * t) / 131072) + ((c[4] * (t * t)) / 17179869184.0)
			var O = (c[5] * 16384.0) + (((c[6] * t) / 8)) + ((c[7] * (t * t)) / 524288.0)
			var Pa = (((S * p) + O) / 16384.0)
			var pInterpreted = Pa / 100.0

			return { pressure: pInterpreted }
		}

		/**
		 * Calculate IR temperature values from raw data.
		 * @param data - an Uint8Array.
		 * @return Object with fields: ambientTemperature, targetTemperature.
		 * @instance
		 * @public
		 */
		instance.getIRTemperatureValues = function(data)
		{
			// Calculate ambient temperature (Celsius).
			var ac = evothings.util.littleEndianToUint16(data, 2) / 128.0

			// Calculate target temperature (Celsius, based on ambient).
			var Vobj2 = evothings.util.littleEndianToInt16(data, 0) * 0.00000015625
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

		// Finally, return the SensorTag instance object.
		return instance
	}
})()
