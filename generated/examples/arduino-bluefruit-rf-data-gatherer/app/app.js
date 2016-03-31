var app = {}; // Object holding the functions and variables

var BluefruitUART = {}; // Object holding the BLE device

var BLEDevice = {}; // Object holding Bluefruit BLE device information

BLEDevice.name = 'Adafruit Bluefruit LE'; // Bluefruit name
BLEDevice.services = ['6e400001-b5a3-f393-e0a9-e50e24dcca9e']; // Bluefruit services UUID
BLEDevice.writeCharacteristicUUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'; // Bluefruit writeCharacteristic UUID
BLEDevice.readCharacteristicUUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'; // Bluefruit readCharacteristic UUID

app.values = []; // For storing received values
app.message = ""; // For storing received data
app.nbRooms = 3; // Total number of rooms
app.msgLength = 4 * app.nbRooms + 1; // Length of message received from transmitter Arduino

function main() { // Main function called when the device is ready

    var connect = document.getElementById('connect');
    connect.addEventListener('click', function()
        {
            connect.innerHTML = 'Connecting';
            app.connectToBluefruit(function() // Connect to Bluefruit device
                {
                    app.readServices(function() // Read services from Bluefruit device
                        {
                            app.enableNotifications(app.sendLimits); // Enable notifications from Bluefruit device and send stored limits
                            $('#connect').hide();
                            $('#disconnect').show();
                            connect.innerHTML = 'Connect';
                        }
                    );
                }
            );
        }
    );

    var disconnect = document.getElementById('disconnect');
    disconnect.addEventListener('click', function()
        {
            app.disconnect(); // Disconnect from Bluefruit device
            $('#roomList').empty();
            $('#disconnect').hide();
            $('#connect').show();
        }
    );
}

document.addEventListener('deviceready', main, false); // Wait for the device to be ready before executing code

/* ------------------------------------------------------------
 Functions
 ------------------------------------------------------------ */

app.connectToBluefruit = function(callback) // Connect to Bluefruit device
{
    evothings.easyble.startScan // Start scanning
    (
        function(device)
        {
            if (device.name == BLEDevice.name) // If device name correspond to Bluefruit device name
            {
                evothings.easyble.stopScan(); // Stop the scan
                BluefruitUART = device; // Store the Bluefruit device

                console.log('Adafruit Bluefruit LE UART found !');

                BluefruitUART.connect // Connect to Bluefruit device
                (
                    function(device)
                    {
                        console.log('Connected to BLE device ' + BluefruitUART.name);
                        callback();
                    },
                    function(errorCode)
                    {
                        console.log('Failed to connect to BLE device: ' + errorCode);
                    }
                )
            }
        },
        function(errorString)
        {
            console.log('Error while scanning: ' + errorString);
        }
    );
};

app.disconnect = function() // Disconnect from Bluefruit device
{
    BluefruitUART.close();
    console.log('Disconnected from BLE device ' + BluefruitUART.name);
};

app.readServices = function(callback) // Read services from Bluefruit device
{
    BluefruitUART.readServices
    (
        BLEDevice.services,
        function(device)
        {
            console.log('BLE services available for device ' + BluefruitUART.name);
            callback();
        },
        function(errorString)
        {
            console.log('BLE services error: ' + errorString);
        }
    )
};

app.sendMessage = function(message) // Send a message to Bluefruit device
{
    var data = evothings.ble.toUtf8(message);
    BluefruitUART.writeCharacteristic
    (
        BLEDevice.writeCharacteristicUUID,
        data,
        function()
        {
            console.log('Sent: ' + message);
        },
        function(errorString)
        {
            console.log('BLE writeCharacteristic error: ' + errorString);
        }
    )
};

