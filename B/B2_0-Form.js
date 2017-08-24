// Form - Simple handling of form data
// Added to bettway GIT
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
				if (el.readOnly) {
					el.style.borderColor = "transparent";
				}
				if (rec.type == "date") $(el).datepicker({ 
					dateFormat: "m/d/yy" 
				});
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
				if (!fld.disabled) el.removeAttribute("disabled");
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