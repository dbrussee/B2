// Written by Dan Brussee
// Version 2.0: Released <unreleased>
// Added to bettway GIT

var style = document.createElement('style');
style.type = 'text/css';
var B = ".BDialog { z-index: 9999; display: none; } ";
B += ".ui-dialog .ui-dialog-titlebar, " +
		".ui-dialog .ui-dialog-buttonpane, " +
		".ui-dialog .ui-dialog-content, " +
		".ui-button { font-size: .8em; }";
B += ".no-close .ui-dialog-titlebar-close { display: none; } ";
B += ".no-title .ui-dialog .ui-dialog-titlebar { display: none; } ";
B += "table.form tr th { padding-right:.3em; text-align:right; font-weight:bold; background-color:transparent; } ";
B += "label { display:inline; } ";
style.innerHTML = B;
document.getElementsByTagName('head')[0].appendChild(style);

B = { };
B.version = "2.0"; // B2_0.js

// Cusomize these settings to work as you want them
B.settings = {
	say: {
		defTitle: 'System Message'
	},
	RemoteMethod: {
		URL: 'rpc/method'
	}
};
B.choiceValue = null;

$(document).ready(function() {
	$(".BDialog").dialog({ autoOpen: false, resizable: false, modal: true, beforeClose: function() {  } });
	$('form').bind('submit',function(e){e.preventDefault();});
    $( document ).tooltip({ track: true });
	$(":button").button();
    $("input[type='text'], textarea").attr('spellcheck',false);
    //$("form").first().find("input").first().focus().select();
    if (typeof init === 'function') init();
});


B.whichOneOf = function(txt) {
	var a = txt;
	if (arguments.length > 2) {
		for (var i = 1; i < arguments.length; i++) {
			var b = arguments[i].trim().toUpperCase();
			if (a == b) return i-1;
		}
	} else {
		var itm = arguments[1];
		if (typeof itm == "string") {
			var lst = itm.split(",");
			for (var i = 0; i < lst.length; i++) {
				var b = lst[i].trim().toUpperCase();
				if (a == b) return i;
			}
		} else { // list passed in
			for (var i = 0; i < itm.length; i++) {
				var b = itm[i].trim().toUpperCase();
				if (a == b) return i;
			}
		}
	}
	return -1;
};
B.isOneOf = function() {
	return B.whichOneOf.apply(null, arguments) >= 0;
};
B.isNotOneOf = function() {
	return B.whichOneOf.apply(null, arguments) < 0;
};

B.is = {
	DATE: function(val, min, max) {
		var t = new Date(val).getTime();
		if (isNaN(t)) return false;
		if (min != undefined && min !== null) {
			if (new Date(min).getTime() > t) return false;
		}
		if (max != undefined && max != null && max !== "") {
			if (t > new Date(max).getTime()) return false;
		}
		return true;		
	},
	INTEGER: function(val, min, max) { 
		var int = parseInt(String(val),10);
		if (isNaN(int)) return false;
		if (int.toString() != val.toString()) return false;
		if (min != undefined && min !== null) {
			if (parseInt(min,10) > int) return false;
		}
		if (max != undefined && max != null && max !== "") {
			if (int > parseInt(max,10)) return false;
		}
		return true;
	},
	NOTONEOF: function() { return B.whichOneOf.apply(null, arguments) < 0; },
	ONEOF: function() { return B.whichOneOf.apply(null, arguments) >= 0; }
};

