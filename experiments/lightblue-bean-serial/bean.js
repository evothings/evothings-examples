/**
* File: bean.js
* Description: Communicates with a LightBlue Bean. Implements the Serial protocol. Requires evothings.ble.
* Author: Fredrik Eldh
*/

evothings.loadScript('libs/evothings/util/util.js');

evothings.bean = (function() {

	// Module-private data.
	var m = {
		deviceInfo:false,
		stateCallback:false,
		deviceHandle:false,
		haveServices:false,
		gettingServices:false,
		serviceCallbacks:[],
		serialChar:false,
		serialDesc:false,
		dataCallback:false,
		debugging:false,
		expectedGtHeader:0x80,
		sendGtHeader:0x80,

		// configuration setting.
		// splits serial writes into 13-byte messages.
		// should be false for higher efficiency, but doing so currently causes the Bean to reject the packets.
		singlePacketWrite:true,
	};
	var bean = {};

	/** This function is called when an operation succeeds.
	* @callback winCallback
	*/

	/** This function is called when an operation fails.
	* @callback failCallback
	* @param {string} errorString - A human-readable string that describes the error that occurred.
	*/

	/** This function is called the connection state changes.
	* @callback stateCallback
	* @param {string} state - "scanning", "connecting", "connected", "querying", "active", or "disconnected".
	*/

	/** This function is called when data is received.
	* @callback dataCallback
	* @param {Uint8Array} data
	*/

	m.sendState = function(state) {
		if(m.stateCallback) m.stateCallback(state);
	}

	/** Scans for Bean devices, and connects to the first one found. */
	bean.connectToFirstDevice = function(win, fail) {
		m.sendState("scanning");
		var knownDevices = {};
		evothings.ble.startScan(
			function(deviceInfo)
			{
				if (knownDevices[deviceInfo.address])
				{
					return;
				}
				console.log('found device: ' + deviceInfo.name);
				knownDevices[deviceInfo.address] = deviceInfo;
				if ((deviceInfo.name == 'LightBlueBean') && !m.deviceInfo)
				{
					console.log('Found bean');
					m.deviceInfo = deviceInfo;
					m.connect(deviceInfo.address, win, fail);
				}
			},
			fail);
	}

	m.connect = function(address, win, fail) {
		evothings.ble.stopScan();
		m.sendState("connecting");
		evothings.ble.connect(
			address,
			function(connectInfo) {
				m.connectCallback(connectInfo, win);
			},
			fail);
	}

	m.connectCallback = function(connectInfo, win) {
		if(connectInfo.state == 2) {	// Connected
			m.deviceHandle = connectInfo.deviceHandle;
			m.sendState("connected");
			win();
		}
		if(connectInfo.state == 0) {	// Disconnected
			m.deviceInfo = false;
			m.deviceHandle = false;
			m.haveServices = false;
			m.sendState("disconnected");
		}
	}

	/** Does nothing if already disconnected.
	* Calls the stateCallback, if one was set.
	*/
	bean.disconnect = function() {
		if(m.deviceHandle) {
			evothings.ble.close(m.deviceHandle)
			m.deviceInfo = false;
			m.deviceHandle = false;
			m.haveServices = false;
			m.sendState("disconnected");
		} else {
			evothings.ble.stopScan();
		}
	}

	/**
	* Sets the connection state callback.
	*/
	bean.observeConnectionState = function(stateCallback) {
		m.stateCallback = stateCallback;
	}

	/**
	* @param {object} data - May be a TypedArray or an ArrayBuffer.
	* Caveat: The Bean protocol limits message size to 64 bytes. Longer messages will be split.
	* Workaround: handle reconstitution on the Arduino side.
	*
	* Test with Serial Loopback sketch shows that messages up to 63 bytes work. 64 bytes or longer causes the Bean to become unresponsive.
	*/
	bean.serialWrite = function(data, win, fail) {
		if(!m.haveServices) {
			// if we don't have our services yet, fetch them, then call this function again.
			m.getServices(function() {
				bean.serialWrite(data, win, fail);
			}, fail);
			return;
		}

		// view data as a Uint8Array, unless it already is one.
		if(data.buffer) {
			if(!(data instanceof Uint8Array))
				data = new Uint8Array(data.buffer);
		} else if(data instanceof ArrayBuffer) {
			data = new Uint8Array(data);
		} else {
			throw "serialWrite data is not an ArrayBuffer.";
		}

		if(m.singlePacketWrite && data.byteLength > 13) {
			var pos = 0;
			var win2 = function() {
				if(pos < data.byteLength) {
					var len = Math.min(13, data.byteLength - pos);
					bean.serialWrite(data.subarray(pos, pos+len), win2, fail);
					pos += len;
				} else {
					win();
				}
			}
			bean.serialWrite(data.subarray(pos, pos+13), win2, fail);
			pos = 13;
			return;
		}

		if(data.byteLength > 64) {
			throw "serialWrite data exceeds Bean maximum.";
		}

		// 6 = length+reserved+messageId+crc.
		var gstPacketLength = data.byteLength + 6;
		var buffer = m.gtBuffer(gstPacketLength);

		//evothings.printObject(buffer);

		// GST length
		buffer.append(data.byteLength + 2);

		// GST reserved
		buffer.append(0);

		// App Message Id
		buffer.append(0);
		buffer.append(0);

		// App Message Payload
		for(var i=0; i<data.byteLength; i++) {
			buffer.append(data[i]);
		}

		// GST CRC
		// compute in two steps.
		var crc = m.computeCRC16(buffer.buf, 1, 4);
		crc = m.computeCRC16(data, 0, data.byteLength, crc);
		buffer.append(crc & 0xff);
		buffer.append((crc >> 8) & 0xff);

		var i = 0;
		var partWin = function() {
			if(i == buffer.packetCount) {
				win();
			} else {
				var packet = buffer.packet(i);
				console.log("write packet "+bean.bytesToHexString(packet));
				evothings.ble.writeCharacteristic(m.deviceHandle, m.serialChar, packet, partWin, fail);
				i++;
			}
		}
		partWin();
	}

	// Returns an object representing a GT message buffer.
	m.gtBuffer = function(gstPacketLength) {
		// BLE max is 20. GT header takes 1 byte.
		var packetCount = Math.ceil(gstPacketLength / 19);

		// We'll store all the packets in one buffer.
		var bufferLength = gstPacketLength + packetCount;

		var buf = new Uint8Array(bufferLength);
		var pos = 0;

		return {
			packetCount: packetCount,
			buf: buf,
			append: function(b) {
				// If this is the start of a GT packet, add the GT header.
				if((pos % 20) == 0) {
					//console.log("pos: "+pos);
					// Decrement the local packetCount. This should not affect the member packetCount.
					buf[pos] = m.gtHeader(--packetCount, pos);
					pos++;
				}
				buf[pos++] = b;
			},
			// Returns the i:th packet in the message.
			packet: function(i) {
				return buf.subarray(i*20, Math.min((i+1)*20, bufferLength));
			},
		};
	}

	// Returns the next GT header, given the number of packets remaining in the message.
	m.gtHeader = function(remain, pos) {
		var h = m.sendGtHeader + (remain);
		if(remain == 0) {
			m.sendGtHeader = (m.sendGtHeader + 0x20) & 0xff;
			if(m.sendGtHeader < 0x80) m.sendGtHeader = 0x80;
		}
		if(pos != 0) h &= 0x7f;
		return h;
	}

	/**
	* @param {winCallback} win
	* @param {failCallback} fail
	*/
	bean.startSerialRead = function(dataCallback, fail) {
		if(!m.haveServices) {
			// if we don't have our services yet, fetch them, then call this function again.
			m.getServices(function() {
				bean.startSerialRead(dataCallback, fail);
			}, fail);
			return;
		}

		console.log("startSerialRead");
		m.dataCallback = dataCallback;

		// Enable Notification.
		evothings.ble.writeDescriptor(m.deviceHandle, m.serialDesc, new Uint8Array([1,0]), function(){}, fail);
		evothings.ble.enableNotification(m.deviceHandle, m.serialChar, function(data) {
			// Handle incoming data.
			data = new Uint8Array(data);
			var hex = app.bytesToHexString(data);
			//console.log("recv: "+hex);
			if(data.byteLength < 8) {
				console.log("ignoring GT packet with bad length: "+data.byteLength);
				return;
			}
			var gtHeader = data[0];
			// ignore message count, since some messages may be lost.
			// it's only useful to ensure integrity of multi-packet messages.
			if((gtHeader & 0x9f) != 0x80) {
				//console.log(hex);
				//fail("multi-packet GST message detected! can't handle those yet...");
				m.handleMultiGST(data, gtHeader);
				return;
			}
			var length = data[1];
			if(length != data.byteLength - 5) {
				console.log("ignoring GST packet with bad length: "+length);
				return;
			}

			// let's ignore the reserved byte (data[2])

			// check message id
			if(data[3] != 0 || data[4] != 0) {
				console.log("ignoring App message with unknown ID " + bean.bytesToHexString(data, 3, 2));
				return;
			}

			// check crc
			var crc = m.computeCRC16(data, 1, length+2);
			if(data[data.byteLength-1] != ((crc >> 8) & 0xff) || data[data.byteLength-2] != (crc & 0xff)) {
				console.log("ignoring GST message with bad CRC (our crc "+crc.toString(16)+", data "+bean.bytesToHexString(data, 1, length+2)+")");
				return;
			}

			// now we finally have a proper message. let's pass it along.
			m.dataCallback(data.subarray(5, data.byteLength-2));
		}, fail);
	}

	m.handleMultiGST = function(data, gtHeader) {
		var counter = gtHeader & 0x60;
		var remain = gtHeader & 0x1f;
		//console.log("multi-packet GST message detected! counter: 0x"+counter.toString(16)+". remain: "+remain);
		var first = (gtHeader & 0x80) == 0x80;
		if(first) {
			var length = data[1];
			if(length > 66) {
				console.log("ignoring GST packet with bad length: "+length);
				return;
			}
			// 2 bytes for length+reserved, 2 btyes for the CRC.
			m.gstBuffer = new Uint8Array(length+4);
			// copy data, after GT header, length byte and Reserved byte, into buffer.
			m.gstBuffer.set(data.subarray(1));
			m.gstPosition = data.byteLength - 1;
			m.gstCounter = counter;
		} else {
			if(!m.gstBuffer) {
				console.log("second packet received before first!");
				return;
			}
			if(counter != m.gstCounter) {
				console.log("GT counter mismatch!");
				return;
			}
			if(remain != m.gstRemain - 1) {
				console.log("GT remain mismatch!");
				return;
			}
			// copy data after GT header into the unwritten part of gstBuffer.
			m.gstBuffer.subarray(m.gstPosition).set(data.subarray(1));
			m.gstPosition += data.byteLength - 1;
		}
		m.gstRemain = remain;
		if(remain == 0) {
			var data = m.gstBuffer;
			var length = data[1];
			// check message id
			if(data[2] != 0 || data[3] != 0) {
				console.log("ignoring App message with unknown ID " + bean.bytesToHexString(data, 2, 2));
				return;
			}

			// check crc
			var crc = m.computeCRC16(data, 0, data.byteLength-2);
			if(data[data.byteLength-1] != ((crc >> 8) & 0xff) || data[data.byteLength-2] != (crc & 0xff)) {
				console.log("ignoring GST message with bad CRC (our crc "+crc.toString(16)+", data "+bean.bytesToHexString(data)+")");
				return;
			}
			m.gstBuffer = false;
			m.dataCallback(data.subarray(4, data.byteLength-2));
		}
	}

	m.computeCRC16 = function(data, offset, length, crc) {
		crc = crc || 0xFFFF;

		for (var i=offset; i<offset+length; i++) {
			var byte = data[i];
			crc = (((crc >> 8) & 0xff) | (crc << 8)) & 0xFFFF;
			crc ^= byte;
			crc ^= ((crc & 0xff) >> 4) & 0xFFFF;
			crc ^= ((crc << 8) << 4) & 0xFFFF;
			crc ^= (((crc & 0xff) << 4) << 1) & 0xFFFF;
		}

		return crc;
	},

	bean.bytesToHexString = function(data, offset, length) {
		offset = offset || 0;
		length = length || data.byteLength;
		var hex = '';
		for(var i=offset; i<(offset+length); i++) {
			hex += (data[i] >> 4).toString(16);
			hex += (data[i] & 0xF).toString(16);
		}
		return hex;
	},

	m.getServices = function(win, fail) {
		m.serviceCallbacks.push(win);
		if(m.gettingServices) {
			return;
		}

		m.gettingServices = true;
		m.sendState('querying');

		evothings.ble.readAllServiceData(m.deviceHandle, function(services)
		{
			m.characteristicSides = [];
			// Find handles for characteristics and descriptor needed.
			for (var si in services)
			{
				var service = services[si];
				console.log('Service '+service.uuid);

				if(service.uuid == 'a495ff10-c5b1-4b44-b512-1370f02d74de')
				for (var ci in service.characteristics)
				{
					var characteristic = service.characteristics[ci];
					console.log(' Char '+characteristic.uuid);

					if (characteristic.uuid == 'a495ff11-c5b1-4b44-b512-1370f02d74de')
					{
						m.serialChar = characteristic.handle;
						for (var di in characteristic.descriptors)
						{
							var descriptor = characteristic.descriptors[di];
							console.log('  Desc '+descriptor.uuid);

							if (descriptor.uuid == '00002902-0000-1000-8000-00805f9b34fb')
							{
								m.serialDesc = descriptor.handle;
							}
						}
					}
				}
			}

			if (m.serialChar && m.serialDesc)
			{
				m.haveServices = true;
				m.gettingServices = false;
				m.sendState('active');

				// copy to local, to avoid callbacks modifying the array.
				// not really needed in such a small library, but good practice anyway.
				var sc = m.serviceCallbacks;
				m.serviceCallbacks = [];

				for(var i=0; i<sc.length; i++) {
					sc[i]();
				}
			}
			else
			{
				m.gettingServices = false;
				fail('Services not found!');
			}
		},
		fail);
	}

	return bean;
})();
