// Dialogs -- These are defined at global level to make them simpler to use.
B.settings.say = {
	defaultTitle: 'System Message',
	tinting: true
};
// TODO
// BUG: askValue - Enter key submits page (reload)

B.dialogStack = []; // The stack stays in the B domain
function openDialog(id, onEnterKey) {
	if (onEnterKey == undefined) onEnterKey = "";
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
	dlg.data("height", height).data("width", width).data("enterkey",onEnterKey).data("id",id);

	dlg.dialog({ 
		autoOpen: false, 
		dialogClass: "no-class",
		resizable: true,	
		modal: true, 
		buttons: btns, 
		height: height, 
		width: width
	}).keypress($.proxy(function (e) { // Handle keypress while on form
		if (e.keyCode === $.ui.keyCode.ENTER) {
			if (this.data("enterkey") != "") {
				clickDialogButton(this.data("id"), this.data("enterkey"));
			}
		}
	}, dlg));
	dlg.dialog("widget").find('.ui-dialog-titlebar-close').remove();

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

B.sayBase = function(msg, title, callback, height, width, btns) {
	if (btns == undefined) btns = [];
	if (btns == "" || btns == null) btns = [];
	if (callback == undefined) callback = null;
	if (width == undefined) width = 350;
	if (height == undefined) height = 250;
	if (btns.length == 0) btns = [ { text: 'Ok', click: function() { closeDialog("B-Say-Dialog"); } } ];
	if (btns.length == 1 && btns[0] == "NONE") btns = []; // Freeze?
	if (title == undefined) title = B.settings.say.defaultTitle;
	if (title == "") title = B.settings.say.defaultTitle;

	var h = "<form id='B-Say-Dialog' class='BDialog' title='" + title + "'>";
	h += "<div id='B-Say-Dialog-Message' style='width: 100%; height: 100%; overflow-y: auto;'></div>";
	h += "</form>";
	$("body").append(h);

	var dlg = $("#B-Say-Dialog");
	dlg.submit(function(event) {
		event.preventDefault();
	});
	dlg.dialog({ 
		BData: null,
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
	dlg.dialog("widget").find('.ui-dialog-titlebar-close').remove();
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
function popSay() { closeDialog("B-Say-Dialog"); }
function sayIcon(icon, msg, title, callback, height, width, btns) {
	if (icon != null) msg = B.img(icon, 22, "", "", "float: left; padding-right: 10px;") + msg;
	B.sayBase(msg, title, callback, height, width, btns);
	if (B.settings.say.tinting) {
		if (icon == "WARN") {
			$("#B-Say-Dialog").css("background", "papayawhip");
		} else if (icon == "ERROR") {
			$("#B-Say-Dialog").css("background", "mistyrose");
		}
	}
};
function say(msg, t, cb, h, w, bs) { sayIcon("INFO", msg, t, cb, h, w, bs); };
function sayPlain(msg, t, cb, h, w, bs) { sayIcon(null, msg, t, cb, h, w, bs); };
function sayWarn(msg, t, cb, h, w, bs) { sayIcon("WARN", msg, t, cb, h, w, bs); };
function sayError(msg, t, cb, h, w, bs) { sayIcon("ERROR", msg, t, cb, h, w, bs); };
function sayFix(fixlist, msg, title, height, width) {
	if (height == undefined) height = 300;
	if (width == undefined) width = 400;
	if (fixlist == "") return;
	fixlist = fixlist.substr(1);
	fixlist = "<li>" + fixlist.split("\n").join("</li><li>") + "</li>";
	if (msg == undefined) msg = "Correct the following items and try again:<br>";
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
function choosePlain(msg, t, opts, cb, h, w) { chooseIcon(null, msg, t, opts, cb, h, w); };
function chooseWarn(msg, t, opts, cb, h, w) { chooseIcon("WARN", msg, t, opts, cb, h, w); };
function chooseError(msg, t, opts, cb, h, w) { chooseIcon("ERROR", msg, t, opts, cb, h, w); };
askIcon = function(icon, msg, title, callback, height, width) {
	if (callback == undefined) callback = function() { };
	var btns = [
		{ text: "Yes", click: function() { 
			var data = $("#B-Say-Dialog").dialog("option", "BData");
			closeDialog("B-Say-Dialog"); 
			callback("YES", data); } },
		{ text: "No",  click: function() { 
			var data = $("#B-Say-Dialog").dialog("option", "BData");
			closeDialog("B-Say-Dialog"); 
			callback("NO", data);  } }
	];
	sayIcon(icon, msg, title, callback, height, width, btns);
};
function ask(msg, t, cb, h, w) { askIcon("HELP", msg, t, cb, h, w); };
function askPlain(msg, t, cb, h, w) { askIcon(null, msg, t, cb, h, w); };
function askWarn(msg, t, cb, h, w) { askIcon("WARN", msg, t, cb, h, w); };
function askError(msg, t, cb, h, w) { askIcon("ERROR", msg, t, cb, h, w); };
askCIcon = function(icon, msg, title, callback, height, width) {
	if (callback == undefined) callback = function() { };
	var btns = [
		{ text: "Yes", click: function() { 
			var data = $("#B-Say-Dialog").dialog("option", "BData");
			closeDialog("B-Say-Dialog"); 
			callback("YES", data); } },
		{ text: "No",  click: function() { 
			var data = $("#B-Say-Dialog").dialog("option", "BData");
			closeDialog("B-Say-Dialog"); 
			callback("NO", data);  } },
		{ text: "Cancel",  click: function() { 
			var data = $("#B-Say-Dialog").dialog("option", "BData");
			closeDialog("B-Say-Dialog"); 
			callback("CANCEL", data);  } }
	];
	sayIcon(icon, msg, title, callback, height, width, btns);
};
function askC(msg, t, cb, h, w) { askCIcon("HELP", msg, t, cb, h, w); };
function askCPlain(msg, t, cb, h, w) { askCIcon(null, msg, t, cb, h, w); };
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
			var data = $("#B-Say-Dialog").dialog("option", "BData");
			var rslt = $("#B-Say-Dialog-Value").val();
			closeDialog("B-Say-Dialog"); 
			callback(rslt, data);  } },
		{ text: "Cancel",  click: function() { 
			var data = $("#B-Say-Dialog").dialog("option", "BData");
			closeDialog("B-Say-Dialog"); 
			callback(null, data);  } }
	];
	sayIcon(icon, h, title, callback, height, width, btns);
	if (value != undefined && value != null) $("#B-Say-Dialog-Value").val(value);
	$("#B-Say-Dialog-Value").select().focus();
};
function askValue(msg, p, v, t, cb, h, w) { askValueIcon("HELP", msg, p, v, t, cb, h, w); };
function askValuePlain(msg, p, v, t, cb, h, w) { askValueIcon(null, msg, p, v, t, cb, h, w); };
function askValueWarn(msg, p, v, t, cb, h, w) { askValueIcon("WARN", msg, p, v, t, cb, h, w); };
function askValueError(msg, p, v, t, cb, h, w) { askValueIcon("ERROR", msg, p, v, t, cb, h, w); };

function freeze(msg, title, with_timer, height, width) {
	if (B.freezeStack == undefined) B.freezeStack = [];
	if (with_timer == undefined) with_timer = false;
	if (title == undefined) title = B.settings.say.defaultTitle;
	if (title == "") title = B.settings.say.defaultTitle;
	var itm = {timer:with_timer, msg:msg, title:title};
	if (B.freezeStack.length > 0) {
		if (B.freezeStack.length > 0) msg += "<br><i>...Plus " + B.freezeStack.length + "</i>";
		updateFreezeText(itm.msg + "<br><i>...Plus " + B.freezeStack.length + "</i>");
		var dlg = $("#B-Say-Dialog");
		dlg.dialog('option', 'title', itm.title);
	} else {
		var h = "<div style='float:left; width:40px; text-align:center; padding-right:10px;'>";
		h += B.img("SPINNER", 28);
		if (with_timer) {
			h += "<div id='freezeDialogTimer' style='width:100%; text-align:center; font-size:7pt;'>";
			h += "&nbsp;";
			h += "</div>";
			B.freezeStart = new Date();
			B.freezeTimer = setInterval(function() {
				var et = B.format.ELAPSE(B.freezeStart, new Date());
				document.getElementById("freezeDialogTimer").innerHTML = et;
			}, 1005);
		}
		h += "</div>";
		if (B.freezeStack.length > 0) msg += "<br><i>...Plus " + B.freezeStack.length + "</i>";
		h += "<span id='freezeMessageText'>" + msg + "</span>";
		B.sayBase(h, title, null, height, width, ["NONE"]);
	}
	B.freezeStack.push(itm);
	return B.freezeStack.length-1; // Position of item to be popped off
}
function timedFreeze(msg, title, height, width) {
	return freeze(msg, title, true, height, width);
}

function updateFreezeText(msg) {
	$("#freezeMessageText").html(msg);
}
function thaw(stackPosition) { 
	if (stackPosition == undefined) stackPosition = B.freezeStack.length-1; // Top
	B.freezeStack.splice(stackPosition,1); // Remove the one being thawed
	if (B.freezeStack.length > 0) {
		var itm = B.freezeStack[B.freezeStack.length-1];
		var plus = "";
		if (B.freezeStack.length > 1) plus = "<br><i>...Plus " + B.frezeStack.length-1 + "</i>";
		updateFreezeText(itm.msg + plus);
		var dlg = $("#B-Say-Dialog");
		dlg.dialog('option', 'title', itm.title);
	} else {
		if (B.freezeTimer != null) {
			clearInterval(B.freezeTimer);
			B.freezeTimer = null;
		}
		closeDialog("B-Say-Dialog"); 
	}
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
	this.frozen = false;
	var lst =  $(this.form).find(":input");
	for (var x = 0; x < lst.length; x++) {
		var el = lst[x];
		if (el.name == "") {
			if (el.type == "submit") {
				this.fields["SUBMIT"] = { 
						name:'SUBMIT', 
						vtype:'button', valid:true, min:null, max:null,
						els:[ el ], 
						type:'button', 
						readonly:el.readOnly, 
						key:false, 
						req:false, 
						upper:false, 
						trim:false, 
						disabled:el.disabled };
			}
			continue; // Unnamed input?
		}
		if (this.fields[el.name] == null) { // First reference to this item... set up a default object
			this.fields[el.name] = { 
				name:el.name, 
				vtype:'text', valid:true, min:null, max:null,
				els:[ el ], 
				type:'text', 
				readonly:el.readOnly, 
				key:false, 
				req:false, 
				upper:false, 
				trim:true, 
				disabled:el.disabled };
			var rec = this.fields[el.name];
			// All elements with the same name must be the same tag
			var tag = el.tagName;
			if (tag == "INPUT") tag = el.type.toUpperCase();	
			var jel = $(el);
			var dta = el.getAttribute("data-validate");
			if (dta == null) { // Use classes to determine types, etc.
				if (jel.hasClass("VK")) { rec.key = true; rec.req = true; }
				if (jel.hasClass("VR")) rec.req = true;
				if (jel.hasClass("VU")) { el.style.textTransform = "uppercase"; rec.upper = true; }
				if (jel.hasClass("VN")) rec.vtype = "num";
				if (jel.hasClass("VI")) rec.vtype = "int";
				if (jel.hasClass("VD")) rec.vtype = "date";
				// Convert INPUT to "TEXT", "HIDDEN", "RADIO", etc.
			} else { // Use data element to determine field info
				var itm = dta.split(":"); // !#:0,100
				var typ = itm[0];
				var range = "";
				if (itm.length == 2) range = itm[1];
				if (B.contains(typ,"!")) rec.req = true;
				if (B.contains(typ,"*")) { rec.req = true; rec.key = true; }
				if (B.contains(typ,"#")) rec.vtype = "int";
				if (B.contains(typ,"i")) rec.vtype = "int";
				if (B.contains(typ,"f")) rec.vtype = "num";
				if (B.contains(typ,"d")) rec.vtype = "date";
				if (B.contains(typ,"%")) rec.vtype = "datetime";
				if (B.contains(typ,"$")) rec.vtype = "dollars";
				if (B.contains(typ,"c")) rec.vtype = "money";
				if (B.contains(typ,"@")) rec.vtype = "email";
				if (B.contains(typ,"z")) rec.vtype = "zip";
				if (B.contains(typ,"_")) rec.trim = false;
				if (B.contains(typ,"U")) { el.style.textTransform = "uppercase"; rec.upper = true; }
				if (range != "") {
					var parts = range.split(",");
					rec.min = parts[0];
					if (parts.length > 1) rec.max = parts[1];
				}
			}
			
			if (B.isOneOf(tag, "TEXT")) {
				// if (el.readOnly) el.style.borderColor = "transparent";
				if (el.readOnly) this.setReadOnly(el.name, true);
				if (rec.type == "date") $(el).datepicker({ dateFormat: "m/d/yy" });
			}

			if (B.isOneOf(tag, "TEXT,TEXTAREA,SELECT,HIDDEN")) { // text
				//var tmp = $(this.form).data("EMBELLISHED"); // Only mark up the form once!
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
				if (tag == "SELECT") rec.type = "select";
			} else if (tag == "CHECKBOX") {
				rec.type = "checkbox";
			} else if (tag == "RADIO") {
				rec.type = "radio";
			} 
		} else {
			this.fields[el.name].els.push(el);
		}
	}
	for (var k in this.fields) {
		var fld = this.fields[k];
		if (fld.readonly) this.setReadOnly(k, true);
	}
	this.onsubmit = function() { return true; };
	return this;
};
B.Form.prototype.fillFromResults = function(rpc) {
	for (var key in rpc.results) {
		this.set(key, rpc.getResult(key));
	}
};
B.Form.prototype.setClean = function() {
	this.cleanData = this.get();
};
B.Form.prototype.isDirty = function(currentData) {
	if (currentData == undefined) currentData = this.get();
	if (currentData == null) currentData = this.get();
	return B.is.CHANGED(this.cleanData, currentData);
};
B.Form.prototype.setReadOnly = function(nam, yorn) {
	if (yorn == undefined) yorn = true;
	var fld = this.fields[nam];
	if (fld == null) return null;
	if (fld.type == "text") {
		var el = fld.els[0]; // There should only be one
		if (yorn == "toggle") yorn = !el.readOnly;
		el.readOnly = yorn;
		el.style.borderColor = (yorn ? "transparent":"");
		$(el).css("border-bottom", (yorn ? "1px solid gainsboro" : ""));
		//el.style.backgroundColor = (yorn ? "beige":"");
		//el.style.color = (yorn ? "darkcyan":"");
		//el.style.color = (yorn ? "silver":"");
		fld.readonly = yorn;
	} else if (fld.type == "select") {
		var el = fld.els[0]; // There should only be one
		if (yorn == "toggle") yorn = !el.readOnly;
		el.disabled = yorn;
		el.style.borderColor = (yorn ? "transparent":"");
		$(el).css("border-bottom", (yorn ? "1px solid gainsboro" : ""));
		//el.style.backgroundColor = (yorn ? "beige":"");
		//el.style.color = (yorn ? "darkcyan":"");
		//el.style.color = (yorn ? "silver":"");
		fld.readonly = yorn;
	}
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
	return this;
};
B.Form.prototype.getDisplay = function(nam) {
	if (nam == undefined) {
		nam = "";
		for (var key in this.fields) {
			if (nam.length > 0) nam += ",";
			nam += key;
		}
		return this.getDisplay(nam);
	} else {
		var nameList = nam.split(","); // 'fnam,lnam,bday' -> {fnam:'Frank',lnam:'Jones',bday:'9/1/1960'}
		var rslt = {};
		for (var nn = 0; nn < nameList.length; nn++) {
			var fld = this.fields[nameList[nn]];
			if (fld == undefined) {
				rslt[nameList[nn]] = null;
			} else if (fld.type == "text") {
				rslt[fld.name] = fld.els[0].value;
				if (fld.trim) rslt[fld.name] = B.trim(rslt[fld.name]);
				if (fld.upper) rslt[fld.name] = rslt[fld.name].toUpperCase();
			} else if (fld.type == "textarea") {
				rslt[fld.name] = fld.els[0].value;
				if (fld.trim) rslt[fld.name] = B.trim(rslt[fld.name]);
				if (fld.upper) rslt[fld.name] = rslt[fld.name].toUpperCase();
			} else if (fld.type == "select") {
				var sel = fld.els[0];
				if (sel.selectedIndex < 0) {
					rslt[fld.name] = null;
				} else {
					rslt[fld.name] = sel.options[sel.selectedIndex].innerHTML;
				}
			} else if (fld.type == "radio") {
				rslt[fld.name] = null;
				for (var rr = 0; rr < fld.els.length; rr++) { // Which radio button?
					var rad = fld.els[rr];
					if (rad.checked) {
						rslt[fld.name] = rad.value;
						var lab = rad.parentElement;
						if (lab != null) {
							if (lab.tagName.toUpperCase() == "LABEL") {
								rslt[fld.name] = lab.innerText; // ??? WOuld this not contain the radio button too??
							}
						}
						break;
					}
				}
			} else if (fld.type == "checkbox") {
				rslt[fld.name] = fld.els[0].checked; // boolean
				var lab = fld.els[0].parentElement();
				if (lab != null) {
					if (lab.tagName == "label") {
						rslt[fld.name] = lab.innerHTML; // ??? WOuld this not contain the radio button too??
					}
				}
			} else {
				// No idea what this thing is!!!!
				rslt[fld.name] = "";
			}
		}
		if (nameList.length == 1) {
			return rslt[nameList[0]];
		} else {
			return rslt;
		}
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
		var nameList = nam.split(","); // 'fnam,lnam,bday' -> {fnam:'Frank',lnam:'Jones',bday:'9/1/1960'}
		var rslt = {};
		for (var nn = 0; nn < nameList.length; nn++) {
			var fld = this.fields[nameList[nn]];
			if (fld == undefined) {
				rslt[nameList[nn]] = null;
			} else if (fld.type == "text") {
				rslt[fld.name] = fld.els[0].value;
				if (fld.trim) rslt[fld.name] = B.trim(rslt[fld.name]);
				if (fld.upper) rslt[fld.name] = rslt[fld.name].toUpperCase();
			} else if (fld.type == "textarea") {
				rslt[fld.name] = fld.els[0].value;
				if (fld.trim) rslt[fld.name] = B.trim(rslt[fld.name]);
				if (fld.upper) rslt[fld.name] = rslt[fld.name].toUpperCase();
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
		return rslt;
	}
};
B.Form.prototype.setFromTableRow = function(rowdata) {
	for (var key in rowdata) {
		if (this.fields[key] != undefined) {
			var fld = this.fields[key];
			var val = "";
			if (fld != null) {
				val = rowdata[key].val;
			}
			if (fld.vtype == "date") val = B.format.MDYYYY(val);
			this.set(key, val);			
		}
	}
};
B.Form.prototype.set = function() {
	if (typeof arguments[0] == "object") { // data collection
		var data = arguments[0];
		for (var key in data) {
			this.set(key, data[key]);
		}
	} else {
		for (var argnum = 0; argnum < arguments.length; argnum+=2) { // Pairs of key/values
			var fld = this.fields[arguments[argnum]];
			if (fld == undefined) continue; // I dont know what this field is
			var val = arguments[argnum+1];
			if (fld.type == "text") {
				fld.els[0].value = val;
			} else if (fld.type == "select") {
				fld.els[0].value = val;
			} else if (fld.type == "radio") {
				if (typeof val == "string") {
					for (var i = 0; i < fld.els.length; i++) {
						var el = fld.els[i];
						if (el.value == val) el.click();
					}
				} else if (typeof val == "boolean") {
					for (var i = 0; i < fld.els.length; i++) {
						var el = fld.els[i];
						if (val == true && el.value == "Y") el.checked = true;
						if (val == false && el.value == "N") el.checked = true;
					}
				}
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
	this.frozen = true;
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
	this.frozen = false;
	return this;
};
B.Form.prototype.getToData = function(data, names) {
	var chk = this.get(names);
	for (var key in chk) {
		data[key] = chk[key];
	}
	return this;
};

B.Form.prototype.markIssues = function(fldList, clearFirst) {
	if (clearFirst == undefined) clearFirst = false;
	if (clearFirst) this.clearIssues();
	var lst = fldList.split(",");
	for (var i = 0; i < lst.length; i++) {
		var fld = this.fields[lst[i]];
		if (fld == null) continue;
		if (fld.type == "text") {
			fld.els[0].style.backgroundColor = "pink";
		} else if (fld.type == "select") {
			fld.els[0].style.backgroundColor = "pink";
		} else if (fld.type == "radio") {
			var items = this.findLabels(fld.els);
			for (var j = 0; j < items.length; j++) {
				items[j].style.backgroundColor = "pink";
			}
		} else if (fld.type == "checkbox") {
			var items = this.findLabels(fld.els);
			for (var j = 0; j < items.length; j++) {
				items[j].style.backgroundColor = "pink";
			}
		} else {
			// No idea what this thing is!!!!
		}
	}
};
B.Form.prototype.validateRequired = function(fldname) {
	var fld = this.fields[fldname];
	var val = this.get(fldname);
	var ok = true;
	if (val == null || val == "") {
		ok = false;
	}
	if (ok) {
		return true;
	} else {
		fld.valid = false;
		this.markIssues(fldname, false);
		return false;
	}
};
B.Form.prototype.validateText = function(fldname, min, max) {
	var fld = this.fields[fldname];
	var val = this.get(fldname);
	var ok = true;
	if (min != null) if (val.length < min) ok = false;
	if (max != null) if (val.length > max) ok = false;
	if (!ok) {
		fld.valid = false;
		this.markIssues(fldname, false);
		return false;
	}
	return true;
};
B.Form.prototype.validateInteger = function(fldname, min, max) {
	var fld = this.fields[fldname];
	var val = this.get(fldname);
	var ok = true;
	if (!B.is.INTEGER(val, min, max)) {
		if (val == "" && !fld.req) {
			// Not integer, but blank and not required
		} else {
			ok = false;
		}
	}
	if (!ok) {
		fld.valid = false;
		this.markIssues(fldname, false);
		return false;
	}
	return true;
};
B.Form.prototype.validateEmail = function(fldname) {
	var fld = this.fields[fldname];
	var val = this.get(fldname);
	var ok = true;
	if (!B.is.EMAIL(val)) {
		if (val == "" && !fld.req) {
			// Not valid, but blank and not required
		} else {
			ok = false;
		}
	}
	if (!ok) {
		fld.valid = false;
		this.markIssues(fldname, false);
		return false;
	}
	return true;
};
B.Form.prototype.validateNumber = function(fldname, min, max) { // Allows floating point
	var fld = this.fields[fldname];
	var val = this.get(fldname);
	var ok = true;
	if (!B.is.NUMBER(val, min, max)) {
		if (val == "" && !fld.req) {
			// Not number, but blank and not required
		} else {
			ok = false;
		}
	}
	if (!ok) {
		fld.valid = false;
		this.markIssues(fldname, false);
		return false;
	}
	return true;
};
B.Form.prototype.validateZipcode = function(fldname) {
	var fld = this.fields[fldname];
	var val = this.get(fldname);
	var ok = true;
	if (val == "") {
		if (fld.req) {
			ok = false;
		}
	} else {
		ok = B.is.ZIPCODE(val);
	}
	if (!ok) {
		fld.valid = false;
		this.markIssues(fldname, false);
		return false;
	}
	return true;
};
B.Form.prototype.validateDate = function(fldname, min, max) {
	var fld = this.fields[fldname];
	var val = this.get(fldname);
	var ok = true;
	//var dat = null;
	if (val == "") {
		if (fld.req) {
			ok = false;
		}
	} else {
		ok = B.is.DATE(val, min, max);
	}
	if (!ok) {
		fld.valid = false;
		this.markIssues(fldname, false);
		return false;
	}
	return true;
};
B.Form.prototype.clearIssues = function(fldList) {
	var lst = [];
	if (fldList == undefined) {
		for (var k in this.fields) {
			lst.push(k);
		}
	} else {
		lst = fldList.split(",");
	}
	for (var i = 0; i < lst.length; i++) {
		this.clearIssue(lst[i]);
	}
};
B.Form.prototype.clearIssue = function(fldname) {
	var fld = this.fields[fldname];
	if (fld.type == "text") {
		fld.els[0].style.backgroundColor = "";
	} else if (fld.type == "select") {
		fld.els[0].style.backgroundColor = "";
	} else if (fld.type == "radio") {
		var lst = this.findLabels(fld.els);
		for (var j = 0; j < lst.length; j++) {
			lst[j].style.backgroundColor = "";
		}
	} else if (fld.type == "checkbox") {
		var lst = this.findLabels(fld.els);
		for (var j = 0; j < lst.length; j++) {
			lst[j].style.backgroundColor = "";
		}
	} else {
		// No idea what this thing is!!!!
	}
};
B.Form.prototype.findLabels = function(els) {
	var lst = [];
	for (var i = 0; i < els.length; i++) {
		var parentElem = $(els[i]).parent();
		var parentTagName = parentElem.get(0).tagName.toLowerCase();
	
		if(parentTagName == "label") {
			lst.push(parentElem[0]);
		}
	}
	return lst;
};

B.Form.prototype.validate = function(chk) {
	if (chk == undefined) chk = this.get();
	this.clearIssues();
	for (var k in this.fields) {
		var fld = this.fields[k];
		fld.valid = true; // Assume the best!
		if (fld.req) this.validateRequired(k);
		if (fld.vtype == "int") this.validateInteger(k, fld.min, fld.max);
		if (fld.vtype == "dollars") this.validateInteger(k, fld.min, fld.max);
		if (fld.vtype == "num") this.validateNumber(k, fld.min, fld.max);
		if (fld.vtype == "text") this.validateText(k, fld.min, fld.max);
		if (fld.vtype == "zip") this.validateZipcode(k);
		if (fld.vtype == "date") this.validateDate(k, fld.min, fld.max);
		
		if (!fld.valid) this.markIssues(k);
	}
};