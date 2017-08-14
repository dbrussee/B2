// B2.0 Tree
// A Tree lives in a DIV. Any existing content will be destroyed

B.Tree = function(elementId, leaf_click_callback, only_one_open_per_level) {
	this.onLeafclick = leaf_click_callback || null;
	if (only_one_open_per_level == undefined) only_one_open_per_level = true;
	this.oneBranchPerLevel = only_one_open_per_level;
	if (typeof elementId == "string") {
		this.element = document.getElementById(elementId);		
	} else {
		this.element = elementId;
	}
	this.tbl = null; // To be created and applied to this.element when rendering
	this.nodes = []; // A node can be a leaf or a branch (leaves)

	this.closedBranchIcon = B.char.PLUS;
	this.openBranchIcon = B.char.MINUS;

	return this;
};
B.Tree.prototype.addBranch = function(html, showing) {
	var branch = new B.TreeBranch(this, this, html, showing);
	this.nodes.push(branch);
	return branch;
}
B.Tree.prototype.addLeaf = function(txt, data, icon) {
	var leaf = new B.TreeLeaf(this, this, txt, data, icon);
	this.nodes.push(leaf);
	return leaf;
}
B.Tree.prototype.closeAll = function() {
	for (var i = 0; i < this.nodes.length; i++) {
		var node = this.nodes[i]
		if (node instanceof B.TreeBranch) node.closeAll();
	}
}
B.Tree.prototype.closeAllBut = function(keep) {
	var keepNode = keep;
	if (typeof keep == "number") keepNode = this.nodes[keep];
	for (var i = 0; i < this.nodes.length; i++) {
		var node = this.nodes[i]
		if (node instanceof B.TreeBranch) {
			if (node == keep) {
				if (!node.showing) node.open();
			} else {
				node.close();
			}
		}
	}
}
B.Tree.prototype.openAll = function() {
	for (var i = 0; i < this.nodes.length; i++) {
		var node = this.nodes[i]
		if (node instanceof B.TreeBranch) {
			node.openAll();
		}
	}
}
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
}

B.TreeBranch = function(tree, parent, html, showing) {
	this.tree = tree;
	this.parent = parent;
	if (html == undefined) html = "Tree Branch";
	this.html = html;
	this.nodes = [];
	if (showing == undefined) showing = true;
	this.showing = showing;
	this.tbl = null;
	this.leafDIV = null;
	return this;
}
B.TreeBranch.prototype.addBranch = function(html, showing) {
	var branch = new B.TreeBranch(this.tree, this, html, showing);
	this.nodes.push(branch);
	return branch;
}
B.TreeBranch.prototype.addLeaf = function(html, data, icon) {
	var leaf = new B.TreeLeaf(this.tree, this, html, data, icon);
	this.nodes.push(leaf);
	return leaf;
}
B.TreeBranch.prototype.close = function() {
	$(this.tbl).hide();
	this.showing = false;
	this.tr.cells[0].innerHTML = this.tree.closedBranchIcon;
}
B.TreeBranch.prototype.closeAll = function() {
	this.close();
	for (var i = 0; i < this.nodes.length; i++) {
		var node = this.nodes[i]
		if (node instanceof B.TreeBranch) {
			node.closeAll();
		}
	}
}
B.TreeBranch.prototype.closeAllBut = function(keep) {
	var keepNode = keep;
	if (typeof keep == "number") keepNode = this.nodes[keep];
	for (var i = 0; i < this.nodes.length; i++) {
		var node = this.nodes[i]
		if (node instanceof B.TreeBranch) {
			if (node == keep) {
				if (!node.showing) node.open();
			} else {
				node.close();
			}
		}
	}
}
B.TreeBranch.prototype.open = function() {
	$(this.tbl).show();
	this.showing = true;
	this.tr.cells[0].innerHTML = this.tree.openBranchIcon;
}
B.TreeBranch.prototype.openAll = function() {
	this.open();
	for (var i = 0; i < this.nodes.length; i++) {
		var node = this.nodes[i]
		if (node instanceof B.TreeBranch) {
			node.openAll();
		}
	}
}
B.TreeBranch.prototype.render = function(parentElement, previousOpen) {
	var tr = document.createElement("tr");
	parentElement.appendChild(tr)
	tr.style.cursor = "pointer";
	var td = document.createElement("td");
	td.style.cssText = "color:darkgreen; vertical-align:top; width:1.1em; text-align:right; padding-right:3px;";
	tr.appendChild(td);
	td = document.createElement("td");
	td.style.cssText = "vertical-align:top;";
	td.innerHTML = "<b>" + this.html + "</b> <span style='font-size:.8em;text-decooration:italic'>(" + this.nodes.length + ")</span>";
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
}

B.TreeLeaf = function(tree, parent, html, data, icon) {
	this.tree = tree;
	this.parent = parent;
	this.icon = icon || B.char.RIGHT;
	this.data = data || null;
	this.html = html || "";
	return this;
}
B.TreeLeaf.prototype.render = function(branchElement) {
	var linktype = null;
	if (this.data instanceof Function) {
		linktype = "function";
	} else if (this.tree.onLeafclick != null && this.data != null) {
		linktype = "leaf";
	}
	var isLink = (linktype != null);
	var tr = document.createElement("tr");
	if (isLink) tr.style.cursor = "pointer";
	var td = document.createElement("td");
	td.style.cssText = "color:darkgreen;vertical-align:top; width:1.1em; text-align:right; padding-right:3px;";
	td.innerHTML = this.icon;
	tr.appendChild(td);
	td = document.createElement("td");
	td.innerHTML = (isLink ? B.format.ASLINK(this.html) : this.html);
	tr.appendChild(td);

	if (linktype == "function") { // Call the user-defined function
		tr.onclick = $.proxy(function(e) {
			try{e.stopPropagation();}catch(e){}			
			try{event.cancelBubble = true;}catch(e){}
			this.data.call();
		}, this);
	} else if (linktype == "leaf") { // call the global functin passing data
		tr.onclick = $.proxy(function(e) {
			try{e.stopPropagation();}catch(e){}			
			try{event.cancelBubble = true;}catch(e){}
			this.tree.onLeafclick(this.data);
		}, this)
	} else { // Do nothing, but stop going up the chain!
		tr.onclick = function(e) { 
			try{e.stopPropagation();}catch(e){}			
			try{event.cancelBubble = true;}catch(e){}
		} 
	}
	
	branchElement.appendChild(tr);
}