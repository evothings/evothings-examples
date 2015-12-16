var nrfe = function(target)
{
	this.target = target;
	this.version = "0.0.1";
	this.widgets = [];
	console.log = hyper.log;
}

var dump = function(o)
{
	for(var p in o)
	{
		console.log(p+' -> '+o[p]);
	}
}

//------------------------------------------------------------------------------- Table o' widgets

var inst_table =
{
	'button': function(def, parent)
	{
		var node = document.createElement('button');
		def.node = node;

		node.className = "mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent";
		node.innerHTML = def.name;

		def.in = function(msg)
		{
			console.log('ohayoo - button got input message');
			console.dir(msg);
			node.innerHTML = msg.payload;
		};

		return node;
	},
	'flexbox': function(def, parent)
	{
		var node = document.createElement('div');
		node.style = {container: 'flex', flexDirection: def.direction};
		return node;
	},
	'event': function(def, parent)
	{

		def.in = function(msg)
		{
			var e = msg.payload;
			if(e && e.type == def.event)
			{
				def.out(msg);
			}
		};

	},
	'input': function(def, parent)
	{
		var node = document.createElement('input');
		node.className = "mdl-textfield__input";

		return node;
	},
	'page': function(def, parent)
	{
		var node = document.createElement('div');
		node.className="mdl-grid";
		node.setAttribute('style', def.style);
		console.log('page style = '+def.style)
		node.style.height = "100%";
		node.style.flexDirection = def.direction || 'col';
		return node;
	},
	'section': function(def, parent)
	{
		var node = document.createElement('div');
		node.className = "mdl-cell mdl-cell--4-col mdl-cell--stretch";
		node.setAttribute('style',def.style);
		console.log('section style = '+def.style)
		return node;
	},
	'text': function(def, parent)
	{
		var node = document.createElement('div');
		node.className = "mdl-cell mdl-cell--4-col mdl-cell--stretch";
		//node.style = "container: 'flex', flexDirection: "+def.direction;
		console.log(JSON.stringify(def));
		node.innerHTML = def.text;
		return node;
	},
	'image': function(def, parent)
	{
		var node = document.createElement('div');
		node.className = "mdl-cell mdl-cell--4-col mdl-cell--stretch";
		var img = document.createElement('img');
		img.style.height='100px';
		img.style.width='100px';
		img.style.zIndex='1000';
		node.appendChild(img);
		//node.style = "container: 'flex', flexDirection: "+def.direction;
		console.log('settings img.src to '+def.image);
		img.src = def.image;
		console.log(JSON.stringify(def));
		return node;
	},
	'template': function(def, parent)
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
	},
	'function': function(def, parent)
	{
		def.in = function(msg)
		{
			var func = new Function('msg', def.func).bind(def);
			var rv = func(msg);
			def.out(rv);
		};

	},
	'bluetooth': function(def, parent)
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

	},
	'bleservices': function(def, parent)
	{
		def.in = function(msg)
		{
			console.log('ble-services called for address '+msg.payload.address);
			evothings.ble.connect(msg.payload.address, function(r)
			{
				var deviceHandle = r.deviceHandle;
				console.log('connect '+r.deviceHandle+' state '+r.state);
				if (r.state == 2) // connected
				{
					console.log('connected, requesting services...');
					evothings.ble.readAllServiceData(deviceHandle, function(services)
					{
						def.out({payload: services});
					});
				}
			}, function(errorCode)
			{
				console.log('connect error: ' + errorCode);
				def.out({payload: {error:'connect error: ' + errorCode}});
			});
		};

	},
	'picklist': function(def, parent)
	{
		var node = document.createElement('div');
		node.className = "mdl-cell mdl-cell--4-col mdl-cell--stretch";
		node.style.marginLeft = "0";
		//node.style = "container: 'flex', flexDirection: "+def.direction;
		console.log(JSON.stringify(def));

		var tdef = def.picklist.split(',');
		var idproperty = def.idproperty || 'name'

		var table = document.createElement('table');
		table.className = "mdl-data-table mdl-js-data-table  mdl-shadow--2dp";
		table.style.width = "100%";

		var thead = document.createElement('thead');
		table.appendChild(thead);
		var thtr = document.createElement('tr');

		thead.appendChild(thtr);
		tdef.forEach(function(colname)
		{
			var th = document.createElement('th');
			th.style.background = "#ddd";
			th.style.fontWeight = "bold";
			th.className="mdl-data-table__cell--non-numeric";
			th.style.width = "100%";
			th.innerHTML = '<strong>'+colname+'</strong>';
			thtr.appendChild(th);
		});
		var tbody = document.createElement('tbody');
		table.appendChild(tbody);

		var seenitems = []

		def.in = function(msg)
		{
			var item = msg.payload;
			//console.log("---------------------- picklist population");
			console.log(JSON.stringify(item));
			if(item && item[idproperty] && !seenitems[item[idproperty]])
			{
				console.log('adding new row for item '+item[idproperty]);
				seenitems[item[idproperty]] = item;
				var tr = document.createElement('tr');
				tbody.appendChild(tr);
				tdef.forEach(function(p)
				{
					var td = document.createElement('td');
					td.className="mdl-data-table__cell--non-numeric";
					td.innerHTML = item[p];
					tr.appendChild(td);
				});
				tr.addEventListener('click', function(e)
				{
					var p = {payload:item};
					console.log('sending item '+JSON.stringify(p));
					def.out(p);
				});
			}
		};

		//-----------------------
		node.appendChild(table);
		return node;
	},
	'cdbattery': function(def, parent)
	{
		window.addEventListener("batterystatus", function(info)
		{
			def.out({payload: info});
		}, false);
		window.addEventListener("batterycritical", function(info)
		{
			def.out({payload: info});
		}, false);
		window.addEventListener("batterylow", function(info)
		{
			def.out({payload: info});
		}, false);
	},
	'cdgeolocation': function(def, parent)
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
	},
	'cdvibration': function(def, parent)
	{
		def.in = function(msg)
		{
			navigator.vibrate(parseInt(def.vibration));
		}
	}
};

//------------------------------------------------------------------------------- Parsing

nrfe.prototype.render = function(fedef)
{
	console.log('NRFE parsing front-end definition');
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
			//console.log('* * appending '+widget_def.type+' under '+parentNode);
			parentNode.appendChild(node);
		}
		if(widget_def.wires && !widget_def.wired)
		{
			widget_def.wired = true
			widget_def.wires.forEach(function(widget_def_child)
			{
				widget_def_child.forEach(function(childid)
				{
					this.renderWidget(this.widgets[childid], node);
				}.bind(this));
			}.bind(this));
		}
		if(node && widget_def.events && !widget_def.evented)
		{
			widget_def.evented = true;
			var events = widget_def.events.split(',');
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
	//console.dir(widget_def)
	var nodeCreator = inst_table[widget_def.type];
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
	return node;
};


