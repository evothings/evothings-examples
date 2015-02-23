// File: arduinotcp.js
// Author: Mikael Kindborg
// Functions for scripting the Arduino board from JavaScript.

evothings = window.evothings || {};

/*
 * Readable names for parameter values. (Having these as
 * globals is a bit ugly but makes for shorter names in
 * the application code.)
 */
var OUTPUT = 1
var INPUT = 2
var HIGH = true
var LOW = false

/** @namespace */
evothings.arduinotcp = {};
(function()
{
	/**
	 * Holder of internal library functions.
	 */
	var internal = {}

	/**
	 * Internal arrays for timer intervals and timeouts.
	 */
	internal.timerTimeouts = []
	internal.timerIntervals = []

	/**
	 * Start timeout timer. This function makes it easier to
	 * use timeouts in Arduino scripts.
	 */
	evothings.arduinotcp.setTimeout = function(fun, ms)
	{
		internal.timerTimeouts.push(
			setTimeout(fun, ms))
	}

	/**
	 * Start interval timer. This function makes it easier to
	 * use timer intervals in Arduino scripts.
	 */
	evothings.arduinotcp.setInterval = function(fun, ms)
	{
		internal.timerIntervals.push(
			setInterval(fun, ms))
	}

	/**
	 * Clear all timers.
	 */
	evothings.arduinotcp.clearAllTimers = function()
	{
		for (var i = 0; i < internal.timerTimeouts.length; ++i)
		{
			clearTimeout(internal.timerTimeouts[i])
		}
		for (var i = 0; i < internal.timerIntervals.length; ++i)
		{
			clearInterval(internal.timerIntervals[i])
		}
		internal.timerTimeouts = []
		internal.timerIntervals = []
	}

	/**
	 * The IP address of the Arduino board.
	 */
	evothings.arduinotcp.ipAddress = ''

	/**
	 * The port number used by the Arduino server.
	 */
	evothings.arduinotcp.port = 0

	evothings.arduinotcp.getIpAddress = function()
	{
		return evothings.arduinotcp.ipAddress
	}

	/**
	 * Write a digital output value.
	 * @param pinNumber - pin number to read
	 * @param value - HIGH or LOW
	 */
	evothings.arduinotcp.digitalWrite = function(pinNumber, value)
	{
		if (value == HIGH)
		{
			internal.sendRequest('H' + pinNumber, internal.callbackFun)
		}
		else if (value == LOW)
		{
			internal.sendRequest('L' + pinNumber, internal.callbackFun)
		}
	}

	/**
	 * Write a digital output value.
	 * @param pinNumber - pin number to read
	 * @param mode - OUTPUT or INPUT
	 */
	evothings.arduinotcp.pinMode = function(pinNumber, mode)
	{
		if (mode == OUTPUT)
		{
			internal.sendRequest('O' + pinNumber, internal.callbackFun)
		}
		else if (mode == INPUT)
		{
			internal.sendRequest('I' + pinNumber, internal.callbackFun)
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
	evothings.arduinotcp.digitalRead = function(pinNumber, callback)
	{
		internal.sendRequest(
			'R' + pinNumber,
			function(result)
			{
				if (result)
				{
					internal.readServerResult(function(data)
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
	evothings.arduinotcp.analogRead = function(pinNumber, callback)
	{
		internal.sendRequest(
			'A' + pinNumber,
			function(result)
			{
				if (result)
				{
					internal.readServerResult(function(data)
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
	evothings.arduinotcp.connect = function(hostname, port, callback)
	{
		evothings.arduinotcp.disconnect()

		chrome.socket.create('tcp', {}, function(createInfo)
		{
			internal.socketId = createInfo.socketId
			chrome.socket.connect(
				createInfo.socketId,
				hostname,
				port,
				function(resultCode)
				{
					internal.connected = (0 === resultCode)
					callback(internal.connected)
				}
			)
		})
	}

	evothings.arduinotcp.disconnect = function()
	{
		if (internal.connected)
		{
			chrome.socket.disconnect(internal.socketId)
			internal.connected = false
		}
	}

	/**
	 * Internal connected flag.
	 */
	internal.connected = false

	/**
	 * Send a request to the Arduino.
	 * @param command - the command string
	 * @callback - function on the format: callback(successFlag)
	 */
	internal.sendRequest = function(command, callback)
	{
		if (internal.connected)
		{
			internal.write(
				internal.socketId,
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
	internal.write = function(socketId, string, callback)
	{
		chrome.socket.write(
			socketId,
			internal.stringToBuffer(string),
			function(writeInfo)
			{
				callback(writeInfo.bytesWritten)
			}
		)
	}

	/**
	 * Array for the callback queue.
	 */
	internal.resultCallbackQueue = []

	/**
	 * Data being read from the server.
	 */
	internal.resultData = ''

	/**
	 * Read result from server, calling the callback function
	 * with the result.
	 * Format: callback(data) where data is a string
	 */
	internal.readServerResult = function(callback)
	{
		// Add callback to queue.
		internal.resultCallbackQueue.push(callback)

		// If this is the only callback there is no read operation
		// in progress, so start reading.
		if (internal.resultCallbackQueue.length == 1)
		{
			internal.resultData = ''
			internal.readNext()
		}
	}

	/**
	 * Read data from server, when a result is read (reading up to next
	 * newline char) the first function in the callback queue is called.
	 */
	internal.readNext = function()
	{
		console.log('internal.readNext: ' + internal.resultData)
		chrome.socket.read(
			internal.socketId,
			1,
			function(readInfo)
			{
				if (1 == readInfo.resultCode)
				{
					var data = internal.bufferToString(readInfo.data)
					if (data == '\n')
					{
						console.log('  end of data: ' + data)
						// We have read all data, call next result callback with result.
						var callback = internal.resultCallbackQueue.shift()
						callback(internal.resultData)

						// If there are callbacks waiting, continue reading
						// the next result.
						if (internal.resultCallbackQueue.length > 0)
						{
							internal.resultData = ''
							internal.readNext()
						}
					}
					else
					{
						console.log('  got data: ' + data)
						// We got more data, continue to read.
						internal.resultData += data
						internal.readNext()
					}
				}
				else
				{
					console.log('  no data')
					// We did not get any data, read again.
					internal.readNext()
				}
			}
		)
	}

	internal.callbackFun = function(result)
	{
		if (result == false)
		{
			alert('Failed to send the command to the Arduino.')
		}
	}

	internal.bufferToString = function(buffer)
	{
		return String.fromCharCode.apply(null, new Uint8Array(buffer))
	}

	internal.stringToBuffer = function(string)
	{
		var buffer = new ArrayBuffer(string.length)
		var bufferView = new Uint8Array(buffer);
		for (var i = 0; i < string.length; ++i)
		{
			bufferView[i] = string.charCodeAt(i) //string[i]
		}
		return buffer
	}
})()
