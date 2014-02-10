// File: arduino.js
// Author: Mikael Kindborg
// Functions for scripting the Arduino board from JavaScript.

// Define console.log to use hyper.log if available.
if (window.hyper)
{
	console.log = hyper.log
}

var arduino = {}

var OUTPUT = 1
var INPUT = 2
var HIGH = true
var LOW = false

// Make using and clearing timer intervals and timeouts easier.
arduino.timerTimeouts = []
arduino.timerIntervals = []

// Start timeout timer.
arduino.setTimeout = function(fun, ms)
{
	arduino.timerTimeouts.push(
		setTimeout(fun, ms))
}

// Start interval timer.
arduino.setInterval = function(fun, ms)
{
	arduino.timerIntervals.push(
		setInterval(fun, ms))
}

// Clear all timers.
arduino.clearAllTimers = function()
{
	for (var i = 0; i < arduino.timerTimeouts.length; ++i)
	{
		clearTimeout(arduino.timerTimeouts[i])
	}
	for (var i = 0; i < arduino.timerIntervals.length; ++i)
	{
		clearInterval(arduino.timerIntervals[i])
	}
	arduino.timerTimeouts = []
	arduino.timerIntervals = []
}

// The IP address of the Arduino board.
// The application must set this value.
arduino.ipAddress = ''

// The port number used by the Arduino server.
// The application must set this value.
arduino.port = 0

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
			arduino.port,
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
			command + '\n',
			function(bytesWritten)
			{
				// Command length is +1 due to the added newline.
				callbackFun(bytesWritten === command.length + 1)
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
	chrome.socket.read(
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

// For debugging!
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
	if (result == false)
	{
		alert('Failed to send the command to the Arduino.')
	}
}
