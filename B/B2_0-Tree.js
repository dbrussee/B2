// B2.0 Tree
// Added to bettway GIT

B.Tree = function(elementId, open_close_callback) {
	if (open_close_callback == undefined) open_close_callback = function(branch) { };
	this.callback = open_close_callback;
	this.element = document.getElementById(elementId);
	this.nodes = []; // A node can be a B.TreeLeaf or a B.TreeBranch (collection of B.TreeNodes)
	return this;
};
B.Tree.prototype.addBranch = function(html, showing) {
	var branch = new B.TreeBranch(this, this, html, showing);
	this.nodes.push(branch);
	return branch;
}
B.Tree.prototype.addLeaf = function(txt, onclick) {
	var leaf = new B.TreeLeaf(this, this, txt, onclick);
	this.nodes.push(leaf);
	return leaf;
}
B.Tree.prototype.closeAll = function() {
	for (var i = 0; i < this.nodes.length; i++) {
		var node = this.nodes[i]
		if (node instanceof B.TreeBranch) {
			node.closeAll();
		}
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
	for (var i = 0; i < this.nodes.length; i++) {
		this.nodes[i].render(this.element);
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
	return this;
}
B.TreeBranch.prototype.addBranch = function(html, showing) {
	var branch = new B.TreeBranch(this.tree, this, html, showing);
	this.nodes.push(branch);
	return branch;
}
B.TreeBranch.prototype.addLeaf = function(html, onclick) {
	var leaf = new B.TreeLeaf(this.tree, this, html, onclick);
	this.nodes.push(leaf);
	return leaf;
}
B.TreeBranch.prototype.close = function() {
	$(this.ul).hide();
	this.showing = false;
	this.span.innerHTML = "&#x25B7; " + this.html;
	this.tree.callback(this);
	return this;
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
	$(this.ul).show();
	this.showing = true;
	this.span.innerHTML = "&#x25BD; " + this.html;
	this.tree.callback(this);
	return this;
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
B.TreeBranch.prototype.render = function(parentElement) {
	var li = document.createElement("li");
	this.li = li;
	li.className = "branch";
	li.style.listStyle = "none";
	li.style.marginLeft = "-1.2em";
	li.style.paddingLeft = "1.2em";
	li.style.textIndent = "-1.2em";
	var spn = document.createElement("span");
	this.span = spn;
	//spn.className = "branch";
	spn.style.fontWeight = "bold";
	spn.style.fontSize = "1.05em";
	spn.style.cursor = "pointer";
//	var chr = (this.showing ? "&#x25C7; " : "&#x25C6; ");
	var chr = (this.showing ? "&#x25B7; " : "&#x25BD; ");
	spn.innerHTML = chr + this.html;
	spn.onclick = function() {
		var spn = $(this).closest("span")[0];
		var li = $(this).closest("li")[0];
		var branch = $(li).data("BBranch");
		// branch is now this object
		if (branch.showing) {
			branch.close();
		} else {
			branch.open();
		}
	}
	li.appendChild(spn);
	var ul = document.createElement(parentElement.tagName);
	this.ul = ul;
	li.appendChild(ul);
	$(li).data("BBranch", this); // this branch!!!
	$(li).data("BTree", this); // this branch!!!
	if (!this.showing) {
		B.addClass(li, "showsub");
		ul.style.display = "none";
	}
	for (var i = 0; i < this.nodes.length; i++) {
		this.nodes[i].render(ul);
	}
	parentElement.appendChild(li);
}

B.TreeLeaf = function(tree, parent, html, onclick) {
	this.tree = tree;
	this.parent = parent;
	if (html == undefined) html = "";
	this.html = html;
	if (onclick == undefined || onclick=="") onclick = null;
	this.onclick = onclick;
	return this;
}
B.TreeLeaf.prototype.render = function(branchElement) {
	var li = document.createElement("li");
	li.style.listStyle = "initial";
	li.style.marginLeft = "initial";
	li.style.paddingLeft = "initial";
	li.style.textIndent = "initial";
	li.className = "leaf";
	if (this.onclick != null) {
		li.onclick = this.onclick;
		li.innerHTML = B.format.ASLINK(this.html);
	} else {
		li.innerHTML = this.html;
	}
	branchElement.appendChild(li);
}