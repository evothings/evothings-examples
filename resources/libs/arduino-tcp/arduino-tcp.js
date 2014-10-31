// File: arduino.js
// Author: Mikael Kindborg
// Functions for scripting the Arduino board from JavaScript.

var arduino = {}

arduino.internal = {}

/**
 * Readable names for parameter values.
 */
var OUTPUT = 1
var INPUT = 2
var HIGH = true
var LOW = false

/**
 * Internal arrays for timer intervals and timeouts.
 */
arduino.internal.timerTimeouts = []
arduino.internal.timerIntervals = []

/**
 * Start timeout timer. This function makes it easier to
 * use timeouts in Arduino scripts.
 */
arduino.setTimeout = function(fun, ms)
{
	arduino.internal.timerTimeouts.push(
		setTimeout(fun, ms))
}

/**
 * Start interval timer. This function makes it easier to
 * use timer intervals in Arduino scripts.
 */
arduino.setInterval = function(fun, ms)
{
	arduino.internal.timerIntervals.push(
		setInterval(fun, ms))
}

/**
 * Clear all timers.
 */
arduino.clearAllTimers = function()
{
	for (var i = 0; i < arduino.internal.timerTimeouts.length; ++i)
	{
		clearTimeout(arduino.internal.timerTimeouts[i])
	}
	for (var i = 0; i < arduino.internal.timerIntervals.length; ++i)
	{
		clearInterval(arduino.internal.timerIntervals[i])
	}
	arduino.internal.timerTimeouts = []
	arduino.internal.timerIntervals = []
}

/**
 * The IP address of the Arduino board.
 */
arduino.ipAddress = ''

/**
 * The port number used by the Arduino server.
 */
arduino.port = 0

arduino.getIpAddress = function()
{
	return arduino.ipAddress
}

/**
 * Write a digital output value.
 * @param pinNumber - pin number to read
 * @param value - HIGH or LOW
 */
arduino.digitalWrite = function(pinNumber, value)
{
	if (value == HIGH)
	{
		arduino.internal.sendRequest('H' + pinNumber, arduino.internal.callbackFun)
	}
	else if (value == LOW)
	{
		arduino.internal.sendRequest('L' + pinNumber, arduino.internal.callbackFun)
	}
}

/**
 * Write a digital output value.
 * @param pinNumber - pin number to read
 * @param mode - OUTPUT or INPUT
 */
arduino.pinMode = function(pinNumber, mode)
{
	if (mode == OUTPUT)
	{
		arduino.internal.sendRequest('O' + pinNumber, arduino.internal.callbackFun)
	}
	else if (mode == INPUT)
	{
		arduino.internal.sendRequest('I' + pinNumber, arduino.internal.callbackFun)
	}
}

/**
 * Read a digital input value, callback is called with the value
 * 'H' or 'L' corresponding to the result of the Arduino function
 * digitalRead().
 * @param pinNumber - pin number to read
 * @param callback - format callback(value) where value is 'H' or 'L',
 * or null on error.
 */
arduino.digitalRead = function(pinNumber, callback)
{
	arduino.internal.sendRequest(
		'R' + pinNumber,
		function(result)
		{
			if (result)
			{
				arduino.internal.readServerResult(function(data)
				{
					callback(data)
				})
			}
			else
			{
				callback(null)
			}
		}
	)
}

/**
 * Read an analog input value, callback is called with the value of
 * the Arduino function analogRead().
 */
arduino.analogRead = function(pinNumber, callback)
{
	arduino.internal.sendRequest(
		'A' + pinNumber,
		function(result)
		{
			if (result)
			{
				arduino.internal.readServerResult(function(data)
				{
					callback(data)
				})
			}
			else
			{
				callback(null)
			}
		}
	)
}

/**
 * Connect to a server.
 * Format: callback(successFlag)
 */
