// App object holding the global functions and variables
var app = {};

// XDK name and UUIDs for BLE connection
app.XDK = {};
app.XDK.name                    = 'XDK_DEMO';
app.XDK.serviceUUID             = '00005301-0000-0041-4C50-574953450000';
app.XDK.readCharacteristicUUID  = '00005302-0000-0041-4C50-574953450000';
app.XDK.writeCharacteristicUUID = '00005303-0000-0041-4C50-574953450000';

// Objects holding the data received from the XDK sensor
app.XDK.accelRaw = {x: 0, y: 0, z: 0};
app.XDK.accel    = {x: 0, y: 0, z: 0};
app.XDK.gyroRaw  = {x: 0, y: 0, z: 0};
app.XDK.gyro     = {x: 0, y: 0, z: 0};
app.XDK.magRaw   = {x: 0, y: 0, z: 0};
app.XDK.mag      = {x: 0, y: 0, z: 0};
app.XDK.envRaw   = {p: 0, t: 0, h: 0};
app.XDK.env      = {p: 0, t: 0, h: 0};
app.XDK.lightRaw = {value: 0};
app.XDK.light    = {value: 0};

// Information about each sensor, used for showing the lines in the graph
app.selectedData = {
    rawAccX:    {sensor: 'accelRaw', data: 'x',     color: 'red',      thickness: 1},
    rawAccY:    {sensor: 'accelRaw', data: 'y',     color: 'purple',   thickness: 1},
    rawAccZ:    {sensor: 'accelRaw', data: 'z',     color: 'fuchsia',  thickness: 1},
    normAccX:   {sensor: 'accel',    data: 'x',     color: 'red',      thickness: 3},
    normAccY:   {sensor: 'accel',    data: 'y',     color: 'purple',   thickness: 3},
    normAccZ:   {sensor: 'accel',    data: 'z',     color: 'fuchsia',  thickness: 3},

    rawGyroX:   {sensor: 'gyroRaw',  data: 'x',     color: 'blue',     thickness: 1},
    rawGyroY:   {sensor: 'gyroRaw',  data: 'y',     color: 'DarkCyan', thickness: 1},
    rawGyroZ:   {sensor: 'gyroRaw',  data: 'z',     color: 'aqua',     thickness: 1},
    normGyroX:  {sensor: 'gyro',     data: 'x',     color: 'blue',     thickness: 3},
    normGyroY:  {sensor: 'gyro',     data: 'y',     color: 'DarkCyan', thickness: 3},
    normGyroZ:  {sensor: 'gyro',     data: 'z',     color: 'aqua',     thickness: 3},

    rawMagX:    {sensor: 'magRaw',   data: 'x',     color: 'green',    thickness: 1},
    rawMagY:    {sensor: 'magRaw',   data: 'y',     color: 'olive',    thickness: 1},
    rawMagZ:    {sensor: 'magRaw',   data: 'z',     color: 'lime',     thickness: 1},
    normMagX:   {sensor: 'mag',      data: 'x',     color: 'green',    thickness: 3},
    normMagY:   {sensor: 'mag',      data: 'y',     color: 'olive',    thickness: 3},
    normMagZ:   {sensor: 'mag',      data: 'z',     color: 'lime',     thickness: 3},

    rawEnvP:    {sensor: 'envRaw',   data: 'p',     color: 'brown',    thickness: 1},
    rawEnvT:    {sensor: 'envRaw',   data: 't',     color: 'orange',   thickness: 1},
    rawEnvH:    {sensor: 'envRaw',   data: 'h',     color: 'yellow',   thickness: 1},
    normEnvP:   {sensor: 'env',      data: 'p',     color: 'brown',    thickness: 3},
    normEnvT:   {sensor: 'env',      data: 't',     color: 'orange',   thickness: 3},
    normEnvH:   {sensor: 'env',      data: 'h',     color: 'yellow',   thickness: 3},

    rawLightX:  {sensor: 'lightRaw', data: 'value', color: 'silver',   thickness: 1},
    normLightX: {sensor: 'light',    data: 'value', color: 'silver',   thickness: 3}
};
// Calling the function on start in case the phone is already in landscape mode
toggleGraph();

// Calling the function each time the window is resized, eg. phone rotation
window.addEventListener('resize', function () {
    setTimeout(toggleGraph, 50);
});


/*
 Variable that holds the 'setInterval' of the 'appendData' function, makes it possible to clear the 'setInterval'
 when the phone is rotated back to portrait mode
 */
var intervalAppend;

// Object holding the timelines to be added to the graph
var line = {};

