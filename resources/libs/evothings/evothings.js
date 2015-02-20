// Dynamic script loader that tracks loaded scripts.
// Can also use an event (similar to 'devireready' in Cordova)
// to notify when scripts are loaded (by using a script loading
// counter to track progress).

/**
* @namespace
*/
evothings = window.evothings || {};
(function()
{
	/* ------------------ Script loading ------------------ */

	var scriptLoadingCounter = 0;
	var loadedScripts = {};
	var scriptsLoadedCallbacks = [];

	/**
	 * Load a script.
	 * @param {String} url - URL or path to the script. Relative paths are
	 * relative to the HTML file that initiated script loading.
	 * @param {function} callback - optional parameterless function that will
	 * be called when the script has loaded.
	 */
	evothings.loadScript = function(url, callback)
	{
		// If script is already loaded call callback directly and return.
		if (loadedScripts[url])
		{
			callback && callback();
			return;
		}

		// Add script to dictionaly of loaded scripts.
		loadedScripts[url] = 'loadingstarted';
		++scriptLoadingCounter;

		// Create script tag.
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = url;

		// Bind the onload event.
		script.onload = function()
		{
			// Mark as loaded.
			loadedScripts[url] = 'loadingcomplete';
			--scriptLoadingCounter;

			// Call callback if given.
			callback && callback();

			// Call scripts loaded callbacks if this was the last script loaded.
			if (0 == scriptLoadingCounter)
			{
				for (var i = 0; i < scriptsLoadedCallbacks.length; ++i)
				{
					(scriptsLoadedCallbacks[i])();
				}

				// Clear callbacks - should we do this???
				scriptsLoadedCallbacks = [];
			}
		}

		// onerror fires for things like malformed URLs and 404's.
		// If this function is called, the matching onload will not be called and
		// scriptsLoaded will not fire.
		script.onerror = function() {
			throw "Could not load script '"+url+"'";
		};

		// Attaching the script tag to the document starts loading the script.
		document.head.appendChild(script);
	}

	/**
	 * Add a callback that will be called when all scripts are loaded.
	 * @param callback - parameterless function that will
	 * be called when all scripts have finished loading.
	 */
	evothings.scriptsLoaded = function(callback)
	{
		// If scripts are already loaded call the callback directly,
		// else add the callback to the callbacks array.
		if (0 != Object.keys(loadedScripts).length &&
			0 == scriptLoadingCounter)
		{
			callback();
		}
		else
		{
			scriptsLoadedCallbacks.push(callback);
		}
	};

	/* ------------------ Debugging ------------------ */

	/**
	 * Print a JavaScript object (dictionary).
	 *
	 * @param {Object} obj - Object to print.
	 * @param {function} printFun - print function (optional - defaults to
	 * console.log if not given).
	 *
	 * @example
	 *   var obj = { company: 'Evothings', field: 'IoT' };
	 *   evothings.easyble.printObject(obj);
	 *   evothings.easyble.printObject(obj, console.log);
	 */
	evothings.printObject = function(obj, printFun)
	{
		printFun = printFun || console.log;
		function print(obj, level)
		{
			var indent = new Array(level + 1).join('  ');
			for (var prop in obj)
			{
				if (obj.hasOwnProperty(prop))
				{
					var value = obj[prop];
					if (typeof value == 'object')
					{
						printFun(indent + prop + ':');
						print(value, level + 1);
					}
					else
					{
						printFun(indent + prop + ': ' + value);
					}
				}
			}
		}
		print(obj, 0);
	};

	/* ------------------ Platform check ------------------ */

	evothings.os = {};

	evothings.os.isIOS = function()
	{
		return /iP(hone|ad|od)/.test(navigator.userAgent);
	};

	evothings.os.isIOS7 = function()
	{
		return /iP(hone|ad|od).*OS 7/.test(navigator.userAgent);
	};

	evothings.os.isAndroid = function()
	{
		return /Android|android/.test(navigator.userAgent);
	};

	evothings.os.isWP = function()
	{
		return /Windows Phone/.test(navigator.userAgent);
	};

	return evothings;

// If for some reason the global evothings variable is already defined we use it.
})();

window.addEventListener('DOMContentLoaded', function(e) {
	/* Set an absolute base font size in iOS 7 due to that viewport-relative
	font sizes doesn't work properly caused by the WebKit bug described at
	https://bugs.webkit.org/show_bug.cgi?id=131863. */
	if (evothings.os.isIOS7())
	{
		document.body.style.fontSize = '20pt'
	}
})
