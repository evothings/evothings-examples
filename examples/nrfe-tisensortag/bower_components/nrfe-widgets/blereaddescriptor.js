var fn = function (def, parent)
{
  def.in = function(msg)
  {
    var deviceHandle = msg.payload.device
    var descriptorHandle = msg.payload.descriptor
    var rv = undefined
    if(deviceHandle && descriptorHandle && evothings && evothings.ble)
    {
      evothings.ble.readDescriptor(
        deviceHandle,
        descriptorHandle,
        function(data)
        {
          def.out({payload: escape(String.fromCharCode.apply(null, new Uint8Array(data)))})
        },
        function(errorCode)
        {
          def.out({payload:{error: errorCode}})
        }
      );
    }
  };
};
module.exports = fn;