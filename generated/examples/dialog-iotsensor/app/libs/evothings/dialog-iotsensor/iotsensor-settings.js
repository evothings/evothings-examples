// File: iotsensor-settings.js

// Shared functions for BLE IoT Sensor settings
;(function()
{	
	"use strict"; 

	/**
	 * @namespace
	 * @description JavaScript library for settings of the Dialog IoT Sensor. <br />
	 * Shared functions are added for the BLE IoT Sensor (RAW and SFL). <br />
	 * See {@link evothings.iotsensor.instance_settings} after creating a new instance
	 * @alias evothings.iotsensor.settings
	 * @public
	 */

	var iotsensor = {};

	// Add object to namespace
	evothings.iotsensor.settings = iotsensor;

	/**
	 * @namespace
	 * @description Status constants.
	 * @alias evothings.iotsensor.settings.status
	 * @public
	 */
	var status = {};

	// Add to namespace. This trick is needed for JSDoc,
	// cannot use iotsensor.status below, docs do not
	// generate properly in this case
	iotsensor.status = status;

	/**
	 * @namespace
	 * @description Error constants. <br />
	 * There are additional error strings reported by the cordova-ble plugin
	 * and the easyble.js library
	 * @alias evothings.iotsensor.settings.error
	 */
	var error = {};

	// Add to namespace. This trick is needed for JSDoc,
	// cannot use iotsensor.error below, docs do not
	// generate properly in this case
	iotsensor.error = error;

	/**
	 * Private. Create an iotsensor_instance_settings
	 * @return {@link evothings.iotsensor.instance_settings}
	 * @private
	 */
	iotsensor.addInstanceMethods = function(anInstance)
	{
		/**
		 * @namespace
		 * @alias evothings.iotsensor.instance_settings
		 * @description 
		 * 	Abstract IoT Sensor Settings instance object. <br />
		 * 	This object specifies the common settings interface to BLE IoT Sensors. <br />
		 * 	Note that all settings are available for both RAW and SFL.
		 * @TODO Create specific setting instances for RAW and SFL.
		 * @TODO <strike>Display configuration and enum objects</strike>
		 * @TODO Check instance.configuration.BASIC before sending data to device
		 * @TODO <strike>Set default values for calibration control (now: all zeros)</strike>
		 * @public
		 */
		var instance = anInstance;

		/**
		 * @instance
		 * @description Commands that be issued using the control characteristic.
		 * Some commands return data, see datasheet chapter 6.1.3
		 * @private 
		 */
		instance.controls = {};

		/**
		 * @instance
		 * @description Stop command.
		 * @private
		 */
		instance.controls.STOP = {
			COMMAND_ID: 0,
			DATA: new Uint8Array([0, 0])
		};

		/**
		 * @instance
		 * @description Start command.
		 * @private
		 */
		instance.controls.START = {
			COMMAND_ID: 1,
			DATA: new Uint8Array([1, 0])
		};

		/**
		 * @instance
		 * @description Read parameters from flash memory
		 * @private
		 */
		instance.controls.READ_PARAMETERS = {
			COMMAND_ID: 2,
			DATA: new Uint8Array([2, 0])
		};

		/**
		 * @instance
		 * @description Reset to factory defaults
		 * @private
		 */
		instance.controls.FACTORY_RESET = {
			COMMAND_ID: 3,
			DATA: new Uint8Array([3, 0])
		};

		/**
		 * @instance
		 * @description Store basic configuration in flash memory.
		 * @private
		 */
		instance.controls.STORE_BASIC_CONF = {
			COMMAND_ID: 4,
			DATA: new Uint8Array([4, 0])
		};

		/**
		 * @instance
		 * @description Store calibration coefficients and control configuration
		 * @private
		 */
		instance.controls.STORE_CAL_CONTROL = {
			COMMAND_ID: 5,
			DATA: new Uint8Array([5, 0])
		};

		/**
		 * @instance
		 * @description Return running status
		 * @private
		 */
		instance.controls.RUNNING_STATUS = {
			COMMAND_ID: 6,
			DATA: new Uint8Array([6, 0])
		};
	
		/**
		 * @instance
		 * @description Reset sensor fusion and calibration configuration
		 * @private
		 */
		instance.controls.RESET_SFL_CAL_CONF = {
			COMMAND_ID: 7,
			DATA: new Uint8Array([7, 0])
		};

		/**
		 * @instance
		 * @description Set basic configuration
		 * @private
		 */
		instance.controls.SET_BASIC_CONF = {
			COMMAND_ID: 10,
			DATA: new Uint8Array(12) // Requires 12 bytes, see 6.1.3.9
		}

		/**
		 * @instance
		 * @description Read basic configuration reply
		 * @private
		 */
		instance.controls.READ_BASIC_CONF = {
			COMMAND_ID: 11,
			DATA: new Uint8Array([11, 0]),
			DATAFUN: getBasicConfigurationValues
		};

		/**
		 * @instance
		 * @description Set sensor fusion coefficients
		 * @private
		 */
		instance.controls.SET_SFL_COEF = {
			COMMAND_ID: 12,
			DATA: new Uint8Array(9) // Requires 9 bytes, see 6.1.3.11
		}

		/**
		 * @instance
		 * @description Read sensor fusion coefficients
		 * @private
		 */
		instance.controls.READ_SFL_COEF = {
			COMMAND_ID: 13,
			DATA: new Uint8Array([13, 0]),
			DATAFUN: getSflCoefficientValues
		};

		/**
		 * @instance
		 * @description Set calibration coefficients
		 * @private
		 */
		instance.controls.SET_CAL_COEF = {
			COMMAND_ID: 14,
			DATA: new Uint8Array(27) // Requires 27 bytes, see 6.1.13
		}

		/**
		 * @instance
		 * @description Read calibration coefficients
		 * @private
		 */
		instance.controls.READ_CAL_COEF = {
			COMMAND_ID: 15,
			DATA: new Uint8Array([15, 0]),
			DATAFUN: getCalibrationCoefficientValues
		};

		/**
		 * @instance
		 * @description Set calibration control flags
		 * @private
		 */
		instance.controls.SET_CONTROL_FLAGS = {
			COMMAND_ID: 16,
			DATA: new Uint8Array(16) // Requires 16 bytes, see 6.1.15
		}

		/**
		 * @instance
		 * @description Read calibration control
		 * @private
		 */
		instance.controls.READ_CAL_CONTROL = {
			COMMAND_ID: 17,
			DATA: new Uint8Array([17, 0]),
			DATAFUN: getCalibrationControlValues
		};

		/**
		 * @instance
		 * @description Fast accelerometer calibration
		 * @private
		 */
		instance.controls.FAST_ACCELERO_CAL = {
			COMMAND_ID: 18,
			DATA: new Uint8Array([18, 0])
		};

		/**
		 * @instance.enums
		 * @description Available values that can be used to configure the sensors <br />
		 * These objects can not be altered.
		 * @public 
		 */
		instance.enums = {};

		/**
		 * @instance.enums
		 * @description Sensor Combination - Default: All (0x0F)
		 * <pre><strong>Changing SENSOR_COMBINATION to any other than '_all' will disable all environmental sensors</strong></pre>
		 * <pre>
		 *  _gyro:           Gyroscope
		 *  _accel_gyro:     Accelerometer & Gyroscope
		 *  _accel_gyro_mag: Accelerometer, Gyroscope & Magnetometer
		 *  _all:            All sensors (including environmental sensors)
		 * </pre>
		 * @example
		 * // Enable only gyroscope
		 * iotsensors.configuration.BASIC.SENSOR_COMBINATION = iotsensor.enums.SENSOR_COMBINATION._gyro;
		 * @public
		 */
		instance.enums.SENSOR_COMBINATION = Object.freeze({
			_gyro: 2,
			_accel_gyro: 3,
			_accel_mag: 5,
			_accel_gyro_mag: 7,
			_all: 15
		});

		/**
		 * @instance.enums
		 * @description Accelerometer Range - Default: 2G (0x03)
		 * <pre>
		 *  _2:  2G
		 *  _4:  4G
		 *  _8:  8G
		 *  _16: 16G
		 * </pre>
		 * @example
		 * // Set accelerometer range to 4G
		 * iotsensor.configuration.BASIC.ACCELEROMETER_RANGE = iotsensor.enums.ACCELEROMETER_RANGE._4;
		 * @public
		 */
		instance.enums.ACCELEROMETER_RANGE = Object.freeze({
			_2: 3,
			_4: 5,
			_8: 8,
			_16: 12
		});

		/**
		 * @instance.enums
		 * @description Accelerometer Rate - Default: 100Hz (0x08)
		 * <pre>
		 *  _0_78:  0.78 Hz
		 *  _1_56:  1.56 Hz
		 *  _3_12:  3.12 Hz
		 *  _6_25:  6.25 Hz
		 *  _12_5:  12.5 Hz
		 *  _25:    25 Hz
		 *  _50:    50 Hz
		 *  _100:   100 Hz
		 * </pre>
		 * @example
		 * // Set accelerometer rate to 50 Hz
		 * iotsensor.configuration.BASIC.ACCELEROMETER_RATE = iotsensor.enums.ACCELEROMETER_RATE._50;
		 * @public
		 */
		instance.enums.ACCELEROMETER_RATE = Object.freeze({
			_0_78: 1,
			_1_56: 2,
			_3_12: 3,
			_6_25: 4,
			_12_5: 5,
			_25: 6,
			_50: 7,
			_100: 8
		});

		/**
		 * @instance.enums
		 * @description Gyroscope Range - Default: 2000 deg/s (0x00)
		 * <pre>
		 *  _500:   500 deg/s
		 *  _1000:  1000 deg/s
		 *  _2000:  2000 deg/s
		 * </pre>
		 * @example
		 * // Set gyroscope range to 500 deg/s
		 * iotsensor.configuration.BASIC.GYROSCOPE_RANGE = iotsensor.enums.GYROSCOPE_RANGE._500;
		 * @public
		 */
		instance.enums.GYROSCOPE_RANGE = Object.freeze({
			_2000: 0,
			_1000: 1,
			_500: 2,
			_250: 3
		});

		/**
		 * @instance.enums
		 * @description Gyroscope Rate - Default: 100 Hz (0x08)
		 * <pre>
		 *  _0_78:  0.78 Hz (RAW project only)
		 *  _1_56:  1.56 Hz (RAW project only)
		 *  _3_12:  3.12 Hz (RAW project only)
		 *  _6_25:  6.25 Hz (RAW project only)
		 *  _12_5:  12.5 Hz (RAW project only)
		 *  _25:    25 Hz
		 *  _50:    50 Hz
		 *  _100:   100 Hz
		 * </pre>
		 * @example
		 * // Set gyroscope rate to 50 Hz
		 * iotsensor.configuration.BASIC.GYROSCOPE_RATE = iotsensor.enums.GYROSCOPE_RATE._50;
		 * @public
		 */
		instance.enums.GYROSCOPE_RATE = Object.freeze({
			_0_78: 1, // Raw only
			_1_56: 2, // Raw only
			_3_12: 3, // Raw only 
			_6_25: 4, // Raw only
			_12_5: 5, // Raw only
			_25: 6,
			_50: 7,
			_100: 8
		});

		/**
		 * @instance.enums
		 * @description Magnetometer Rate - Reserved for future use
		 * @public
		 */
		instance.enums.MAGNETOMETER_RATE = Object.freeze({
			_0: 0
		});

		/**
		 * @instance.enums
		 * @description Environmental Sensors Rate - Default: 2Hz (4)
		 * <pre>
		 *  _0_5: 0.5 Hz
		 *  _1:   1 Hz
		 *  _2:   2 Hz
		 * </pre>
		 * @example
		 * // Set environmental sensors rate to 1 Hz
		 * iotsensor.configuration.BASIC.ENVIRONMENTAL_SENSORS_RATE = iotsensor.enums.ENVIRONMENTAL_SENSORS_RATE._1;
		 * @public
		 */
		instance.enums.ENVIRONMENTAL_SENSORS_RATE = Object.freeze({
			_0_5: 1,
			_1: 2,
			_2: 4
		});

		/**
		 * @instance.enums
		 * @description Sensor Fusion Rate - Default: 10Hz (10)
		 * <pre>
		 *  _10: 10 Hz
		 *  _15: 15 Hz
		 *  _20: 20 Hz
		 *  _25: 25 Hz
		 * </pre>
		 * @example
		 * // Set environmental sensor fusion rate to 25 Hz
		 * iotsensor.configuration.BASIC.SENSOR_FUSION_RATE = iotsensor.enums.SENSOR_FUSION_RATE._25;
		 * @public
		 */
		instance.enums.SENSOR_FUSION_RATE = Object.freeze({
			_10: 10,
			_15: 15,
			_20: 20,
			_25: 25
		});

		/**
		 * @instance.enums
		 * @description Sensor Fusion Raw Data Enable - Default: Enabled (1)
		 * <pre><b>NOTE: Disabling Sensor Fusion Raw Data disables to possibility to read Accelerometer, Gyroscope and Magnetometer</b></pre>
		 * <pre>
		 *  _disabled: Disabled
		 *  _enabled:  Enabled
		 * </pre>
		 * @example
		 * // Disable Sensor Fusion raw data
		 * iotsensor.configuration.BASIC.SENSOR_FUSION_RAW_DATA_ENABLE = iotsensor.enums.SENSOR_FUSION_RAW_DATA_ENABLE._disabled;
		 * @public
		 */
		instance.enums.SENSOR_FUSION_RAW_DATA_ENABLE = Object.freeze({
			_disabled: 0,
			_enabled: 1
		});

		/**
		 * @instance.enums
		 * @description Calibration Mode - Default: Static (1)
		 * <pre>
		 *  _none:       None
		 *  _static:     Static
		 *  _continuous: Continuous
		 *  _one_shot:   One Shot
		 * </pre>
		 * @example
		 * // Set calibration mode to none
		 * iotsensor.configuration.BASIC.CALIBRATION_MODE = iotsensor.enums.CALIBRATION_MODE._none;
		 * @public
		 */
		instance.enums.CALIBRATION_MODE = Object.freeze({
			_none: 0,
			_static: 1,
			_continuous: 2,
			_one_shot: 3
		});

		/**
		 * @instance.enums
		 * @description Auto Calibration Mode - Default: Basic (0)
		 * <pre>
		 *  _basic:       Basic
		 *  _smartfusion: Smart Fusion
		 * </pre>
		 * @example
		 * // Set auto calibration mode to Smart Fusion
		 * iotsensor.configuration.BASIC.AUTO_CALIBRATION_MODE = iotsensor.enums.AUTO_CALIBRATION_MODE._smartfusion;
		 * @public
		 */
		instance.enums.AUTO_CALIBRATION_MODE = Object.freeze({
			_basic: 0,
			_smartfusion: 1
		});

		/**
		 * @instance.configuration
		 * @description Configuration values that can be altered. <br />
		 * Make sure to call any of the following functions to save the settings in device
		 * after altering the configuration settings:<br />
		 * <ul>
		 * <li>{@link evothings.iotsensor.instance_settings#setBasicConfiguration|setBasicConfiguration()}</li>
		 * <li>{@link evothings.iotsensor.instance_settings#setCalibrationCoefficients|setCalibrationCoefficients()}</li>
		 * <li>{@link evothings.iotsensor.instance_settings#setCalibrationControl|setCalibrationControl()}</li>
		 * <li>{@link evothings.iotsensor.instance_settings#setSflCoefficients|setSflCoefficients()}</li>
		 * </ul>
		 * @public 
		 */
		instance.configuration = {};

		/**
		 * @instance.configuration
		 * @description Basic configuration settings. <br />
		 * <pre>It is good practice to {@link evothings.iotsensor.instance_settings#readBasicConfiguration|read the basic configuration settings} from the device on startup 
		 * in case the settings in flash memory do not match the default settings specified in configuration.BASIC.</pre>
		 * <pre>
		 * SENSOR_COMBINATION:            Specify which sensors are enabled (default: All)
		 * ACCELEROMETER_RANGE:           Default: 2g
		 * ACCELEROMETER_RATE:            Default: 100 Hz
		 * GYROSCOPE_RANGE:               Default: 2000 deg/s
		 * GYROSCOPE_RATE:                Default: 100 Hz
		 * MAGNETOMETER_RATE:             Reserved for future use
		 * ENVIRONMENTAL_SENSORS_RATE:    Default: 2 Hz
		 * SENSOR_FUSION_RATE:            Default: 10 Hz
		 * SENSOR_FUSION_RAW_DATA_ENABLE: Enable/Disable sensor fusion raw data (Default: Enabled)
		 * CALIBRATION_MODE:              Default: Static
		 * AUTO_CALIBRATION_MODE:         Default: Basic
		 * </pre>
		 * @public 
		 * @example
		 * // Change accelerometer range to 16g
		 * iotsensor.configuration.BASIC.ACCELEROMETER_RANGE = iotsensor.enums.ACCELEROMETER_RANGE._16g;
		 *		
		 * // Set basic configuration in device
		 * iotsensor.setBasicConfiguration();
		 *
		 * // Optional - Store basic configuration in flash
		 * iotsensor.storeBasicConfigurationInFlash();
		 *
		 * // Optional - Retrieve new settings from device
		 * iotsensor.readBasicConfiguration(
		 * 	function(data)
		 * 	{
		 *      console.log('Settings: ' + data);
		 * 	}
		 * );
		 */
		instance.configuration.BASIC = {
			SENSOR_COMBINATION: 		instance.enums.SENSOR_COMBINATION._all,
			ACCELEROMETER_RANGE: 		instance.enums.ACCELEROMETER_RANGE._2,
			ACCELEROMETER_RATE: 		instance.enums.ACCELEROMETER_RATE._100,
			GYROSCOPE_RANGE: 			instance.enums.GYROSCOPE_RANGE._2000,
			GYROSCOPE_RATE: 			instance.enums.GYROSCOPE_RATE._100,
			MAGNETOMETER_RATE: 			instance.enums.MAGNETOMETER_RATE._0,
			ENVIRONMENTAL_SENSORS_RATE: instance.enums.ENVIRONMENTAL_SENSORS_RATE._2,
			SENSOR_FUSION_RATE: 		instance.enums.SENSOR_FUSION_RATE._10, 
			SENSOR_FUSION_RAW_DATA_ENABLE: 	instance.enums.SENSOR_FUSION_RAW_DATA_ENABLE._enabled, 
			CALIBRATION_MODE: 			instance.enums.CALIBRATION_MODE._static, 
			AUTO_CALIBRATION_MODE: 		instance.enums.AUTO_CALIBRATION_MODE._basic,
		}

		/**
		 * @instance.configuration
		 * @description Sensor Fusion Coefficients settings. <br />
		 * <pre>
		 * BETA_A:             Unsigned Q15 fixed-point format in range 0x0000 (0) to 0x8000 (1.0) (default: 0x028F: 0.02)
		 * BETA_M:             Unsigned Q15 fixed-point format in range 0x0000 (0) to 0x8000 (1.0) (default: 0x028F: 0.02)
		 * TEMPERATURE_REPORT: 32 bit unsigned integer (reserved for future use)
		 * </pre>
		 * @public
		 * @example
		 * // Change Beta A to 2000
		 * iotsensor.configuration.SFL_COEF.BETA_A = 2000;
		 *		
		 * // Set basic configuration in device
		 * iotsensor.setSflCoefficients();
		 *
		 * // Retrieve sensor fusion coefficients from device
		 * iotsensor.readSflCoefficients(
		 * 	function(data)
		 *	{
		 *		console.log('Sfl coefficients: ' + data);
		 *	}
		 * );
		 */
		instance.configuration.SFL_COEF = {
			BETA_A: 655, // default: 0x028F (= 655)
			BETA_M: 655, // default: 0x028F (= 655)
			TEMPERATURE_REPORT: 0 // reserved for future use
		}

		/**
		 * @instance.configuration
		 * @description Calibration Coefficients settings. <br />
		 * <pre>
		 * SENSOR_TYPE: Magnetometer (Default: 2)
		 * Q_FORMAT: Precision of matrix coefficients (Default: 14)
		 * OFFSET_VECTOR: 3x1 Int16 array listed in [x, y, z] order (Default: [0, 0, 0])
		 * MATRIX: 3x3 Int16 array (Default: [[16384, 0, 0], [0, 16384, 0], [0, 0, 16384]])
		 * </pre>
		 * <pre><strong>SENSOR_TYPE is set to 2 (magnetometer) and should not be changed.</strong></pre>
		 * @example
		 * // Set Q_FORMAT
		 * iotsensor.configuration.CAL_COEF.Q_FORMAT = 12;
		 * 
		 * // Set offset vector
		 * iotsensor.configuration.OFFSET_VECTOR = new Int16Array([100, 100, 100]);
		 *
		 * // Set matrix
		 * iotsensor.configuration.MATRIX = [new Int16Array([100, 0, 0]), new Int16Array([0, 100, 0]), new Int16Array([0, 0, 100])];
		 * 
		 * // Set Calibration coefficients in device
		 * iotsensor.setCalibrationCoefficients();
		 * 
		 * // Retrieve calibration coefficients from device
		 * iotsensor.readCalibrationCoefficients(
		 * 	function(data)
		 * 	{
		 *		console.log('Calibration coefficients: ' + data);
		 * 	}
		 * );
		 * @public
		 */
		instance.configuration.CAL_COEF = {
			SENSOR_TYPE: 2, // magnetometer
			Q_FORMAT: 14,
			OFFSET_VECTOR: new Int16Array(3), // Offset vector 3x1 Int16
			MATRIX: [ // Matrix 3x3 Int16
					new Int16Array([16384, 0, 0]),
					new Int16Array([0, 16384, 0]),
					new Int16Array([0, 0, 16384])
					]
		}

		/**
		 * @description Calibration control settings. 
		 * <pre>
		 * SENSOR_TYPE: Magnetometer (Default: 2)
		 * CONTROL_FLAGS: Uint8 array listed in [byte2, byte3] order (Default: [12, 0])
		 * PARAMETERS: Uint8Array(12) (Default: all zeros)
		 * </pre>
		 * <pre><strong>SENSOR_TYPE is set to 2 (magnetometer) and should not be changed.</strong></pre>
		 * @instance.configuration
		 * @example
		 * // Set calibration control flag byte 2 (CONTROL_FLAG[0])
		 * iotsensor.configuration.CAL_CONTROL.CONTROL_FLAGS[0] = 28 // 0011100
		 * 
		 * // Set calibration control flags in device
		 * iotsensor.setCalibrationControl();
		 *
		 * // Retrieve calibration control flags from device
		 * iotsensor.readCalibrationControl(
		 * 	function(data)
		 * 	{
		 * 		console.log('Calibration control ' + data);
		 * 	}
		 * );
		 * @public
		 */
		instance.configuration.CAL_CONTROL = {
			SENSOR_TYPE: 2, // magnetometer
			CONTROL_FLAGS: new Uint8Array([12, 0]),
			PARAMETERS: new Uint8Array(12) // TODO: Set default values
		}

		/** 
		 * @description Set the sensor status callback. <br />
		 * This function is called everytime the sensor receives a START or STOP command and sends a reply back to the device.
		 * @param {function} callbackFun - Callback called with START/STOP reply (1: START, 0: STOP): callbackFun(data).
		 * @instance
		 * @example
		 * iotsensor.sensorStatusCallback(
		 * 	function(data)
		 * 	{
		 * 		console.log('Sensor status: ' + data);
		 * 	}
		 * );
		 * @public
		 */
		instance.sensorStatusCallback = function(callbackFun)
		{
			// Set callback function for both STOP and START commands
			instance.controls.STOP.callbackFun = callbackFun;
			instance.controls.START.callbackFun = callbackFun;
		}

		/**
		 * @description Read parameters from flash memory <br />
		 * @instance
		 * @example
		 * iotsensor.readParametersFromFlash();
		 * @public
		 */
		instance.readParametersFromFlash = function()
		{
			instance.controlPoint(instance.controls.READ_PARAMETERS);
		}

		/**
		 * @description Reset to factory defaults. All settings from iotsensor.configuration.BASIC are restored.
		 * @instance
		 * @example
		 * iotsensor.resetToFactoryDefaults();
		 * @public
		 */
		instance.resetToFactoryDefaults = function()
		{
			instance.controlPoint(instance.controls.FACTORY_RESET);
		}

		/**
		 * @description Store basic configuration in flash memory.
		 * <pre>Call setBasicConfiguration() before calling this function.</pre>
		 * @instance
		 * @example
		 * iotsensor.storeBasicConfigurationInFlash();
		 * @public
		 */
		instance.storeBasicConfigurationInFlash = function()
		{
			instance.controlPoint(instance.controls.STORE_BASIC_CONF);
		}

		/**
		 * @description Store calibration coefficients and control configuration in flash memory. 
		 * <pre>Call setCalibrationCoefficients() and setControlFlags() before calling this function.</pre>
		 * @instance
		 * @example
		 * iotsensor.storeCalibrationAndControl();
		 * @public
		 */
		instance.storeCalibrationAndControl = function()
		{
			instance.controlPoint(instance.controls.STORE_CAL_CONTROL);
		}

		/**
		 * @description Get running status. 0: Stopped, 1: Running
		 * @param {function} callbackFun Callback called with running status: callbackFun(data).
		 * @instance
		 * @example
		 * // Running status. 0: Stopped, 1: Running
		 * iotsensor.getRunningStatus(
		 * 	function(data)
		 * 	{
		 * 		console.log('Running status: ' + data);
		 * 	}
		 * );
		 * @public
		 */
		instance.getRunningStatus = function(callbackFun)
		{	
			var control = instance.controls.RUNNING_STATUS;

			// Set callback function
			control.callbackFun = callbackFun;

			instance.controlPoint(control);
		}

		/**
		 * @description Reset sensor fusion and calibration configuration to default.
		 * @instance
		 * @example
		 * iotsensor.resetSflAndCalibrationConfiguration();
		 * @public
		 */
		instance.resetSflAndCalibrationConfiguration = function()
		{
			instance.controlPoint(instance.controls.RESET_SFL_CAL_CONF);
		}

		/**
		 * @description Set the basic configuration in device. 
		 * <pre>Settings are not stored in flash. Call storeBasicConfiguration() to do so.</pre>
		 * @instance
		 * @example
		 * iotsensor.setBasicConfiguration();
		 * @public
		 */
		instance.setBasicConfiguration = function()
		{
			var control = instance.controls.SET_BASIC_CONF;

			// Convert instance.configuration.BASIC to Uint8Array(12)
			var arr = new Uint8Array(12);
			arr[0] = control.COMMAND_ID;

			var index = 0;
			for(var key in instance.configuration.BASIC)
			{
				index++
				arr[index] = instance.configuration.BASIC[key];
			}

			// Store array in instance.controls.SET_BASIC_CONF.DATA
			control.DATA = arr;

			instance.controlPoint(control);
		}

		/**
		 * @description Return the basic configuration. Returns a readable object to callbackFun
		 * <pre>Calling this function will also store the data in configuration.BASIC</pre>
		 * <pre>Make sure to call this function upon initialization in order to get the most recent settings</pre>
		 * @param {function} callbackFun Callback called with running status: callbackFun(data).
		 * @instance
		 * @example
		 * iotsensor.readBasicConfiguration(
		 * 	function(data)
		 * 	{
		 * 		console.log('Basic configuration:'
		 *  				+ ' ' + data.SENSOR_COMBINATION
		 *  				+ ' ' + data.ACCELEROMETER_RANGE
		 *  				+ ' ' + data.ACCELEROMETER_RATE
		 *  				+ ' ' + data.GYROSCOPE_RANGE
		 *  				+ ' ' + data.GYROSCOPE_RATE
		 *  				+ ' ' + data.MAGNETOMETER_RATE
		 *  				+ ' ' + data.ENVIRONMENTAL_SENSORS_RATE
		 *  				+ ' ' + data.SENSOR_FUSION_RATE
		 *  				+ ' ' + data.SENSOR_FUSION_RAW_DATA_ENABLE
		 *  				+ ' ' + data.CALIBRATION_MODE
		 *  				+ ' ' + data.AUTO_CALIBRATION_MODE);
		 * 	}
		 * );
		 * @public
		 */
		instance.readBasicConfiguration = function(callbackFun)
		{
			var control = instance.controls.READ_BASIC_CONF;

			// Set callback function
			control.callbackFun = callbackFun;

			instance.controlPoint(control);
		}

		/**
		 * @description Set the sensor fusion configuration in device.
		 * <pre>Settings are not stored in flash. Call storeCalibrationAndControl() to do so.</pre>
		 * @instance
		 * @example
		 * iotsensor.setSflCoefficients();
		 * @public
		 */
		instance.setSflCoefficients = function()
		{
			var control = instance.controls.SET_SFL_COEF;
			var coef = instance.configuration.SFL_COEF;

			// Convert instance.configuration.SFL_COEF to Uint8Array(9)
			var arr = new Uint8Array(9);
			arr[0] = control.COMMAND_ID;

			arr[1] = coef.BETA_A & 0xFF; // Beta A gain LSB
			arr[2] = (coef.BETA_A >> 8) & 0xFF; // Beta A gain LSB
			arr[3] =coef.BETA_M & 0xFF; // Beta M gain LSB
			arr[4] = (coef.BETA_M >> 8) & 0xFF; // Beta M gain LSB

			// TODO: Add TEMPERATURE_REPORT (4 bytes), reserved for future use

			control.DATA = arr;

			instance.controlPoint(control);
		}

		/**
		 * @description Return the sensor fusion coefficients. Returns a readable object to callbackFun.
		 * <pre>Calling this function will also store the data in configuration.SFL_COEF</pre>
		 * <pre>Make sure to call this function upon initialization in order to get the most recent settings</pre>
		 * @param {function} callbackFun Callback called with running status: callbackFun(data).
		 * A data array is passed as a parameter.
		 * @instance
		 * @example
		 * iotsensor.readSflCoefficients(
		 * 	function(data)
		 * 	{
		 * 		console.log('Sfl coefficients:'
		 *  				+ ' ' + data.BETA_A
		 *  				+ ' ' + data.BETA_M
		 *  				+ ' ' + data.TEMPERATURE_REPORT);
		 * 	}
		 * );
		 * @public
		 */
		instance.readSflCoefficients = function(callbackFun)
		{
			var control = instance.controls.READ_SFL_COEF;

			// Set callback function
			control.callbackFun = callbackFun;

			instance.controlPoint(control);
		}

		/**
		 * Set calibration coefficients in device.
		 * <pre>Settings are not stored in flash. Call storeCalibrationAndControl() to do so.</pre>
		 * @instance
		 * @example
		 * iotsensor.setCalibrationCoefficients();
		 * @public
		 */
		instance.setCalibrationCoefficients = function()
		{
			var control = instance.controls.SET_CAL_COEF;
			var coef = instance.configuration.CAL_COEF;

			// Convert instance.configuration.CAL_COEF to Uint8Array(27)
			var arr = new Uint8Array(27);
			arr[0] = control.COMMAND_ID;
			arr[1] = coef.SENSOR_TYPE;
			arr[2] = coef.Q_FORMAT;

			// Convert 3xInt16 to Uint8Array
			for(var i = 0; i < 3; i++)
			{
				arr[2*i+3] = coef.OFFSET_VECTOR[i] & 0xFF;
				arr[2*i+4] = (coef.OFFSET_VECTOR[i] >> 8) & 0xFF;
			}

			// Convert 3x3 Int16Array to Uint8Array
			var index = 0;
			for(var j = 0; j < 3; j++)
			{
				for(var k = 0; k < 3; k++)
				{
					arr[2*index+9] = coef.MATRIX[j][k] & 0xFF;
					arr[2*index+10] = (coef.MATRIX[j][k] >> 8) & 0xFF;
					index++;
				}
			}

			control.DATA = arr;
			instance.controlPoint(control);
		}

		/**
		 * Read calibration coefficients. Returns a readable object to callbackFun.
		 * <pre>Calling this function will also store the data in configuration.CAL_COEF</pre>
		 * <pre>Make sure to call this function upon initialization in order to get the most recent settings</pre>
		 * @param {function} callbackFun Callback called with running status: callbackFun(data).
		 * A data array is passed as a parameter.
		 * @instance
		 * @example
		 * iotsensor.readCalibrationCoefficients(
		 * 	function(data)
		 * 	{
		 * 		console.log('Calibration coefficients:'
		 *  				+ ' ' + data.SENSOR_TYPE
		 *  				+ ' ' + data.Q_FORMAT
		 *  				+ ' ' + data.OFFSET_VECTOR
		 *  				+ ' ' + data.MATRIX);
		 * 	}
		 * );
		 * @public
		 */
		instance.readCalibrationCoefficients = function(callbackFun)
		{
			var control = instance.controls.READ_CAL_COEF;

			// Set callback function
			control.callbackFun = callbackFun;

			instance.controlPoint(control);
		}

		/**
		 * Set calibration control flags in device.
		 * <pre>Settings are not stored in flash. Call storeCalibrationAndControl() to do so.</pre>
		 * @instance
		 * @example
		 * iotsensor.setCalibrationCoefficients();
		 * @public
		 */
		instance.setCalibrationControl = function()
		{
			var control = instance.controls.SET_CONTROL_FLAGS;
			var cal_control = instance.configuration.CAL_CONTROL;

			// Convert instance.configuration.CAL_CONTROL to Uint8array(16)
			var arr = new Uint8Array(16);
			arr[0] = control.COMMAND_ID; 
			arr[1] = cal_control.SENSOR_TYPE;

			arr[2] = cal_control.CONTROL_FLAGS[0];
			arr[3] = cal_control.CONTROL_FLAGS[1];

			for(var i = 0; i < 12; i++)
			{
				arr[4+i] = cal_control.PARAMETERS[i];
			}

			control.DATA = arr;
			instance.controlPoint(control);
		}

		/**
		 * Read calibration control flags. Returns a readable object to callbackFun.
		 * <pre>Calling this function will also store the data in configuration.CAL_COEF</pre>
		 * <pre>Make sure to call this function upon initialization in order to get the most recent settings</pre>
		 * @param {function} callbackFun Callback called with running status: callbackFun(data).
		 * A data array is passed as a parameter.
		 * @instance
		 * @example
		 * iotsensor.readCalibrationControl(
		 * 	function(data)
		 * 	{
		 * 		console.log('Calibration control values:'
		 *  				+ ' ' + data.SENSOR_TYPE
		 *  				+ ' ' + data.CONTROL_FLAGS[0]
		 *  				+ ' ' + data.CONTROL_FLAGS[1]
		 *  				+ ' ' + data.PARAMETERS);
		 * 	}
		 * );
		 * @public
		 */
		instance.readCalibrationControl = function(callbackFun)
		{
			var control = instance.controls.READ_CAL_CONTROL;

			// Set callback function
			control.callbackFun = callbackFun;

			instance.controlPoint(control);
		}

		/**
		 * Read fast accelerometer status. 0: Stopped, 1: Started
		 * @param {function} callbackFun Callback called with running status: callbackFun(data).
		 * @instance
		 * @example
		 * // Fast accelerometer cal status. 0: Stopped, 1: Started
		 * iotsensor.getFastAccelerometerCalibration(
		 * 	function(data)
		 * 	{
		 * 		console.log('Fast accelerometer calibration status: ' + data);
		 * 	}
		 * );
		 * @public
		 */
		instance.getFastAccelerometerCalibration = function(callbackFun)
		{
			var control = instance.controls.FAST_ACCELERO_CAL;

			// Set callback function
			control.callbackFun = callbackFun;

			instance.controlPoint(control);
		}

		/**
		 * Internal. Helper function to handle the replies
		 * from control point
		 * @param data - data returned from control point
		 * @instance
		 * @private
		 */
		instance.handleCommandReply = function(data)
		{
			// Find control based on COMMAND_ID
			for(var key in instance.controls)
			{
				// Second byte is command id
				if(instance.controls[key]['COMMAND_ID'] === data[1])
				{
					var control = instance.controls[key];
					if(control.callbackFun)
					{
						// We are not interested in byte 0 and byte 1
						// Byte 0: Report Id (always 8)
						// Byte 1: Command Id
						var data = data.slice(2);
						if(control.DATAFUN)
						{
							// If dataFun is set, convert data to readable object
							data = control.DATAFUN(data);
						}
						// Return data to callbackFun
						control.callbackFun(data);
					}
					else
					{
						instance.errorFun('Callback function not set for COMMAND_ID ' + data[1]);
					}
				}
			}
		}

		/**
		 * Private. Calculate basic configuration values from array
		 * @param data - Uint8Array.
		 * @return Object with fields: 
		 * - SENSOR_COMBINATION
		 * - ACCELEROMETER_RANGE
		 * - ACCELEROMETER_RATE
		 * - GYROSCOPE_RANGE
		 * - GYROSCOPE_RATE
		 * - MAGNETOMETER_RATE (Reserved for future use)
		 * - ENVIRONMENTAL_SENSORS_RATE
		 * - SENSOR_FUSION_RATE
		 * - SENSOR_FUSION_RAW_DATA_ENABLE
		 * - CALIBRATION_MODE
		 * - AUTO_CALIBRATION_MODE
		 * @instance
		 * @private
		 */
		function getBasicConfigurationValues(data)
		{
			// Store values for future use
			var index = 0;
			for(var key in instance.configuration.BASIC)
			{
				instance.configuration.BASIC[key] = data[index];
				index++;
			}

			// Convert and return readable object
			return {
				SENSOR_COMBINATION: 			getKey(instance.configuration.BASIC.SENSOR_COMBINATION, instance.enums.SENSOR_COMBINATION),
				ACCELEROMETER_RANGE: 			getKey(instance.configuration.BASIC.ACCELEROMETER_RANGE, instance.enums.ACCELEROMETER_RANGE),
				ACCELEROMETER_RATE: 			getKey(instance.configuration.BASIC.ACCELEROMETER_RATE, instance.enums.ACCELEROMETER_RATE),
				GYROSCOPE_RANGE: 				getKey(instance.configuration.BASIC.GYROSCOPE_RANGE, instance.enums.GYROSCOPE_RANGE),
				GYROSCOPE_RATE: 				getKey(instance.configuration.BASIC.GYROSCOPE_RATE, instance.enums.GYROSCOPE_RATE),
				MAGNETOMETER_RATE: 				getKey(instance.configuration.BASIC.MAGNETOMETER_RATE, instance.enums.MAGNETOMETER_RATE),
				ENVIRONMENTAL_SENSORS_RATE: 	getKey(instance.configuration.BASIC.ENVIRONMENTAL_SENSORS_RATE, instance.enums.ENVIRONMENTAL_SENSORS_RATE),
				SENSOR_FUSION_RATE: 			getKey(instance.configuration.BASIC.SENSOR_FUSION_RATE, instance.enums.SENSOR_FUSION_RATE),
				SENSOR_FUSION_RAW_DATA_ENABLE: 	getKey(instance.configuration.BASIC.SENSOR_FUSION_RAW_DATA_ENABLE, instance.enums.SENSOR_FUSION_RAW_DATA_ENABLE),
				CALIBRATION_MODE: 				getKey(instance.configuration.BASIC.CALIBRATION_MODE, instance.enums.CALIBRATION_MODE),
				AUTO_CALIBRATION_MODE: 			getKey(instance.configuration.BASIC.AUTO_CALIBRATION_MODE, instance.enums.AUTO_CALIBRATION_MODE),
			}
		}

		/**
		 * Private. Calculate sensor fusion coefficients values from array
		 * @param data - Uint8Array.
		 * @return Object with fields: BETA_A, BETA_M, TEMPERATURE_REPORT
		 * @instance
		 * @private
		 */
		function getSflCoefficientValues(data)
		{
			var coef = instance.configuration.SFL_COEF;

			// Store values for future use
			coef.BETA_A = evothings.util.littleEndianToInt16(data, 0);
			coef.BETA_M = evothings.util.littleEndianToInt16(data, 2);
			coef.TEMPERATURE_REPORT = evothings.util.littleEndianToUint32(data, 4);

			return coef;
		}

		/**
		 * Private. Get calibration coefficients values from array
		 * @param data - Uint8Array.
		 * @return Object with fields: SENSOR_TYPE, Q_FORMAT, OFFSET_VECTOR, MATRIX
		 * @instance
		 * @private
		 */
		function getCalibrationCoefficientValues(data)
		{
			var coef = instance.configuration.CAL_COEF;

			// Store values for future use
			coef.SENSOR_TYPE	= data[0];
			coef.Q_FORMAT 		= data[1];
			
			for(var i = 0;i < 3; i++)
			{
				coef.OFFSET_VECTOR[i] = evothings.util.littleEndianToInt16(data, 2 + 2*i);
			}

			// Convert 18 byte array to 3x3 Int16 matrix
			for(var j = 0; j < 18; j+=2)
			{
				coef.MATRIX[Math.floor(j/6)][(j/2)%3] = evothings.util.littleEndianToInt16(data, 8+j);
			}

			return coef;
		}

		/**
		 * Private. Get calibration control flag values from array
		 * @param data - Uint8Array.
		 * @return Object with fields: SENSOR_TYPE, CONTROL_FLAGS, PARAMETERS
		 * @instance
		 * @private
		 */
		function getCalibrationControlValues(data)
		{
			var cal_control = instance.configuration.CAL_CONTROL;

			// Store values for future use
			cal_control.SENSOR_TYPE = data[0];

			cal_control.CONTROL_FLAGS[0] = data[1];
			cal_control.CONTROL_FLAGS[1] = data[2];

			for(var i = 0; i < 12; i++)
			{
				cal_control.PARAMETERS[i] = data[3+i];
			}

			return cal_control;
		}

		// Finally, return the IoT Sensor Settings instance object.
		return instance;
	}

	/**
	 * Private. Find the key in an array
	 * @param val - Value to search for in array
	 * @param array - Array to search
	 * @return key from array
	 * @private
	 */
	function getKey(val, array)
	{
		for(var key in array)
		{
			var this_val = array[key];
			if(this_val == val)
			{
				return key;
				break;
			}
		}
	}

})();