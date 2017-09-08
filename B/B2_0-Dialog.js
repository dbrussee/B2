// Dialogs -- These are defined at global level to make the simple to use.

// TODO
// BUG: askValue - Enter key submits page (reload)

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
		if (el.getAttribute("id") != null) {
			btn.id = id + "_" + el.getAttribute("id");
		} else if (el.getAttribute("data-id") != null) {
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
		resizable: true,	
		modal: true, 
		buttons: btns, 
		height: height, 
		width: width
	});
	dlg.dialog("widget").find('.ui-dialog-titlebar-close').remove()

	dlg.dialog("option", "closeOnEscape", false);
	dlg.dialog("open");
	dlg.find("input").first().focus();
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

function sayBase(msg, title, callback, height, width, btns) {
	if (btns == undefined) btns = [];
	if (btns == "" || btns == null) btns = [];
	if (callback == undefined) callback = null;
	if (width == undefined) width = 350;
	if (height == undefined) height = 250;
	if (btns.length == 0) btns = [ { text: 'Ok', click: function() { closeDialog("B-Say-Dialog"); } } ];
	if (btns.length == 1 && btns[0] == "NONE") btns = []; // Freeze?
	if (title == undefined) title = B.settings.say.defTitle;
	if (title == "") title = B.settings.say.defTitle;

	var h = "<form id='B-Say-Dialog' class='BDialog' title='" + B.settings.say.defTitle + "'>"
	h += "<div id='B-Say-Dialog-Message' style='width: 100%; height: 100%; overflow-y: auto;'></div>";
	h += "</form>";
	$("body").append(h);

	var dlg = $("#B-Say-Dialog");
	dlg.submit(function(event) {
		event.preventDefault();
	});
	dlg.dialog({ 
		dialogClass: "no-class",
		resizable: true, modal: true, autoOpen: false, closeOnEscape: false,
		height: height, width: width, minHeight: 200, minWidth: 300,
		buttons: btns, 
		close: function() { $(this).dialog("destroy").remove(); }
	});
	dlg.dialog("widget").find('.ui-dialog-titlebar-close').remove()
	dlg.dialog("open");
	dlg.dialog('option', 'title', title);
	$("#B-Say-Dialog-Message").html(msg);
};
function sayIcon(icon, msg, title, callback, height, width, btns) {
	msg = B.img(icon, 28, "", "", "float: left; padding-right: 10px;") + msg;
	sayBase(msg, title, callback, height, width, btns);
	if (icon == "WARN") {
		$("#B-Say-Dialog").css("background", "papayawhip");
	} else if (icon == "ERROR") {
		$("#B-Say-Dialog").css("background", "mistyrose");
	}
};
function say(msg, t, cb, h, w, bs) { sayIcon("INFO", msg, t, cb, h, w, bs); };
function sayWarn(msg, t, cb, h, w, bs) { sayIcon("WARN", msg, t, cb, h, w, bs); };
function sayError(msg, t, cb, h, w, bs) { sayIcon("ERROR", msg, t, cb, h, w, bs); };
function sayFix(fixlist, msg, title, height, width) {
	if (fixlist == "") return;
	fixlist = fixlist.substr(1);
	fixlist = "<li>" + fixlist.split("\n").join("</li><li>") + "</li>";
	if (msg == undefined) msg = "Correct the following items and try again:";
	msg += "<br><div style='height: 115px; position: relative; overflow-y: auto;'>";
	msg += "<ul>" + fixlist + "</ul>";
	msg += "</div>";
	sayIcon("GEAR", msg, title, null, height, width);
};
chooseIcon = function(icon, msg, title, options, callback, height, width) {
	if (callback == undefined) callback = function() { };
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
	sayIcon(icon, msg, title, callback, height, width, btns);
};
function choose(msg, t, opts, cb, h, w) { chooseIcon("HELP", msg, t, opts, cb, h, w); };
function chooseWarn(msg, t, opts, cb, h, w) { chooseIcon("WARN", msg, t, opts, cb, h, w); };
function chooseError(msg, t, opts, cb, h, w) { chooseIcon("ERROR", msg, t, opts, cb, h, w); };
askIcon = function(icon, msg, title, callback, height, width) {
	if (callback == undefined) callback = function() { };
	var btns = [
		{ text: "Yes", click: function() { 
			closeDialog("B-Say-Dialog"); 
			callback("YES"); } },
		{ text: "No",  click: function() { 
			closeDialog("B-Say-Dialog"); 
			callback("NO");  } }
	];
	sayIcon(icon, msg, title, callback, height, width, btns);
}
function ask(msg, t, cb, h, w) { askIcon("HELP", msg, t, cb, h, w); };
function askWarn(msg, t, cb, h, w) { askIcon("WARN", msg, t, cb, h, w); };
function askError(msg, t, cb, h, w) { askIcon("ERROR", msg, t, cb, h, w); };
askCIcon = function(icon, msg, title, callback, height, width) {
	if (callback == undefined) callback = function() { };
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
	sayIcon(icon, msg, title, callback, height, width, btns);
}
function askC(msg, t, cb, h, w) { askCIcon("HELP", msg, t, cb, h, w); };
function askCWarn(msg, t, cb, h, w) { askCIcon("WARN", msg, t, cb, h, w); };
function askCError(msg, t, cb, h, w) { askCIcon("ERROR", msg, t, cb, h, w); };

