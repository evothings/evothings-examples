var fn = function (def, parent)
{
  console.log('ble characteristics instantiated');
  def.in = function(msg)
  {
    var deviceHandle = msg.payload.device
    var serviceHandle = msg.payload.handle
    console.log('ble characteristics device = '+deviceHandle+', service = '+serviceHandle)
    if(deviceHandle && serviceHandle && evothings && evothings.ble)
    {
      evothings.ble.characteristics(
        deviceHandle,
        serviceHandle,
        function(characteristics)
        {
          characteristics.forEach(function(ch)
          {
            ch.device = deviceHandle
            ch.service = serviceHandle
          })
          def.out({payload: {characteristics: characteristics}})
        })
    }
  };
};
module.exports = fn;