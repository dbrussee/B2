B.settings.SlideMenu = {
	openStyle: "OVERLAY", // "PUSH" pushes page content to the right when Slide Menu opens (Not ready for use)
	Multisection: false,  // Only one section open at a time on SlideMenu
	Slidetime: 250, SectionSlidetime: 200,
	FG: "white", BG: "black",
	SectionFG: "navy", SectionBG: "lightyellow",
	ItemFG: "white", ItemBG: "navy", ItemHoverFG: "yellow", ItemHoverBG: "navy"
};

B.PopupMenu = function(onbeforeshow) {
    this.items = {};
    this.itemlist = [];
    this.showing = false;
    this.object = null;
    this.tree = null;
    this.branch = null;
    this.target = null;
    if (onbeforeshow == undefined) onbeforeshow = null;
    if (onbeforeshow == null) onbeforeshow = function() { return true; };
    this.onBeforeShow = onbeforeshow;
    this.onclose = function() { };
    this.handler = null;
    this.made = false; // After the first MAKE... we need to track the status of open/closed submenus
};
B.PopupMenu.prototype.addMenu = function(id, img, txt, func, disabled) {
    if (disabled == undefined) disabled = false;
    if (func == undefined) func = function() { return true; };
    var itm = { kind:'menu', id:id, img:img, text:txt, func:func, disabled:disabled, treenode:null };
    this.items[id] = itm;
    this.itemlist.push(itm);
};
B.PopupMenu.prototype.addSpace = function() {
    var itm = { kind:'space' };
    // No reference in items collection
    this.itemlist.push(itm); 
};
B.PopupMenu.prototype.addSubmenu = function(id, txt) {
    var itm = { kind:'submenu', id:id, text:txt, menu:new B.PopupSubmenu(this, this, id, txt), treenode:null };
    this.items[id] = itm;
    this.itemlist.push(itm);
    return itm.menu;
};
B.PopupMenu.prototype.enable = function() {
    for (var i = 0; i < arguments.length; i++) {
        var itm = this.items[arguments[i]];
		itm.disabled = false;
		if (itm.treenode) {
			itm.treenode.enabled = true;
			$(itm.treenode.textTD).fadeTo(0,1);
		}
    }
};
B.PopupMenu.prototype.disable = function() {
    for (var i = 0; i < arguments.length; i++) {
        var itm = this.items[arguments[i]];
		itm.disabled = true;
		if (itm.treenode) {
			itm.treenode.enabled = false;
			$(itm.treenode.textTD).fadeTo(0,.3);	
		}
    }
};
B.PopupMenu.prototype.getSubmenu = function(code) {
    // code is <submenuid>.<submenuid>
    // example: a.b.c
    var parts = code.split(".");
    var menu = this;
    for (var i = 0; i < parts.length; i++) {
        if (parts[i] == "") continue;
        var item = menu.items[parts[i]];
        if (item.kind == "submenu") {
            menu = item.menu;
        } else {
            break;
        }
    }
    return menu;
};

