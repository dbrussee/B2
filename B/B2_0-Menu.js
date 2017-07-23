// Added to bettway GIT
B.ContextMenu = function() {
	this.items = [];
	this.menuObject = null;
	this.locationStyle = "context";
	this.attachedTo = null;
	this.onBeforeShow = function() { };
	return this;
}
B.ContextMenu.prototype.addMenu = function(text, handler, iconcode, pos) {
	if (pos == undefined) pos = this.items.length;
	var obj = { 
		menu: this,
		text: text, 
		handler: handler, 
		icon: iconcode, 
		disabled: false,
		disable: function(yn) {
			if (yn == undefined) yn = true;
			if (yn) {
				if (!this.disabled) {
					this.disabled = true;
					this.menu.reset();
				}
			} else {
				this.enable();
			}
		},
		enable: function(yn) {
			if (yn == undefined) yn = true;
			if (yn) {
				if (this.disabled) {
					this.disabled = false;
					this.menu.reset();
				}
			} else {
				this.disable();
			}
		}
	};
	if (pos == this.items.length) {
		this.items[this.items.length] = obj; 
	} else {
		this.items.splice(pos, 0, obj);
	}
	return obj;
}
B.ContextMenu.prototype.addSpace = function() {
	this.items[this.items.length] = { 
		text: '', 
		handler: function() { } 
	};
	return this;
}
B.ContextMenu.prototype.hide = function() {
	this.reset();
	$("html").off("click");
}
B.ContextMenu.prototype.clear = function() {
	this.items = [];
	this.reset();
	return this;
}
B.ContextMenu.prototype.removeMenu = function(itm) {
	this.items.splice(itm, 0);
	this.reset();
}
B.ContextMenu.prototype.disable = function(itm) {
	var mnu = this.items[itm];
	if (!mnu.disabled) {
		mnu.disabled = true;
		this.reset();
	}
}
B.ContextMenu.prototype.enable = function(itm) {
	var mnu = this.items[itm];
	if (mnu.disabled) {
		mnu.disabled = false;
		this.reset();
	}
}
B.ContextMenu.prototype.reset = function() {
	if (this.menuObject != null) {
		this.menuObject.remove();
		this.menuObject = null; // will force initialize on next display
	}
	return this;
}
B.ContextMenu.prototype.initialize = function() {
	var ul = document.createElement("ul");
	ul.className = "BContextMenu";
	ul.style.position = "absolute";
	ul.style.zIndex = "9999";
	for (var i = 0; i < this.items.length; i++) {
		var itm = this.items[i];
		var li = $(document.createElement("li"));
		li.data("parm", itm.parm);
		if (itm.text == "") {
			li.html("");
			li.attr("type", "separator");
		} else {
			var icon = "ui-icon-";
			var txt = itm.text;
			if (itm.disabled) {
				icon += "blank"; // Disabled
				txt = "<span style='color: silver;'>" + itm.text + "</span>";
			} else {
				if (itm.icon == undefined) {
					icon += "triangle-1-e"; // right facing triangle
				} else {
					icon += itm.icon; // Whatever the user chose
				}
			}
			li.html("<a style='text-decoration: none;' href='#'><span class='ui-icon " + icon + "'></span>" + txt + "</a>&nbsp;");
		}
		if (!itm.disabled) {
			li.on("click", $.proxy(function(event) { 
				event.stopPropagation();
				this.menu.hide(); 
				this.handler(this); 
			}, itm)); // proxy uses this menu item as "this" in context
		}
		li.appendTo(ul);
	}
	this.menuObject = $(ul).menu().appendTo("body");
	this.menuObject.on("menuselect", function(event, ui) {
		$(this).hide();
		try {event.preventDefault();} catch(e) {;}
	});
	this.menuObject.hide();
}
B.ContextMenu.prototype.show = function(event) {
	try {
		event.preventDefault();
		$("*").tooltip("close");
	} catch(e) {;}
	this.onBeforeShow();
	if (this.menuObject == null) this.initialize();
	if (this.locationStyle == "context") {
		if (B.is.IE()) {
			this.menuObject.css("top", event.clientY-5).css("left", event.clientX-5);
		} else {
			this.menuObject.css("top", event.pageY-5).css("left", event.pageX-5);
		}
	} else {
		if (this.attachedTo == null) {
			this.menuObject.css("top", this.position.top).css("left", this.position.left);
		} else {
			this.menuObject.css("top", this.attachedTo.offsetTop + "px");
			this.menuObject.css("left", (this.attachedTo.offsetLeft + this.attachedTo.offsetWidth - 5) + "px");
		}
	}
	this.menuObject.show();
	window.setTimeout($.proxy(function() {
		$("html").one("click", $.proxy(function(event) { 
			this.hide(); 
		}, this));		
	}, this), 10);
}