/*
 * Called when the window is resized, eg. when the phone is rotated
 * Portrait mode : shows the table where the data to be shown in the graph can be selected
 * Landscape mode : shows the graph with the selected data and a color legend
 */
function toggleGraph() {
    if (Math.abs(window.orientation) === 90) { // If the phone is in landscape mode
        document.getElementById('colorInstructions').innerHTML = ''; // Empty the color legend

        // Display the the 'graphContainer' div which overlaps the rest
        var graphContainer = document.getElementById('graphContainer');
        graphContainer.style.display = 'flex';

        // Create the time series according to the selected data
        for (var key in app.selectedData) {
            if (document.getElementById(key).checked == true) {
                console.log(key + " is checked, adding timeline");
                line[key] = new TimeSeries();
            }
        }

        // Append sensor data every second
        intervalAppend = setInterval(appendData, 1000);

        // Add the time series to the graph
        for (var key in line) {
            app.smoothie.addTimeSeries(line[key], {
                strokeStyle: app.selectedData[key].color,
                lineWidth: app.selectedData[key].thickness
            });
            // Add a color legend for each line
            app.addColorInstruction(key, app.selectedData[key].color);
        }

        // Appending sensor data to the time series
        function appendData() {
            for (var key in line) {
                console.log("Appending " + app.XDK[app.selectedData[key].sensor][app.selectedData[key].data] + " to line " + key);
                line[key].append(new Date().getTime(), app.XDK[app.selectedData[key].sensor][app.selectedData[key].data]);
            }
            app.smoothie.updateValueRange(); // Updating the scale for a dynamic display
        }
    }
    else { // If the phone is in portrait mode
        clearInterval(intervalAppend); // Stop the 'setInterval' of the 'appendData' function
        document.getElementById('graphContainer').style.display = 'none'; // Hide the 'graphContainer' div

        // Removing the time series from the chart
        if (app.smoothie) {
            for (var key in line) {
                app.smoothie.removeTimeSeries(line[key]);
            }
        }

        line = {}; // Emptying the object holding the time series
    }
}

/*
 Called when the user clicks on a cell to select data
 * Toggles the value of the invisible checkBox contained in the cell
 * Calls the toggleColor function
 */
function toggleCheckbox(cell) {
    cell.children[0].checked = !cell.children[0].checked;
    toggleColor(cell.children[0]);
}

/*
 Called when the user clicks on a cell to select data
 * Changes the color of the cell to the color of the corresponding time series when the invisible checkBox is checked
 * Changes the color of the cell back to white when the checkBox is unchecked
 */
function toggleColor(checkbox) {
    if (checkbox.checked) {
        checkbox.parentNode.style.background = app.selectedData[checkbox.id].color;
    } else {
        checkbox.parentNode.style.background = 'white';
    }
}

app.addColorInstruction = function (sensor, color) {
    var element =
        '<div class="colorInstruction">' +
        '<div style="background:' + color + '" class="colorBox"></div>' +
        '<span class="sensorId">' + sensor + '</span>' +
        '</div>';
    var colorInstructions = document.getElementById('colorInstructions');
    colorInstructions.innerHTML = colorInstructions.innerHTML + element;
};

app.setStatus = function (status) {
    console.log(status);
    document.getElementById('status').innerHTML = status;
};

app.connect = function () {
    app.setStatus("Starting scan");
    evothings.easyble.startScan(
        function (device) {
            if (device.name == app.XDK.name) {
                evothings.easyble.stopScan();
                app.XDK.device = device;
                app.setStatus("XDK device found");

                app.XDK.device.connect(
                    function () {
                        app.setStatus("Connected to " + app.XDK.device.name);
                        document.getElementById('connect').style.display = 'none';
                        document.getElementById('disconnect').style.display = 'block';

                        app.XDK.device.readServices(
                            [app.XDK.serviceUUID],
                            function () {
                                app.setStatus("BLE services available for " + app.XDK.name);

                                app.XDK.device.writeDescriptor(
                                    app.XDK.writeCharacteristicUUID,
                                    '00002902-0000-1000-8000-00805f9b34fb',
                                    new Uint8Array([1]),
                                    function () {
                                        app.setStatus("BLE descriptor written");
                                        document.getElementById('start').style.display = 'block';

                                        app.XDK.device.enableNotification(
                                            app.XDK.writeCharacteristicUUID,
                                            function (data) {
                                                app.saveSensorData(evothings.ble.fromUtf8(data));
                                            },
                                            function (error) {
                                                app.setStatus("BLE notification error: " + error);
                                            }
                                        )
                                    },
                                    function (error) {
                                        app.setStatus("BLE descriptor error: " + error)
                                    }
                                )
                            },
                            function (error) {
                                app.setStatus("BLE services error: " + error);
                            }
                        )
                    },
                    function (error) {
                        app.setStatus("Failed to connect:" + error);
                    }
                )
            }
        },
        function (error) {
            app.setStatus('Error while scanning: ' + error);
        }
    )
};

