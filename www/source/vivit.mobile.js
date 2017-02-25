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
	
	for (var indx1=1; indx1<8; indx1++) {															// load the main header html onto each page
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

	var html = "";

	if(requestEvents.readyState == XMLHttpRequest.DONE & requestEvents.status == 200) {
		var xmlDoc 	  = parser.parseFromString(requestEvents.responseText, 'text/xml');
		var items 	  = xmlDoc.getElementsByTagName('item');
		var saveDate  = new Date();
		var today 	  = new Date(saveDate.getFullYear(), saveDate.getMonth(), saveDate.getDate(), 0, 0, 0, 0);

		for (var index1=0; index1<items.length; index1++) {
			var pubDate   = items[index1].getElementsByTagName('pubDate');
			var title  	  = items[index1].getElementsByTagName('title');
			var desc  	  = items[index1].getElementsByTagName('description')[0].firstChild.nodeValue.replace(/\n/g, "");
			var dateSplit = pubDate[0].firstChild.nodeValue.split(" ");
			var timeSplit = dateSplit[4].split(":");
			var eventDate = new Date(Date.UTC(dateSplit[3], convertMonStrInt(dateSplit[2]), dateSplit[1], timeSplit[0], timeSplit[1], timeSplit[2]));
			var eventZone = String(eventDate).split("(");

			if (eventDate < today) continue;

			if (eventDate.getTime() !== saveDate.getTime()) {
				saveDate = eventDate;

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
				
				html += "<div id=eventDate_" + index1 + "' class='eventDateItem'>";
				html += "<div class='eventDate'>" + days[eventDate.getDay()] +", " + mons[eventDate.getMonth()] + " " + eventDate.getDate() + ", " + eventDate.getFullYear() + "</div>";
				html += "</div>";

				html += "<div id=eventItem_" + index1 + "' class='eventItem'>";
				html += "<div class='eventFloat'>";
				html += "<div class='eventTitle' onclick='eventInfo(" + index1 + ")'>" + title[0].firstChild.nodeValue + "</div>";
				html += "<div class='eventImage'><img src='" + imgurl + "' width='50px;'></div>";
				html += "</div>";
				html += "<div class='eventTime'><b>Time:</b> " + formatAMPM(eventDate) + " - (" + eventZone[1] + "</div>";
				html += "<div class='eventLine'></div>";
				html += "<img src='images\\ical.gif'><span class='eventAction'>Export to Your Calendar</span><img src='images\\notepad.gif'><span class='eventAction'><a href='#' onclick='eventReg(" + index1 + ")'>Register</a></span>"
				html += "</div>";
			}
		}

		html += "<div id='popupBasic' data-role='popup'><div data-role='main' class='ui-content'><div id='popupContent'></div><a href='#' class='ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b ui-icon-back ui-btn-icon-left' data-rel='back'>Close</a></div></div></div>";

		$('#eventPage').html(html);
		$('#popupBasic').hide();
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
	$('#popupBasic').show();
//	$('#popupBasic').popup();
	
    $("#popupBasic").popup({
        beforeposition: function () {
            $(this).css({
                width: window.innerWidth - 10,
                height: window.innerHeight - 14
            });
        },
        x: 0,
        y: 0
    });

    $('#popupBasic').css('overflow-y', 'scroll');
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