B.PopupMenu.prototype.make = function() {
    if (!this.made) {
        this.object = document.createElement("div");
        this.object.style.cssText = "position:absolute; display:none; border:1px dotted navy; border-top: 3px solid navy; padding:3px; background-color:white; box-shadow:5px 5px 10px gray;";
        $(this.object).appendTo("body");
    }
    this.object.innerHTML = ""; // Clean it out each time!
    
    var oldTree = this.tree;

    this.tree = new B.Tree(this.object, null, true); // Only one submenu at a time
    for (var i = 0; i < this.itemlist.length; i++) {
        var itm = this.itemlist[i];
        itm.tree = this;
        if (itm.kind == "space") {
            this.tree.addItem("<span style='color:silver;'>&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;&mdash;</span>", function() {}, "<span style='color:silver;'>&mdash;</span>");
        } else if (itm.kind == "menu") {
            if (itm.disabled) {
                itm.treenode = this.tree.addItem("<span style='color:silver;'>" + itm.text + "</span>", null, "&nbsp;");
            } else {
                if (itm.img == "") itm.img = B.char.RIGHT_OL;
                itm.treenode = this.tree.addItem(itm.text, $.proxy(function() { 
                    var rslt = this.func(); 
                    if (rslt == undefined) rslt = true;
                    if (rslt) {
                        $("html").click();
                        this.tree.hide();     
                    }
                }, itm), itm.img);
            }
        } else if (itm.kind == "submenu") {
            var open = false;
            if (oldTree != null) {
                open = oldTree.nodes[i].showing;
            }
            var b = this.tree.addBranch(itm.text, open);
            this.treenode = b;
            itm.menu.make(b);
        } else {
            // What kind if thing are you!?
        }
    }
    this.tree.render();
    this.made = true;
};
B.PopupMenu.prototype.showAt = function(x,y) {
    this.showing = true;
    this.make();
    $(this.object).css("top", y).css("left", x);
    $(this.object).show();
    this.handler = $.proxy(function() {
		$("html").one("click", $.proxy(function(event) { 
			this.hide(); 
		}, this));		
    }, this);
	window.setTimeout(this.handler, 10);
};
B.PopupMenu.prototype.show = function(event) {
	var rslt = this.onBeforeShow(this, event);
	if (rslt == undefined) rslt = true;
	if (!rslt) return;
	this.target = event.target;
	this.showing = true;
	try {
		event.preventDefault();
		$("*").tooltip("close");
    } catch(e) {;}
	this.make();  
	if (event != undefined) {
		if (B.is.IE()) {
			$(this.object).css("top", event.clientY+5).css("left", event.clientX+5);
		} else {
			$(this.object).css("top", event.pageY+5).css("left", event.pageX+5);
		}
	}  
	this.draw();
};
B.PopupMenu.prototype.draw = function() {
    $(this.object).show();
    this.handler = $.proxy(function() {
		$("html").one("click", $.proxy(function(event) { 
			this.hide(); 
		}, this));		
	}, this);
	window.setTimeout(this.handler, 10);
};
B.PopupMenu.prototype.hide = function() {
    if (this.handler != null) $("html").unbind("click", this.handler);
    this.handler = null;
    $(this.object).hide();
    this.onclose(this);
    this.target = null;
    this.showing = false;
};

