B.PopupMenu = function(onbeforeshow, menuWidth) {
    this.items = {};
    this.itemlist = [];
    this.showing = false;
    this.object = null;
    if (menuWidth == undefined) menuWidth = null;
    if (typeof menuWidth == "number") menuWidth += "px";
    this.menuWidth = menuWidth;
    if (onbeforeshow == undefined) onbeforeshow = null;
    if (onbeforeshow == null) onbeforeshow = function() { return true; };
    this.onbeforeshow = onbeforeshow;
}
B.PopupMenu.prototype.addMenu = function(id, img, txt, func, disabled) {
    if (disabled == undefined) disabled = false;
    if (func == undefined) func = function() { return true; };
    var itm = { kind:'menu', id:id, img:img, text:txt, func:func, disabled:disabled };
    this.items[id] = itm;
    this.itemlist.push(itm);
}
B.PopupMenu.prototype.addSpace = function() {
    var itm = { kind:'space' };
    // No reference in items collection
    this.itemlist.push(itm); 
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
B.PopupMenu.prototype.show = function(event) {
	try {
		event.preventDefault();
		$("*").tooltip("close");
	} catch(e) {;}    
    if (this.object == null) {
        this.object = document.createElement("div");
        this.object.style.cssText = "position:absolute; display:none; border:1px dotted black; padding:3px; background-color:white; box-shadow:5px 5px 10px gray;";
        if (this.menuWidth != null) this.object.style.width = this.menuWidth;
        $(this.object).appendTo("body")
    }
    this.object.innerHTML = ""; // Clean it out each time!
    var tree = new B.Tree(this.object, null, false);
    for (var i = 0; i < this.itemlist.length; i++) {
        var itm = this.itemlist[i];
        itm.tree = this;
        if (itm.kind == "space") {
            tree.addLeaf("<span style='color:silver;'><hr></span>", null,"&nbsp;");
        } else if (itm.kind == "menu") {
            if (itm.disabled) {
                tree.addLeaf("<span style='color:silver;'>" + itm.text + "</span>", null, "&nbsp;");
            } else {
                if (itm.img == "") itm.img = B.char.RIGHT_CLR;
                tree.addLeaf(itm.text, $.proxy(function() { 
                    this.tree.hide(); 
                    this.func(); 
                }, itm), itm.img);
            }
        } else {
            // What kind if thing are you!?
        }
    }
    tree.render();
    if (B.is.IE()) {
        $(this.object).css("top", event.clientY+5).css("left", event.clientX+5);
    } else {
        $(this.object).css("top", event.pageY+5).css("left", event.pageX+5);
    }

    $(this.object).show();
	window.setTimeout($.proxy(function() {
		$("html").one("click", $.proxy(function(event) { 
			this.hide(); 
		}, this));		
	}, this), 10);
}
B.PopupMenu.prototype.hide = function() {
    $(this.object).hide();
}