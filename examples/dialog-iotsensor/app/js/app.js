var app = {};

(function(){

	// Load script used by this file.
	evothings.loadScript('js/charts.js');
	
	var iotsensor = null;
	var scanTime = 10;
	var devices = {};
	
	
	
	/* First function called, resets location to the scanning screen,			*/
	/* initializes the settings, creates an iotsensor.SFL object, starts		*/
	/*  scanning for IoT devices, and sets all callback functions.				*/
	app.initialize = function()
	{	
		initializeSettings();
		iotsensor = evothings.iotsensor.createInstance(
			evothings.iotsensor.SFL);
			
		app.onScanButton();
		
		iotsensor
			.accelerometerCallback(ui.showSensorView)
			.gyroscopeCallback(ui.showSensorView)
			.magnetometerCallback(ui.showSensorView)
			.barometerCallback(ui.showSensorView)
			.temperatureCallback(ui.showSensorView)
			.humidityCallback(ui.showSensorView)
			.sflCallback(ui.showSensorView)
			.errorCallback(connectionError);
	
		setEventHandlers();	
		initSensorFunctions();
		initSensorButtons();
	}
	
	
	
	/* The initSensorFunctions sets all the functions that can be called in 	*/
	/* app.sensors																*/
	function initSensorFunctions()
	{
		app.sensors['accelerometer'].on = iotsensor.accelerometerOn;
		app.sensors['accelerometer'].off = iotsensor.accelerometerOff;
		
		app.sensors['gyroscope'].on = iotsensor.gyroscopeOn;
		app.sensors['gyroscope'].off = iotsensor.gyroscopeOff;
		
		app.sensors['magnetometer'].on = iotsensor.magnetometerOn;
		app.sensors['magnetometer'].off = iotsensor.magnetometerOff;
		
		app.sensors['humidity'].on = iotsensor.humidityOn;
		app.sensors['humidity'].off = iotsensor.humidityOff;
		
		app.sensors['temperature'].on = iotsensor.temperatureOn;
		app.sensors['temperature'].off = iotsensor.temperatureOff;
		
		app.sensors['barometer'].on = iotsensor.barometerOn;
		app.sensors['barometer'].off = iotsensor.barometerOff;
		
		app.sensors['sensor_fusion'].on = iotsensor.sflOn;
		app.sensors['sensor_fusion'].off = iotsensor.sflOff;
	}
	
	
	
	/* The initSensorButtons function generates the sensor buttons html code	*/
	function initSensorButtons()
	{
		var sensorButtons = '';

		for(key in app.sensors){
			sensorButtons += '<button id="but_' + key + '" '; 
			sensorButtons += 'onclick="app.onSensorButton(\'' + key + '\')" ';
			sensorButtons += 'class="green small wide">';
			sensorButtons += app.sensors[key].name + '</button>';			
		}
		
		document.getElementById("sensor-buttons").innerHTML = sensorButtons;	
	}
	
	
	
	/* When the scan button is pressed stop any ongoing scans if there are any.	*/
	/* Change the connection status to scanning, and clear the found-devices 	*/
	/* list. Start the scan, if any device is found the addDevice function will	*/
	/* be called.																*/
	app.onScanButton = function()
	{
		iotsensor.startScanningForDevices(
			function(device)
			{
				// Only show IoT devices based on the advertising name
				if(device.name === evothings.iotsensor.SFL || device.name === evothings.iotsensor.RAW)
				{
					device.timeStamp = Date.now();

					// Insert the device into table of found devices.
					devices[device.address] = device;
				}
			}
		);
		displayConnectStatus("Scanning for Bluetooth devices..");
				
		updateTimer = setInterval(displayDeviceList, 500);
		
		setTimeout(
			function() 
			{
				iotsensor.stopScanningForDevices();
				displayConnectStatus('Stopped scanning for devices');
				clearInterval(updateTimer);
			}, 
			(scanTime * 1000)
		); 
	}
	
	
	
	/* When the connect button is pressed connect to the selected device. 		*/
	app.onConnectButton = function(address)
	{
		if(iotsensor.isIoTSensor(devices[address]))
		{
			displayConnectStatus("Connecting..");
			iotsensor.connectToDevice(
				devices[address],
				function()
				{
					connected = 'true';
					
					// Stop scanning
					iotsensor.stopScanningForDevices();
					clearInterval(updateTimer);
					
					// Clear device list
					devices = {};
					document.getElementById('found-devices').innerHTML = '';

							
					getSettings(
						function()
						{
							showAvailableSensors();
							updateSettingsView();
							displayDeviceInformation(
								'Connected to IoT sensor with firmware version: ' 
								+ iotsensor.getFirmwareString()
							);
							
							
							setCurrentLocation('#connected');
						}
					);
				},
				function(error)
				{
					connectionError(error);		
				}
			);
		}
		else
		{
			displayConnectStatus("Device is not an Dialog IoT Sensor");
		}
	}
	
	
	
	/* When the disconnect button is pressed disconnect from the device and 	*/
	/* change the connection status to Disconnected.							*/
	app.onDisconnectButton = function()
	{
		devices = {};
		displayDeviceList();
		iotsensor.disconnectDevice();
		displayConnectStatus("Disconnected");
	}
	
	
	
	/* When the sensor button is pressed turn last active sensor off, set the 	*/
	/* new sensor as active and turn on the sensor. The sensor view is opened 	*/
	/* using the ui.showSensorview function which is a callback function for 	*/
	/* when new data is received.												*/
	app.onSensorButton = function(sensorId)
	{
		for(key in app.sensors){
			if(app.sensors[key].active != 'false')
			{
				setSensorStatus('false', key);
			}
		}
		app.sensors[sensorId].active = 'true';
		ui.setActiveSensor();
	
		app.sensors[sensorId].on();
	}
	
	

	/* When the settings button is pressed go to the first subheader 'basic' in	*/
	/* the settings menu. Then hard disable all sensors to make sure no sensor 	*/
	/* is on. Finally open the settings view									*/
	app.onSettingsButton = function()
	{
		app.onSubheaderButton('basic');
		
		iotsensor.disableAllSensors();
		setCurrentLocation('#settings');
	}
	
	
	
	/* When the dropdown button is pressed hide all dropdown selections except	*/
	/* the one that is requested.												*/
	app.onDropdownButton = function(divId) 
	{
		for(key in app.settings)
		{		
			id = 'dd_' + app.settings[key].id;
			
			/* Check if the id equals the id of the element that was pressed. 	*/
			if(id == divId)
			{
				var selectedElement = document.getElementById(divId);
				
				/* Toggle function if the same button is pressed twice hide the	*/
				/* dropdown content again.										*/
				if(selectedElement.style.display == "block")
				{
					selectedElement.style.display = "none";
				} 
				else 
				{
					selectedElement.style.display = "block";
				}
			
			/* If the id does not equal the id of the element that was pressed 	*/
			/* then hide all dropdown content of this element.					*/
			} 
			else 
			{
				document.getElementById(id).style.display = "none";
			}
		}
	}
	
	
	
	/* When something is selected from the dropdown content set the new setting.*/
	app.onDropdownSelection = function(divId, setting)
	{
		for(key in app.settings)
		{
			if('dd_' + app.settings[key].id == divId)
			{	
				setSettings('BASIC', key,setting);			
			}
		}
	}
	
	
	
	/* When the subheader button is pressed the color of the subheader buttons	*/
	/* will change, the settings elements will be hidden and finaly only the	*/
	/* requested elements will be shown.										*/
	app.onSubheaderButton = function(className)
	{
		var list = document.getElementsByClassName("subheader-button");
		
		for(var i = 0; i < list.length; i++) 
		{
			if(list[i].id == className)
			{	
				/* Set the color to blue, this button is active.				*/
				document.getElementById(list[i].id).style.color = "#52afb8";
			} 
			else 
			{
				/* Set the color to black, this button is not active.			*/
				document.getElementById(list[i].id).style.color = "#000000";
			}
		}
		
		/* Hide all settings elements */
		var length = document.getElementsByClassName('settings').length;
		for(var i = 0; i < length; i++) 
		{
			document.getElementsByClassName('settings')[i].style.display = "none";
		}
		
		/* Only show elements that are requested */
		length = document.getElementsByClassName(className).length;
		for(var i = 0; i < length; i++) 
		{
			document.getElementsByClassName(className)[i].style.display = "block";
		}
		
		/* Clear the displaySave status so no old messages are shown here.		*/
		displaySaveStatus("");
	}
	
	
	
	/* When the reset button is pressed all values will be reset to the factory	*/
	/* defaults. New settings are immediatly received and the views are updated.*/
	app.onResetToDefaultButton = function()
	{
		displaySaveStatus("Resetting to default values..");
		
		iotsensor.resetToFactoryDefaults();	
		
		getSettings(
			function()
			{
				updateSettingsView();
				showAvailableSensors();
				displaySaveStatus("Values have been reset to default");
			}
		);
	}
	
	
	
	/* When the sfl button is pressed a prompt will come up asking for new 		*/
	/* sfl coefficents. When these have been filled in the values are checked	*/
	/* to see if they are valid. If they are valid the new values are stored 	*/
	/* localy.																	*/
	app.onSflButton = function(setting)
	{
		var newValue = null;
		
		if(setting == 'A')
		{
			newValue = prompt("Sensor Fusion Coefficient " + setting 
				+ "\nPlease fill in a value between 0 and 32768",
				app.settings.CURRENT.BETA_A);
		} 
		else 
		{
			newValue = prompt("Sensor Fusion Coefficient " + setting 
				+ "\nPlease fill in a value between 0 and 32768",
				app.settings.CURRENT.BETA_M);
		}
	
		/* Check if the new value is valid										*/
		if(newValue != null)
		{
			if(newValue < 32768 && newValue > 0)
			{
				if(setting == 'A')
				{
					setSettings('SFL_COEF', 'BETA_A', newValue);
				} 
				else 
				{				
					setSettings('SFL_COEF', 'BETA_M', newValue);
				}
			} 
			else 
			{
				alert(newValue + " is an invalid value, please choose a value "
					+ "between 0 and 32768");
			}
		}		
	}
	
	
	
	/* When the save button is pushed all values will be stored into flash.		*/
	app.onSaveButton = function()
	{
		iotsensor.storeBasicConfigurationInFlash();
		iotsensor.storeCalibrationAndControl();
		displaySaveStatus("Saved");
	}
	
	
	
	/* When the scan time slider is changed it sets the scan time to selected 	*/
	/* value.																	*/
	app.setScanTime = function(time)
	{
		displayScanTime("Scan time: " + time + " seconds");
		scanTime = time;
	}
	
	
	
	/* When the backbutton is pressed check if location is not starting screen	*/
	/* if so go to connected screen.											*/
	app.onBackButton = function()
	{
		if(location.toString().split("#")[1] != "")
		{
			setCurrentLocation("#connected");
		}
	}
	
	
	
	/* When the toggle sensor button is pressed, turn the active sensor on or	*/
	/* off depending on the state.												*/
	app.onToggleSensorButton = function()
	{
		for(key in app.sensors)
		{
			if(app.sensors[key].active == 'true')
			{
				setSensorStatus('suspended', key);
			}
			else if(app.sensors[key].active == 'suspended')
			{
				setSensorStatus('true', key);
			}
		}
	}
	
	
	
	/* The suspendActiveSensorfunction turns the active sensor on or off		*/
	/* depending on the state.													*/
	function setSensorStatus(state, sensor)
	{
		if(state == 'suspended')
		{
			app.sensors[sensor].off();
			app.sensors[sensor].active = 'suspended';
		}
		else if(state == 'true')
		{
			app.sensors[sensor].on();
			app.sensors[sensor].active = 'true';
		} 
		else if(state == 'false')
		{
			app.sensors[key].off();
			app.sensors[key].active = 'false';
		}
		ui.setActiveSensor();
	}
	
	
	
	/* The updateSettingsView functions updates the entire settings view 		*/
	/* including the selected settings.											*/
	function updateSettingsView()
	{
		/* sets the display text of the settings buttons.						*/
		for(key in app.settings.CURRENT)
		{
			if(app.settings[key])
			{
				document.getElementById(app.settings[key].id).innerHTML 
					= app.settings[key][app.settings.CURRENT[key]];
			}
		}
		
		document.getElementById('sensf_coef_a').innerHTML 
			= app.settings.CURRENT.BETA_A;
			
		document.getElementById('sensf_coef_m').innerHTML 
			= app.settings.CURRENT.BETA_M;
		
		/* First hide all settings. 											*/
		hideAllSettings();
		
		/* Then show all selected settings.										*/
		showSelectedSettings();
	}
	
	
	
	/* The showSelectedSettings function shows all the settings that are active.*/
	function showSelectedSettings()
	{
		var id;
		for(key in app.settings.CURRENT)
		{
			if(app.settings[key])
			{
				id = 'dd_' + app.settings[key].id + app.settings.CURRENT[key];
				if(document.getElementById(id))
				{
					/* If an element is active change the color to a darker		*/
					/* grey.													*/
					document.getElementById(id).style.backgroundColor 
						= '#a9a9a9';
				}
			}			
		}
	}
	
	
	
	/* The hideAllSettings function "hides" all settings by making all settings	*/
	/* the same grey color.														*/
	function hideAllSettings()
	{
		var id;
		for (key in app.settings)
		{
			for(key2 in app.settings[key])
			{
				id = 'dd_' + app.settings[key].id + key2;
				if(document.getElementById(id))
				{
					document.getElementById(id).style.backgroundColor 
						= "#f9f9f9";
				}
			}
		}
	}
	
	
	
	/* The showAvailableSensors function hides or displays all sensors that can	*/
	/* be viewed. 																*/
	function showAvailableSensors()
	{
		var children = document.getElementById("sensor-buttons").children;
		
		/* Loop through all elements within the "sensor-buttons" div and hides	*/
		/* all of them.															*/
		for(var j = 0; j < children.length; j++)
		{
			document.getElementById(children[j].id).style.display = "none";
		}
		
		/* If the sensor_combination is not set do not continue this function.	*/
		if(app.settings.CURRENT.SENSOR_COMBINATION == null)
		{
			return;
		}
		
		if(app.settings.CURRENT.SENSOR_COMBINATION.indexOf('_gyro') > -1)
		{
			document.getElementById("but_gyroscope").style.display 
				= "block";
		}	
	
		if(app.settings.CURRENT['SENSOR_COMBINATION'].indexOf('_accel') > -1)
		{
			document.getElementById("but_accelerometer").style.display 
				= "block";
		}
		
		if(app.settings.CURRENT['SENSOR_COMBINATION'].indexOf('_mag') > -1)
		{
			document.getElementById("but_magnetometer").style.display 
				= "block";
		}
		
		if(app.settings.CURRENT['SENSOR_COMBINATION'].indexOf('_all') > -1)
		{
			document.getElementById("but_accelerometer").style.display 
				= "block";
			document.getElementById("but_gyroscope").style.display 
				= "block";
			document.getElementById("but_magnetometer").style.display 
				= "block";
			document.getElementById("but_humidity").style.display 
				= "block";
			document.getElementById("but_temperature").style.display 
				= "block";
			document.getElementById("but_barometer").style.display 
				= "block";
			document.getElementById("but_sensor_fusion").style.display 
				= "block";
		}

		/* check if raw data is disabled, if so hide accelerometer, gyroscope 	*/
		/* and magnetometer														*/
		if(app.settings.CURRENT['SENSOR_FUSION_RAW_DATA_ENABLE'] == '_disabled')
		{
			document.getElementById("but_accelerometer").style.display = "none";
			document.getElementById("but_gyroscope").style.display = "none";
			document.getElementById("but_magnetometer").style.display = "none";
		}
	}
	
	
	
	/* The displayConnectStatus function displays the connection status on 		*/
	/* screen.																	*/
	function displayConnectStatus(message)
	{
		document.getElementById('scan-status').innerHTML = message;
	};
	
	
	
	/* The displaySaveSatus function displays the save status on screen.		*/
	function displaySaveStatus(message)
	{
		document.getElementById('save-status').innerHTML = message;
	};
	
	
	
	/* The displayDeviceInformation function displays the device information on	*/
	/* screen.																	*/
	function displayDeviceInformation(message)
	{
		document.getElementById('device-information').innerHTML = message;
	}
	
	
	
	/* The displayScanTime function displays the scan time on screen.			*/
	function displayScanTime(message)
	{
		document.getElementById('scan-time').innerHTML = message;
	}
	
	
	
	/* The initializeSettings function generates the settings menu. All settings*/
	/* that have been added to app.settings will be displayed.					*/
	function initializeSettings()
	{
		var settings = '';
		
		for(key in app.settings)
		{
			settings += '<p class="settings ' + app.settings[key].subheader;
			settings += '">' + app.settings[key].name + '</p>';
			
			settings += '<a onclick="app.onDropdownButton(\'dd_' ;
			settings += app.settings[key].id + '\')" class="settings '; 
			settings += app.settings[key].subheader + '">';
			
			settings += '<button class="settings dropdown ';
			settings += app.settings[key].subheader + '">';
			
			settings += '<span class="settings ' + app.settings[key].subheader;
			settings += '" id="' + app.settings[key].id; 
			settings += '" style="float: left"></span>';
			
			settings += '<span class="settings ' + app.settings[key].subheader;
			settings += '" style="float: right">▼</span>';
			
			settings += '</button>';
			settings += '</a>';
			
			settings += '<div id="dd_' + app.settings[key].id; 
			settings += '" class="dropdown-content">';
			
			/* Loops through the options for this particular setting */
			for(key2 in app.settings[key])
			{
				if(!(key2 == 'name' || key2 == 'id' || key2 == 'subheader'))
				{
					settings += '<a id="dd_' + app.settings[key].id + key2 + '"';
					settings += 'onclick="app.onDropdownSelection(\'dd_';
					settings += app.settings[key].id + '\',\'' + key2 + '\')">';
					settings += app.settings[key][key2] + '</a>';
				}
			}
			settings += '</div>';			
		}

		document.getElementById("settings_menu").innerHTML = settings;	
	}
	
	
	
	/* The setCurrentLocation function keeps track of the current location that	*/
	/* is being viewed and change backbutton visibility.															*/
	function setCurrentLocation(window_location)
	{
		location = window_location;
		if(window_location == "#connected" || window_location == "#")
		{
			document.getElementById("back").style.display = "none";
		} 
		else 
		{
			document.getElementById("back").style.display = "block";
		}
	}
	
	
	
	function addDeviceToView(device)
	{
		var rssiWidth = 100; // Used when RSSI is zero or greater
		if (device.rssi < -100) { rssiWidth = 0; }
		else if (device.rssi < 0) { rssiWidth = 100 + device.rssi; }

		// Create tag for device data.
		var element = 
			'<li >'
			+	'<strong>' + device.name + '</strong> <br />'
			// Do not show address on iOS since it can be confused
			// with an iBeacon UUID.
			+	(evothings.os.isIOS() ? '' : device.address + '<br />')
			+	'<button onclick="app.onConnectButton(\'' + device.address + '\')" class="red">CONNECT</button> <br />'
			+ 	 device.rssi 
			+ 	'<div style="background:rgb(225,0,0);height:20px;width:'
			+ 		rssiWidth + '%;">'
			+ 	'</div>'
			+ '</li>';

		document.getElementById('found-devices').innerHTML += element;
	}
	
	
	
	function displayDeviceList()
	{
		// Clear device list
		document.getElementById('found-devices').innerHTML = '';

		for(address in devices)
		{
			var device = devices[address];

			// Only show devices that are updated during the last 10 seconds
			if(device.timeStamp + 10000 > Date.now())
			{
				addDeviceToView(device);
			}
		}
	}
	
	
	
	/* The setSettings function saves the settings in app.settings.CURRENT and 	*/
	/* updates the settingsview and the available sensors.						*/
	function setSettings(group, setting, value)
	{
		if(group == 'BASIC')
		{
			iotsensor.configuration.BASIC[setting] 
				= iotsensor.enums[setting][value];
			iotsensor.setBasicConfiguration();
		}
		
		if(group == "SFL_COEF")
		{
			iotsensor.configuration.SFL_COEF[setting] = value;
			iotsensor.setSflCoefficients();
		}

		app.settings.CURRENT[setting] = value;
		
		updateSettingsView();
		showAvailableSensors();
	}
	
	
	
	/* The getSettings function reads all basic configuration data, when this	*/
	/* is done it reads all SFL data, and finally it saves this data in the 	*/
	/* app.settings.CURRENT variable.											*/
	function getSettings(callbackFun)
	{
		iotsensor.readBasicConfiguration(
			function(data)
			{
				iotsensor.readSflCoefficients(
					function(dataSfl)
					{			
						for(key in data)
						{
							app.settings.CURRENT[key] = data[key];
						}	
						for(key in dataSfl)
						{
							app.settings.CURRENT[key] = dataSfl[key];
						}
						callbackFun();
					}
				);	
			}
		);
	}
	
	

	/* The connectionError function handles the connection errors				*/
	function connectionError(error)
	{
		switch(error)
		{
			case 'IOTSENSOR_NOT_FOUND':
				displayConnectStatus("No IoT sensor found");
				devices = {};
				this.device = null;	
			break;
			
			case 'Callback function not set for COMMAND_ID 1':	//not relevant
			case 'Callback function not set for COMMAND_ID 0':	//not relevant
			break;
			
			
			default:
				displayConnectStatus("Connection error: " + error);
				devices = {};
				this.device = null;
				setCurrentLocation('#');
			break;
		}
		
	}
	
	
	
	/* The setEventHandlers function sets eventhandler for the backbutton, and	*/
	/* the functions to set active sensors to suspended when the app is in the 	*/
	/* background.																*/
	function setEventHandlers()
	{
		document.addEventListener(
			"backbutton",
			app.onBackButton,
			false
		);
		
		document.addEventListener(
			'pause',
			function()
			{
				for(key in app.sensors)
				{
					if(app.sensors[key].active == 'true')
					{
						setSensorStatus('suspended',key);
					}
				}
			},
			false
		);
		
		document.addEventListener(
			'resume',
			function()
			{
				for(key in app.sensors)
				{
					if(app.sensors[key].active == 'suspended')
					{
						setSensorStatus('true',key);
					}
				}
			},
			false
		);
	}
	
	
	
	/* On click event when something else is clicked then the dropdown menu		*/
	/* If so hide all dropdown content											*/
	window.onclick = function(event) 
	{
		if (event.target.className.split(" ")[0] != 'settings') {
			var list = document.getElementsByClassName("dropdown-content");
			for (var i = 0; i < list.length; i++) {
				document.getElementById(list[i].id).style.display = "none";
			}			
		}
	}
	
})();