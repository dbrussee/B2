B.SlideMenu = function(title, width, multi, clr, bgclr) {
	if (bgclr == undefined) bgclr = B.settings.SlideMenu.BG;
	this.bgclr = bgclr;	
	if (clr == undefined) clr = B.settings.SlideMenu.FG;
	this.clr = clr;
	if (multi == undefined) multi = B.settings.SlideMenu.Multisection;
	this.multi = multi;
	if (width == undefined) width = "240px";
	if (width == null) width = "240px";
	if (width == "") width = "240px";
	if (typeof width == "number") width += "px";
	var div = document.createElement("div");
	div.style.cssText = "position:absolute; height:93%; overflow:hidden; left:5px; top:5px; margin:0; boxShadow: 5px 5px 10px gray;";
	$(div).on("click", $.proxy(function() { this.close(); }, this));
	div.style.width = width;
	div.style.backgroundColor = this.bgclr;
	div.style.color = this.clr;
	var topdiv = document.createElement("div");
	topdiv.style.cssText = "padding-bottom:0; margin-bottom:0; text-align:right;";
	if (title == undefined) title = "";
	topdiv.innerHTML = "<span style='font-size: 10pt; font-weight: bold; float: left; padding-left: 6px; padding-top: 5px;'>" + title + "</span>";
	var xbox = document.createElement("span");
	xbox.style.cssText = "cursor:pointer; padding-right:4px; padding-top:4px;";
	xbox.innerHTML = B.img("ERROR", 17);
	topdiv.appendChild(xbox);
	div.appendChild(topdiv);
	$(topdiv).on("click", $.proxy(function() { this.hide(); }, this));
	
	this.form = document.createElement("form");
	div.appendChild(this.form);
	
	this.menu = document.createElement("div");
	this.menu.style.borderBottom = "1px solid silver";
	this.form.appendChild(this.menu);

	$(div).fadeTo(1,.9).hide().appendTo("body");
	this.div = div;
	
	this.isOpen = false;
	
	this.show = function(sectionid) { 
		if (this.isOpen) return;
		if (sectionid != undefined) {
			this.setSection(sectionid);
		}
		var rslt = this.onbeforeopen(this);
		if (rslt == undefined) rslt = true;
		if (rslt) {
			$(this.div).show("slide", B.settings.SlideMenu.Slidetime, $.proxy(function() { 
				this.onafteropen(this); 
			}, this)); 
			if (B.settings.SlideMenu.PushStyle) {
				this.pushDiv.style.left = this.div.style.width;
			}
			this.isOpen = true;
			window.setTimeout($.proxy(function() {
				$("html").one("click", $.proxy(function(event) { 
					this.hide(); 
				}, this));		
			}, this), 10);			
		}
	}
	this.pushDiv = document.createElement("span");
	this.pushDiv.style.cssText = "position:absolute; top:0; left:0; overflow:hidden;";
	this.open = this.show;
	this.hide = function() { 
		var rslt = this.onbeforeclose(this);
		if (rslt == undefined) rslt = true;
		if (rslt) {
			$(this.div).hide("slide", 100, $.proxy( function() { 
				if (B.settings.SlideMenu.PushStyle) {
					this.pushDiv.style.left = "0px";
				}
				this.onafterclose(this);
			}, this));
			this.isOpen = false;
		}
	}
	this.close = this.hide;
	this.toggle = function() {
		if (this.isOpen) {
			this.hide();
		} else {
			this.show();
		}
	}
	this.items = [];
	this.sections = {};
	this.curSec = null; // No sections
	
	this.onbeforeopen = function() { return true; }
	this.onafteropen = function() { }
	this.onbeforeclose = function() { return true; }
	this.onafterclose = function() { }
	
	return this;
}
B.SlideMenu.prototype.addMenu = function(text, handler, iconname, section, clr, bgclr, hvrclr, hvrbgclr) {
	if (clr == undefined) clr = B.settings.SlideMenu.ItemFG;
	this.clr = clr;
	if (bgclr == undefined) bgclr = B.settings.SlideMenu.ItemBG;
	this.bgclr = bgclr;	
	if (hvrclr == undefined) hvrclr = B.settings.SlideMenu.ItemHoverFG;
	this.hvrclr = hvrclr;
	if (hvrbgclr == undefined) hvrbgclr = B.settings.SlideMenu.ItemHoverBG;
	this.hvrbgclr = hvrbgclr;	
	if (section == undefined) section = null;
	if (section == "") section = null;
	var h = "";
	var div = document.createElement("div");
	div.style.cssText = "font-weight:normal; cursor:pointer; font-size:10pt; margin:0; padding:3px;";
	div.style.backgroundColor = this.bgclr;
	div.style.color = this.clr;
	if (iconname == undefined) iconname = "";
	if (iconname == null) iconname = "";
	if (iconname != "") {
		h = B.img(iconname, 10);
	}
	div.innerHTML = B.trim(h + " " + text);
	div.style.borderTop = "1px solid " + this.menu.bgclr;
	if (section == null) {
		this.menu.appendChild(div);
	} else {
		section.div.appendChild(div);
	}
	var itm = { mnu: this, id: "", div: div, section: section, type: 'item', handler: handler, disabled: true, clr: clr, bgclr: bgclr, hvrclr: hvrclr, hvbgclr: hvrbgclr };
	this.items.push(itm);
	this.enable(this.items.length-1);
	return itm;
}
B.SlideMenu.prototype.addSection = function(id, title, clr, bgclr) {
	if (clr == undefined) clr = B.settings.SlideMenu.SectionFG;
	if (bgclr == undefined) bgclr = B.settings.SlideMenu.SectionBG;

	var sec = { 
		mnu: this, 
		id: id, 
		div: null, 
		section: null, 
		type: 'section', 
		handler: null, 
		disabled: false, 
		clr: clr, 
		bgclr: bgclr, 
		hvrclr: null, 
		hvrbgclr: null, 
		visible: false, 
		addMenu: function(text, handler, iconname, clr, bgclr, hvrclr, hvrbgclr) {
			this.mnu.addMenu(text, handler, iconname, this, clr, bgclr, hvrclr, hvrbgclr);
		},
		show: function() { 
			this.div.show(); 
		} 
	};
	sec.show = function() {
		if (this.mnu.multi) {
			if (this.visible) {
				$(this.div).hide();
				this.visible = false;
			} else {
				$(this.div).show("slide", {direction: "left"}, B.settings.SlideMenu.SectionSlidetime); 
				this.visible = true;
			}
		} else {
			if (this.mnu.curSec != null) {
				if (this.id == this.mnu.curSec.id) {
					return;
				} else {
					$(this.mnu.curSec.div).hide();
					this.visible = false;
				}
			}
			$(this.div).show("slide", {direction: "left"}, B.settings.SlideMenu.Slidetime); 
			this.visible = true;
		}
		this.mnu.curSec = this;
		return this;
	}
	this.sections[id] = sec;

	var div = document.createElement("div");
	div.style.cssText = "text-align:center; font-weight:bold; cursor:pointer; font-size:10pt; padding-top:3px; margin:0;";
	div.style.backgroundColor = sec.bgclr;
	div.style.color = sec.clr;
	div.innerHTML = "<div style='padding-bottom: 3px;'>" + B.trim(title) + "</div>";
	div.style.borderTop = "1px solid " + this.bgclr;
	sec.section = div;
	this.menu.appendChild(div);
	
	var sub = document.createElement("div");
	sub.style.cssText = "text-align:left; padding:0; padding-left:.5em; font-weight:bold; cursor:pointer; font-size:10pt; margin:0;";
	sec.div = sub;
	$(sub).hide();
	div.appendChild(sub);
	div.onclick = $.proxy(function(event) { 
		event.stopPropagation(); 
		this.show();
	}, sec);
	this.click = $.proxy(function() { this.show(); }, this);

	return sec;

}
B.SlideMenu.prototype.setSection = function(id) { this.getSection(id).show(); return this; }
B.SlideMenu.prototype.getSection = function(id) { return this.sections[id]; }
B.SlideMenu.prototype.setDisabled = function(disValue) {
	for (var i = 1; i < arguments.length; i++) {
		if (disValue) {
			this.disable(arguments[i]);
		} else {
			this.enable(arguments[i]);
		}
	}
}
B.SlideMenu.prototype.disable = function() {
	for (var i = 0; i < arguments.length; i++) {
		var itm = this.items[arguments[i]];
		itm.div.style.backgroundColor = "gray";
		itm.div.style.color = "white";
		itm.div.onclick = function(event) { event.stopPropagation(); };
		itm.div.onmouseover = function() { };
		itm.div.onmouseout = function() { };
		itm.disabled = true;
	}
}
B.SlideMenu.prototype.enable = function() {
	for (var i = 0; i < arguments.length; i++) {
		var itm = this.items[arguments[i]];
		itm.div.style.backgroundColor = itm.bgclr;
		itm.div.style.color = itm.clr;
		itm.div.onclick = $.proxy(function(event) { 
			event.stopPropagation();
			var rslt = itm.handler();
			if (rslt == undefined) rslt = true;
			if (rslt) this.close();
		}, this);
		itm.div.onmouseover = $.proxy(function() { 
			this.div.style.backgroundColor = itm.hvrbgclr ;
			this.div.style.color = itm.hvrclr;
		}, itm);
		itm.div.onmouseout = $.proxy(function() { 
			this.div.style.backgroundColor = this.bgclr; 
			this.div.style.color = this.clr;
		}, itm);
		itm.disabled = false;
	}
}
