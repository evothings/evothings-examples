// JavaScript code for the BLE Discovery example app.

// TODO: Add comments to functions, shorten long lines.

$(document).ready( function()
{
	/** Add event handler for when the first page is shown. */
	$(document).on('pageshow', '#first', function (data)
	{
		// Start device discovery.
		// Clear the list of device services
		$("#serviceList").empty();
	});
});

/** BLE plugin, is loaded asynchronously so the
	variable is redefined in the onDeviceReady handler. */
var ble = null;

// Application object.
var app = {};

// BLE device scanning will be made with this interval in milliseconds.
app.scanInterval = 5000;

// Track whether scanning is ongoing to avoid multiple intervals.
app.isScanning = false;

// Time for last scan event. This is useful for
// when the device does not support continuous scan.
app.lastScanEvent = 0;

// Application Constructor
app.initialize = function()
{
	this.bindEvents();
};

// Bind Event Listeners
//
// Bind any events that are required on startup. Common events are:
// 'load', 'deviceready', 'offline', and 'online'.
app.bindEvents = function()
{
	document.addEventListener('deviceready', this.onDeviceReady, false);
};

// deviceready Event Handler
//
// The scope of 'this' is the event. In order to call the 'receivedEvent'
// function, we must explicity call 'app.receivedEvent(...);'
app.onDeviceReady = function()
{
	// The plugin was loaded asynchronously and can here be referenced.
	ble = evothings.ble;

	app.receivedEvent('deviceready');
	app.startLeScan();
};

// TODO: Update DOM on a Received Event.
// Currently logging event.
app.receivedEvent = function(id)
{
	console.log('Received Event: ' + id);
};

app.testCharConversion = function()
{
	var fail = false;
	for (var i = 0; i < 256; i++)
	{
		ble.testCharConversion(i, function(s)
		{
			s = new Uint8Array(s);
			if (s[0] != i)
			{
				console.log("testCharConversion mismatch: " + s[0] + " " + i);
				console.log(s);
				fail = true;
			}
			if (i == 255)
			{
				if (fail)
				{
					console.log("testCharConversion fail!");
				}
				else
				{
					console.log("testCharConversion success!");
				}
			}
		});
	}
};

app.knownDevices = {};

app.startLeScan = function()
{
	console.log('startScan');

	app.stopLeScan();
	app.isScanning = true;
	app.lastScanEvent = new Date();
	//app.runScanTimer();

	ble.startScan(function(r)
	{
		//address, rssi, name, scanRecord
		if (app.knownDevices[r.address])
		{
			return;
		}
		app.knownDevices[r.address] = r;
		var res = r.address + " " + r.rssi + " " + r.name;
		console.log('scan result: ' + res);
		var p = document.getElementById('deviceList');
		var li = document.createElement('li');
		var $a = $("<a href=\"#connected\">" + res + "</a>");
		$(li).append($a);
		$a.bind("click",
			{address: r.address, name: r.name},
			app.eventDeviceClicked);
		p.appendChild(li);
		$("#deviceList").listview("refresh");
	}, function(errorCode)
	{
		console.log('startScan error: ' + errorCode);
	});
};

/** Handler for when device in devices list was clicked. */
app.eventDeviceClicked = function(event) {
	app.connect(event.data.address, event.data.name);
};

// Stop scanning for devices.
app.stopLeScan = function()
{
	console.log('Stopping scan...');
	ble.stopScan();
	app.isScanning = false;
	clearTimeout(app.scanTimer);
};

// Run a timer to restart scan in case the device does
// not automatically perform continuous scan.
app.runScanTimer = function()
{
	if (app.isScanning)
	{
		var timeSinceLastScan = new Date() - app.lastScanEvent;
		if (timeSinceLastScan > app.scanInterval)
		{
			if (app.scanTimer) { clearTimeout(app.scanTimer); }
			app.startLeScan(app.callbackFun);
		}
		app.scanTimer = setTimeout(app.runScanTimer, app.scanInterval);
	}
};

app.connect = function(address, name)
{
	app.stopLeScan();
	console.log('connect('+address+')');
	document.getElementById('deviceName').innerHTML = address + " " + name;
	ble.connect(address, function(r)
	{
		app.deviceHandle = r.deviceHandle;
		console.log('connect '+r.deviceHandle+' state '+r.state);
		document.getElementById('deviceState').innerHTML = r.state;
		if (r.state == 2) // connected
		{
			console.log('connected, requesting services...');
			app.getServices(r.deviceHandle);
		}
	}, function(errorCode)
	{
		console.log('connect error: ' + errorCode);
	});
};

