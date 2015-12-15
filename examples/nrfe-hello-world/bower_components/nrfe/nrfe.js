
var nrfe = function(modules, cb)
{
	this.widgets = [];
	this.inst_table = modules

	if (window.hyper)
	{
		console.log = hyper.log;
	}

	console.dir(this.inst_table);
	cb(this);


	window.dump = function (o)
	{
		for (var p in o)
		{
			console.log(p + ' -> ' + o[p]);
		}
	}
};

nrfe.prototype.render = function(fedef, target)
{
	//console.log('nrfe.render  preparing to add widgets at DOM node '+target);
	this.target = target;
	console.dir(fedef);
	var page = undefined;
	if(fedef)
	{
		fedef.forEach(function(wdef)
		{

			if(wdef.type === 'page')
			{
				page = wdef;
			}

			this.widgets[wdef.id] = wdef
		}.bind(this));
		this.renderWidget(page, this.target);
	}
};

nrfe.prototype.renderWidget = function(widget_def, parentNode)
{
	//console.log('NRFE parsing widget '+widget_def.type);
	if(widget_def   )
	{
		var node = widget_def.node || this.instantiateWidget(widget_def, parentNode);
		widget_def.node = node;
		if(parentNode && widget_def.node)
		{
			console.log('* * appending '+widget_def.type+' under '+parentNode);
			//this.appendChildInOrder(parentNode, widget_def, node);
			parentNode.appendChild(node)
		}
		if(widget_def.wires && !widget_def.wired)
		{
			widget_def.wired = true;

			var sortedChildren = [];
			widget_def.wires.forEach(function(widget_def_child)
			{
				widget_def_child.forEach(function(childid)
				{
					var w = this.widgets[childid];
					w._order = w.order || 1;
					sortedChildren.push(w)
				}.bind(this));
			}.bind(this));
			sortedChildren.sort(function(a, b)
			{
				return a._order === b._order ? 0 : (a._order > b._order ? 1 : -1);
			});
			sortedChildren.forEach(function(widget)
			{
				this.renderWidget(widget, node);
			}.bind(this));
		}
		if(node && widget_def.events && !widget_def.evented)
		{
			widget_def.evented = true;
			var earr = widget_def.events || [];
			var events = earr.split(',');
			//var events = ['click','change','keypress','keyup','keydown', 'focus','blur'];
			events.forEach(function(handler)
			{
				//console.log('adding event handler '+handler+' for widget '+def.type);
				node.addEventListener(handler, function(e)
				{
					widget_def.out({payload:e})
				});
			});
		}
	}
};

nrfe.prototype.instantiateWidget = function(widget_def, parentNode)
{
	console.log('NRFE instantiating widget '+widget_def.type+', under parent node '+parentNode);
	if(!parentNode)
	{
		//zyzyzy();
	}
	//console.dir(widget_def)
	var nodeCreator = this.inst_table[widget_def.type];
	var node = undefined;
	if(nodeCreator)
	{
		node = nodeCreator(widget_def, parentNode);
		if(node)
		{
			node._def = widget_def;
		}
		//console.log('creator returns node '+node);
		widget_def.out = function(msg)
		{
			var wires = this.widgets[widget_def.id].wires;
			//console.log("out wires are..");
			//console.log(JSON.stringify(wires));
			wires.forEach(function(warr)
			{
				warr.forEach(function(wid)
				{
					//console.log('sending message to widget '+wid+' type '+widget_def.type);
					var w = this.widgets[wid];
					//console.log(JSON.stringify(w));
					w.in(msg);
				}.bind(this))
			}.bind(this))
		}.bind(this);
		if(!widget_def.in)
		{
			widget_def.in = function(msg)
			{
				console.log('-- no message handler defined for node '+widget_def.type+' ['+widget_def.id+']');
				console.dir(msg);
			};
		}
	}
	else
	{
		console.log('******************************** COULD NOT FIND CREATOR FOR NODE TYPE '+widget_def.type);
	}
	return node;
};

