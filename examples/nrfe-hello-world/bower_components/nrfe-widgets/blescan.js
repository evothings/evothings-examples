
	var fn = function (def, parent)
	{
		def.in = function(msg)
		{
			if(def.scanning && evothings && evothings.ble)
			{
				console.log('stopping scanning')
				evothings.ble.stopScan();
				def.scanning = false;
			}
			else if (evothings && evothings.ble)
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
	module.exports = fn;