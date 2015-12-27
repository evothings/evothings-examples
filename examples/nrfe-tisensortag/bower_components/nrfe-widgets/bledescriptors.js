var fn = function (def, parent)
{
  def.in = function(msg)
  {
    var deviceHandle = msg.payload.device
    var characteristicHandle = msg.payload.characteristic
    if(deviceHandle && serviceHandle && evothings && evothings.ble)
    {
      evothings.ble.descriptors(
        deviceHandle,
        characteristicHandle,
        function(descriptors)
        {
          def.out({payload: {descriptors:descriptors}})
        })
    }
  };
};
module.exports = fn;