// This is basically a re-implementation of the Tree.Branch item
B.PopupSubmenu = function(menu, parentBranch, id, text) {
    this.menu = menu;
    this.parent = parentBranch;
    this.tree = this.parent.tree;
    this.branch = null;
    this.items = {};
    this.itemlist = [];
};
B.PopupSubmenu.prototype.addMenu = function(id, img, txt, func, disabled) {
    if (disabled == undefined) disabled = false;
    if (func == undefined) func = function() { return true; };
    var itm = { kind:'menu', id:id, img:img, text:txt, func:func, disabled:disabled, treenode:null };
    this.items[id] = itm;
    this.itemlist.push(itm);
};
B.PopupSubmenu.prototype.addSpace = function() {
    var itm = { kind:'space' };
    // No reference in items collection
    this.itemlist.push(itm); 
};
B.PopupSubmenu.prototype.addSubmenu = function(id, txt) {
    var itm = { kind:'submenu', id:id, text:txt, menu:new B.PopupSubmenu(this.menu, this, id, txt), treenode:null };
    // No reference in items collection
    this.itemlist.push(itm);
};
B.PopupSubmenu.prototype.enable = function() { // Pass in "id,id" or "id", "id"
    for (var i = 0; i < arguments.length; i++) {
        var id = arguments[i];
        if (id.indexOf(",") > -1) {
            this.enable(id.split(","));
        } else {
            var itm = this.items[id];
            itm.disabled = false;
        }
    }
};
B.PopupSubmenu.prototype.disable = function() { // Pass in "id,id" or "id", "id"
    for (var i = 0; i < arguments.length; i++) {
        var id = arguments[i];
        if (id.indexOf(",") > -1) {
            this.disable(id.split(","));
        } else {
            var itm = this.items[id];
			itm.disabled = true;
			
        }
    }
};
B.PopupSubmenu.prototype.make = function(branch) {
    for (var i = 0; i < this.itemlist.length; i++) {
        var itm = this.itemlist[i];
        itm.tree = branch.tree;
        itm.branch = branch;
        itm.menu = this.menu;
        if (itm.kind == "space") {
            itm.branch.addItem("<span style='background-color:silver;'>&nbsp;</span>", null,"&nbsp;");
        } else if (itm.kind == "menu") {
            if (itm.disabled) {
                itm.treenode = itm.branch.addItem("<span style='color:silver;'>" + itm.text + "</span>", null, "&nbsp;");
            } else {
                if (itm.img == "") itm.img = B.char.RIGHT_OL;
                itm.treenode = itm.branch.addItem(itm.text, $.proxy(function() { 
                    var rslt = this.func(); 
                    if (rslt == undefined) rslt = true;
                    if (rslt) {
                        $("html").click();
                        this.menu.hide();     
                    }
                }, itm), itm.img);
            }
        } else if (itm.kind == "submenu") {
            this.treenode = this.tree.addBranch(itm.text, false);
            itm.menu.make();
        } else {
            // What kind if thing are you!?
        }
    }

};

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
	$(div).on("click", $.proxy(function() { this.close(); }, this));
	div.style.position = "absolute";
	div.style.height = "93%";
	div.style.overflow = "hidden";
	div.style.width = width;
	div.style.backgroundColor = this.bgclr;
	div.style.color = this.clr;
	div.style.left = "5px";
	div.style.top = "5px";
	div.style.margin = "0";
	div.style.boxShadow = "5px 5px 10px gray";
	var topdiv = document.createElement("div");
	topdiv.style.paddingBottom = "0px";
	topdiv.style.marginBottom = "0";
	topdiv.style.textAlign = "right";
	if (title == undefined) title = "";
	topdiv.innerHTML = "<span style='font-size: 10pt; font-weight: bold; float: left; padding-left: 6px; padding-top: 5px;'>" + title + "</span>";
	var xbox = document.createElement("span");
	xbox.style.cursor = "pointer";
	xbox.style.paddingRight = "4px";
	xbox.style.paddingTop = "4px";
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
			if (B.settings.SlideMenu.openStyle == "PUSH") {
				this.pushDiv.style.left = this.div.style.width;
			}
			this.isOpen = true;
			window.setTimeout($.proxy(function() {
				$("html").one("click", $.proxy(function(event) { 
					this.hide(); 
				}, this));		
			}, this), 10);			
		}
	};
	this.pushDiv = document.createElement("span");
	this.pushDiv.style.position = "absolute";
	this.pushDiv.style.top = "0px";
	this.pushDiv.style.left = "0px";
	this.pushDiv.style.overflow = "hidden";
	this.open = this.show;
	this.hide = function() { 
		var rslt = this.onbeforeclose(this);
		if (rslt == undefined) rslt = true;
		if (rslt) {
			$(this.div).hide("slide", 100, $.proxy( function() { 
				if (B.settings.SlideMenu.openStyle == "PUSH") {
					this.pushDiv.style.left = "0px";
				}
				this.onafterclose(this);
			}, this));
			this.isOpen = false;
		}
	};
	this.close = this.hide;
	this.toggle = function() {
		if (this.isOpen) {
			this.hide();
		} else {
			this.show();
		}
	};
	this.items = [];
	this.sections = {};
	this.curSec = null; // No sections
	
	this.onbeforeopen = function() { return true; };
	this.onafteropen = function() { };
	this.onbeforeclose = function() { return true; };
	this.onafterclose = function() { };
	
	return this;
};
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
	div.style.backgroundColor = this.bgclr;
	div.style.color = this.clr;
	if (iconname == undefined) iconname = "";
	if (iconname == null) iconname = "";
	if (iconname != "") {
		h = B.img(iconname, 10);
	}
	div.innerHTML = B.trim(h + " " + text);
	div.style.fontWeight = "normal";
	div.style.fontSize = "10pt";
	div.style.borderTop = "1px solid " + this.menu.bgclr;
	div.style.margin = "0";
		div.style.padding = "3px";
	if (section == null) {
		this.menu.appendChild(div);
	} else {
		section.div.appendChild(div);
	}
	var itm = { mnu: this, id: "", div: div, section: section, type: 'item', handler: handler, disabled: true, clr: clr, bgclr: bgclr, hvrclr: hvrclr, hvbgclr: hvrbgclr };
	this.items.push(itm);
	this.enable(this.items.length-1);
	return itm;
};
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
	};
	this.sections[id] = sec;

	var div = document.createElement("div");
	div.style.backgroundColor = sec.bgclr;
	div.style.color = sec.clr;
	div.style.textAlign = "center";
	div.innerHTML = "<div style='padding-bottom: 3px;'>" + B.trim(title) + "</div>";
	div.style.fontWeight = "bold";
	div.style.cursor = "pointer";
	div.style.fontSize = "10pt";
	div.style.borderTop = "1px solid " + this.bgclr;
	div.style.paddingTop = "3px";
	div.style.margin = "0";
	sec.section = div;
	this.menu.appendChild(div);
	
	var sub = document.createElement("div");
	sub.style.textAlign = "left";
	sub.style.padding = "0"; // padding already applied on parent
	sub.style.paddingLeft = ".5em";
	sub.style.fontWeight = "bold";
	sub.style.cursor = "pointer";
	sub.style.fontSize = "10pt";
	sub.style.margin = "0";
	sec.div = sub;
	$(sub).hide();
	div.appendChild(sub);
	div.onclick = $.proxy(function(event) { 
		event.stopPropagation(); 
		this.show();
	}, sec);
	this.click = $.proxy(function() { this.show(); }, this);

	return sec;

};
B.SlideMenu.prototype.setSection = function(id) { this.getSection(id).show(); return this; };
B.SlideMenu.prototype.getSection = function(id) { return this.sections[id]; };
B.SlideMenu.prototype.setDisabled = function(disValue) {
	for (var i = 1; i < arguments.length; i++) {
		if (disValue) {
			this.disable(arguments[i]);
		} else {
			this.enable(arguments[i]);
		}
	}
};
B.SlideMenu.prototype.disable = function() {
	for (var i = 0; i < arguments.length; i++) {
		var itm = this.items[arguments[i]];
		itm.div.style.backgroundColor = "gray";
		itm.div.style.color = "white";
        itm.div.style.cursor = "default";
		itm.div.onclick = function(event) { event.stopPropagation(); };
		itm.div.onmouseover = function() { };
		itm.div.onmouseout = function() { };
		itm.disabled = true;
	}
};
B.SlideMenu.prototype.enable = function() {
	for (var i = 0; i < arguments.length; i++) {
		var itm = this.items[arguments[i]];
		itm.div.style.backgroundColor = itm.bgclr;
        itm.div.style.color = itm.clr;
        if (itm.handler == null) { // Text only... no handler
            itm.div.style.cursor = "default";
            itm.div.onclick = function(event) { event.stopPropagation(); return false; };
            itm.div.onmouseover = function() { };
            itm.div.onmouseout = function() { };
        } else {
            itm.div.style.cursor = "pointer";
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
        }
        itm.disabled = false;    
	}
};

