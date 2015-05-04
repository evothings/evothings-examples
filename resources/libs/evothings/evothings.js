;(function()
{
	/**
	 * @namespace
	 * @description <p>Functions for loading scripts asynchronously,
	 * detecting platform, and other common application functionality.</p>
	 * @alias evothings
	 * @public
	 */
	var evothings = window.evothings || {};
	window.evothings = evothings;

	/* ------------------ Script loading ------------------ */

	var scriptLoadingCounter = 0;
	var loadedScripts = {};
	var scriptsLoadedCallbacks = [];

	/* Make sure to catch any DOMContentLoaded events occurring before
	 * asynchronous loading of scripts. Those scripts, like ui.js, should check
	 * this variable before listening for the event. */
	evothings.gotDOMContentLoaded = false

	window.addEventListener('DOMContentLoaded', function(e)
	{
		evothings.gotDOMContentLoaded = true
	})

	/**
	 * Load a script.
	 * @param {string} url - URL or path to the script. Relative paths are
	 * relative to the HTML file that initiated script loading.
	 * @param {function} callback - Optional parameterless function that will
	 * be called when the script has loaded.
	 * @public
	 */
	evothings.loadScript = function(url, callback)
	{
		// If script is already loaded call callback directly and return.
		if (loadedScripts[url])
		{
			callback && callback();
			return;
		}

		// Add script to dictionary of loaded scripts.
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
					var loadedCallback = scriptsLoadedCallbacks[i];
					loadedCallback && loadedCallback();
				}

				// Clear callbacks - should we do this???
				scriptsLoadedCallbacks = [];
			}
		};

		// onerror fires for things like malformed URLs and 404's.
		// If this function is called, the matching onload will not be called and
		// scriptsLoaded will not fire.
		script.onerror = function()
		{
			throw "Could not load script '" + url + "'";
		};

		// Attaching the script tag to the document starts loading the script.
		document.head.appendChild(script);
	};

	/**
	 * Load array of scripts.
	 * @param {array} array - Array of URL or path name stringa.
	 * Relative paths are relative to the HTML file that initiated
	 * script loading.
	 * @param {function} loadedCallback - Optional parameterless
	 * function called when all scripts in the array has loaded.
	 * @public
	 */
	evothings.loadScripts = function(array, loadedCallback)
	{
		var lib = array.shift();
		if (!lib)
		{
			// Array is empty and all scripts are loaded.
			loadedCallback && loadedCallback();
		}
		else
		{
			// Load next script.
			evothings.loadScript(lib, function() {
				evothings.loadScripts(array, loadedCallback);
			});
		}
	};

	/**
	 * Experimental.
	 * Mark a script as loaded. This is useful if a script is designed
	 * to be included both in HTML and in JavaScript.
	 * @param {string} pathOrURL - URL or path to the script. Relative paths are
	 * relative to the HTML file that initiated script loading.
	 * @public
	 */
	evothings.markScriptAsLoaded = function(pathOrURL)
	{
		loadedScripts[url] = 'loadingcomplete';
	};

	/**
	 * <p>Add a callback that will be called when all scripts are loaded.</p>
	 * <p><strong>It is good practise to always use this function when
	 * loading script asynchronously or using a library that does so.</strong></p>
	 * @param  {function} callback - Parameterless function that will
	 * be called when all scripts have finished loading.
	 * @public
	 */
	evothings.scriptsLoaded = function(callback)
	{
		// If scripts are already loaded call the callback directly,
		// else add the callback to the callbacks array.
		if (0 != Object.keys(loadedScripts).length &&
			0 == scriptLoadingCounter)
		{
			callback && callback();
		}
		else
		{
			scriptsLoadedCallbacks.push(callback);
		}
	};

	/* ------------------ Debugging ------------------ */

	/**
	 * Print a JavaScript object (dictionary). For debugging.
	 *
	 * @param {Object} obj - Object to print.
	 * @param {function} printFun - print function (optional - defaults to
	 * console.log if not given).
	 *
	 * @example
	 * var obj = { company: 'Evothings', field: 'IoT' };
	 * evothings.printObject(obj);
	 * evothings.printObject(obj, console.log);
	 *
	 * @public
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

	/**
	 * @namespace
	 * @description Namespace for platform check functions.
	 */
	evothings.os = {};

	/**
	 * Returns true if current platform is iOS, false if not.
	 * @return {boolean} true if platform is iOS, false if not.
	 * @public
	 */
	evothings.os.isIOS = function()
	{
		return /iP(hone|ad|od)/.test(navigator.userAgent);
	};

	/**
	 * Returns true if current platform is iOS 7, false if not.
	 * @return {boolean} true if platform is iOS 7, false if not.
	 * @public
	 */
	evothings.os.isIOS7 = function()
	{
		return /iP(hone|ad|od).*OS 7/.test(navigator.userAgent);
	};

	/**
	 * Returns true if current platform is Android, false if not.
	 * @return {boolean} true if platform is Android, false if not.
	 * @public
	 */
	evothings.os.isAndroid = function()
	{
		return /Android|android/.test(navigator.userAgent);
	};

	/**
	 * Returns true if current platform is Windows Phone, false if not.
	 * @return {boolean} true if platform is Windows Phone, false if not.
	 * @public
	 */
	evothings.os.isWP = function()
	{
		return /Windows Phone/.test(navigator.userAgent);
	};

	/* ------------------ Load UI script ------------------ */

	evothings.loadScript('libs/evothings/ui/ui.js');
})();
