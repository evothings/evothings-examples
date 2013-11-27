
var ble = window.BLE;

var formatFlags = function(name, flags, translation) {
	var str = name+':';
	for (var key in translation) {
		if((flags & key) != 0)
			str += ' '+translation[key];
	}
	return str;
}

(function ( $ ) {

	$.fn.addCollapsibleSet = function(options) {
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

	$.fn.addCollapsible = function(options) {
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

	$.fn.getCollapsibleTitle = function() {
		if ($(this).prop('data-role') == 'collapsible') {
			return $('div[data-role=collapsible] > h2:first', this).text(params.title);
		}
	}

	$.fn.collapsibleTitleElm = function() {
		if ($(this).closest('div[data-role=collapsible]').find('.ui-collapsible-heading-toggle')) {
			return $(this).closest('div[data-role=collapsible]').find('.ui-collapsible-heading-toggle').first();
		}
		return $(this).closest('div[data-role=collapsible]').find('.ui-collapsible-heading').first();
	}

	$.fn.addListView = function(options) {
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

	$.fn.addListViewItem = function(options) {
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

	$.collapsibleSetTemplateCheck = function($template) {
		if (!$template || $template.attr('data-role') !== 'collapsible-set')
			throw new Error('collapsibleSet error: template must have data-role=collapsible-set');
	};

}( jQuery ));

function testList(refresh) {
	$('#testList').addCollapsible({template: $('#testListTemplate'), title: 'testtitle1'})
				  .addCollapsibleSet()
				  .addCollapsible({title: 'testtitle2'})
				  .addListView()
				  .addListViewItem({text: 'item1'})
				  .addListViewItem({text: 'item2'});

	if(refresh)
		$('#testList').closest('div[data-role=page]').trigger('create');
}

$( document ).on( 'pageinit', '#first', function( event ) {
	testList(true);
});

var app = {
	// Application Constructor
	initialize: function() {
		this.bindEvents();
	},
	// Bind Event Listeners
	//
	// Bind any events that are required on startup. Common events are:
	// 'load', 'deviceready', 'offline', and 'online'.
	bindEvents: function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);
	},
	// deviceready Event Handler
	//
	// The scope of 'this' is the event. In order to call the 'receivedEvent'
	// function, we must explicity call 'app.receivedEvent(...);'
	onDeviceReady: function() {
		app.receivedEvent('deviceready');
		ble = window.BLE;

		//console.log("testCharConversion");
		// once this passes, we can startLeScan().
		//app.testCharConversion();
		console.log("resetting...");
		ble.stopScan();
		ble.reset(function() {
			console.log("reset complete!");
			app.startLeScan();
		}, function(err) {
			console.log("reset error: "+err);
		});
	},
	// Update DOM on a Received Event
	receivedEvent: function(id) {
		console.log('Received Event: ' + id);
	},

	testCharConversion: function() {
		var fail = false;
		for (var i = 0; i < 256; i++) {
			ble.testCharConversion(i, function(s) {
				s = new Uint8Array(s);
				if(s[0] != i) {
					console.log("testCharConversion mismatch: "+s[0]+" "+i);
					console.log(s);
					fail = true;
				}
				if(i == 255) {
					if(fail) {
						console.log("testCharConversion fail!");
					} else {
						console.log("testCharConversion success!");
					}
				}
			});
		}
	},

	knownDevices: {},

	startLeScan: function() {
		console.log('startScan');
		ble.startScan(function(r) {
			//address, rssi, name, scanRecord
			if(app.knownDevices[r.address]) {
				return;
			}
			app.knownDevices[r.address] = r;
			var res = r.address+" "+r.rssi+" "+r.name
			console.log('scan result: ' + res);
			var p = document.getElementById('deviceList');
			var li = document.createElement('li');
			li.innerHTML = "<a href=\"#connected\" onClick=\"app.connect('"+r.address+"', '"+r.name+"')\">"+res+"</a>";
			p.appendChild(li);
			$("#deviceList").listview("refresh");
		}, function(errorCode) {
			console.log('startScan error: ' + errorCode);
		});
	},

	connect: function(address, name) {
		ble.stopScan();
		console.log('connect('+address+')');
		document.getElementById('deviceName').innerHTML = address + " " + name;
		ble.connect(address, function(r) {
			console.log('connect '+r.device+' state '+r.state);
			document.getElementById('deviceState').innerHTML = r.state;
			if(r.state == 2) {	// connected
				console.log('connected, requesting services...');
				app.services(r.device);
			}
		}, function(errorCode) {
			console.log('connect error: ' + errorCode);
		});
	},

	services: function(device) {
		var first = true;
		var serviceCount;
		var services = [];
		var finish = function() {
			console.log('finish');
			var p = $("#serviceList");
			for(var si in services) {
				var ss = services[si];
				var s = ss.s;
				//console.log('s'+s.handle+': '+s.type+' '+s.uuid+'. '+s.characteristicCount+' chars.');

				var $c = $("#serviceList").
					addCollapsible({template: $('#testListTemplate'), title: 's'+s.handle+': '+s.type+' '+s.uuid+'. '+s.characteristicCount+' chars.'});

				if (s.characteristicCount > 0)
					$cs = $c.addCollapsibleSet();

				for(var ci in ss.c) {
					var cc = ss.c[ci];
					var c = cc.c;
					//console.log(' c'+c.handle+': '+c.uuid+'. '+c.descriptorCount+' desc.');

					var $c = $cs.addCollapsible({title: 'c'+c.handle+': '+c.uuid+'. '+c.descriptorCount+' desc.'});

					var $lv;
					if(c.descriptorCount > 0)
						$lv = $c.addListView();

					for (var di in cc.d) {
						var d = cc.d[di];
						//console.log('  d'+d.handle+': '+d.uuid);

						var $lvi = $lv.addListViewItem({text: 'd'+d.handle+': '+d.uuid});

						// This be the human-readable name of the characteristic.
						if(d.uuid == "00002901-0000-1000-8000-00805f9b34fb") {
							var h = d.handle;
							//console.log("rd "+h);
							// need a function here for the closure, so that variables h, ch, dli retain proper values.
							// without it, all strings would be added to the last descriptor.
							function f(h, c, lvi) {
								ble.readDescriptor(device, h, function(data) {
									var s = ble.fromUtf8(data);
									//console.log("rdw "+h+": "+s);
									c.collapsibleTitleElm().prepend(s + ' ');
								},
								function(errorCode) {
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
		};
		ble.services(device, function(s) {
			serviceCount = s.serviceCount;
			if(first) {
				//console.log('s'+s.handle+"/"+serviceCount+" "+s.characteristicCount);
			}
			var service = {s:s, c:[]};
			//msg += 's'+s.handle+': '+s.type+' '+s.uuid+'. '+s.characteristicCount+' chars.'+"\n";
			if(s.characteristicCount == 0) {
				services.push(service);
				if(services.length == serviceCount) {
					console.log('f1');
					finish();
				}
			}
			ble.characteristics(device, s.handle, function(c) {
				//console.log(' c'+c.handle+"/"+s.characteristicCount+" "+c.descriptorCount);
				var characteristic = {c:c, d:[]};
				//msg += ' c'+c.handle+': '+c.uuid+'. '+c.descriptorCount+' desc.'+"\n";
				//dumpFlags('  permissions', c.permissions, ble.permission);
				formatFlags('  properties', c.properties, ble.property);
				formatFlags('  writeType', c.writeType, ble.writeType);
				if(c.descriptorCount == 0) {
					service.c.push(characteristic);
					if(service.c.length == s.characteristicCount) services.push(service);
					if(services.length == serviceCount) {
						console.log('f2');
						finish();
					}
				}
				ble.descriptors(device, c.handle, function(d) {
					//console.log('  d'+d.handle+"/"+c.descriptorCount);
					characteristic.d.push(d);
					//msg += '  d'+d.handle+': '+d.uuid+"\n";
					//dumpFlags('   permissions', d.permissions, ble.permission);
					if(characteristic.d.length == c.descriptorCount) service.c.push(characteristic);
					if(service.c.length == s.characteristicCount) services.push(service);
					if(services.length == serviceCount) {
						console.log('f3');
						finish();
					}
				}, function(errorCode) {
					console.log('  descriptors error: ' + errorCode);
				});
			}, function(errorCode) {
				console.log(' characteristics error: ' + errorCode);
			});
		}, function(errorCode) {
			console.log('services error: ' + errorCode);
		});
	},
};
