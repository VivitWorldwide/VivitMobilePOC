/**********************************************************************************
 *                       - V i v i t   W o r l d w id e -
 *
 * vivit.mobile.js (VivitMobilePOC)
 *=================================================================================
 * Written by: Mark Ford / 02-11-2017
 *
 * The main javascript code.
 **********************************************************************************/

/**********************************************************************************
 * Global variables.
 **********************************************************************************/
var inAppBrowserRef;


/**********************************************************************************
 * Initialization routines.
 **********************************************************************************/
$(document).ready(function() {
	$('#mainPanel').load('source/mainPanel.htm');													// load the main panel html
	
	for (var indx1=1; indx1<7; indx1++) {															// load the main header html onto each page
		$('#mainHeader' + indx1).load('source/mainHeader.htm');
		$('#mainBannerAdd' + indx1).load('source/mainBannerAdd.htm');								// load the main banner add html onto each page
	}

	$('#mainPanel').enhanceWithin().panel();														// establish the main panel

	$('#mainPanel').on('click', '#website', function() {											// load the vivit website when prompted
		launchWebsite();
	});
});


/**********************************************************************************
 * Launch the Vivit Website.
 **********************************************************************************/
function launchWebsite() {
	var url		= "http://vivit-worldwide.org/"
	var target 	= "_blank";
	var options = "location=yes,hidden=yes";

	inAppBrowserRef = cordova.InAppBrowser.open(url, target, options);
	inAppBrowserRef.addEventListener('loadstart', loadStartCallBack);
	inAppBrowserRef.addEventListener('loadstop', loadStopCallBack);
	inAppBrowserRef.addEventListener('loaderror', loadErrorCallBack);
}


/**********************************************************************************
 * Let the user know the website is loading.
 **********************************************************************************/
function loadStartCallBack() {
	$("#websiteReference").text("Loading the Vivit Website... Please wait...");
}


/**********************************************************************************
 * Update the loading message and show the website.
 **********************************************************************************/
function loadStopCallBack() {
	if (inAppBrowserRef != undefined) {
    	$("#websiteReference").text("Reload the Vivit Website (make this a link or button or something");
    	inAppBrowserRef.insertCSS({ code: "body{font-size: 25px;" });
    	inAppBrowserRef.show();
	}
}


/**********************************************************************************
 * Communicate any errors that occur loading the website.
 **********************************************************************************/
function loadErrorCallBack(params) {
	$("#websiteReference").text("The Vivit Website appears unavailable: " + params.message);
 
	inAppBrowserRef.close();
	inAppBrowserRef = undefined;
}
