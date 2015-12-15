
	var fn = function (def, parent)
	{
		var onSuccess = function(position)
		{
			def.out({payload:position})
		};
		var onError = function(error)
		{
			def.out({error:error});
		};
		def.in = function(msg)
		{
			navigator.geolocation.getCurrentPosition(onSuccess, onError);
		}
	};
	module.exports = fn;