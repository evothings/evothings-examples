// Using closure to avoid global name space conflicts.
;(() =>
{
'use strict';

// Application object that exposes global functions.
window.app = {};

// UUIDs
var accelerometerServiceUUID = 'f000aa10-0451-4000-b000-000000000000';
var accelerometerDataUUID    = 'f000aa11-0451-4000-b000-000000000000';
var accelerometerConfigUUID  = 'f000aa12-0451-4000-b000-000000000000';
var accelerometerPeriodUUID  = 'f000aa13-0451-4000-b000-000000000000';

// Variables.
var gattServer;
var accelerometerService;
var accelerometer;

function showInfo(info)
{
	document.getElementById('info').innerHTML = info;
	//console.log(info);
}

function log(message)
{
	console.log(message);
}

/* Called from commented out code below.
function readAccelerometer(characteristic) {
	characteristic.readValue().then(data => {
		log('got accel data: ' + data)
		var accelerometer = getAccelerometerValues(data);
		log('x: ' + accelerometer.x);
		log('y: ' + accelerometer.y);
		log('z: ' + accelerometer.z);
	})
}
*/

function getAccelerometerValues(data) {
	var divisors = { x: 16.0, y: -16.0, z: 16.0 };

	// Calculate accelerometer values.
	var ax = data.getInt8(0, true) / divisors.x;
	var ay = data.getInt8(1, true) / divisors.y;
	var az = data.getInt8(2, true) / divisors.z;

	return { x: ax, y: ay, z: az };
}

function onAccelerometerChanged(event) {
	var characteristic = event.target;
	var values = getAccelerometerValues(characteristic.value);
	showInfo('x: ' + values.x + ' y: '  + values.y + ' z: ' + values.z);
}

function init()
{
    console.log('@@@ app.init');
}

document.addEventListener(
	'deviceready',
	init,
	false);

app.start = () =>
{
	showInfo('Scanning...');

	bleat.requestDevice({
		filters:[{ name: 'SensorTag' }]
	})
	.then(device => {
		log('Found device: ' + device.name);
		return device.gatt.connect();
	})
	.then(server => {
		gattServer = server;
		log('SensorTag connected: ' + gattServer.connected);
		showInfo('Connected')
		return gattServer.getPrimaryService(accelerometerServiceUUID);
	})
	.then(service => {
		// Get accelerometer config characteristic.
		accelerometerService = service
		return accelerometerService.getCharacteristic(accelerometerConfigUUID);
	})
	.then(characteristic => {
		// Turn accelerometer config to ON.
		return characteristic.writeValue(new Uint8Array([1]));
	})
	.then(() => {
		// Get period characteristic.
		return accelerometerService.getCharacteristic(accelerometerPeriodUUID);
	})
	.then(characteristic => {
		// Set update interval.
		var milliseconds = 100;
		return characteristic.writeValue(new Uint8Array([milliseconds / 10]));
	})
	.then(() => {
		// Get data characteristic.
		return accelerometerService.getCharacteristic(accelerometerDataUUID);
	})
	.then(characteristic => {
		// Start sensor notification.
		log('Start notficatons')
		characteristic.addEventListener('characteristicvaluechanged', onAccelerometerChanged);
  		return characteristic.startNotifications();
	})
	/* Test of read
	.then(() => {
		log('Value written')
		return accelerometerService.getCharacteristic(accelerometerDataUUID);
	})
	.then(characteristic => {
		log('Accelerometer data characteristic: ' + characteristic.uuid);
		// Read accelerometer every second.
		var timer = setInterval(() => { readAccelerometer(characteristic) }, 1000);
		// Keep going for 10 seconds
		setTimeout(() => {
			clearInterval(timer);
			gattServer.disconnect();
			log('Gatt server connected: ' + gattServer.connected);
			},
			10000)
	})
	*/
	.catch(error => {
		log(error);
	});
}

app.stop = () =>
{
	if (gattServer && gattServer.connected)
	{
		gattServer.disconnect();
	}

	showInfo('Disconnected');
}

})();
