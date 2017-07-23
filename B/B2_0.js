// Written by Dan Brussee
// Version 2.0: Released <unreleased>
//

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

// Remote calls
B.RestfulService = function(baseURL) {
	this.baseURL = baseURL;
	this.getText = function(urlEnd, callback) {
		$.get(this.baseURL + urlEnd, callback);
	}
}

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
// Form - Simple handling of form data
B.formsCollection = {};
B.getForm = function(id) {
	var frm = B.formsCollection[id];
	if (frm == null) {
		frm = new B.Form(id);
		B.formsCollection[id] = frm;
	}
	return frm;	
}
B.Form = function(formID) {
	this.id = formID;
	this.form = document.getElementById(formID);
	this.fields = {};
	var lst =  $(this.form).find(":input");
	for (var x = 0; x < lst.length; x++) {
		var el = lst[x];
		if (el.name == "") continue; // Unnamed input?
		if (this.fields[el.name] == null) { // First reference to this item... set up a default object
			this.fields[el.name] = { name: el.name, els: [ el ], type: 'text', key: false, req: false, upper: false, trim: true, disabled: false };
			var rec = this.fields[el.name];
			if (el.disabled) rec.disabled = true;
			// All elements with the same name must be the same tag
			var tag = el.tagName;
			var jel = $(el);
			if (jel.hasClass("VK")) { rec.key = true; rec.req = true; }
			if (jel.hasClass("VR")) rec.req = true;
			if (jel.hasClass("VN")) rec.trim = false;
			if (jel.hasClass("VU")) { el.style.textTransform = "uppercase"; rec.upper = true; }
			if (jel.hasClass("VN")) rec.type = "num";
			if (jel.hasClass("VI")) rec.type = "int";
			if (jel.hasClass("VD")) rec.type = "date";
			// Convert INPUT to "TEXT", "HIDDEN", "RADIO", etc.
			if (tag == "INPUT") tag = el.type.toUpperCase();
			
			if (B.isOneOf(tag, "TEXT")) {
				if (rec.type == "date") $(el).datepicker({ 
					dateFormat: "m/d/yyyy" 
				});
			}

			if (B.isOneOf(tag, "TEXT,TEXTAREA,SELECT,HIDDEN")) { // text
				var tmp = $(this.form).data("EMBELLISHED"); // Only mark up the form once!
				if (rec.req) {
					var txt = "";
					if (rec.key) {
						txt = " **";
					} else {
						txt = " *";
					}
					if (txt != "") {
						var jel = $(el);
						if (jel.data("EMBELLISHED") == undefined) {
							jel.after(txt);
							jel.data("EMBELLISHED", "Y");
						}
					}
				}
				if (tag == "SELECT") {
					rec.type = "select";
				} else {
					rec.type = "text";
				}
			} else if (tag == "CHECKBOX") {
				rec.type = "check";
			} else if (tag == "RADIO") {
				rec.type = "radio";
			} 
		} else {
			this.fields[el.name].els.push(el);
		}
	}
	this.onsubmit = function() { return true; };
	return this;
};
B.Form.prototype.focus = function(nam) {
	var fld = this.fields[nam];
	if (fld == null) return null;
	if (fld.disabled) return null;
	if (fld.type == "hidden") return null;
	if (fld.type == "radio") {
		var val = this.get(nam);
		for (var i = 0; i < fld.els.length; i++) {
			if (fld.els[i].value == val) {
				fld.els[i].focus();
				break;
			}
		}
	} else {
		fld.els[0].focus();
	}
};
B.Form.prototype.getElements = function(nam) {
	if (nam == undefined) {
		nam = "";
		for (var key in this.fields) {
			if (nam.length > 0) nam += ",";
			nam += key;
		}
		return this.getElements(nam);
	} else {
		var nameList = nam.split(","); // 'fnam,lnam,bday' -> ['fnam','lnam','bday']
		var rslt = [];
		for (var nn = 0; nn < nameList.length; nn++) {
			var fld = this.fields[nameList[nn]];
			for (var i = 0; i < fld.els.length; i++) {
				rslt.push(fld.els[i]);
			}
		}
		return rslt;
	}	
};
B.Form.prototype.get = function(nam) {
	if (nam == undefined) {
		nam = "";
		for (var key in this.fields) {
			if (nam.length > 0) nam += ",";
			nam += key;
		}
		return this.get(nam);
	} else {
		var nameList = nam.split(","); // 'fnam,lnam,bday' -> ['fnam','lnam','bday']
		var rslt = {};
		for (var nn = 0; nn < nameList.length; nn++) {
			var fld = this.fields[nameList[nn]];
			if (fld.type == "text") {
				rslt[fld.name] = fld.els[0].value;
			} else if (fld.type == "select") {
				var sel = fld.els[0];
				if (sel.selectedIndex < 0) {
					rslt[fld.name] = null;
				} else {
					rslt[fld.name] = sel.options[sel.selectedIndex].value;
				}
			} else if (fld.type == "radio") {
				rslt[fld.name] = null;
				for (var rr = 0; rr < fld.els.length; rr++) { // Which radio button?
					var rad = fld.els[rr];
					if (rad.checked) {
						rslt[fld.name] = rad.value;
						break;
					}
				}
			} else if (fld.type == "checkbox") {
				rslt[fld.name] = fld.els[0].checked; // boolean
			} else {
				// No idea what this thing is!!!!
				rslt[fld.name] = "";
			}
		}
		if (nameList.length == 1) {
			return rslt[nam];
		} else {
			return rslt;
		}
	}
};
B.Form.prototype.set = function() {
	for (var i = 0; i < arguments.length; i+=2) { // Pairs of key/values
		var fld = this.fields[arguments[i]];
		var val = arguments[i+1];
		if (fld.type == "text") {
			fld.els[0].value = val;
		} else if (fld.type == "select") {
			fld.els[0].value = val;
		} else if (fld.type == "radio") {
			fld.els[0].value = val;
		} else if (fld.type == "checkbox") {
			if (typeof val == "string") val = (B.is.ONEOF(val,"Y,YES,OK"));
			fld.els[0].checked = val;
		} else {
			// No idea what this thing is!!!!
		}
	}
};
B.Form.prototype.freeze = function() {
	for (var key in this.fields) {
		var fld = this.fields[key];
		var els = fld.els;
		for (var i = 0; i < els.length; i++) {
			var el = els[i];
			if (el.type != "hidden") el.setAttribute("disabled", "disabled");
		}
	}
};
B.Form.prototype.thaw = function() {
	for (var key in this.fields) {
		var fld = this.fields[key];
		var els = fld.els;
		for (var i = 0; i < els.length; i++) {
			var el = els[i];
			if (el.type != "hidden") {
				if (!fld.disabled) el.removeAttribute("disabled");
			}
		}
	}
};