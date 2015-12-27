
	var fn = function (def, parent)
	{
		def.in = function(msg)
		{
			var deviceHandle = msg.payload.device;
			if(evothings && evothings.ble && deviceHandle)
			{
					console.log('connected, requesting services...');
					evothings.ble.services(
						deviceHandle,
						function(services)
						{
							console.log('got services')
							services.forEach(function(service)
							{
								service.device = deviceHandle
							})
							def.out({payload:{services: services}})
						})
			}
		};
	};
	module.exports = fn;