// JavaScript code for the BLE Peripheral example app.

var base64 = cordova.require('cordova/base64');

// Application object.
var app = {};

// Device list.
app.devices = {};

// UI methods.
app.ui = {};

app.initialize = function()
{
	document.addEventListener('deviceready', this.onDeviceReady, false);
}

app.onDeviceReady = function()
{
	app.startServer();
	app.startAdvert();
}

app.startServer = function()
{
	var settings = {
		onConnectionStateChange:function(deviceHandle, connected) {
			console.log("device "+deviceHandle+" "+(connected?"":"dis")+"connected");
		},
		services:[
			{
				// matching advert data.
				uuid:"7d444841-9dc0-11d1-b245-5ffdce74fad2",
				type:0,
				characteristics:[
					{
						// random uuid.
						uuid:"00000001-9dc0-11d1-b245-5ffdce74fad2",
						handle:1,
						permissions:1|16,
						properties:2|8|16,
						writeType:2,
						onReadRequest:function(deviceHandle, requestId) {
							evothings.ble.sendResponse(deviceHandle, requestId, new Uint8Array([6,7,8,9,0]), function() {
								console.log("cr1 success");
							}, function(err) {
								console.log("cr1 fail: "+err);
							});
						},
						onWriteRequest:function(deviceHandle, requestId, data) {
							console.log("cw1:"+evothings.util.typedArrayToHexString(data));
							evothings.ble.sendResponse(deviceHandle, requestId, null, function() {
								console.log("cw1 success");
							}, function(err) {
								console.log("cw1 fail: "+err);
							});
						},
						descriptors:[
							// notification control.
							(function() {
								var value = new Uint8Array([0,0]);
								return {
									uuid:'00002902-0000-1000-8000-00805f9b34fb',
									permissions:1|16,
									onReadRequest:function(deviceHandle, requestId) {
										evothings.ble.sendResponse(deviceHandle, requestId, value, function() {
											console.log("dr1 success");
										}, function(err) {
											console.log("dr1 fail: "+err);
										});
									},
									onWriteRequest:function(deviceHandle, requestId, data) {
										console.log("dw1:"+evothings.util.typedArrayToHexString(data));
										value = data;
										evothings.ble.sendResponse(deviceHandle, requestId, null, function() {
											console.log("dw1 success");
										}, function(err) {
											console.log("dw1 fail: "+err);
										});
									},
								}
							})(),
						],	//descriptors
					},
				],	//characteristics
			},
		],	//services
	};

	evothings.ble.stopGattServer(function() {
		console.log("GATT server already started!?!");
	}, function(err) {
		console.log(err+", as expected");
		evothings.ble.startGattServer(settings, function() {
			console.log("GATT server started successfully.");
		}, function(err) {
			console.log("GATT server start error: "+err);
		});
	});
}

app.startAdvert = function()
{
	app.stopAdvert();

	var data = {
		includeDeviceName:true,
		//includeTxPowerLevel:true,
		//serviceUUIDs:["00001234-0000-1000-8000-00805f9b34fb", "5678abcd-0000-1000-8000-00805f9b34fb"],
		serviceUUIDs:["7d444841-9dc0-11d1-b245-5ffdce74fad2"],
		//serviceData:{"7d444841-9dc0-11d1-b245-5ffdce74fad2":base64.fromArrayBuffer(new Uint8Array([6,7,8,9,0]))},
		//manufacturerData:{"42":base64.fromArrayBuffer(new Uint8Array([1,2,3,4,5]))},
	};

	var scanRespData = {
		//includeDeviceName:false,
		//includeTxPowerLevel:true,
		serviceUUIDs:["ffffffff-0000-1000-8000-00805f9b34fb"],
		//serviceData:{"7d444841-9dc0-11d1-b245-5ffdce74fad2":base64.fromArrayBuffer(new Uint8Array([6,7,8,9,0]))},
		serviceData:{"abcdef12-0000-1000-8000-00805f9b34fb":base64.fromArrayBuffer(new Uint8Array([6,7,8,9,0]))},
		//manufacturerData:{"42":base64.fromArrayBuffer(new Uint8Array([1,2,3,4,5]))},
	};

	var settings = {
		advertiseMode:"ADVERTISE_MODE_BALANCED",
		//connectable:false,
		//timeoutMillis:0,
		txPowerLevel:"ADVERTISE_TX_POWER_HIGH",
		broadcastData:data,
		scanResponseData:scanRespData,
	};

	evothings.ble.startAdvertise(settings,
		function()
		{
			console.log("Advertise started.");
		},
		function(errorCode)
		{
			console.log("startAdvertise failed: "+errorCode);
		}
	);
}

// Stop scanning for devices.
app.stopAdvert = function()
{
	evothings.ble.stopAdvertise();
}

app.initialize();
