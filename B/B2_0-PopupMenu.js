B.PopupMenu = function(onbeforeshow) {
    this.items = {};
    this.itemlist = [];
    this.showing = false;
    this.object = null;
    this.tree = null;
    this.branch = null;
    if (onbeforeshow == undefined) onbeforeshow = null;
    if (onbeforeshow == null) onbeforeshow = function() { return true; };
    this.onbeforeshow = onbeforeshow;
    this.onclose = function() { };
    this.handler = null;
    this.made = false; // After the first MAKE... we need to track the status of open/closed submenus
}
B.PopupMenu.prototype.addMenu = function(id, img, txt, func, disabled) {
    if (disabled == undefined) disabled = false;
    if (func == undefined) func = function() { return true; };
    var itm = { kind:'menu', id:id, img:img, text:txt, func:func, disabled:disabled, treenode:null };
    this.items[id] = itm;
    this.itemlist.push(itm);
}
B.PopupMenu.prototype.addSpace = function() {
    var itm = { kind:'space' };
    // No reference in items collection
    this.itemlist.push(itm); 
}
B.PopupMenu.prototype.addSubmenu = function(id, txt) {
    var itm = { kind:'submenu', id:id, text:txt, menu:new B.PopupSubmenu(this, this, id, txt), treenode:null };
    this.items[id] = itm;
    this.itemlist.push(itm);
    return itm.menu;
}
B.PopupMenu.prototype.enable = function() {
    for (var i = 0; i < arguments.length; i++) {
        var itm = this.items[arguments[i]];
        itm.disabled = false;
    }
}
B.PopupMenu.prototype.disable = function() {
    for (var i = 0; i < arguments.length; i++) {
        var itm = this.items[arguments[i]];
        itm.disabled = true;
    }
}
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
}

B.PopupMenu.prototype.make = function() {
    if (!this.made) {
        this.object = document.createElement("div");
        this.object.style.cssText = "position:absolute; display:none; border:1px dotted navy; border-top: 3px solid navy; padding:3px; background-color:white; box-shadow:5px 5px 10px gray;";
        $(this.object).appendTo("body")
    }
    this.object.innerHTML = ""; // Clean it out each time!
    
    var oldTree = this.tree;

    this.tree = new B.Tree(this.object, null, false);
    for (var i = 0; i < this.itemlist.length; i++) {
        var itm = this.itemlist[i];
        itm.tree = this;
        if (itm.kind == "space") {
            this.tree.addItem("------------", function() {}, "--");
        } else if (itm.kind == "menu") {
            if (itm.disabled) {
                itm.treenode = this.tree.addItem("<span style='color:silver;'>" + itm.text + "</span>", null, "&nbsp;");
            } else {
                if (itm.img == "") itm.img = B.char.RIGHT_CLR;
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
}
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
}
B.PopupMenu.prototype.show = function(event) {
    this.showing = true;
	try {
		event.preventDefault();
		$("*").tooltip("close");
    } catch(e) {;}
    this.make();    
    if (B.is.IE()) {
        $(this.object).css("top", event.clientY+5).css("left", event.clientX+5);
    } else {
        $(this.object).css("top", event.pageY+5).css("left", event.pageX+5);
    }

    $(this.object).show();
    this.handler = $.proxy(function() {
		$("html").one("click", $.proxy(function(event) { 
			this.hide(); 
		}, this));		
	}, this);
	window.setTimeout(this.handler, 10);
}
B.PopupMenu.prototype.hide = function() {
    if (this.handler != null) $("html").unbind("click", this.handler);
    this.handler = null;
    $(this.object).hide();
    this.onclose();
    this.showing = false;
}

// This is basically a re-implementation of the Tree.Branch item
B.PopupSubmenu = function(menu, parentBranch, id, text) {
    this.menu = menu;
    this.parent = parentBranch;
    this.tree = this.parent.tree;
    this.branch = null;
    this.items = {};
    this.itemlist = [];
}
B.PopupSubmenu.prototype.addMenu = function(id, img, txt, func, disabled) {
    if (disabled == undefined) disabled = false;
    if (func == undefined) func = function() { return true; };
    var itm = { kind:'menu', id:id, img:img, text:txt, func:func, disabled:disabled, treenode:null };
    this.items[id] = itm;
    this.itemlist.push(itm);
}
B.PopupSubmenu.prototype.addSpace = function() {
    var itm = { kind:'space' };
    // No reference in items collection
    this.itemlist.push(itm); 
}
B.PopupSubmenu.prototype.addSubmenu = function(id, txt) {
    var itm = { kind:'submenu', id:id, text:txt, menu:new B.PopupSubmenu(this.menu, this, id, txt), treenode:null };
    // No reference in items collection
    this.itemlist.push(itm);
}
B.PopupSubmenu.prototype.enable = function() { // Pass in "id,id" or "id", "id"
    for (var i = 0; i < arguments.length; i++) {
        var id = argumenst[i];
        if (id.indexOf(",") > -1) {
            this.enable(id.split(","));
        } else {
            var itm = this.items[id];
            itm.disabled = false;
        }
    }
}
B.PopupSubmenu.prototype.disable = function() { // Pass in "id,id" or "id", "id"
    for (var i = 0; i < arguments.length; i++) {
        var id = argumenst[i];
        if (id.indexOf(",") > -1) {
            this.disable(id.split(","));
        } else {
            var itm = this.items[id];
            itm.disabled = true;
        }
    }
}
B.PopupSubmenu.prototype.make = function(branch) {
    for (var i = 0; i < this.itemlist.length; i++) {
        var itm = this.itemlist[i];
        itm.tree = branch.tree;
        itm.branch = branch;
        itm.menu = this.menu;
        if (itm.kind == "space") {
            itm.branch.addItem("<hr />", null,"&nbsp;");
        } else if (itm.kind == "menu") {
            if (itm.disabled) {
                itm.treenode = itm.branch.addItem("<span style='color:silver;'>" + itm.text + "</span>", null, "&nbsp;");
            } else {
                if (itm.img == "") itm.img = B.char.RIGHT_CLR;
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

}