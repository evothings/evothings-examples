// File: arduino.js
// Author: Mikael Kindborg
// Functions for scripting the Arduino board from JavaScript.

var arduino = {}

var OUTPUT = 1
var INPUT = 2
var HIGH = true
var LOW = false

console.log = hyper.log

arduino.ipAddress = ''

arduino.getIpAddress = function()
{
    return arduino.ipAddress
}

arduino.digitalWrite = function(pin, value)
{
	if (value == HIGH)
	{
		arduino.sendRequest('H' + pin, arduino.callbackFun)
	}
	else if (value == LOW)
	{
		arduino.sendRequest('L' + pin, arduino.callbackFun)
	}
}

arduino.pinMode = function(pin, mode)
{
	if (mode == OUTPUT)
	{
		arduino.sendRequest('O' + pin, arduino.callbackFun)
	}
	else if (mode == INPUT)
	{
		arduino.sendRequest('I' + pin, arduino.callbackFun)
	}
}

arduino.digitalRead = function(n, callbackFun)
{
	arduino.sendRequest('R' + n, callbackFun)
}

arduino.connected = false

// callbackFun(successOrNot)
arduino.sendRequest = function(command, callbackFun)
{
	if (!arduino.connected)
	{
		arduino.socket.connect(
			arduino.getIpAddress(),
			23,
			function(socketId, resultCode)
			{
				if (0 === resultCode)
				{
					arduino.connected = true
					arduino.socketId = socketId
					arduino.sendRequest(command, callbackFun)
				}
				else
				{
					callbackFun(false)
				}
			}
		)
	}
	else
	{
		arduino.write(
			arduino.socketId,
			command,
			function(bytesWritten)
			{
				callbackFun(bytesWritten === command.length)
			}
		)
	}
}

// Socket API for Arduino.
arduino.socket = {}

// callbackFun(socketId, resultCode)
arduino.socket.connect = function(hostname, port, callbackFun)
{
	chrome.socket.create('tcp', {}, function(createInfo)
	{
		arduino.socketId = createInfo.socketId
		chrome.socket.connect(
			createInfo.socketId,
			hostname,
			port,
			function(result)
			{
				callbackFun(createInfo.socketId, result)
			}
		)
	})
}

// callbackFun(bytesWritten)
arduino.write = function(socketId, string, callbackFun)
{
	chrome.socket.write(
		socketId,
		arduino.stringToBuffer(string),
		function(writeInfo)
		{
			callbackFun(writeInfo.bytesWritten)
		}
	)
}

// callbackFun(resultCode, string)
arduino.read = function(socketId, bufferSize, callbackFun)
{
	chrome.socket.write(
		socketId,
		bufferSize,
		function(readInfo)
		{
			callbackFun(
				readInfo.resultCode,
				arduino.bufferToString(readInfo.data))
		}
	)
}

arduino.disconnect = function(socketId)
{
	chrome.socket.disconnect(socketId)
}

arduino.bufferToString = function(buffer)
{
	var string = ''
	for (var i = 0; i < buffer.byteLength; ++i)
	{
		string += buffer[i]
	}
	return string
}

arduino.stringToBuffer = function(string)
{
	var buffer = new ArrayBuffer(string.length)
	var bufferView = new Uint8Array(buffer);
	for (var i = 0; i < string.length; ++i)
	{
		bufferView[i] = string.charCodeAt(i) //string[i]
	}
	return buffer
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

arduino.callbackFun = function(result)
{
	console.log('Callback result: ' + result)
}