arduino.connect = function(hostname, port, callback)
{
	arduino.disconnect()

	chrome.socket.create('tcp', {}, function(createInfo)
	{
		arduino.internal.socketId = createInfo.socketId
		chrome.socket.connect(
			createInfo.socketId,
			hostname,
			port,
			function(resultCode)
			{
				arduino.internal.connected = (0 === resultCode)
				callback(arduino.internal.connected)
			}
		)
	})
}

arduino.disconnect = function()
{
	if (arduino.internal.connected)
	{
		chrome.socket.disconnect(arduino.internal.socketId)
		arduino.internal.connected = false
	}
}

/**
 * Internal connected flag.
 */
arduino.internal.connected = false

/**
 * Send a request to the Arduino.
 * @param command - the command string
 * @callback - function on the format: callback(successFlag)
 */
arduino.internal.sendRequest = function(command, callback)
{
	if (arduino.internal.connected)
	{
		arduino.internal.write(
			arduino.internal.socketId,
			command + '\n', // Here a newline is added to the end of the request.
			function(bytesWritten)
			{
				// Command length is +1 due to the added newline.
				callback(bytesWritten === command.length + 1)
			}
		)
	}
}

/**
 * Write data.
 * Format: callback(bytesWritten)
 */
arduino.internal.write = function(socketId, string, callback)
{
	chrome.socket.write(
		socketId,
		arduino.internal.stringToBuffer(string),
		function(writeInfo)
		{
			callback(writeInfo.bytesWritten)
		}
	)
}

/**
 * Array for the callback queue.
 */
arduino.internal.resultCallbackQueue = []

/**
 * Data being read from the server.
 */
arduino.internal.resultData = ''

/**
 * Read result from server, calling the callback function
 * with the result.
 * Format: callback(data) where data is a string
 */
arduino.internal.readServerResult = function(callback)
{
	// Add callback to queue.
	arduino.internal.resultCallbackQueue.push(callback)

	// If this is the only callback there is no read operation
	// in progress, so start reading.
	if (arduino.internal.resultCallbackQueue.length == 1)
	{
		arduino.internal.resultData = ''
		arduino.internal.readNext()
	}
}

/**
 * Read data from server, when a result is read (reading up to next
 * newline char) the first function in the callback queue is called.
 */
arduino.internal.readNext = function()
{
	console.log('arduino.internal.readNext: ' + arduino.internal.resultData)
	chrome.socket.read(
		arduino.internal.socketId,
		1,
		function(readInfo)
		{
			if (1 == readInfo.resultCode)
			{
				var data = arduino.internal.bufferToString(readInfo.data)
				if (data == '\n')
				{
					console.log('  end of data: ' + data)
					// We have read all data, call next result callback with result.
					var callback = arduino.internal.resultCallbackQueue.shift()
					callback(arduino.internal.resultData)

					// If there are callbacks waiting, continue reading
					// the next result.
					if (arduino.internal.resultCallbackQueue.length > 0)
					{
						arduino.internal.resultData = ''
						arduino.internal.readNext()
					}
				}
				else
				{
					console.log('  got data: ' + data)
					// We got more data, continue to read.
					arduino.internal.resultData += data
					arduino.internal.readNext()
				}
			}
			else
			{
				console.log('  no data')
				// We did not get any data, read again.
				arduino.internal.readNext()
			}
		}
	)
}

arduino.internal.callbackFun = function(result)
{
	if (result == false)
	{
		alert('Failed to send the command to the Arduino.')
	}
}

arduino.internal.bufferToString = function(buffer)
{
	return String.fromCharCode.apply(null, new Uint8Array(buffer))
}

arduino.internal.stringToBuffer = function(string)
{
	var buffer = new ArrayBuffer(string.length)
	var bufferView = new Uint8Array(buffer);
	for (var i = 0; i < string.length; ++i)
	{
		bufferView[i] = string.charCodeAt(i) //string[i]
	}
	return buffer
}

/**
 * For debugging.
 */
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
