var ui = {};

(function(){
	
	evothings.loadScript('js/smoothie.js');
	evothings.loadScript('js/sensors.js');
	
	var chart;
	var activeSensor;
	
	var options;
	var acc_range = 16;
	var gyr_range = 2000;
		
	var RED 	= "#f44336";
	var GREEN	= "#4caf50";
	var BLUE	= "#2196f3";
	var YELLOW	= "#ffeb3b";

	var init = false;
	var lines = {'value': {'timeSerie': null,
						'color':	'RED'},
				 'w': {'timeSerie': null,
						'color':	'YELLOW'},
				 'x': {'timeSerie': null,
						'color':	'RED'},
				 'y': {'timeSerie': null,
						'color':	'GREEN'},
				 'z': {'timeSerie': null,
						'color':	'BLUE'}
				
				}

				
				
	/* The setActiveSensor function sets the active sensor.						*/
	ui.setActiveSensor = function(){
		for(key in app.sensors){
			if(app.sensors[key].active != 'false'){
				activeSensor = key;
			}
		}
		init = false;
	}
	
	
	
	/* The setGraphSettings function changes the axis accordingly to the 		*/
	/* settings and sets the scrolling speed of the chart.						*/
	function setGraphSettings(){
		acc_range = app.settings.CURRENT.ACCELEROMETER_RANGE.substr(1);
		gyr_range = app.settings.CURRENT.GYROSCOPE_RANGE.substr(1);
		
		switch(activeSensor){
			case 'accelerometer':
				chart.setOptions({	millisPerPixel:20,
									minValue:-acc_range, 		
									maxValue:acc_range});				
			break;
			
			case 'gyroscope'	:
				chart.setOptions({	millisPerPixel:20,
									minValue:-gyr_range, 		
									maxValue:gyr_range});
			break;
			
			case 'magnetometer' :
				chart.setOptions({	millisPerPixel:20,
									minValue:-1000, 
									maxValue:1000});
			break;
			
			case 'barometer'	:
				chart.setOptions({	millisPerPixel:50,
									minValue:800, 
									maxValue:1100});
			break;
			
			case 'temperature'	:
				chart.setOptions({	millisPerPixel:50,
									minValue:10, 
									maxValue:40});
			break;
			
			case 'humidity'		:
				chart.setOptions({	millisPerPixel:50,
									minValue:0, 
									maxValue:100});
			break; 
			
			case 'sensor_fusion':	
				chart.setOptions({	millisPerPixel:20,
									minValue:-33000, 
									maxValue:33000});
			break;
			
			default:
				console.log("Error no sensor active");
			break;
		}
	}
	
	
	
	/* The showSensorView function checks if the table and chart have been 		*/
	/* initialized and updates the table and chart.								*/
	ui.showSensorView = function(data)
	{
		if(init == false){
			initTable();
			initChart();
			displaySensorName(app.sensors[activeSensor].name);
			location = "#sensor";
			document.getElementById("back").style.display = "block";
			init = true;
		}
		showTable(data);
		showChart(data);
	}
	
	
	
	/* The resizeChart function resizes the chart according to the body size.	*/
	ui.resizeChart = function(){
		var c = document.getElementById("chart-div");
		var ctx = c.getContext("2d");
		var width = document.body.clientWidth;
		var height = document.body.clientHeight;
		ctx.canvas.width  = width;
		ctx.canvas.height = height / 2;
	}
	
	
	
	/* The initChart function initiates the chart for every sensor.				*/
	function initChart(){
		console.log("initchart has been called");
		if(chart){
			/* Remove all lines that have been set.								*/
			chart.seriesSet = [];
		} else {
			ui.resizeChart();

			/* Set the basic options for every chart.							*/
			var options = {	grid:{fillStyle:'#ffffff',sharpLines:true},
							labels:{fillStyle:'#000000'},
						  }
						  
			chart = new SmoothieChart(options);
			chart.streamTo(document.getElementById("chart-div"), 500);
		}
		
		/* Create a timeSerie for every line in lines.							*/
		for(key in lines){
			lines[key].timeSerie = new TimeSeries();
			chart.addTimeSeries(lines[key].timeSerie, 	
				{strokeStyle: lines[key].color, lineWidth: 2}
			);
		}
		
		setGraphSettings();
	}
	
	
	
	/* The initTable function initializes the table.							*/
	function initTable(){
		var i = 0;
		var result = "<table class='sensor-table'>";
			result += "<tr><td>Label</td><td>Name</td><td>Value</td></tr>";
			
		/* Check if the data is bigger than 1 so we can loop through.			*/
		if(app.sensors[activeSensor].data.length > 1){
			for (key in lines){
				if(key == app.sensors[activeSensor].data[i]){
					result += '<tr>';
					result += 	'<td style="background-color:'; 	
					result +=	lines[key].color +'"></td>';
					result += 	'<td id="table_val_' + key + '">';
					result += 	key + '</td>';
					result +=	'<td id="table_' + key + '"></td>';
					result += '</tr>';
					i++;
				}
			}
		} else {
			result += '<tr>';
			result += 	'<td style="background-color:';
			result +=	lines['value'].color +'"></td>';
			result += 	'<td id="table_val_value">';
			result +=	app.sensors[activeSensor].name + '</td>';
			result +=	'<td id="table_value"></td>';
			result += '</tr>';
		}
		
		result += "</table>";
		document.getElementById("table-div").innerHTML = result;
	}
	
	
	
	/* The showChart function updates the chart, it is called everytime new 	*/
	/* data is received.														*/
	function showChart(data){
		var now = new Date().getTime();

		/* Check if the data is bigger than 1 so we can loop through.			*/
		if(app.sensors[activeSensor].data.length > 1){
			for(key in data){
				lines[key].timeSerie.append(now, data[key]);
			}
		} else {
			lines['value'].timeSerie.append(now, data);
		}
	}
	
	
	
	/* The showTable function updates the table, it is called everytime new 	*/
	/* data is received.														*/
	function showTable(data){
		i = 0;
		
		/* Check if the data is bigger than 1 so we can loop through.			*/
		if(app.sensors[activeSensor].data.length > 1){
			for(key in data){
				document.getElementById("table_"+key).innerHTML 
					= data[key] + app.sensors[activeSensor].unit;
				i++;
			}
		} else {
			document.getElementById("table_value").innerHTML 
				= data + app.sensors[activeSensor].unit;
		}
	}
	
	
	
	/* The displaySensorName function displays the sensor name in the sensorview. */
	function displaySensorName(message){
		$('#sensor-view').html(message);
		console.log("sensorviewname:" + message);
	};
})();
