// Dialogs -- These are defined at global level to make the simple to use.
// Added to bettway GIT
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

function sayBase(msg, title, callback, height, width, btns) {
	if (btns == undefined) btns = [];
	if (btns == "" || btns == null) btns = [];
	if (callback == undefined) callback = null;
	if (width == undefined) width = 350;
	if (height == undefined) height = 250;
	if (btns.length == 0) btns = [ { text: 'Ok', click: function() { closeDialog("B-Say-Dialog"); } } ];
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
function sayIcon(icon, msg, title, callback, height, width, btns) {
	msg = B.img(icon, 28, "", "", "float: left; padding-right: 10px;") + msg;
	sayBase(msg, title, callback, height, width, btns);
};
function say(msg, t, cb, h, w, bs) { sayIcon("INFO", msg, t, cb, h, w, bs); };
function sayWarn(msg, t, cb, h, w, bs) { sayIcon("WAIT", msg, t, cb, h, w, bs); };
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
function chooseWarn(msg, t, opts, cb, h, w) { chooseIcon("WAIT", msg, t, opts, cb, h, w); };
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
function askWarn(msg, t, cb, h, w) { askIcon("WAIT", msg, t, cb, h, w); };
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

function timedFreeze(msg, title) {
	freeze(msg, title, true, true);
}
function freeze(msg, title, showSpinner, showTimer) {
	if (showTimer == undefined) showTimer = false;
	if (showSpinner == undefined) showSpinner = true;
	var h = "";
	if (showSpinner) {
		h += "<div style='float: left; width: 40px; height: 43px;'>";
		h += B.img("SPINNER", 24);
		if (showTimer) {
			h += "<div style='width: 25px; text-align: center; color: blue; font-size: 6pt; font-weight: bold; padding-bottom: 2px; padding-top: 2px;' id='spnFreezeSpinnerTime'></div>";
		}
		h += "</div>";
	} else {
		if (showTimer) {
			h += "<div style='float: left; width: 40px; height: 13px;'>";
			h += "<div style='width: 25px; text-align: center; color: blue; font-size: 6pt; font-weight: bold; padding-bottom: 2px; padding-top: 2px;' id='spnFreezeSpinnerTime'></div>";
			h += "</div>";
		}
	}
	h += "<span id='freezeMessageText'>" + msg + "</span>";
	var dlg = prepareSayDialog(h, title);
	dlg.dialog("option", "dialogClass", "no-close");
	openSayDialog([ ]);
	if (showTimer) {
		B.freezeTimer = new B.Timer(1005, function(st) {
			document.getElementById("spnFreezeSpinnerTime").innerHTML = B.format.ELAPSE(st,new Date()).replace(" ", "&nbsp;");
		});
	}
}
function updateFreezeText(msg) {
	$("#freezeMessageText").html(msg);
}
function thaw() { 
	if (B.freezeTimer != null) {
		B.freezeTimer.stop();
		B.freezeTimer = null;
	}
	$("#appSayDialog").dialog("close"); 
}