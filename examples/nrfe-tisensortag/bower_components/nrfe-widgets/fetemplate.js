
	var fn = function (def, parent)
	{
		var node = document.createElement('div');
		//node.innerHTML = "fooz";
		def.in = function(msg)
		{
			if(msg && msg.payload)
			{
				console.log('template got message');
				//console.dir(JSON.stringify(msg.payload));
				dump(msg.payload);
				//console.log('template is '+def.template);
				node.innerHTML = Mustache.render(def.template, msg.payload)
			}
		};
		console.log('---- creating template '+def.name);
		console.dir(node);
		return node;
	};
	module.exports = fn;