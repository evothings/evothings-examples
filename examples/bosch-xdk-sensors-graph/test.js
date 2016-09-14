/*
 Description:
 JavaScript code for the mbed GATT Web Bluetooth example app.
 Credits:
 ARM mbed [-_-]~
 http://mbed.org
 */

// Using closure to avoid global name space conflicts.
;(() =>
{
    'use strict';

/**
 * Application object that exposes global functions.
 */
window.app = {};

/**
 * Name of device to connect to.
 */
var deviceName = 'ChangeMe!!'

/**
 * LED defines (inverted).
 */
var ledOFF = 1;
var ledON  = 0;

/**
 * The BLE GATT server.
 */
var gattServer = null;

/**
 * BLE UUIDs.
 */
var ledServiceUUID = '0000a000-0000-1000-8000-00805f9b34fb';
var ledReadCharacteristicUUID = '0000a001-0000-1000-8000-00805f9b34fb';
var ledWriteCharacteristicUUID = '0000a002-0000-1000-8000-00805f9b34fb';

/**
 * BLE Objects.
 */
var ledService = null;
var ledReadCharacteristic = null;
var ledWriteCharacteristic = null;

/**
 * Initialise the application.
 */
function initialize()
{
    document.addEventListener(
        'deviceready',
        onDeviceReady,
        false);
}

/**
 * When low level initialization is complete, this function is called.
 */
function onDeviceReady()
{
    // Report status.
    showInfo('Enter BLE device name and tap Connect');

    // Show the saved device name, if any.
    var name = localStorage.getItem('deviceName');
    if (name)
    {
        deviceName = name;
    }
    $('#deviceName').val(deviceName);
}

/**
 * Print debug info to console and application UI.
 */
function showInfo(info)
{
    document.getElementById('info').innerHTML = info;
    console.log(info);
}

/**
 * Scan for device and connect.
 */
function connect()
{
    // Disconnect if connected.
    if (gattServer && gattServer.connected)
    {
        gattServer.disconnect();
        gattServer = null;
    }

    showInfo('Status: Scanning...');

    // Find and connect to device and get characteristics for LED read/write.
    bleat.requestDevice({
        filters:[{ name: deviceName }]
    })
        .then(device => {
        showInfo('Status: Found device: ' + device.name);
    // Connect to device.
    return device.gatt.connect();
})
.then(server => {
    showInfo('Status: Connected');
    // Save gatt server.
    gattServer = server;
    // Get LED service.
    return gattServer.getPrimaryService(ledServiceUUID);
})
.then(service => {
    // Save LED service.
    ledService = service
    // Get LED read characteristic.
    return ledService.getCharacteristic(ledReadCharacteristicUUID);
})
.then(characteristic => {
    // Save LED read characteristic.
    ledReadCharacteristic = characteristic
    // Get LED write characteristic.
    return ledService.getCharacteristic(ledWriteCharacteristicUUID);
})
.then(characteristic => {
    showInfo('Status: Ready');
    // Save LED write characteristic.
    ledWriteCharacteristic = characteristic
})
.catch(error => {
    showInfo(error);
});
};

/**
 *  Connect to device. Called from the UI.
 */
app.onConnectButton = function()
{
    // Get device name from text field.
    deviceName = $('#deviceName').val();

    // Save it for next time we use the app.
    localStorage.setItem('deviceName', deviceName);

    // Connect to device.
    connect();
};

/**
 * Toggle the LED on/off. Called from the UI.
 */
app.onToggleButton = function()
{
    // Must have read && write characteristics.
    if (ledReadCharacteristic && ledWriteCharacteristic)
    {
        // Read LED status from the device.
        ledReadCharacteristic.readValue().then(data => {

            // Toggle status.
            var ledStatus = data.getUint8(0);
        if (ledStatus == ledON)
        {
            showInfo('Status: LED OFF');
            $('#toggleButton').removeClass('green');
            $('#toggleButton').addClass('red');
            ledStatus = ledOFF;
        }
        else if (ledStatus == ledOFF)
        {
            showInfo('Status: LED ON');
            $('#toggleButton').removeClass('red');
            $('#toggleButton').addClass('green');
            ledStatus = ledON;
        }

        // Write new LED status to device.
        ledWriteCharacteristic.writeValue(new Uint8Array([ledStatus]));
    });
    }
}

// Initialize the app.
initialize();

})();