app.enableNotifications = function() // Enable notifications for Bluefruit device
{
    BluefruitUART.writeDescriptor // Write descriptor for Bluefruit device
    (
        BLEDevice.readCharacteristicUUID,
        '00002902-0000-1000-8000-00805f9b34fb', // Same for every BLE device
        new Uint8Array([1]),
        function()
        {
            console.log('BLE descriptor written.');
        },
        function(errorString)
        {
            console.log('BLE writeDescriptor error: ' + errorString);
        }
    );

    BluefruitUART.enableNotification // Enable notifications for Bluefruit device
    (
        BLEDevice.readCharacteristicUUID,
        function(data)
        {
            var message = evothings.ble.fromUtf8(data); // Message received from transmitter Arduino

            /*
             This part handles the parsing of the received message (message). It will then be stored in (app.message).
             Due to the way Bluetooth works, the message will sometimes be sent in two parts, therefore I wrote a code that
             will concatenate the two parts if it happens.
             */

            // If for some reason the stored message is longer than the max length (app.msgLength), empty it
            if (app.message.length > app.msgLength)
            {
                app.message = "";
            }

            // If both the message and the stored message are shorter than expected
            if (app.message.length < app.msgLength && message.length < app.msgLength)
            {
                /*
                 If the received message contains a '#' (message.indexOf('#') != -1), it means that it is the first part
                 of the message, so the stored message has to be empty (app.message.length == 0).
                 If the received message contains a '*' (message.indexOf('*') != -1), it means that it is the second part
                 of the message, so the stored message can't be empty (app.message.length > 0).
                 */
                if ((message.indexOf('#') != -1 && app.message.length == 0) || (message.indexOf('*') != -1 && app.message.length > 0))
                {
                    app.message = app.message.concat(message); // Concatenate the received message to the stored message
                }
            }

            /*
             If the received message is as long as it should be (message.length == app.msgLength), it starts with a '#'
             (message.indexOf('#') == 0) and ends with a '*' (message.indexOf('*') == app.msgLength - 1), then it is
             complete and can be stored in (app.message)
             */
            else if (message.length == app.msgLength && message.indexOf('#') == 0 && message.indexOf('*') == app.msgLength - 1)
            {
                app.message = message;
            }

            /*
             If the stored message is as long as it should be (app.message.length == app.msgLength), it starts with a '#'
             (app.message.indexOf('#') == 0) and ends with a '*' (app.message.indexOf('*') == app.msgLength - 1),
             then it is complete
             */
            if (app.message.length == app.msgLength && app.message.indexOf('#') == 0 && app.message.indexOf('*') == app.msgLength - 1)
            {
                var end = app.message.indexOf('*'); // Get the position of the last char
                // Create an array (split("/")) from the message and store the values in (app.values)
                app.values = app.message.substring(1, end).split("/");
                app.message = ""; // Empty the message

                console.log('--------------------------------------');
                console.log("Data for room:");
                for (var i = 0; i < app.values.length; i++)
                {
                    app.values[i] = parseInt(app.values[i]); // Convert the values from string to int
                    console.log("   * " + i + " is " + app.values[i]);
                }
            }

            app.fillRoomList(app.setupSlider); // Fill the list with the values that were stored and then configure the slider
        },
        function(errorString)
        {
            console.log('BLE enableNotification error: ' + errorString);
        }
    );

    app.setupSlider = function() // Slide bar configuration
    {
        var slider = document.querySelectorAll('input[type="range"]');
        rangeSlider.create(slider, {
            polyfill: true,     // Boolean, if true, custom markup will be created
            rangeClass: 'rangeSlider',
            disabledClass: 'rangeSlider--disabled',
            fillClass: 'rangeSlider__fill',
            bufferClass: 'rangeSlider__buffer',
            handleClass: 'rangeSlider__handle',
            startEvent: ['mousedown', 'touchstart', 'pointerdown'],
            moveEvent: ['mousemove', 'touchmove', 'pointermove'],
            endEvent: ['mouseup', 'touchend', 'pointerup'],
            min: null,          // Number , 0
            max: null,          // Number, 100
            step: null,         // Number, 1
            value: null,        // Number, center of slider
            buffer: null,       // Number, in percent, 0 by default
            borderRadius: 10,    // Number, if you use buffer + border-radius in css for looks good,
            onInit: function () {
                console.info('onInit')
            },
            onSlideStart: function (position, value) {
            },
            onSlide: function (position) { // When the slide bar is moved
                for (var i = 0; i < app.values.length; i++)
                {
                    var slideBarValue = document.getElementById("slideBar" + i).value;
                    if (slideBarValue == position) // If the value corresponds to the position of one of the slideBars
                    {
                        localStorage.setItem('limit' + i, position); // Store new limit
                    }
                }

                app.sendLimits(); // Send limits to the transmitter Arduino (for lighting up the LEDs)
            },
            onSlideEnd: function (position, value) {
            }
        });
    };

    app.fillRoomList = function(callback) // Fill the list
    {
        var roomList = $('#roomList');
        roomList.empty(); // Empty the list
        if (app.values.length) // If there are some values
        {
            for (var i = 0; i < app.values.length; i++) // For each room
            {
                if (localStorage.getItem('limit' + i) === null) // If the limit hasn't been set yet, set to 100 (lowest)
                {
                    localStorage.setItem('limit' + i, 100);
                }

                var limit = localStorage.getItem('limit' + i); // Limit for the room
                var state; // State of the light
                if (app.values[i] > limit)
                {
                    state = 'on';
                }
                else
                {
                    state = 'off';
                }

                var element = $( // Element to be added in the list
                    '<li>'
                    + '<h1>Room ' + i + '</h1><br />'
                    + 'Light is <strong>' + state + '</strong>'
                    + '<div class="slideBar">'
                    + 'Slide the bar to change the limit<br /><br />'
                    + '<input'
                    + ' id="slideBar' + i + '"'
                    + ' type="range"'
                    + ' min="100"'
                    + ' max="999"'
                    + ' value="' + limit + '"'
                    + ' data-buffer="' + app.values[i]/10 + '"'
                    + 'data-rangeSlider>'
                    + '<br />'
                    + '</div>'
                    + '</li>'
                    + '<br />'
                );

                roomList.append(element); // Append the element
            }
        }
        callback(); // Configure the slider once all the element are added to the list
    };

    app.sendLimits = function() // Send the limits to the transmitter Arduino
    {
        var message = '#'; // Start the message with a '#'
        for (var i = 0; i < app.values.length; i++)
        {
            message = message.concat(localStorage.getItem('limit' + i));
            if (i < app.values.length - 1)
            {
                message = message.concat('/'); // Separate the values with a '/'
            }
        }
        message = message.concat('*'); // End the message with a '*'
        app.sendMessage(message); // Send the message
    }
};