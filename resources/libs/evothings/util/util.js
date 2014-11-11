/**
 * File: util.js
 * Description: Utilities for byte arrays.
 * Author: Aaron Ardiri
 */
if (!window.evothings) { window.evothings = {} }
evothings.util = (function()
{
	var funs = {}

	funs.littleEndianToInt8 = function(data, offset)
	{
		var x = funs.littleEndianToUint8(data, offset)
		if (x & 0x80) x = (~x & 0xff) - 1
		return x
	}

	funs.littleEndianToUint8 = function(data, offset)
	{
		return data[offset]
	}

	funs.littleEndianToInt16 = function(data, offset)
	{
		return (funs.littleEndianToInt8(data, offset + 1) << 8)
			+ funs.littleEndianToUint8(data, offset)
	}

	funs.littleEndianToUint16 = function(data, offset)
	{
		return (funs.littleEndianToUint8(data, offset + 1) << 8)
			+ funs.littleEndianToUint8(data, offset)
	}

	// Return object that holds functions.
	return funs
})()
