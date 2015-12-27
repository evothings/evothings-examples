var fn = function (def, parent)
{
  def.in = function(msg)
  {
    var deviceHandle = msg.payload.device
    var characteristicHandle = msg.payload.characteristic
    var rv = undefined
    if(deviceHandle && characteristicHandle && evothings && evothings.ble)
    {
      evothings.ble.descriptors(
        deviceHandle,
        characteristicHandle,
        function(descriptors)
        {
          def.out({payload: descriptors})
        })
    }
  };
};
module.exports = fn;