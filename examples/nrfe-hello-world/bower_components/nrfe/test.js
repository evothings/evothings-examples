// Should be loaded form index.html
console.dir(nrfeWidgets)

$.ajax({
	complete: function(flows)
	{
		console.log('flows loaded..');
		var target = document.getElementById('content');
		new nrfe(nrfeWidgets, function(generator)
		{
			console.log('gogogo');
			generator.render(JSON.parse(flows.responseText), target);
		});
	},
	url: "flows.json"
});
