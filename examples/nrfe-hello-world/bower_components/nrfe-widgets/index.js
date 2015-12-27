(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.nrfeWidgets = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var fn = function (def, parent)
{
  console.log('ble characteristics instantiated');
  def.in = function(msg)
  {
    var deviceHandle = msg.payload.device
    var serviceHandle = msg.payload.handle
    console.log('ble characteristics device = '+deviceHandle+', service = '+serviceHandle)
    if(deviceHandle && serviceHandle && evothings && evothings.ble)
    {
      evothings.ble.characteristics(
        deviceHandle,
        serviceHandle,
        function(characteristics)
        {
          characteristics.forEach(function(ch)
          {
            ch.device = deviceHandle
            ch.service = serviceHandle
          })
          def.out({payload: {characteristics: characteristics}})
        })
    }
  };
};
module.exports = fn;
},{}],2:[function(require,module,exports){

var fn = function (def, parent)
{
  def.in = function(msg)
  {
    if(evothings && evothings.ble)
    {
      console.log('ble-services called for address ' + msg.payload.address);
      evothings.ble.connect(msg.payload.address, function (r)
      {
        var deviceHandle = r.deviceHandle;
        console.log('ble connect ' + r.deviceHandle + ' state ' + r.state);
        if (r.state == 2) // connected
        {
          def.out({payload:{device: deviceHandle}})
        }
      }, function (errorCode)
      {
        console.log('connect error: ' + errorCode);
        def.out({payload: {error: 'connect error: ' + errorCode}});
      });
    }
  };
};
module.exports = fn;
},{}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
var fn = function (def, parent)
{
  def.in = function(msg)
  {
    var deviceHandle = msg.payload.device
    var characteristicHandle = msg.payload.characteristic
    if(deviceHandle && serviceHandle && evothings && evothings.ble)
    {
      evothings.ble.descriptors(
        deviceHandle,
        characteristicHandle,
        function(descriptors)
        {
          def.out({payload: {descriptors:descriptors}})
        })
    }
  };
};
module.exports = fn;
},{}],5:[function(require,module,exports){
var fn = function (def, parent)
{
  console.log('============================================ble read characteristic instantiated');
  def.in = function(msg)
  {
    var deviceHandle = msg.payload.device
    var characteristicHandle = msg.payload.handle
    var rv = undefined
    if(deviceHandle && characteristicHandle && evothings && evothings.ble)
    {
      evothings.ble.readCharacteristic(
        deviceHandle,
        characteristicHandle,
        function(data)
        {
          rv = escape(String.fromCharCode.apply(null, new Uint8Array(data)));
          def.out({payload:{result: rv}})
        },
        function(errorCode)
        {
          rv = errorCode
          def.out({payload:{error: errorCode}})
        }
      )
    }
  };
};
module.exports = fn;
},{}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){

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
},{}],8:[function(require,module,exports){

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
},{}],9:[function(require,module,exports){

		var fn = function(def, parent)
		{
			var node = document.createElement('button');
			def.node = node;

			node.className = "mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent";
			node.style.width = "100%";
			node.innerHTML = def.name;

			def.in = function(msg)
			{
				console.log('ohayoo - button got input message');
				console.dir(msg);
				node.innerHTML = msg.payload;
			};

			return node;
		};
		module.exports = fn;
},{}],10:[function(require,module,exports){

	var fn = function (def, parent)
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
	};
	module.exports = fn;
},{}],11:[function(require,module,exports){

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
},{}],12:[function(require,module,exports){

	var fn = function (def, parent)
	{
		def.in = function(msg)
		{
			navigator.vibrate(parseInt(def.vibration));
		}
	};
	module.exports = fn;
},{}],13:[function(require,module,exports){

	var fn = function (def, parent)
	{
		def.in = function (msg)
		{
			var e = msg.payload;
			if (e && e.type == def.event)
			{
				def.out(msg);
			}
		};

	};
	module.exports = fn;
},{}],14:[function(require,module,exports){

	var fn = function (def, parent)
	{
		def.in = function(msg)
		{
			var func = new Function('msg', def.func).bind(def);
			var rv = func(msg);
			def.out(rv);
		};
	};
	module.exports = fn;
},{}],15:[function(require,module,exports){

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
},{}],16:[function(require,module,exports){

	var fn = function (def, parent)
	{
		var node = document.createElement('div');
		node.className = "mdl-cell mdl-cell--4-col mdl-cell--stretch";
		//node.style = "container: 'flex', flexDirection: "+def.direction;
		console.log(JSON.stringify(def));
		node.innerHTML = def.text;
		return node;

	};
	module.exports = fn;
},{}],17:[function(require,module,exports){

	var fn = function (def, parent)
	{
		var node = document.createElement('div');
		node.className = "mdl-cell mdl-cell--4-col mdl-cell--stretch";
		var img = document.createElement('img');
		img.setAttribute('style', def.style);
		node.appendChild(img);
		//node.style = "container: 'flex', flexDirection: "+def.direction;
		console.log('settings img.src to '+def.image+' and style '+def.style);
		img.src = def.image;
		console.log(JSON.stringify(def));
		return node;
	}
	module.exports = fn;
},{}],18:[function(require,module,exports){

},{}],19:[function(require,module,exports){

	var fn = function (def, parent)
	{
		var node = document.createElement('input');
		node.className = "mdl-textfield__input";

		return node;
	};
	module.exports = fn;
},{}],20:[function(require,module,exports){

		var fn = function(def, parent)
		{
			var node = document.createElement('div');
			node.className="mdl-grid";
			node.setAttribute('style', def.style);
			console.log('page style = '+def.style)
			node.style.height = "100%";
			node.style.flexDirection = def.direction || 'col';
			return node;
		};
		module.exports = fn;
},{}],21:[function(require,module,exports){

	var fn = function (def, parent)
	{
		var node = document.createElement('div');
		node.className = "mdl-cell mdl-cell--4-col mdl-cell--stretch";
		//node.style.marginLeft = "0";
		//node.style = "container: 'flex', flexDirection: "+def.direction;
		console.log(JSON.stringify(def));

		var tdef = def.picklist.split(',');
		var idproperty = def.idproperty || 'name'

		var table = document.createElement('table');
		table.className = "mdl-data-table mdl-js-data-table  mdl-shadow--2dp";
		if(def.style)
		{
			node.setAttribute('style', def.style);
		}
		else
		{

			node.style.width = "100%";
			node.style.maxHeight = "200px";
			node.style.overflowY = "scroll";
			node.style.margin = "0";
		}

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

		var addRow = function(item)
		{
			console.log(JSON.stringify(item));
			if (item && item[idproperty] && !seenitems[item[idproperty]])
			{
				console.log('adding new row for item ' + item[idproperty]);
				seenitems[item[idproperty]] = item;
				var tr = document.createElement('tr');
				tbody.appendChild(tr);
				tdef.forEach(function (p)
				{
					var td = document.createElement('td');
					td.className = "mdl-data-table__cell--non-numeric";
					td.innerHTML = item[p];
					tr.appendChild(td);
				});
				tr.addEventListener('click', function (e)
				{
					var p = {payload: item};
					console.log('sending item ' + JSON.stringify(p));
					def.out(p);
				});
			}
		};

		def.in = function(msg)
		{
			if(msg && msg.payload)
			{
				var item = msg.payload;
				//console.log("---------------------- picklist population");
				if(item.forEach)
				{
					console.log('picklist got array. iterating..')
					item.forEach(function(e)
					{
						addRow(e)
					})
				}
				else
				{
					addRow(item)
				}
			}
		};

		//-----------------------
		node.appendChild(table);
		return node;
	};
	module.exports = fn;
},{}],22:[function(require,module,exports){

		var fn = function(def, parent)
		{
			var node = document.createElement('div');
			node.className = "mdl-cell mdl-cell--4-col mdl-cell--stretch";
			node.setAttribute('style',def.style);
			console.log('section style = '+def.style)
			return node;
		};
		module.exports = fn;
},{}],23:[function(require,module,exports){

console.dir(window.nrfeWidgets);
},{}],24:[function(require,module,exports){
var app = {}
app.sensortag = {};

app.sensortag.ACCELEROMETER_SERVICE = 'f000aa10-0451-4000-b000-000000000000';
app.sensortag.ACCELEROMETER_DATA = 'f000aa11-0451-4000-b000-000000000000';
app.sensortag.ACCELEROMETER_CONFIG = 'f000aa12-0451-4000-b000-000000000000';
app.sensortag.ACCELEROMETER_PERIOD = 'f000aa13-0451-4000-b000-000000000000';
app.sensortag.ACCELEROMETER_NOTIFICATION = '00002902-0000-1000-8000-00805f9b34fb';

app.sensortag.MAGNETOMETER_SERVICE = 'f000aa30-0451-4000-b000-000000000000';
app.sensortag.MAGNETOMETER_DATA = 'f000aa31-0451-4000-b000-000000000000';
app.sensortag.MAGNETOMETER_CONFIG = 'f000aa32-0451-4000-b000-000000000000';
app.sensortag.MAGNETOMETER_PERIOD = 'f000aa33-0451-4000-b000-000000000000';
app.sensortag.MAGNETOMETER_NOTIFICATION = '00002902-0000-1000-8000-00805f9b34fb';

var fn = function (def, parent)
{
  def.in = function(msg)
  {
    var device = msg.payload
    if(device && evothings && evothings.ble)
    {

    }
  };
};
module.exports = fn;
},{}],25:[function(require,module,exports){

var widgets =
{
	page: require("./page"),
	bleservices: require("./bleservices"),
	blecharacteristics: require("./blecharacteristics"),
	blereadcharacteristic: require("./blereadcharacteristic"),
	bledesccriptors: require("./bledescriptors"),
	blescan: require("./blescan"),
	bleconnect: require("./bleconnect"),
	button: require("./button"),
	cdbattery: require("./cdbattery"),
	cdgeolocation: require("./cdgeolocation"),
	cdvibration: require("./cdvibration"),
	event: require("./event"),
	fefunction: require("./fefunction"),
	image: require("./image"),
	input: require("./input"),
	picklist: require("./picklist"),
	section: require("./section"),
	fetemplate: require("./fetemplate"),
	html: require("./html"),
	tisensor: require('./tisensor')
}
module.exports = widgets
},{"./blecharacteristics":1,"./bleconnect":2,"./bledescriptors":4,"./blereadcharacteristic":5,"./blescan":7,"./bleservices":8,"./button":9,"./cdbattery":10,"./cdgeolocation":11,"./cdvibration":12,"./event":13,"./fefunction":14,"./fetemplate":15,"./html":16,"./image":17,"./input":19,"./page":20,"./picklist":21,"./section":22,"./tisensor":24}]},{},[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25])(25)
});