app.getServices = function(deviceHandle)
{
	ble.readAllServiceData(deviceHandle, function(services) {
		var p = $("#serviceList");
		p.empty();
		for (var si in services)
		{
			var s = services[si];
			console.log('s'+s.handle+': '+s.type+' '+s.uuid+'. '+s.characteristics.length+' chars.');

			var $c = $("#serviceList").
				addCollapsible({template: $('#servicesListTemplate'),
					title: 's' + s.handle + ': ' + s.type + ' ' +
					s.uuid + '. ' + s.characteristics.length + ' chars.'});

			var $cs;
			if (s.characteristics.length > 0)
				$cs = $c.addCollapsibleSet();

			for (var ci in s.characteristics)
			{
				var c = s.characteristics[ci];
				console.log(' c'+c.handle+': '+c.uuid+'. '+c.descriptors.length+' desc.');
				console.log(formatFlags('  properties', c.properties, ble.property));
				console.log(formatFlags('  writeType', c.writeType, ble.writeType));

				var $c = $cs.addCollapsible({title: 'c' + c.handle + ': ' +
					c.uuid + '. ' + c.descriptors.length + ' desc.'});

				var $lv;
				if (c.descriptors.length > 0)
					$lv = $c.addListView();

				for (var di in c.descriptors)
				{
					var d = c.descriptors[di];
					console.log('  d'+d.handle+': '+d.uuid);

					var $lvi = $lv.addListViewItem({text: 'd'+d.handle+': '+d.uuid});

					// This be the human-readable name of the characteristic.
					if (d.uuid == "00002901-0000-1000-8000-00805f9b34fb")
					{
						var h = d.handle;
						console.log("rd "+h);
						// need a function here for the closure, so that variables h, ch, dli retain proper values.
						// without it, all strings would be added to the last descriptor.
						function f(h, c, lvi)
						{
							ble.readDescriptor(deviceHandle, h, function(data)
							{
								var s = ble.fromUtf8(data);
								console.log("rdw "+h+": "+s);
								c.collapsibleTitleElm().prepend(s + ' ');
							},
							function(errorCode)
							{
								console.log("rdf "+h+": "+errorCode);
								lvi.prepend('rdf ' + errorCode);
							});
						}
						f(h, $c, $lvi);
					}
				}
			}
		}
		$('#connected').trigger('create');
	}, function(errorCode)
	{
		console.log('readAllServiceData error: ' + errorCode);
	});
};

// Set format flags.
function formatFlags(name, flags, translation)
{
	var str = name+':';
	for (var key in translation) {
		if((flags & key) != 0)
			str += ' '+translation[key];
	}
	return str;
}

/** jQuery Mobile Collapsible dynamic UI helper methods

	These purpose of these methods is to simplify the creation and modification
	of a jQuery Mobile collapsible list. It uses a hidden template element from
	which sub-elements are cloned and inserted into the (visible) collapsible
	list.

	Template element:
	<div id="collapsible-template" data-role="collapsible-set" data-theme="a">
		<div data-role="collapsible">
			<h2></h2>
			<ul data-role="listview" data-theme="b" data-divider-theme="b">
				<li></li>
			</ul>
		</div>
	</div> */
(function ( $ ) {

	$.fn.addCollapsibleSet = function(options)
	{
		var params = $.extend({
			template: $(this).data('template'),
		}, options );

		// check the validity of the template
		$.collapsibleSetTemplateCheck(params.template);

		// clone the template's collapsible-set element and its children (without their data & events)
		var $collapsibleSet = params.template.clone(false);
		// clear the id attribute from the cloned element
		$collapsibleSet.attr('id' , '');
		// remove its children
		$collapsibleSet.empty();

		// remember which template was used for creating the element
		// to avoid having to specify it at each call
		$collapsibleSet.data('template', params.template);

		// insert the element into the DOM
		$(this).append($collapsibleSet);

		return $collapsibleSet;
	};

	$.fn.addCollapsible = function(options)
	{
		var params = $.extend({
			template: $(this).data('template'),
			title: ''
		}, options );

		// check the validity of the template
		$.collapsibleSetTemplateCheck(params.template);

		// clone the template's collapsible element and its children (without their data & events)
		var $collapsible = params.template.find('div[data-role=collapsible]:first').clone(false);
		// remove any children except the title h2 element
		$collapsible.children(':not(.ui-collapsible-heading)').remove(); // TODO: handle hard-coded title element type

		// set the collapsible's title
		$collapsible.find('.ui-collapsible-heading').first().text(params.title); // TODO: handle hard-coded title element type

		// remember which template was used for creating the element
		// to avoid having to specify it at each call
		$collapsible.data('template', params.template);

		// append the element to the closest parent collapsible-set
		$(this).closest('div[data-role=collapsible-set]').append($collapsible); // TODO: handle cases lacking a collapsible-set

		return $collapsible;
	};

	$.fn.getCollapsibleTitle = function()
	{
		if ($(this).prop('data-role') == 'collapsible') {
			return $('div[data-role=collapsible] > h2:first', this).text(params.title);
		}
	}

	$.fn.collapsibleTitleElm = function()
	{
		if ($(this).closest('div[data-role=collapsible]').find('.ui-collapsible-heading-toggle')) {
			return $(this).closest('div[data-role=collapsible]').find('.ui-collapsible-heading-toggle').first();
		}
		return $(this).closest('div[data-role=collapsible]').find('.ui-collapsible-heading').first();
	}

	$.fn.addListView = function(options)
	{
		var params = $.extend({
			template: $(this).data('template'),
		}, options );

		// clone the template's root listview element and its children (without their data & events)
		var $listView = params.template.find('ul[data-role=listview]:first').clone(false);
		// remove all its children list items
		$listView.children('li').remove();

		// remember which template was used for creating the element
		// to avoid having to specify it at each call
		$listView.data('template', params.template);

		// append the element to the closest parent collapsible
		$(this).closest('div[data-role=collapsible]').append($listView); // TODO: handle cases lacking a collapsible

		return $listView;
	};

	$.fn.addListViewItem = function(options)
	{
		var params = $.extend({
			template: $(this).data('template'),
			text: ''
		}, options );

		// clone the template listview item
		var $listViewItem = params.template.find('ul[data-role=listview]:first').
										children('li:first').clone(false);

		// remember which template was used for creating the element
		// to avoid having to specify it at each call
		$listViewItem.data('template', params.template);

		// set the contents of the list item
		$listViewItem.html(params.text);

		// append the element to the closest parent listview
		$(this).closest('ul[data-role=listview]').append($listViewItem);

		return $listViewItem;
	};

	$.collapsibleSetTemplateCheck = function($template)
	{
		if (!$template || $template.attr('data-role') !== 'collapsible-set')
			throw new Error('collapsibleSet error: template must have data-role=collapsible-set');
	};

}( jQuery ));
