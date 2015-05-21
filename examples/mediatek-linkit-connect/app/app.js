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

$(document).ready(function() {

	$('#connectButton').click(function() {
		app.connect()
	})

	$('#disconnectButton').click(function() {
		app.disconnect()
	})
})

var app = {}

app.PORT = 4538
app.socketId

app.connect = function() {

	var IPAddress = $('#IPAddress').val()

	console.log('Trying to connect to ' + IPAddress)

	$('#startView').hide()
	$('#connectingStatus').text('Connecting to ' + IPAddress)
	$('#connectingView').show()

	chrome.sockets.tcp.create(function(createInfo) {

		app.socketId = createInfo.socketId

		chrome.sockets.tcp.connect(
		createInfo.socketId,
		IPAddress,
		app.PORT,
		connectedCallback)

	})

	function connectedCallback(result) {
	
		if (result === 0) {

			 console.log('Connected to ' + app.IPAdress)
					 
			 $('#connectingView').hide()
			 $('#controlView').show()

			 chrome.sockets.tcp.onReceive.addListener(function(info) {
				 var data = app.bufferToString(info.data)
				 console.log('Received: ' + data)
				 app.parseReceivedData(data)
			 })
		}
		else {

			var errorMessage = 'Failed to connect to ' + app.IPAdress
			console.log(errorMessage)
			navigator.notification.alert(errorMessage, function() {})

			 $('#connectingView').hide()
			 $('#startView').show()
		}
	}
}

app.handleVerifiedResponse = function(response) {

  var pin = response.charAt(1)
  var pin_value = parseInt(response.charAt(2))

  var domId = '#led' + pin

	if ($(domId).length == 0) {
	
		var htmlString = '<div style="display:inline-block">' +
						 '<div id="led' + pin +'" class="circleBase ledOff"></div>' +
						 '<p class="center">' + pin + '</p></div>' 

		$('#ledView').append($(htmlString))
	}

	if (pin_value == 1) {

		$(domId).removeClass('ledOff').addClass('ledOn')
		$(domId).unbind('click').click(function(){
			app.ledOff(domId)
			})
	}
	else {

		$(domId).removeClass('ledOn').addClass('ledOff')
		$(domId).unbind('click').click(function(){
			app.ledOn(domId)
			})	
	}
}

app.parseReceivedData = function (data) {

	var regExpPattern = /\$[0-4][0-1]#/gm

	data.match(regExpPattern).forEach(function(element,index, array) {

				app.handleVerifiedResponse(element) 

	})
}

app.sendString = function(sendString) {

console.log('Trying to send:' + sendString)	

chrome.sockets.tcp.send(
	app.socketId,
	app.stringToBuffer(sendString),
	function(sendInfo) {

		if (sendInfo.resultCode < 0) {

			var errorMessage = 'Failed to send data'

			console.log(errorMessage)
			navigator.notification.alert(errorMessage, function() {})
		}
	})
}

app.ledOn = function(led) {

	var id = $(led).attr('id')
	var pin = id.replace(/^led/,'')
	var string = '$' + pin + '1#\n'
	
	app.sendString(string)
}

app.ledOff = function(led) {

	var id = $(led).attr('id')
	var pin = id.replace(/^led/,'')
	var string = '$' + pin + '0#\n'
	
	app.sendString(string)
}

app.disconnect = function() {

	chrome.sockets.tcp.disconnect(app.socketId)
	$('#ledView').empty()
	$('#controlView').hide()
	$('#startView').show()
}

// Helper functions. 

app.stringToBuffer = function(string) {

	var buffer = new ArrayBuffer(string.length)
	var bufferView = new Uint8Array(buffer)
	
	for (var i = 0; i < string.length; ++i) {

		bufferView[i] = string.charCodeAt(i)
	}

	return buffer
}

app.bufferToString = function(buffer) {

	return String.fromCharCode.apply(null, new Uint8Array(buffer))
}

