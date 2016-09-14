var app = {};

app.XDK = {};
app.XDK.name = 'XDK_DEMO';
app.XDK.serviceUUID_1 = '00005301-0000-0041-4C50-574953450000';
app.XDK.serviceUUID_2 = '00005302-0000-0041-4C50-574953450000';
app.XDK.serviceUUID_3 = '00005303-0000-0041-4C50-574953450000';

app.XDK.accelRaw = {x: 0, y: 0, z: 0};
app.XDK.accel    = {x: 0, y: 0, z: 0};
app.XDK.gyroRaw  = {x: 0, y: 0, z: 0};
app.XDK.gyro     = {x: 0, y: 0, z: 0};
app.XDK.magRaw   = {x: 0, y: 0, z: 0};
app.XDK.mag      = {x: 0, y: 0, z: 0};
app.XDK.envRaw   = {p: 0, t: 0, h: 0};
app.XDK.env      = {p: 0, t: 0, h: 0};
app.XDK.lightRaw = 0;
app.XDK.light    = 0;

app.accelRawDataBox = document.getElementById('accelerometerRaw');
app.accelDataBox = document.getElementById('accelerometer');

app.gyroRawDataBox = document.getElementById('gyroscopeRaw');
app.gyroDataBox = document.getElementById('gyroscope');

app.magRawDataBox = document.getElementById('magnetometerRaw');
app.magDataBox = document.getElementById('magnetometer');

app.envRawDataBox = document.getElementById('environmentalRaw');
app.envDataBox = document.getElementById('environmental');

app.lightRawDataBox = document.getElementById('lightRaw');
app.lightDataBox = document.getElementById('light');

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
                            [app.XDK.serviceUUID_1],
                            function () {
                                app.setStatus("BLE services available for " + app.XDK.name);

                                app.XDK.device.writeDescriptor(
                                    app.XDK.serviceUUID_3,
                                    '00002902-0000-1000-8000-00805f9b34fb',
                                    new Uint8Array([1]),
                                    function () {
                                        app.setStatus("BLE descriptor written");
                                        document.getElementById('start').style.display = 'block';

                                        app.XDK.device.enableNotification(
                                            app.XDK.serviceUUID_3,
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
    if (app.XDK.device) {
        app.XDK.device.writeCharacteristic(
            app.XDK.serviceUUID_2,
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
            app.XDK.serviceUUID_2,
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
            app.accelRawDataBox.innerHTML = "X = " + sensorX + " Y = " + sensorY + " Z = " + sensorZ;
            break;
        case 'a':
            app.XDK.accel = {x: sensorX, y: sensorY, z: sensorZ};
            app.accelDataBox.innerHTML = "X = " + sensorX + " Y = " + sensorY + " Z = " + sensorZ;
            break;
        case 'gr':
            app.XDK.gyroRaw = {x: sensorX, y: sensorY, z: sensorZ};
            app.gyroRawDataBox.innerHTML = "X = " + sensorX + " Y = " + sensorY + " Z = " + sensorZ;
            break;
        case 'g':
            app.XDK.gyro = {x: sensorX, y: sensorY, z: sensorZ};
            app.gyroDataBox.innerHTML = "X = " + sensorX + " Y = " + sensorY + " Z = " + sensorZ;
            break;
        case 'mr':
            app.XDK.magRaw = {x: sensorX, y: sensorY, z: sensorZ};
            app.magRawDataBox.innerHTML = "X = " + sensorX + " Y = " + sensorY + " Z = " + sensorZ;
            break;
        case 'm':
            app.XDK.mag = {x: sensorX, y: sensorY, z: sensorZ};
            app.magDataBox.innerHTML = "X = " + sensorX + " Y = " + sensorY + " Z = " + sensorZ;
            break;
        case 'er':
            app.XDK.envRaw = {p: sensorP, t: sensorT, h: sensorH};
            app.envRawDataBox.innerHTML = "P = " + sensorP + " T = " + sensorT + " H = " + sensorH;
            break;
        case 'e':
            app.XDK.env = {p: sensorP, t: sensorT, h: sensorH};
            app.envDataBox.innerHTML = "P = " + sensorP + " T = " + sensorT + " H = " + sensorH;
            break;
        case 'lr':
            app.XDK.lightRaw = value;
            app.lightRawDataBox.innerHTML = value;
            break;
        case 'l':
            app.XDK.light = value;
            app.lightDataBox.innerHTML = value;
            break;
        default:
            app.setStatus("Error while parsing sensor data");
    }
};
