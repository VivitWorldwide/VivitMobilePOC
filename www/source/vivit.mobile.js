/**********************************************************************************
 *                       - V i v i t   W o r l d w i d e -
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
var requestEventThumbs	= new XMLHttpRequest();
var parser 				= new DOMParser();


/**********************************************************************************
 * Initialization routines.
 **********************************************************************************/
$(document).ready(function() {
	$('#mainPanel').load('source/mainPanel.htm');													// load the main panel html
	
	for (var indx1=1; indx1<8; indx1++) {															// load the main header html onto each page
		$('#mainHeader' + indx1).load('source/mainHeader.htm');
		$('#mainBannerAdd' + indx1).load('source/mainBannerAdd.htm');								// load the main banner add html onto each page
	}

	$('#mainPanel').enhanceWithin().panel();														// establish the main panel

	$('#mainPanel').on('click', '#loadEvents', function() {											// load the events from the vivit website
		loadEvents();
	});

	$('#mainPanel').on('click', '#loadTechBeacon', function() {										// load the tech beacon info from the vivit website
		loadTechBeacon();
	});

	$('#mainPanel').on('click', '#website', function() {											// load the vivit website when prompted
		launchWebsite("http://vivit-worldwide.org/");
	});
});


/**********************************************************************************
 * Call the Vivit Upcoming Events RSS feed to load the information.  When the info
 * has loaded, load the event page to get the thumbnail images.
 **********************************************************************************/
function loadEvents() {
	requestEvents.onreadystatechange = function() {requestEventThumbnails();};
	requestEvents.open("GET", "http://c.ymcdn.com/sites/vivitworldwide.site-ym.com/resource/rss/events.rss", true);
	requestEvents.send();
}


/**********************************************************************************
 * Call the Vivit Upcoming Events page to load the thumbnail images.  When the 
 * images have loaded, display the events.
 **********************************************************************************/
function requestEventThumbnails() {
	requestEventThumbs.onreadystatechange = function() {displayEvents();};
	requestEventThumbs.open("GET", "https://vivitworldwide.site-ym.com/events/event_list.asp", true);
	requestEventThumbs.send();
}


/**********************************************************************************
 * Display the Vivit Upcoming Events information.  This is triggered by the RSS
 * feed load.
 **********************************************************************************/