B.DropdownMenu = function(onbeforeshow) {
    this.menus = {};
    this.menulist = [];
    this.object = null;
    if (onbeforeshow == undefined) onbeforeshow = null;
    if (onbeforeshow == null) onbeforeshow = function() { return true; };
    this.onbeforeshow = onbeforeshow;
};
B.DropdownMenu.prototype.addMenu = function(id, text, onclick) {
    var pop = new B.PopupMenu();
    if (onclick == undefined) onclick = function() { return true; };
    var mnu = { id:id, ddmenu:this, text:text, submenu:pop, onclick:onclick, built:false };
    this.menus[id] = mnu;
    this.menulist.push(mnu);
    return mnu.submenu;
};
B.DropdownMenu.prototype.setText = function(id, text) {
    var menu = this.menus[id];
    menu.text = text;
    if (this.object != null) {
        menu.td.innerHTML = text;
    }
};
B.DropdownMenu.prototype.getText = function(id) {
    var menu = this.menus[id];
    if (menu != null) return menu.text;
    return null;
};
B.DropdownMenu.prototype.getMenu = function(code) {
    // code is <menuid>.<submenuid>.<submenuid>
    // example: a.aa.aaa
    //    a is the main dropdown menu
    //    aa is a submenu in that dropdown
    //    aaa is a submenu in aa
    var parts = code.split(".");
    var menu = this.menus[parts[0]].submenu; // This is a B.PopupMenu object
    menu = menu.getSubmenu(parts.slice(1).join("."));
    return menu; // This is either a PopupMenu or a subMenu of that PopupMenu
};
B.DropdownMenu.prototype.getItem = function(menucode, itemid) {
    var menu = this.getMenu(menucode);
    return menu.items[itemid].treenode;
};
B.DropdownMenu.prototype.enableItem = function(code, id) {
    var menu = this.getMenu(code);
    menu.enable(id);
};
B.DropdownMenu.prototype.disableItem = function(code, id) {
    var menu = this.getMenu(code);
    menu.disable(id);
};
B.DropdownMenu.prototype.closeAll = function() {
	for (var k in this.menus) {
		var mnu = this.menus[k];
		if (mnu.submenu.showing) {
			mnu.td.click();
		}
	}
};
B.DropdownMenu.prototype.render = function(div) {
    if (typeof div == "string") div = document.getElementById(div);
    this.object = div;
    this.object.innerHTML = "";
    var tbl = document.createElement("table");
    tbl.style.cssText = "border-collapse:collapse;";
    var tbody = document.createElement("tbody");
    tbl.appendChild(tbody);
    var tr = document.createElement('tr');
    tbody.appendChild(tr);
    for (var i = 0; i < this.menulist.length; i++) {
        var mnu = this.menulist[i]; // pointers to menu objects
        var td = document.createElement("td");
        mnu.td = td;
        td.innerHTML = mnu.text;
        td.style.cssText = "padding-left:.5em; padding-right:.5em; border-right:1px solid navy;";
        td.className = "BAction";
        td.onclick = $.proxy(function() { // closing the menu
            this.onclick();
			var mnu = this;
            if (this.submenu.showing) {
                this.td.style.color = "";
                this.td.style.backgroundColor = "";
            	this.submenu.hide();
            } else {
				if (this.submenu.itemlist.length == 0) return;
				if (this.built) {
					mnu.td.style.color = "white";
					mnu.td.style.backgroundColor = "navy"; 
					mnu.submenu.draw();    
				} else {
					this.built = true;
					var el = $(mnu.td);
					var tr = $(el).parent("tr");
					var pos = el.offset();
					this.submenu.onclose = $.proxy(function() { 
						this.style.color = "";
						this.style.backgroundColor = "";
					}, mnu.td);
					mnu.td.style.color = "white";
					mnu.td.style.backgroundColor = "navy";        
					mnu.submenu.showAt(pos.left, pos.top + tr.outerHeight());    
				}
            }
        }, mnu);
        tr.appendChild(td);
    }
    this.object.appendChild(tbl);
};

