// JavaScript code for the mbed ble scan app

// Short name for EasyBLE library.
var easyble = evothings.easyble;

// Name of device to connect to
var MyDeviceName = "ChangeMe!!"

// LED defines (inverted)
var ledOFF = 1;
var ledON  = 0;

// Object that holds application data and functions.
var app = {};

var GDevice;

/*
 * Initialise the application.
*/
app.initialize = function()
{
	document.addEventListener(
		'deviceready',
		function() { evothings.scriptsLoaded(app.onDeviceReady()) },
		false);
};

/*
 * when low level initialization complete, 
 * this function is called
*/
app.onDeviceReady = function()
{
	// report status
	app.showInfo('Device Ready!');
	
	// call stop before you start, just in case something else is running
	easyble.stopScan();
	easyble.closeConnectedDevices();
	
	// only report devices once
	easyble.reportDeviceOnce(true);
	app.startScan();
	app.showInfo('Status: Scanning...');
};


/*
 * print debug info to console and application
*/
app.showInfo = function(info)
{
	document.getElementById('info').innerHTML = info;
	console.log(info);
};

/*
 * Scan all devices and report
*/
app.startScan = function()
{
	easyble.startScan(
		function(device)
		{
			// do not show un-named beacons
			if(!device.name){
				return 0;}
			
			// print "name : mac address" for every device found
			console.log(device.name.toString() +" : "+device.address.toString().split(":").join(''))

			// If my device is found connect to it
			if (device.name == MyDeviceName)
			{
				app.showInfo('Status: Device found: ' + device.name + '.');
				easyble.stopScan();
				app.connectToDevice(device);
			}
		},
		function(errorCode)
		{
			app.showInfo('Error: startScan: ' + errorCode + '.');
			//app.reset();
		});
};

/*
 * Read services for a device.
*/
app.connectToDevice = function(device)
{
	console.log("Starting ConnectToDevice")
	app.showInfo('Connecting...');
	device.connect(
		function(device)
		{
			GDevice = device;
			app.showInfo('Status: Connected');
			app.readServices(GDevice);
			app.toggle();
		},
		function(errorCode)
		{
			app.showInfo('Error: Connection failed: ' + errorCode + '.');
			evothings.ble.reset();
			// This can cause an infinite loop...
			//app.connectToDevice(device);
		});
};

/*
 * Dump all information on named device to the console
*/ 
app.readServices = function(device)
{
	//read all services
	device.readServices(
		null,
		// Function that prints out service data.
		function(winCode)
		{
			console.log("ReadServices Sucess");
		},
		function(errorCode)
		{
			console.log('Error: Failed to read services: ' + errorCode + '.');
		});
};

/*
 * convert base64 to array to hex.
*/ 
app.getHexData = function(data)
{
	if(data){ // sanity check
		return evothings.util.typedArrayToHexString(evothings.util.base64DecToArr(data))	
	}
}

/*
 * Toggle the LED on / off
*/
app.toggle = function()
{	
	// console.log(GDevice.__services[2].__characteristics[0]['uuid'])
	GDevice.readCharacteristic( 
		"0000a001-0000-1000-8000-00805f9b34fb",
		function(win){
			var view = new Uint8Array(win)
			var led = new Uint8Array(1)
			if(view[0] == ledON){
				$('#toggle').removeClass('green')
				$('#toggle').addClass('red')
				led[0] = ledOFF;
			}
			else if (view[0] == ledOFF){
				$('#toggle').removeClass('red')
				$('#toggle').addClass('green')
				led[0] = ledON;
			}
			GDevice.writeCharacteristic(
				'0000a002-0000-1000-8000-00805f9b34fb',
				led,
				function(win){console.log("led toggled successfully!")},
				function(fail){console.log("led toggle failed: "+fail)})
			
		},
		function(fail){
			console.log("read char fail: "+fail);
			}
		);
}

// Initialize the app.
app.initialize();