function displayEvents() {
	var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	var mons = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	var html = "";
	var thmb = [];
	var tcnt = 0;

	if (requestEventThumbs.readyState == XMLHttpRequest.DONE & requestEventThumbs.status == 200) {
		var desc = requestEventThumbs.responseText;
		var imgpos = 0;
		var imgurl = "";
		do {
			imgpos = desc.indexOf("<img src=", imgpos+1);
			var quote1pos = desc.indexOf('"', imgpos+10);
			var quote2pos = desc.indexOf("'", imgpos+10);
			var quote3pos = quote1pos;
			if (quote2pos < quote1pos) quote3pos = quote2pos;
			if (imgpos > 0) imgurl = desc.substring(imgpos+10, quote3pos);
			if (imgurl.indexOf("thumb") > 0) {
				thmb[tcnt] = imgurl;
				tcnt++;
			}
		}
		while (imgpos > 0);
	}
	
	if (requestEvents.readyState == XMLHttpRequest.DONE & requestEvents.status == 200) {
		var xmlDoc 	  = parser.parseFromString(requestEvents.responseText, "text/xml");
		var items 	  = xmlDoc.getElementsByTagName("item");
		var saveDate  = new Date();
		var today 	  = new Date(saveDate.getFullYear(), saveDate.getMonth(), saveDate.getDate(), 0, 0, 0, 0);

		for (var indx1=0; indx1<items.length; indx1++) {
			var pubDate   = items[indx1].getElementsByTagName("pubDate");
			var title  	  = items[indx1].getElementsByTagName("title");
			var desc  	  = items[indx1].getElementsByTagName("description")[0].firstChild.nodeValue.replace(/\n/g, "");
			var dateSplit = pubDate[0].firstChild.nodeValue.split(" ");
			var timeSplit = dateSplit[4].split(":");
			var eventDate = new Date(Date.UTC(dateSplit[3], convertMonStrInt(dateSplit[2]), dateSplit[1], timeSplit[0], timeSplit[1], timeSplit[2]));
			var eventZone = String(eventDate).split("(");

			if (eventDate < today) continue;

			if (eventDate.getTime() !== saveDate.getTime()) {
				saveDate = eventDate;
/*
				var imgpos = 0;
				var imgurl = "";
				do {
					imgpos = desc.indexOf("<img src=", imgpos+1);
					if (imgpos > 0) imgurl = desc.substring(imgpos+10, desc.indexOf('"', imgpos+10));
					if (imgurl.indexOf("vivit_and_hpe")  < 0 & imgurl.indexOf("register") < 0 & imgurl.indexOf("hpe_logo") < 0) break;
					else (imgurl = "");
				}
				while (imgpos > 0);
				if (imgurl == "") imgurl = "images/vivit_logo.png";
*/
				if (thmb[indx1] != "") imgurl = "https://vivitworldwide.site-ym.com" + thmb[indx1]; 
				else imgurl = "images/vivit_logo.png";
				
				html += "<div id=eventDate_" + indx1 + "' class='eventDateItem'>";
				html += "<div class='eventDate'>" + days[eventDate.getDay()] +", " + mons[eventDate.getMonth()] + " " + eventDate.getDate() + ", " + eventDate.getFullYear() + "</div>";
				html += "</div>";

				html += "<div id=eventItem_" + indx1 + "' class='eventItem'>";
				html += "<div class='eventFloat'>";
				html += "<div class='eventTitle' onclick='eventInfo(" + indx1 + ")'>" + title[0].firstChild.nodeValue + "</div>";
				html += "<div class='eventImage'><img src='" + imgurl + "'></div>";
				html += "</div>";
				html += "<div class='eventTime'><b>Time:</b> " + formatAMPM(eventDate) + " - (" + eventZone[1] + "</div>";
				html += "<div class='eventLine'></div>";
				html += "<img src='images\\ical.gif'><span class='eventAction'>Export to Your Calendar</span><img src='images\\notepad.gif'><span class='eventAction'><a href='#' onclick='eventReg(" + indx1 + ")'>Register</a></span>"
				html += "</div>";
			}
		}

		$('#eventPage').html(html);
	}
}


/**********************************************************************************
 * 
 **********************************************************************************/
function eventInfo(which) {
	var xmlDoc 	= parser.parseFromString(requestEvents.responseText, "text/xml");
	var items 	= xmlDoc.getElementsByTagName("item");
	var desc  	= items[which].getElementsByTagName("description");
	var html    = desc[0].firstChild.nodeValue;
	
	html += "<br/><br/><a href='#' onclick='eventReg(" + which + ")'>Register</a><br/><br/>";
		
	$('#eventInfoContent').html(html);
	$("#openEventInfo").click();
}    


/**********************************************************************************
 * 
 **********************************************************************************/
function eventReg(which) {
	var xmlDoc 	= parser.parseFromString(requestEvents.responseText, "text/xml");
	var items 	= xmlDoc.getElementsByTagName("item");
	var link  	= items[which].getElementsByTagName("link");
	
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
 * Call the Vivit TechBeacon RSS feed to load the information.  When the info
 * has loaded, display it.
 **********************************************************************************/
function loadTechBeacon() {
	requestEvents.onreadystatechange = function() {displayTechBeacon();};
	requestEvents.open("GET", "http://feeds.feedburner.com/techbeacon/rss", true);
	requestEvents.send();
}


/**********************************************************************************
 * Display the Vivit TechBeacon information.  This is triggered by the RSS feed
 * load.
 **********************************************************************************/
function displayTechBeacon() {
	if (requestEvents.readyState == XMLHttpRequest.DONE & requestEvents.status == 200) {

		var xmlDoc 	  = parser.parseFromString(requestEvents.responseText, "text/xml");
		var items 	  = xmlDoc.getElementsByTagName("item");
		var html	  = "";

//		for (var indx1=0; indx1<items.length; indx1++) {
		for (var indx1=0; indx1<3; indx1++) {
//			alert(items[indx1].firstChild.nodeValue);
		}
		
		$('#techBeaconPage').html("TEST");
	}
}


/**********************************************************************************
 * Launch the Vivit Website.
 **********************************************************************************/
function formatAMPM(date) {
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var ampm = hours >= 12 ? 'pm' : 'am';

	hours = hours % 12;
	hours = hours ? hours : 12; 								// hour 0 should be 12
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