// B2.0 Tree
// A Tree lives in a DIV. Any existing content will be destroyed
// require B2_0-Core.js
// require jQuery

B.Tree = function(elementId, item_click_callback, only_one_open_per_level) {
	this.rendered = false;
	this.onitemclick = item_click_callback || null;
	if (only_one_open_per_level == undefined) only_one_open_per_level = true;
	this.oneBranchPerLevel = only_one_open_per_level;
	if (typeof elementId == "string") {
		this.element = document.getElementById(elementId);		
	} else {
		this.element = elementId;
	}
	this.tbl = null; // To be created and applied to this.element when rendering
	this.nodes = []; // A node can be a item or a branch (which contains items)

	this.closedBranchIcon = B.char.RIGHT;
	this.openBranchIcon = B.char.DIR_SE;

	return this;
};
B.Tree.prototype.addBranch = function(html, showing) {
	var branch = new B.TreeBranch(this, this, html, showing);
	this.nodes.push(branch);
	return branch;
};
B.Tree.prototype.addItem = function(txt, data, icon) {
	var item = new B.TreeItem(this, this, txt, data, icon);
	this.nodes.push(item);
	return item;
};
B.Tree.prototype.closeAll = function() {
	for (var i = 0; i < this.nodes.length; i++) {
		var node = this.nodes[i];
		if (node instanceof B.TreeBranch) node.closeAll();
	}
};
B.Tree.prototype.closeAllBut = function(keep) {
	//var keepNode = keep;
	if (typeof keep == "number") keepNode = this.nodes[keep];
	for (var i = 0; i < this.nodes.length; i++) {
		var node = this.nodes[i];
		if (node instanceof B.TreeBranch) {
			if (node == keep) {
				if (!node.showing) node.open();
			} else {
				node.close();
			}
		}
	}
};
B.Tree.prototype.openAll = function() {
	for (var i = 0; i < this.nodes.length; i++) {
		var node = this.nodes[i];
		if (node instanceof B.TreeBranch) {
			node.openAll();
		}
	}
};
B.Tree.prototype.render = function() {
	var prevOpen = false;
	this.element.innerHTML = ""; // Clean it up first
	this.tbl = document.createElement("table");
	this.tbl.style.cssText = "border-collapse:collapse; border:0; padding:0; margin:0";
	this.element.appendChild(this.tbl);
	var tbody = document.createElement("tbody");
	this.tbl.appendChild(tbody);
	for (var i = 0; i < this.nodes.length; i++) {
		if (this.nodes[i] instanceof B.TreeBranch) {
			this.nodes[i].render(tbody, prevOpen);
			if (this.nodes[i].showing) prevOpen = true;
		} else {
			this.nodes[i].render(tbody);
		}
	}
};

