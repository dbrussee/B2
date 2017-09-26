// Dialogs -- These are defined at global level to make the simple to use.

// TODO
// BUG: askValue - Enter key submits page (reload)

B.dialogStack = []; // The stack stays in the B domain
function openDialog(id, onEnterKey) {
	if (onEnterKey == undefined) onEnterKey = function() { };
	var btns = [];
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
	}).keypress($.proxy(function (e) {
		if (e.keyCode === $.ui.keyCode.ENTER) {
			this();
		}
	}, onEnterKey));
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
	if (title == undefined) title = B.settings.say.defaultTitle;
	if (title == "") title = B.settings.say.defaultTitle;

	var h = "<form id='B-Say-Dialog' class='BDialog' title='" + B.settings.say.defaultTitle + "'>"
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
	}).keypress(function (e) {
		if (e.keyCode === $.ui.keyCode.ENTER) {
			clickDialogButton("B-Say-Dialog", 0);
		}
	});
	dlg.dialog("widget").find('.ui-dialog-titlebar-close').remove()
	dlg.dialog("open");
	dlg.dialog('option', 'title', title);
	$("#B-Say-Dialog-Message").html(msg);
};
function clickDialogButton(dlgid, btnid) {
	var dlg = $("#" + dlgid);
	if (dlg == undefined) return;
	var buttons = dlg.dialog("option","buttons");
	var btn = null;
	if (isNaN(btnid)) {
		for (var i = 0; i < buttons.length; i++) {
			var test = buttons[i];
			if (test.text.toUpperCase() == btnid.toUpperCase()) {
				btn = test; break;
			}
		}
	} else {
		btn = buttons[btnid];
	}
	if (btn) btn.click.call(btn);
	return (btn); // boolean
}
function sayIcon(icon, msg, title, callback, height, width, btns) {
	msg = B.img(icon, 28, "", "", "float: left; padding-right: 10px;") + msg;
	sayBase(msg, title, callback, height, width, btns);
	if (B.settings.say.tinting) {
		if (icon == "WARN") {
			$("#B-Say-Dialog").css("background", "papayawhip");
		} else if (icon == "ERROR") {
			$("#B-Say-Dialog").css("background", "mistyrose");
		}
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

// Form - Simple handling of form data
// Added to bettway GIT
B.formsCache = {};
B.Form = function(formID, forceReload) {
	var itm = B.formsCache[formID];
	if (itm == null) {
		B.formsCache[formID] = {form:this, cleanData:null};
	} else {
		if (forceReload == undefined) forceReload = false;
		if (!forceReload) { // Check if it already exists first
			return itm.form;	
		}
	}

	this.id = formID;
	this.form = document.getElementById(formID);
	this.fields = {};
	var lst =  $(this.form).find(":input");
	for (var x = 0; x < lst.length; x++) {
		var el = lst[x];
		if (el.name == "") continue; // Unnamed input?
		if (this.fields[el.name] == null) { // First reference to this item... set up a default object
			this.fields[el.name] = { name:el.name, els:[ el ], type:'text', readonly:el.readOnly, key:false, req:false, upper:false, trim:true, disabled:el.disabled };
			var rec = this.fields[el.name];
			// All elements with the same name must be the same tag
			var tag = el.tagName;
			var jel = $(el);
			if (jel.hasClass("VK")) { rec.key = true; rec.req = true; }
			if (jel.hasClass("VR")) rec.req = true;
			if (jel.hasClass("VU")) { el.style.textTransform = "uppercase"; rec.upper = true; }
			if (jel.hasClass("VN")) rec.type = "num";
			if (jel.hasClass("VI")) rec.type = "int";
			if (jel.hasClass("VD")) rec.type = "date";
			// Convert INPUT to "TEXT", "HIDDEN", "RADIO", etc.
			if (tag == "INPUT") tag = el.type.toUpperCase();
			
			if (B.isOneOf(tag, "TEXT")) {
				if (el.readOnly) el.style.borderColor = "transparent";
				if (rec.type == "date") $(el).datepicker({ dateFormat: "m/d/yy" });
			}

			if (B.isOneOf(tag, "TEXT,TEXTAREA,SELECT,HIDDEN")) { // text
				var tmp = $(this.form).data("EMBELLISHED"); // Only mark up the form once!
				if (rec.req) {
					var txt = "";
					if (rec.key) {
						txt = " " + B.img("LEDYELLOW", ".7em");
					} else {
						txt = " " + B.img("LEDOFF", ".7em");
					}
					if (txt != "") {
						var jel = $(el);
						if (jel.data("EMBELLISHED") == undefined) {
							jel.after(txt);
							jel.data("EMBELLISHED", "Y");
						}
					}
				}
				rec.type = (tag == "SELECT" ? "select" : "text");
			} else if (tag == "CHECKBOX") {
				rec.type = "checkbox";
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
B.Form.prototype.setClean = function() {
	this.cleanData = this.get();
}
B.Form.prototype.isDirty = function(currentData) {
	if (currentData == undefined) currentData = this.get();
	if (currentData == null) currentData = this.get();
	return B.is.CHANGED(this.cleanData, currentData);
}
B.Form.prototype.setReadOnly = function(nam, yorn) {
	if (yorn == undefined) yorn = true;
	var fld = this.fields[nam];
	if (fld == null) return null;
	if (fld.type == "text") {
		var el = fld.els[0]; // There should only be one
		if (yorn == "toggle") yorn = !el.readOnly;
		el.readOnly = yorn;
		el.style.borderColor = (yorn ? "transparent":"");
		fld.readonly = yorn;
	}
}
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
	return this;
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
			if (fld == undefined) {
				rslt[nameList[nn]] = null;
			} else if (fld.type == "text") {
				rslt[fld.name] = B.trim(fld.els[0].value);
			} else if (fld.type == "textarea") {
				rslt[fld.name] = B.trim(fld.els[0].value);
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
B.Form.prototype.setFromTableRow = function(rowdata) {
	for (var key in rowdata) {
		if (this.fields[key] != undefined) {
			this.set(key, rowdata[key].val);			
		}
	}
}
B.Form.prototype.set = function() {
	if (typeof arguments[0] == "object") { // data collection
		var data = arguments[0];
		for (var key in data) {
			this.set(key, data[key]);
		}
	} else {
		for (var i = 0; i < arguments.length; i+=2) { // Pairs of key/values
			var fld = this.fields[arguments[i]];
			if (fld == undefined) continue; // I dont know what this field is
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
	}
	return this;
};
B.Form.prototype.reset = function() {
	this.form.reset();
	return this;
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
	return this;
};
B.Form.prototype.thaw = function() {
	for (var key in this.fields) {
		var fld = this.fields[key];
		var els = fld.els;
		for (var i = 0; i < els.length; i++) {
			var el = els[i];
			if (el.type != "hidden") {
				if (!fld.disabled) {
					el.removeAttribute("disabled");
				}
			}
		}
	}
	return this;
};
B.Form.prototype.getToData = function(data, names) {
	var chk = this.get(names);
	for (var key in chk) {
		data[key] = chk[key];
	}
	return this;
};
