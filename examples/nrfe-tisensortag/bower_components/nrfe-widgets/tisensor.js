var app = {}
app.sensortag = {};

app.sensortag.ACCELEROMETER_SERVICE = 'f000aa10-0451-4000-b000-000000000000';
app.sensortag.ACCELEROMETER_DATA = 'f000aa11-0451-4000-b000-000000000000';
app.sensortag.ACCELEROMETER_CONFIG = 'f000aa12-0451-4000-b000-000000000000';
app.sensortag.ACCELEROMETER_PERIOD = 'f000aa13-0451-4000-b000-000000000000';
app.sensortag.ACCELEROMETER_NOTIFICATION = '00002902-0000-1000-8000-00805f9b34fb';

app.sensortag.MAGNETOMETER_SERVICE = 'f000aa30-0451-4000-b000-000000000000';
app.sensortag.MAGNETOMETER_DATA = 'f000aa31-0451-4000-b000-000000000000';
app.sensortag.MAGNETOMETER_CONFIG = 'f000aa32-0451-4000-b000-000000000000';
app.sensortag.MAGNETOMETER_PERIOD = 'f000aa33-0451-4000-b000-000000000000';
app.sensortag.MAGNETOMETER_NOTIFICATION = '00002902-0000-1000-8000-00805f9b34fb';

var fn = function (def, parent)
{
  def.in = function(msg)
  {
    var device = msg.payload
    if(device && evothings && evothings.ble)
    {

    }
  };
};
module.exports = fn;