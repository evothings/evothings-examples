// This is a scimple server that 'simulates' and Arduino from
// the point of view of an Evothings JavaScript app.
// I wrote it for debugging purposes.

var NET = require('net')
var OS = require('os')
var DNS = require('dns')

var server = NET.createServer(serverFun)

server.listen(3300)

function serverFun(socket)
{
	try
	{
		console.log('Connected ' + socket.remoteAddress + ':' + socket.remotePort)

		//socket.setEncoding('utf8')

		socket.on('close', function (had_error)
		{
			console.log('Connection closed')
		});

		socket.on('data', function(data)
		{
			console.log(data.toString().substr(0,2))
			var command = data.toString()

			if ('O' == command[0])
			{
				console.log('PIN ' + command[1] + ' mode is OUTPUT')
			}
			if ('I' == command[0])
			{
				console.log('PIN ' + command[1] + ' mode is INPUT')
			}
			if ('H' == command[0])
			{
				console.log('PIN ' + command[1] + ' is ON')
			}
			if ('L' == command[0])
			{
				console.log('PIN ' + command[1] + ' is OFF')
			}
			if ('R' == command[0])
			{
				socket.write(((Math.random() < 0.5) ? 'L' : 'H') + '\n')
			}
			if ('A' == command[0])
			{
				socket.write(Math.floor(Math.random() * 1024) + '\n')
			}
		});
	}
	catch(err)
	{
		console.log('Error: ' + err)
	}
}

/**
 * Get the public IP-address for the machine.
 * @param fun Function f(error, address, family)
 * Thanks to nodyou: http://stackoverflow.com/a/8440736/1285614
 */
function GetIP(fun)
{
  DNS.lookup(OS.hostname(), fun)
}

GetIP(function (err, addr, fam)
{
	console.log('Arduino server running at ' + addr)
})
