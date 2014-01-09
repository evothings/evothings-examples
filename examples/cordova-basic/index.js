// JavaScript code for the Cordova Basic example app.

function messagebox(message)
{
	/** Show a native alert box: */
	navigator.notification.alert(
		message,
		function alertDismissed() {})
}

function onDeviceReady()
{
	/** Start watching/monitoring device sensors: */
	startWatch()
}

function startWatch()
{
	navigator.compass.watchHeading(
		onCompassSuccess,
		onCompassError,
		{ frequency: 500 })
}

/** Called by Cordova native when compass heading data is available: */
function onCompassSuccess(heading)
{
	showCompassHeading(
		'Compass Heading: ' +
		Math.round(heading.magneticHeading))
	showCompassDirection(
		computeCompassDirection(
			Math.round(heading.magneticHeading)))
}

/** Translates the approximate compass heading to a text: */
function computeCompassDirection(heading)
{
	var offset = 45/2
	if (heading < offset) return 'Facing North'
	if (heading < offset + 45) return 'Facing North-East'
	if (heading < offset + 90) return 'Facing East'
	if (heading < offset + 135) return 'Facing South-East'
	if (heading < offset + 180) return 'Facing South'
	if (heading < offset + 225) return 'Facing South-West'
	if (heading < offset + 270) return 'Facing West'
	if (heading < offset + 315) return 'Facing North-West'
	return 'Facing North'
}

function onCompassError(compassError)
{
	showCompassHeading(
		'Compass Error: ' +
		compassError.code)
}

function showCompassHeading(data)
{
	/** Changes the contents of the HTML-element with id 'compass-heading': */
	document.getElementById('compass-heading').innerHTML = data
}

function showCompassDirection(data)
{
	/** Changes the contents of the HTML-element with id 'compass-direction': */
	document.getElementById('compass-direction').innerHTML = data
}

document.addEventListener("deviceready", onDeviceReady, false)
