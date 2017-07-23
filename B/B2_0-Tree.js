// B2.0 Tree
// Added to bettway GIT

B.Tree = function(elementId) {
	this.element = document.getElementById(elementId);
	this.nodes = []; // A node can be a B.TreeLeaf or a B.TreeBranch (collection of B.TreeNodes)
	return this;
};
B.Tree.prototype.addBranch = function(this, html, showing) {
	var branch = new B.TreeBranch(html, showing);
	this.nodes.push(branch);
	return branch;
}
B.Tree.prototype.addLeaf = function(this, txt, onclick) {
	var leaf = new B.TreeLeaf(txt, onclick);
	this.nodes.push(leaf);
	return leaf;
}
B.Tree.prototype.render = function() {
	for (var i = 0; i < this.nodes.length; i++) {
		this.nodes[i].render(this.element);
	}
}

B.TreeBranch = function(tree, html, showing) {
	this.tree = tree;
	if (html == undefined) html = "Tree Branch";
	this.html = html;
	this.nodes = [];
	if (showing == undefined) showing = true;
	this.showing = showing;
	return this;
}
B.TreeBranch.prototype.addBranch = function(html, showing) {
	var branch = new B.TreeBranch(this.tree, html, showing);
	this.nodes.push(branch);
	return branch;
}
B.TreeBranch.prototype.addLeaf = function(html, onclick) {
	var leaf = new B.TreeLeaf(this.tree, html, onclick);
	this.nodes.push(leaf);
	return leaf;
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
	//spn.className = "branch";
	spn.style.fontWeight = "bold";
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
			$(branch.ul).hide();
			branch.showing = false;
			spn.innerHTML = "&#x25B7; " + branch.html;
//			B.addClass(branch.li, "showsub");
		} else {
			$(branch.ul).show();
			branch.showing = true;
			spn.innerHTML = "&#x25BD; " + branch.html;
//			B.removeClass(branch.li, "showsub");
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

B.TreeLeaf = function(tree, html, onclick) {
	this.tree = tree;
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