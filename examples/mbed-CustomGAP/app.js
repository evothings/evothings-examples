// JavaScript code for the mbed ble scan app

// Short name for EasyBLE library.
var easyble = evothings.easyble;

// Name of device to connect to
var DeviceName = "ChangeMe!!"

// Object that holds application data and functions.
var app = {};

// list of scanned devices
deviceList = {}

// Initialise the application.
app.initialize = function()
{
	document.addEventListener(
		'deviceready',
		function() { evothings.scriptsLoaded(app.onDeviceReady()) },
		false);
};

// when low level initialization complete, 
// this function is called
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

// print debug info to console and application
app.showInfo = function(info)
{
	document.getElementById('info').innerHTML = info;
	console.log(info);
};

// Scan all devices and report
app.startScan = function()
{
	easyble.startScan(
		function(device)
		{
			// do not show un-named beacons
			if(!device.name){return 0;}
			console.log("\n\r\tDevice Found!")
			console.log(device.name.toString() +" : "+device.address.toString().split(":").join(''))
			

			// add found device to device list
			// see documentation here http://evothings.com/doc/raw/plugins/com.evothings.ble/com.evothings.module_ble.html
			var element = $(
			'<li style="font-size: 50%" onclick="app.connectToDevice()">'
			+		'<strong>Address: '+device.address  +'</strong><br />'
			+		'RSSI: '+device.rssi+"dB"	+'<br />'
			+		'Name: '+device.name 		+'<br />'
			+		'ServiceUUID: '+device.advertisementData.kCBAdvDataServiceUUIDs +'<br />'
			+		'Manufacturer Data Hex  : '+app.getHexData(device.advertisementData.kCBAdvDataManufacturerData)+'<br />'
			+		'Manufacturer Data ASCII: '+app.hextostring(app.getHexData(device.advertisementData.kCBAdvDataManufacturerData))+'<br />'
			+'	</li>'
			);
			$('#found-devices').append(element);
		},
		function(errorCode)
		{
			app.showInfo('Error: startScan: ' + errorCode + '.');
			//app.reset();
		});
};

// convert hex to ASCII strings
app.hextostring = function(d){
    if(d){ // do not parse undefined data
    	var r = '';
    	$.each(('' + d).match(/../g), function(){
    	    r += String.fromCharCode('0x' + this)
    	});
    	return r
    }
}

// convert base64 to array to hex.
app.getHexData = function(data)
{
	if(data){ // sanity check
		return evothings.util.typedArrayToHexString(evothings.util.base64DecToArr(data))	
	}
}

// Initialize the app.
app.initialize();
