	app.sensors = {
		'accelerometer':{	'name': 'Accelerometer', 	
							'active': 'false', 
							'data': ['x', 'y', 'z'],
							'unit': 'g'},
		'gyroscope': {		'name': 'Gyroscope', 
							'active': 'false', 
							'data': ['x', 'y', 'z'],
							'unit': 'deg/s'},
		'magnetometer': {	'name': 'Magnetometer',
							'active': 'false', 
							'data': ['x', 'y', 'z'],
							'unit': 'g'},
		'humidity': {		'name': 'Humidity',
							'active': 'false',
							'data': ['value'],
							'unit': '%'},
		'temperature': {	'name': 'Temperature', 	
							'active': 'false',
							'data': ['value'],
							'unit': '°C'},
		'barometer': {		'name': 'Barometer',
							'active': 'false',
							'data': ['value'],
							'unit': 'hPa'},
		'sensor_fusion': {	'name': 'Sensor Fusion', 	
							'active': 'false',
							'data': ['w', 'x', 'y', 'z'],
							'unit': ''}
	}
	
	app.settings = {};
	app.settings.CURRENT = {};
	
	app.settings.SENSOR_COMBINATION = {
		name:			"Sensor Combination",
		id:				"sens_combo",
		subheader:		"basic",
		_gyro:			"Gyroscope",
		_accel_gyro:	"Accelerometer + Gyroscope",
		_accel_mag:		"Accelerometer + Magnetometer",
		_accel_gyro_mag:"Accelerometer + Gyroscope + Magnetometer",
		_all:			"All"}
					
	app.settings.ACCELEROMETER_RANGE = {
		name:		"Accelerometer Range",
		id:			"acc_range",
		subheader:	"basic",
		_2:			"2G",
		_4:			"4G",
		_8:			"8G",
		_16:		"16G"}
	
	app.settings.ACCELEROMETER_RATE = {
		name:		"Accelerometer Rate",
		id:			"acc_rate",
		subheader:	"basic",
		_0_78:		"0.78Hz",
		_1_56:		"1.56Hz",
		_3_12:		"3.12Hz",
		_6_25:		"6.25Hz",
		_12_5:		"12.5Hz",
		_25:		"25Hz",
		_50:		"50Hz",
		_100:		"100Hz"}
					
	app.settings.GYROSCOPE_RANGE = {
		name:		"Gyroscope Range",
		id:			"gyro_range",
		subheader:	"basic",
		_2000:		"2000 deg/s",
		_1000:		"1000 deg/s",
		_500:		"500 deg/s",
		_250:		"250 deg/s"}
					
	app.settings.GYROSCOPE_RATE = {
		name:		"Gyroscope Rate",
		id:			"gyro_rate",
		subheader:	"basic",
		_25:		"25Hz",
		_50:		"50Hz",
		_100:		"100Hz"}
	
	app.settings.ENVIRONMENTAL_SENSORS_RATE = {
		name:		"Environmental Sensors Rate",
		id:			"env_sens_rate",
		subheader:	"basic",
		_0_5: 		"0.5Hz",
		_1:			"1Hz",
		_2:			"2Hz"}
		
	app.settings.SENSOR_FUSION_RATE = {
		name:		"Sensor Fusion Rate",
		id:			"sensf_rate",
		subheader:	"sensf",
		_10: 		"10Hz",
		_15: 		"15Hz",
		_20:		"20Hz",
		_25:		"25Hz"}
		
	app.settings.SENSOR_FUSION_RAW_DATA_ENABLE = {
		name:		"Sensor Fusion Raw Data",
		id:			"sensf_raw",
		subheader:	"sensf",
		_disabled: 	"Disabled",
		_enabled:	"Enabled"}
		
	app.settings.CALIBRATION_MODE = {
		name:			"Calibration Mode",
		id:				"cali_mode",
		subheader:		"calibration",
		_none:			"None",
		_static:		"Static",
		_continuous:	"Continuous",
		_one_shot:		"One Shot"}
		
	app.settings.AUTO_CALIBRATION_MODE = {
		name:			"Auto Calibration Mode",
		id:				"auto_cali",
		subheader:		"calibration",
		_basic: 		"Basic",
		_smartfusion:	"Smart Fusion"}