askValueIcon = function(icon, msg, prompt, value, title, callback, height, width) {
	if (callback == undefined) callback = function() { };
	var h = msg;
	h += "<table class='form' style='width:98%'>";
	h += "<tr><th>" + prompt + "</th><td><input id='B-Say-Dialog-Value' size='20'></td></tr>";
	h += "</table>";
	var btns = [
		{ text: "Ok",  click: function() { 
			var rslt = $("#B-Say-Dialog-Value").val();
			closeDialog("B-Say-Dialog"); 
			callback(rslt);  } },
		{ text: "Cancel",  click: function() { 
			closeDialog("B-Say-Dialog"); 
			callback(null);  } }
	];
	sayIcon(icon, h, title, callback, height, width, btns);
	if (value != undefined && value != null) $("#B-Say-Dialog-Value").val(value);
	$("#B-Say-Dialog-Value").select().focus();
}
function askValue(msg, p, v, t, cb, h, w) { askValueIcon("HELP", msg, p, v, t, cb, h, w); };
function askValueWarn(msg, p, v, t, cb, h, w) { askValueIcon("WARN", msg, p, v, t, cb, h, w); };
function askValueError(msg, p, v, t, cb, h, w) { askValueIcon("ERROR", msg, p, v, t, cb, h, w); };

function freeze(msg, title, with_timer, height, width) {
	if (with_timer == undefined) with_timer = false;
	var h = "<div style='float:left; width:40px; text-align:center; padding-right:10px;'>"
	h += B.img("SPINNER", 28);
	if (with_timer) {
		h += "<div id='freezeDialogTimer' style='width:100%; text-align:center; font-size:7pt;'>";
		h += "&nbsp;"
		h += "</div>";
		B.freezeStart = new Date();
		B.freezeTimer = setInterval(function() {
			var et = B.format.ELAPSE(B.freezeStart, new Date());
			document.getElementById("freezeDialogTimer").innerHTML = et;
		}, 1005);
	}
	h += "</div>";
	h += "<span id='freezeMessageText'>" + msg + "</span>";
	sayBase(h, title, null, height, width, ["NONE"]);
}
function timedFreeze(msg, title, height, width) {
	freeze(msg, title, true, height, width);
}

function updateFreezeText(msg) {
	$("#freezeMessageText").html(msg);
}
function thaw() { 
	if (B.freezeTimer != null) {
		clearInterval(B.freezeTimer);
		B.freezeTimer = null;
	}
	closeDialog("B-Say-Dialog"); 
}