// Dialogs -- These are defined at global level to make the simple to use.
B.dialogStack = []; // The stack stays in the B domain
function openDialog(id, btns) {
	if (btns == undefined) btns = [];
	var dlg = $("#" + id);
	var lst = $(":button.BDialogButton", dlg);
	for (var i = 0; i < lst.length; i++) {
		var el = lst[i]; // Original button
		el.style.display = "none";
		var txt = el.innerText;
		if (txt == undefined) txt = el.textContent;
		var btn = { text: txt, click: el.onclick };
		if (el.getAttribute("id") != "") {
			btn.id = id + "_" + el.getAttribute("id");
		} else if (el.getAttribute("data-id") != "") {
			btn.id = id + "_" + el.getAttribute("data-id");
		}
		btns.push(btn);
	}
	if (btns.length == 0) btns = [ { text: 'Ok', click: function() { popDialog(); } } ];
	var height = dlg.data("height"); // Remember the last values
	var width = dlg.data("width");
	if (height === undefined) { // data attribute not found... use CSS values
		height = dlg.css("height");
		width = dlg.css("width");
	}
	height = parseInt(height,10);
	width = parseInt(width,10);
	dlg.data("height", height).data("width", width);

	dlg.dialog({ 
		autoOpen: false, 
		dialogClass: "no-class",
		resizable: false,	
		modal: true, 
		buttons: btns, 
		height: height, 
		width: width
	});
	dlg.dialog("widget").find('.ui-dialog-titlebar-close').remove()

	dlg.dialog("option", "closeOnEscape", false);
	dlg.dialog("open");
	B.dialogStack.push(id);
	return dlg;
};
function popDialog() {
	closeDialog(B.dialogStack[B.dialogStack.length-1]);
};
function closeDialog(id) {
	var dlg = $("#" + id);
	dlg.dialog("close");
	for (var i = 0; i < B.dialogStack.length; i++) {
		if (B.dialogStack[i] == id) {
			B.dialogStack.splice(i, 1);
			break; // Only pop one... just in case it was opened multiple times
		}
	}
	return false;
};
function say(msg, title, callback, height, width, btns) {
	if (btns == undefined) btns = [];
	if (btns == "" || btns == null) btns = [];
	if (callback == undefined) callback = null;
	if (width == undefined) width = 350;
	if (height == undefined) height = 250;
	if (btns.length == 0) btns = [ { text: 'Close', click: function() { closeDialog("B-Say-Dialog"); } } ];
	if (title == undefined) title = B.settings.say.defTitle;
	if (title == "") title = B.settings.say.defTitle;

	var h = "<form id='B-Say-Dialog' class='BDialog' title='" + title + "'>"
	h += "<div id='B-Say-Dialog-Message' style='width: 100%; height: 100%; overflow-y: auto;'></div>";
	h += "</form>";
	$("body").append(h);

	var dlg = $("#B-Say-Dialog");
	dlg.dialog({ 
		dialogClass: "no-class",
		resizable: true, modal: true, autoOpen: false, closeOnEscape: false,
		height: height, width: width, minHeight: 200, minWidth: 300,
		buttons: btns, 
		close: function() { $(this).dialog("destroy").remove(); }
	});
	dlg.dialog("widget").find('.ui-dialog-titlebar-close').remove()
	dlg.dialog("open");
	
	$("#B-Say-Dialog-Message").html(msg);
};
function sayFix(fixlist, msg, title, height, width) {
	if (fixlist == "") return;
	fixlist = fixlist.substr(1);
	fixlist = "<li>" + fixlist.split("\n").join("</li><li>") + "</li>";
	if (msg == undefined) msg = "Correct the following items and try again:";
	msg += "<br><div style='height: 115px; position: relative; overflow-y: auto;'>";
	msg += "<ul>" + fixlist + "</ul>";
	msg += "</div>";
	say(msg, title, null, height, width);
};
choose = function(msg, title, options, callback, height, width) {
	var btns = [];
	var lst = options.split(",");
	for (var i = 0; i < lst.length; i++) {
		if (i == 0)	btns.push({ text: lst[i], click: function() { closeDialog("B-Say-Dialog"); callback("1"); } });
		if (i == 1)	btns.push({ text: lst[i], click: function() { closeDialog("B-Say-Dialog"); callback("2"); } });
		if (i == 2)	btns.push({ text: lst[i], click: function() { closeDialog("B-Say-Dialog"); callback("3"); } });
		if (i == 3)	btns.push({ text: lst[i], click: function() { closeDialog("B-Say-Dialog"); callback("4"); } });
		if (i == 4)	btns.push({ text: lst[i], click: function() { closeDialog("B-Say-Dialog"); callback("5"); } });
		if (i == 5)	btns.push({ text: lst[i], click: function() { closeDialog("B-Say-Dialog"); callback("6"); } });
		if (i == 6)	btns.push({ text: lst[i], click: function() { closeDialog("B-Say-Dialog"); callback("7"); } });
		if (i == 7)	btns.push({ text: lst[i], click: function() { closeDialog("B-Say-Dialog"); callback("8"); } });
		if (i == 8)	btns.push({ text: lst[i], click: function() { closeDialog("B-Say-Dialog"); callback("9"); } });
	}
	say(msg, title, callback, height, width, btns);
};
ask = function(msg, title, callback, height, width) {
	var btns = [
		{ text: "Yes", click: function() { 
			closeDialog("B-Say-Dialog"); 
			callback("YES"); } },
		{ text: "No",  click: function() { 
			closeDialog("B-Say-Dialog"); 
			callback("NO");  } }
	];
	say(msg, title, callback, height, width, btns);
}
askC = function(msg, title, callback, height, width) {
	var btns = [
		{ text: "Yes", click: function() { 
			closeDialog("B-Say-Dialog"); 
			callback("YES"); } },
		{ text: "No",  click: function() { 
			closeDialog("B-Say-Dialog"); 
			callback("NO");  } },
		{ text: "Cancel",  click: function() { 
			closeDialog("B-Say-Dialog"); 
			callback("CANCEL");  } }
	];
	say(msg, title, callback, height, width, btns);
}