app.disconnect = function () {
    evothings.easyble.closeConnectedDevices();
    app.setStatus("Disconnected from all devices");
    document.getElementById('start').style.display = 'none';
    document.getElementById('disconnect').style.display = 'none';
    document.getElementById('connect').style.display = 'block';
};

app.start = function () {
    /*
     Setting the right dimension for the canvas
     * The width is equal to the screen width, or height if the phone is in landscape mode
     * The height is equal to the screen height, or width if the phone is in landscape mode
     IMPORTANT : Set the canvas size before streaming the Smoothie chart to it
     */
    var graphCanvas = document.getElementById('graphCanvas');
    graphCanvas.width = (screen.height > screen.width) ? 0.99 * screen.height : 0.99 * screen.width;
    graphCanvas.height = (screen.height < screen.width) ? 0.4 * screen.height : 0.4 * screen.width;

    // Creating the Smoothie object and starting streaming to the canvas
    app.smoothie = new SmoothieChart();
    app.smoothie.streamTo(graphCanvas, 1000);

    if (app.XDK.device) {
        app.XDK.device.writeCharacteristic(
            app.XDK.readCharacteristicUUID,
            evothings.ble.toUtf8("start"),
            function () {
                app.setStatus("Sent start command");
                document.getElementById('disconnect').style.display = 'none';
                document.getElementById('start').style.display = 'none';
                document.getElementById('stop').style.display = 'block';
            },
            function (error) {
                app.setStatus("Start command error: " + error);
            }
        )
    }
};

app.stop = function () {
    if (app.XDK.device) {
        app.XDK.device.writeCharacteristic(
            app.XDK.readCharacteristicUUID,
            evothings.ble.toUtf8("end"),
            function () {
                app.setStatus("Sent stop command");
                document.getElementById('disconnect').style.display = 'block';
                document.getElementById('start').style.display = 'block';
                document.getElementById('stop').style.display = 'none';
            },
            function (error) {
                app.setStatus("Stop command error: " + error);
            }
        )
    }
};

app.saveSensorData = function (data) {
    //console.log("Received: " + data);
    var sensor = data.substring(0, data.indexOf('='));
    if (sensor == 'lr' || sensor == 'l') {
        var value = parseInt(data.substring(data.indexOf('=') + 1));
    } else if (sensor == 'er' || sensor == 'e') {
        var sensorP = parseInt(data.substring(data.indexOf('p') + 1, data.indexOf('t')));
        var sensorT = parseInt(data.substring(data.indexOf('t') + 1, data.indexOf('h')));
        var sensorH = parseInt(data.substring(data.indexOf('h') + 1));
    } else {
        var sensorX = parseInt(data.substring(data.indexOf('x') + 1, data.indexOf('y')));
        var sensorY = parseInt(data.substring(data.indexOf('y') + 1, data.indexOf('z')));
        var sensorZ = parseInt(data.substring(data.indexOf('z') + 1));
    }
    switch (sensor) {
        case 'X':
        case 'T':
        case '':
            break;
        case 'ar':
            app.XDK.accelRaw = {x: sensorX, y: sensorY, z: sensorZ};
            break;
        case 'a':
            app.XDK.accel = {x: sensorX, y: sensorY, z: sensorZ};
            break;
        case 'gr':
            app.XDK.gyroRaw = {x: sensorX, y: sensorY, z: sensorZ};
            break;
        case 'g':
            app.XDK.gyro = {x: sensorX, y: sensorY, z: sensorZ};
            break;
        case 'mr':
            app.XDK.magRaw = {x: sensorX, y: sensorY, z: sensorZ};
            break;
        case 'm':
            app.XDK.mag = {x: sensorX, y: sensorY, z: sensorZ};
            break;
        case 'er':
            app.XDK.envRaw = {p: sensorP, t: sensorT, h: sensorH};
            break;
        case 'e':
            app.XDK.env = {p: sensorP, t: sensorT, h: sensorH};
            break;
        case 'lr':
            app.XDK.lightRaw.value = value;
            break;
        case 'l':
            app.XDK.light.value = value;
            break;
        default:
            app.setStatus("Error while parsing sensor data");
    }
};
