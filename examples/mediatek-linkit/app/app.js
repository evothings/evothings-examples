//
// Copyright 2015, Evothings AB
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
//

var app = {}

// Time between map updates in milli seconds.
app.TIME_BETWEEN_REQUESTS = 10000

// Map init position.
app.MAP_INIT_LATITUDE = 59.3383
app.MAP_INIT_LONGITUDE = 18.0621

app.initializeMap = function initialize()
{

	var mapOptions =
	{
		center: { lat: app.MAP_INIT_LATITUDE, lng:app.MAP_INIT_LONGITUDE },
		zoom: 13,
		draggable: true,
		panControl: false,
		mapTypeControl: false,
		streetViewControl: false,
		zoomControl:false,
	}

	app.map = new google.maps.Map(document.getElementById('map-canvas'),
			mapOptions)
}

app.connect = function()
{
	app.IPAdress = $('#IPAdress').val()

	$('#startView').hide()

	$('#connectingStatus').text('Connecting to ' + app.IPAdress)
	$('#connectingView').show()

	console.log('Trying to connect to ' + app.IPAdress)

	app.fetchTimer = setInterval(function() { app.fetchData() }, app.TIME_BETWEEN_REQUESTS)

	app.fetchData()
}

app.fetchData = function()
{
	console.log('Trying to fetch data...')

	$.getJSON('http://' + app.IPAdress, app.dataReceived)
}

app.dataReceived = function(data, textStatus, xhr)
{

	if($('#mapView').css('display') == 'none')
	{
		$('#connectingView').hide()
		$('#mapView').show()
		google.maps.event.trigger(app.map, "resize")
		console.log('Showing off')
	}

	// Read response
	var longitude = data['long']
	var latitude = data['lat']

	console.log('Received data - Latitude: ' + latitude + ', Longitude: ' + longitude)

	// Remove current marker if available.
	if(app.marker)
	{
		app.marker.setMap(null)
	}

	// Create a new parker and add it too map.
	var markerPosition = new google.maps.LatLng(latitude, longitude)

	app.marker = new google.maps.Marker({
		position: markerPosition
	})

	app.marker.setMap(app.map)

	// Center map around the marker.
	app.map.panTo(app.marker.getPosition())
}

app.disconnect = function()
{
	clearInterval(app.fetchTimer)

	$('#mapView').hide()
	$('#startView').show()
}
