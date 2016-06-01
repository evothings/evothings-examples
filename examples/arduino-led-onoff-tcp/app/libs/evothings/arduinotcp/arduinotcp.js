// File: arduinotcp.js
// Author: Mikael Kindborg
// Functions for scripting the Arduino board from JavaScript.

/*
 * Readable names for parameter values. (Having these as
 * globals is a bit ugly but makes for shorter names in
 * the application code.)
 */

/**
 * Value for setting a pin to output.
 * @todo Move into namespace
 */
var OUTPUT = 1

/**
 * Value for setting a pin to input.
 * @todo Move into namespace
 */
var INPUT = 2

/**
 * Value for setting a pin to on.
 * @todo Move into namespace
 */
var HIGH = true

/**
 * Value for setting a pin to off.
 * @todo Move into namespace
 */
var LOW = false

/**
 * @namespace
 * @description <p>Functions for communicating with an Arduino
 * WiFi shield or Ethernet shield.</p>
 */
evothings.arduinotcp = {}

;(function()
{
	/**
	 * Holder of internal library functions.
	 * @private
	 */
	var internal = {}

	/**
	 * Internal string that holds data read from server.
	 * @private
	 */
	internal.receiveBuffer = ''
	
	/**
	 * Internal flag that keeps track of the receive listener.
	 * @private
	 */
	internal.receiveListnerAdded = false

	/**
	 * Internal arrays for timeouts.
	 * @private
	 */
	internal.timerTimeouts = []

	/**
	 * Internal arrays for timer intervals.
	 * @private
	 */
	internal.timerIntervals = []

	/**
	 * Start timeout timer. This function makes it easier to
	 * use timeouts in Arduino scripts.
	 * @param fun Timer function, takes no parameters.
	 * @param ms Timer delay in milliseconds.
	 * @public
	 */
	evothings.arduinotcp.setTimeout = function(fun, ms)
	{
		internal.timerTimeouts.push(
			setTimeout(fun, ms))
	}

	/**
	 * Start interval timer. This function makes it easier to
	 * use timer intervals in Arduino scripts.
	 * @param fun Timer function, takes no parameters.
	 * @param ms Timer interval in milliseconds.
	 * @public
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
	 * @public
	 */
	evothings.arduinotcp.ipAddress = ''

	/**
	 * The port number used by the Arduino server.
	 * @public
	 */
	evothings.arduinotcp.port = 0

	/**
	 * Returns the current IP address value.
	 * @return {string} IP address.
	 * @public
	 */
	evothings.arduinotcp.getIpAddress = function()
	{
		return evothings.arduinotcp.ipAddress
	}

	/**
	 * Write a digital output value.
	 * @param {number} pinNumber - pin number to read
	 * @param {number} value - HIGH or LOW
	 * @public
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
	 * Set pin to output or input.
	 * @param {number} pinNumber - pin number to read
	 * @param {number} mode - OUTPUT or INPUT
	 * @public
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
	 * @param {number} pinNumber - pin number to read
	 * @param {function} callback - Function called with value of pin.
	 * Format: callback(value) where value is 'H' or 'L',
	 * or null on error.
	 * @public
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
	 * Read an analog input value. The callback function is called
	 * with the value of the Arduino function analogRead().
	 * @param {number} pinNumber - pin number to read.
	 * @param {function} callback - Function called with analog value of pin.
	 * Format: callback(value) where is a number, or null on error.
	 * @public
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
	 * Connect to a server running on the Arduino.
	 * @param {string} hostname
	 * @param {number} port
	 * @param {number} callback Function called when connect
	 * operation has completed. Format: callback(successFlag)
	 * where successFlag is true on success and false on error.
	 * @public
	 */
	evothings.arduinotcp.connect = function(hostname, port, callback)
	{
		evothings.arduinotcp.disconnect()

		chrome.sockets.tcp.create(function(createInfo)
		{
		  // Save socket id.
			internal.socketId = createInfo.socketId
			
			// Connect.
			chrome.sockets.tcp.connect(
				createInfo.socketId,
				hostname,
				port,
				function(resultCode)
				{
				  if (resultCode === 0)
				  {
				    // Connect success.
				    
				    // Set up receive listener (lazy initialisation).
				    if (!internal.receiveListnerAdded)
				    {
				      internal.receiveListnerAdded = true
				      
              chrome.sockets.tcp.onReceive.addListener(function(info) 
              {
                // Accumulate result.
                internal.receiveBuffer += internal.bufferToString(info.data)
              
                // Process data.
                internal.readNext()
              })
            }
			    
					  internal.connected = true
					}
					else
					{
				    // Error.
					  internal.connected = false
					}
					
					callback(internal.connected)
				}
			)
		})
	}

	/**
	 * Disconnect from the Arduino.
	 * @public
	 */
	evothings.arduinotcp.disconnect = function()
	{
		if (internal.connected)
		{
			chrome.sockets.tcp.close(internal.socketId)
			internal.connected = false
		}
	}

	/**
	 * Internal connected flag.
	 * @private
	 */
	internal.connected = false

	/**
	 * Send a request to the Arduino.
	 * @param command - the command string
	 * @callback - function on the format: callback(successFlag)
	 * @private
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
	 * @private
	 */
	internal.write = function(socketId, string, callback)
	{
		chrome.sockets.tcp.send(
			socketId,
			internal.stringToBuffer(string),
			function(sendInfo)
			{
				callback(sendInfo.bytesSent)
			}
		)
	}

	/**
	 * Array for the callback queue.
	 * @private
	 */
	internal.resultCallbackQueue = []

	/**
	 * Read result from server, calling the callback function
	 * with the result.
	 * Format: callback(data) where data is a string
	 * @private
	 */
	internal.readServerResult = function(callback)
	{
		// Add callback to queue.
		internal.resultCallbackQueue.push(callback)

		// If this is the only callback there is no read operation
		// in progress, so start reading.
		internal.readNext()
	}

	/**
	 * Parse data received from server, when a result is found (reading up to
	 * next newline char) the first function in the callback queue is called.
	 * This function may return if data has not yet arrived from the server.
	 * In that case it will be called again.
	 * @private
	 */
	internal.readNext = function()
	{
    if (internal.resultCallbackQueue.length === 0)
		{
		  // No callback in queue.
			return
		}
		
		console.log('internal.readNext: ' + internal.receiveBuffer)
		
		var data = internal.receiveBuffer
		
		// Does in buffer contain a newline?
		var pos = data.indexOf('\n')
		
		if (pos > -1)
		{
		  // Extract data up to newline.
		  var result = data.substr(0, pos)
		  
		  // Remove data from input buffer.
		  internal.receiveBuffer = internal.receiveBuffer.substring(pos + 1) 
		  
			// Call next callback in queue with the result.
			var callback = internal.resultCallbackQueue.shift()
			callback(result)

      // If there are callbacks waiting, continue reading
      // the next result.
      if (internal.resultCallbackQueue.length > 0)
      {
        internal.readNext()
      }
		}
	}

	/**
	 * @private
	 */
	internal.callbackFun = function(result)
	{
		if (result == false)
		{
			alert('Failed to send the command to the Arduino.')
		}
	}

	/**
	 * @private
	 */
	internal.bufferToString = function(buffer)
	{
		return String.fromCharCode.apply(null, new Uint8Array(buffer))
	}

	/**
	 * @private
	 */
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
