/*
Evothings UI functionality.

FastClick is used to make UI responsive.
*/

;(function()
{
	// Special layout hack for iOS 7.
	function applyiOS7LayoutHack()
	{
		// Set an absolute base font size in iOS 7 due to that viewport-relative
		// font sizes doesn't work properly caused by the WebKit bug described at
		// https://bugs.webkit.org/show_bug.cgi?id=131863.
		if (evothings.os.isIOS7())
		{
			document.body.style.fontSize = '20pt';
		}
	}

	function applyUIUpdatesWhenPageHasLoaded()
	{
		window.addEventListener('DOMContentLoaded', function(e)
		{
			applyiOS7LayoutHack();
			FastClick.attach(document.body);
		});
	}

	// Load FastClick, when loaded apply UI modifications.
	evothings.loadScript(
		'libs/evothings/ui/fastclick.js',
		applyUIUpdatesWhenPageHasLoaded);
})();
