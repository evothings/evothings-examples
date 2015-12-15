define(function()
{
	var fn = function (def, parent)
	{
		def.in = function(msg)
		{
			if(def.scanning)
			{
				console.log('stopping scanning')
				evothings.ble.stopScan();
				def.scanning = false;
			}
			else
			{
				console.log('starting scanning')
				def.scanning = true;
				evothings.ble.startScan(function(r)
				{
					msg.payload = r;
					def.out(msg);
				});
			}
		};
	};
	fn._name = "bluetooth";
	return fn;
});