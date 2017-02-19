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
var requestEvents 		= new XMLHttpRequest();
var parser 				= new DOMParser();


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
		launchWebsite("http://vivit-worldwide.org/");
	});

	$('#mainPanel').on('click', '#loadEvents', function() {											// load the events from the vivit website
		loadEvents();
	});
	
	loadEvents();
});


/**********************************************************************************
 * Events.
 **********************************************************************************/
function loadEvents() {
	requestEvents.onreadystatechange = function() {displayEvents();};
	requestEvents.open("GET", "http://c.ymcdn.com/sites/vivitworldwide.site-ym.com/resource/rss/events.rss", true);
	requestEvents.send();
}


/**********************************************************************************
 * Events.
 **********************************************************************************/
function displayEvents() {
	var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	var mons = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

	var html = "<div class='eventHeader'>Upcoming Events</div>";
	
	if(requestEvents.readyState == XMLHttpRequest.DONE & requestEvents.status == 200) {
		var xmlDoc 	= parser.parseFromString(requestEvents.responseText, 'text/xml');
		var items 	= xmlDoc.getElementsByTagName('item');

		for (var index1=1; index1<items.length; index1++) {
			var pubDate   = items[index1].getElementsByTagName('pubDate');
			var title  	  = items[index1].getElementsByTagName('title');
			var dateSplit = pubDate[0].childNodes[0].nodeValue.split(" ");
			var timeSplit = dateSplit[4].split(":");
			var eventDate = new Date(Date.UTC(dateSplit[3], convertMonStrInt(dateSplit[2]), dateSplit[1], timeSplit[0], timeSplit[1], timeSplit[2]));
			var eventZone = String(eventDate).split("(");

			html += "<div id=event_" + index1 + "'>";
			html += "<div class='eventDate'>" + days[eventDate.getDay()] +", " + mons[eventDate.getMonth()] + " " + eventDate.getDate() + ", " + eventDate.getFullYear() + "</div>";
			html += "<div class='eventLine'></div>";
			html += "<div class='eventTitle' onclick='eventInfo(" + index1 + ")'>" + title[0].childNodes[0].nodeValue + "</div>";
			html += "<div class='eventTime'><b>Time:</b> " + formatAMPM(eventDate) + " - (" + eventZone[1] + "</div>";
			html += "<div class='eventLine'></div>";
			html += "<img src='images\\ical.gif'><span class='eventAction'>Export to Your Calendar</span><img src='images\\notepad.gif'><span class='eventAction'><a href='#' onclick='eventReg(" + index1 + ")'>Register</a></span>"
			html += "</div>";
		}

		html += "<div data-role='popup' id='popupBasic'><div data-role='main' class='ui-content'><div id='popupContent'></div><a href='#' class='ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b ui-icon-back ui-btn-icon-left' data-rel='back'>Close</a></div></div></div>";

		$('#eventPage').html(html);
	}
}


/**********************************************************************************
 * 
 **********************************************************************************/
function eventInfo(which) {
	var xmlDoc 	= parser.parseFromString(requestEvents.responseText, 'text/xml');
	var items 	= xmlDoc.getElementsByTagName('item');
	var desc  	= items[which].getElementsByTagName('description');
	var html    = desc[0].firstChild.nodeValue;
	
	html += "<br/><br/><a href='#' onclick='eventReg(" + which + ")'>Register</a><br/><br/>";
	
	$('#popupContent').html(html);
	$('#popupBasic').popup();
	$('#popupBasic').popup("open");
}    



/**********************************************************************************
 * 
 **********************************************************************************/
function eventReg(which) {
	var xmlDoc 	= parser.parseFromString(requestEvents.responseText, 'text/xml');
	var items 	= xmlDoc.getElementsByTagName('item');
	var link  	= items[which].getElementsByTagName('link');
	
	$("body").pagecontainer("change", "#vivitWebsite");
	
	launchWebsite(link[0].firstChild.nodeValue);
}    



/**********************************************************************************
 * 
 **********************************************************************************/
function convertMonStrInt(monthStr) {
	var monthInt = 0;
	
	switch(monthStr) {
    	case "Jan": monthInt =  0; break;
    	case "Feb": monthInt =  1; break;
    	case "Mar": monthInt =  2; break;
    	case "Apr": monthInt =  3; break;
    	case "May": monthInt =  4; break;
    	case "Jun": monthInt =  5; break;
    	case "Jul": monthInt =  6; break;
    	case "Aug": monthInt =  7; break;
    	case "Sep": monthInt =  8; break;
    	case "Oct": monthInt =  9; break;
    	case "Nov": monthInt = 10; break;
    	case "Dec": monthInt = 11; break;
	}
	
	return monthInt;
}


/**********************************************************************************
 * Launch the Vivit Website.
 **********************************************************************************/
function formatAMPM(date) {
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var ampm = hours >= 12 ? 'pm' : 'am';

	hours = hours % 12;
	hours = hours ? hours : 12; // the hour '0' should be '12'
	minutes = minutes < 10 ? '0'+minutes : minutes;
	var strTime = hours + ':' + minutes + ' ' + ampm;

	return strTime;
}


/**********************************************************************************
 * Launch the Vivit Website.
 **********************************************************************************/
function launchWebsite(url) {
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
    	$("#websiteReference").text("Reload the Vivit Website (make this a link or button or something)");
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
