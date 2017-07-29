// B2.0 Tree
// A Tree lives in a DIV. Any existing content will be destroyed

B.Tree = function(elementId, leaf_click_callback, only_one_open_per_level) {
	this.onLeafclick = leaf_click_callback || null;
	if (only_one_open_per_level == undefined) only_one_open_per_level = true;
	this.oneBranchPerLevel = only_one_open_per_level;
	this.element = document.getElementById(elementId);
	this.nodes = []; // A node can be a leaf or a branch (leaves)

	this.closedBranchIcon = B.img("ADD");
	this.openBranchIcon = B.img("X");

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
	for (var i = 0; i < this.nodes.length; i++) {
		if (this.nodes[i] instanceof B.TreeBranch) {
			this.nodes[i].render(this.element, prevOpen);
			if (this.nodes[i].showing) prevOpen = true;
		} else {
			this.nodes[i].render(this.element);
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
	this.imgTD = null;
	this.txtTD = null;
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
	$(this.leafDIV).hide();
	this.showing = false;
	this.imgTD.innerHTML = this.tree.closedBranchIcon;
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
	$(this.leafDIV).show();
	this.showing = true;
	this.imgTD.innerHTML = this.tree.openBranchIcon;
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
	var div = document.createElement("div");
	div.style.cursor = "pointer";
	var tbl = document.createElement("table");
	tbl.style.cssText = "width:100%; border:0 border-collapse:collapse";
//	tbl.style.width = "100%";
//	tbl.style.border = "0";
//	tbl.style.borderCollapse = "collapse";
	var tr = document.createElement("tr");
	tbl.appendChild(tr);
	var td = document.createElement("td");
	td.style.cssText = "vertical-align:top; width:1.1em; text-align:right; padding-right:3px;";
//	td.style.verticalAlign = "top";
//	td.style.width = "1.1em";
//	td.style.textAlign = "right";
//	td.style.paddingRight = "3px";
	this.imgTD = td;
	tr.appendChild(td);
	td = document.createElement("td");
	this.txtTD = td;
	td.innerHTML = "<b>" + this.html + "</b> <span style='font-size:.8em;'><i>(" + this.nodes.length + ")</i></span>";
	tr.appendChild(td);
	div.appendChild(tbl);
	parentElement.appendChild(div);
	
	var div2 = document.createElement("div");

	this.leafDIV = div2;
	this.txtTD.appendChild(div2);
	if (this.tree.oneBranchPerLevel && previousOpen) {
		this.showing = false;
	}
	if (!this.showing) {
		$(div2).hide();
	}

	this.txtTD.onclick = $.proxy(function(e) {
		e.stopPropagation();
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
			this.nodes[i].render(this.leafDIV, prevOpen);
			if (this.nodes[i].showing) prevOpen = true;
		} else {
			this.nodes[i].render(this.leafDIV);
		}
	}
	this.imgTD.innerHTML = (this.showing ? this.tree.openBranchIcon : this.tree.closedBranchIcon);
}

B.TreeLeaf = function(tree, parent, html, data, icon) {
	this.tree = tree;
	this.parent = parent;
	this.icon = icon || B.img("DIAMOND");
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
	var div = document.createElement("div");
	if (isLink) div.style.cursor = "pointer";
	var h = "<table style='width:100%;border:0;border-collapse:collapse;'>";
	h += "<tr><td style='vertical-align:top; width:1.1em; text-align:right; padding-right:3px;'>" + this.icon + "</td>";
	h += "<td>" + (isLink ? B.format.ASLINK(this.html) : this.html) + "</td></tr></table>";
	div.innerHTML = h;
	if (linktype == "function") { // Call the user-defined function
		div.onclick = $.proxy(function(e) {
			e.stopPropagation();
			this.data.call();
		}, this);
	} else if (linktype == "leaf") { // call the global functin passing data
		div.onclick = $.proxy(function(e) {
			e.stopPropagation();
			this.tree.onLeafclick(this.data);
		}, this)
	} else { // Do nothing, but stop going up the chain!
		div.onclick = function(e) { e.stopPropagation(); } 
	}
	
	branchElement.appendChild(div);
}