B.TreeBranch = function(tree, parent, html, showing) {
	this.tree = tree;
	this.parent = parent;
	if (html == undefined) html = "Tree Branch";
	this.html = html;
	this.nodes = [];
	if (showing == undefined) showing = true;
	this.showing = showing;
	this.tbl = null;
	this.itemDIV = null;
	return this;
};
B.TreeBranch.prototype.addBranch = function(html, showing) {
	var branch = new B.TreeBranch(this.tree, this, html, showing);
	this.nodes.push(branch);
	return branch;
};
B.TreeBranch.prototype.addItem = function(html, data, icon) {
	var item = new B.TreeItem(this.tree, this, html, data, icon);
	this.nodes.push(item);
	return item;
};
B.TreeBranch.prototype.close = function() {
	$(this.tbl).hide();
	this.showing = false;
	this.tr.cells[0].innerHTML = this.tree.closedBranchIcon;
};
B.TreeBranch.prototype.closeAll = function() {
	this.close();
	for (var i = 0; i < this.nodes.length; i++) {
		var node = this.nodes[i];
		if (node instanceof B.TreeBranch) {
			node.closeAll();
		}
	}
};
B.TreeBranch.prototype.closeAllBut = function(keep) {
	//var keepNode = keep;
	if (typeof keep == "number") keepNode = this.nodes[keep];
	for (var i = 0; i < this.nodes.length; i++) {
		var node = this.nodes[i];
		if (node instanceof B.TreeBranch) {
			if (node == keep) {
				if (!node.showing) node.open();
			} else {
				node.close();
			}
		}
	}
};
B.TreeBranch.prototype.open = function() {
	$(this.tbl).show();
	this.showing = true;
	this.tr.cells[0].innerHTML = this.tree.openBranchIcon;
};
B.TreeBranch.prototype.openAll = function() {
	this.open();
	for (var i = 0; i < this.nodes.length; i++) {
		var node = this.nodes[i];
		if (node instanceof B.TreeBranch) {
			node.openAll();
		}
	}
};
B.TreeBranch.prototype.render = function(parentElement, previousOpen) {
	var tr = document.createElement("tr");
	parentElement.appendChild(tr);
	tr.style.cursor = "pointer";
	//tr.className = "BAction";
	var td = document.createElement("td");
	td.style.cssText = "color:darkgreen; vertical-align:top; width:1.1em; text-align:center;";
	tr.appendChild(td);
	td = document.createElement("td");
	td.style.cssText = "vertical-align:top;";
	td.innerHTML = "<span style='font-style:italic;color:brown;text-shadow: 2px 2px 2px silver'>" + this.html + " <span style='font-size:.7em;'>(" + this.nodes.length + ")</span></span>";
	tr.appendChild(td);

	this.tbl = document.createElement("table");
	var tbody = document.createElement("tbody");
	this.tbl.appendChild(tbody);
	this.tbl.style.cssText = "width:100%; border:0; border-collapse:collapse; padding:0; margin:0";
	this.tr = tr;
	td.appendChild(this.tbl);

	if (this.tree.oneBranchPerLevel && previousOpen) {
		this.showing = false;
	}
	if (!this.showing) {
		$(this.tbl).hide();
	}

	tr.onclick = $.proxy(function(e) {
		try{e.stopPropagation();}catch(e){}			
		try{event.cancelBubble = true;}catch(e){}
		if (this.showing) {
			this.close();
		} else {
			if (this.tree.oneBranchPerLevel) {
				this.parent.closeAllBut(this);
			} else {
				this.open();
			}
		}
	}, this);
	var prevOpen = false;
	for (var i = 0; i < this.nodes.length; i++) {
		if (this.nodes[i] instanceof B.TreeBranch) {
			this.nodes[i].render(tbody, prevOpen);
			if (this.nodes[i].showing) prevOpen = true;
		} else {
			this.nodes[i].render(tbody);
		}
	}
	tr.cells[0].innerHTML = (this.showing ? this.tree.openBranchIcon : this.tree.closedBranchIcon);
};

