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
		if (x & 0x80) x = x - 256
		return x
	}

	funs.littleEndianToUint8 = function(data, offset)
	{
		return data[offset]
	}

	funs.littleEndianToInt16 = function(data, offset)
	{
		return (funs.littleEndianToInt8(data, offset + 1) << 8) +
			funs.littleEndianToUint8(data, offset)
	}

	funs.littleEndianToUint16 = function(data, offset)
	{
		return (funs.littleEndianToUint8(data, offset + 1) << 8) +
			funs.littleEndianToUint8(data, offset)
	}

	funs.littleEndianToUint32 = function(data, offset)
	{
		return (funs.littleEndianToUint8(data, offset + 3) << 24) +
			(funs.littleEndianToUint8(data, offset + 2) << 16) +
			(funs.littleEndianToUint8(data, offset + 1) << 8) +
			funs.littleEndianToUint8(data, offset)
	}

	// Converts a single Base64 character to a 6-bit integer.
	function b64ToUint6(nChr) {
		return nChr > 64 && nChr < 91 ?
				nChr - 65
			: nChr > 96 && nChr < 123 ?
				nChr - 71
			: nChr > 47 && nChr < 58 ?
				nChr + 4
			: nChr === 43 ?
				62
			: nChr === 47 ?
				63
			:
				0;
	}

	// Decodes a Base64 string. Returns a Uint8Array.
	// nBlocksSize is optional.
	funs.base64DecToArr = function(sBase64, nBlocksSize) {
		var
			sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ""), nInLen = sB64Enc.length,
			nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2,
			taBytes = new Uint8Array(nOutLen);

		for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
			nMod4 = nInIdx & 3;
			nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
			if (nMod4 === 3 || nInLen - nInIdx === 1) {
				for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
					taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
				}
				nUint24 = 0;

			}
		}

		return taBytes;
	}

	// Returns the integer i in hexadecimal string form,
	// with leading zeroes, such that
	// the resulting string is at least byteCount*2 characters long.
	funs.toHexString = function(i, byteCount) {
		var string = (new Number(i)).toString(16);
		while(string.length < byteCount*2) {
			string = '0'+string;
		}
		return string;
	}

	// Return object that holds functions.
	return funs
})()
