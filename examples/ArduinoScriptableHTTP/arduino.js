// File: arduino.js
// Author: Mikael Kindborg
// Functions for scripting the Arduino board from JavaScript.

console.log = hyper.log;

var arduino = {}

var OUTPUT = 1
var INPUT = 2
var HIGH = true
var LOW = false

arduino.ipAddress = ''

arduino.getIpAddress = function()
{
    return arduino.ipAddress
}

arduino.digitalWrite = function(pin, value)
{
	if (value == HIGH)
	{
		console.log('Setting pin #' + pin + ' to HIGH...');
		arduino.sendRequest('H' + pin, arduino.callbackFun)
	}
	else if (value == LOW)
	{
		console.log('Setting pin #' + pin + ' to LOW...');
		arduino.sendRequest('L' + pin, arduino.callbackFun)
	}
}

arduino.pinMode = function(pin, mode)
{
	if (mode == OUTPUT)
	{
		console.log('Configuring pin #' + pin + ' as OUTPUT...');
		arduino.sendRequest('O' + pin, arduino.callbackFun)
	}
	else if (mode == INPUT)
	{
		console.log('Configuring pin #' + pin + ' as INPUT...');
		arduino.sendRequest('I' + pin, arduino.callbackFun)
	}
}

arduino.digitalRead = function(n, callbackFun)
{
	arduino.sendRequest('R' + n, callbackFun)
}

arduino.sendRequest = function(command, callbackFun)
{
	console.log('sendRequest(' + command + ')');
	$.ajax({
		type: 'PUT',
		dataType: 'text',
		timeout: 10000,
		url: 'http://' + arduino.getIpAddress() + '/' + command,
		success: function(data) { console.log("X1"); callbackFun(data) },
		error: function(a, err) { console.log("X2" + err); callbackFun(null, err) },
		beforeSend: function(jqXHR, settings) {
		    console.log('Settings:')
			//arduino.printObject(settings, '  ')
		}
	})
}

arduino.printObject = function (obj, level)
{
	if (!level) { level = '' }
	for (prop in obj)
	{
		if (obj.hasOwnProperty(prop))
		{
			var value = obj[prop]
			if (typeof value === 'object')
			{
			    console.log(level + prop + ':')
			    arduino.printObject(value, level + '  ')
			}
			else
			{
			    console.log(level + prop + ': ' +value)
			}
		}
	}
}

arduino.callbackFun = function(data, error)
{
	if (!data) { console.log('Ajax error: ' + error) }
}