B.TreeItem = function(tree, parent, html, data, icon) {
	this.tree = tree;
	this.parent = parent;
	this.icon = icon || B.char.RIGHT;
	this.iconTD = null;
	this.data = data || null;
	this.html = html || "";
	this.enabled = true;
	this.textTD = null;
	return this;
};
B.TreeItem.prototype.setIcon = function(icon) {
	this.icon = icon;
	if (this.iconTD != null) this.iconTD.innerHTML = icon;
};
B.TreeItem.prototype.setText = function(text) {
	this.html = text;
	if (this.textTD != null) this.textTD.innerHTML = text + "&nbsp;";
};
B.TreeItem.prototype.render = function(branchElement) {
	var linktype = null;
	if (this.data instanceof Function) {
		linktype = "function";
	} else if (this.tree.onItemclick != null && this.data != null) {
		linktype = "item";
	}
	var isLink = (linktype != null);
	var tr = document.createElement("tr");
	if (isLink) {
		tr.className = "BAction";
	} else {
		tr.style.cursor = "default";
		this.icon = B.char.RIGHT_OL;
	}
	var td = document.createElement("td");
	td.style.cssText = "color:darkgreen;vertical-align:top; width:1.1em; text-align:center;";
	this.iconTD = td;
	td.innerHTML = this.icon;
	tr.appendChild(td);
	td = document.createElement("td");
	this.textTD = td;
	//td.innerHTML = (isLink ? B.format.ASLINK(this.html) : this.html);
	td.innerHTML = this.html + "&nbsp;";
	tr.appendChild(td);

	if (linktype == "function") { // Call the user-defined function
		tr.onclick = $.proxy(function(e) {
			try{e.stopPropagation();}catch(e){}			
			try{event.cancelBubble = true;}catch(e){}
			if (!this.enabled) return false;
			this.data.call(); // In this case, data IS a function... so call it
		}, this);
	} else if (linktype == "item") { // call the global functin passing data
		tr.onclick = $.proxy(function(e) {
			try{e.stopPropagation();}catch(e){}			
			try{event.cancelBubble = true;}catch(e){}
			if (!this.enabled) return false;
			this.tree.onItemclick(this.data);
		}, this);
	} else { // Do nothing, but stop going up the chain!
		tr.onclick = function(e) { 
			try{e.stopPropagation();}catch(e){}			
			try{event.cancelBubble = true;}catch(e){}
		} ;
	}
	
	branchElement.appendChild(tr);
};

