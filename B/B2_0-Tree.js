// B2.0 Tree
// UL
//    LI
//    UL
//       LI
//       LI
//    LI
B.Tree = function(elementId) {
	this.name = name;
	// id should be for a "UL" element;
	this.element = document.getElementById(elementId);
	this.nodes = []; // A node can be a B.TreeLeaf or a B.TreeBranch (collection of B.TreeNodes)
	return this;
};
B.Tree.prototype.addBranch = function(html) {
	var branch = new B.TreeBranch();
	this.nodes.push(branch);
	return branch;
}
B.Tree.prototype.addLeaf = function(txt, onclick) {
	var leaf = new B.TreeLeaf(txt, onclick);
	this.nodes.push(leaf);
	return leaf;
}
B.Tree.prototype.render = function() {
	for (var i = 0; i < this.nodes.length; i++) {
		this.nodes[i].render(this.element);
	}
}

B.TreeBranch = function(html) {
	if (html == undefined) html = "Tree Branch";
	this.nodes = [];
	return this;
}
B.TreeBranch.prototype.addBranch = function(html) {
	var branch = new B.TreeBranch(html);
	this.nodes.push(branch);
	return branch;
}
B.TreeBranch.prototype.addLeaf = function(html, onclick) {
	var leaf = new B.TreeLeaf(html, onclick);
	this.nodes.push(leaf);
	return leaf;
}
B.TreeBranch.prototype.render = function(parentElement) {
	var li = document.createElement("li");
	li.style.fontWeight = "bold";
	li.innerHTML = this.html;
	var ul = document.createElement("ul");
	li.appendChild(ul);

	for (var i = 0; i < this.nodes.length; i++) {
		this.nodes[i].render(ul);
	}
	parentElement.appendChild(li);
}

B.TreeLeaf = function(html, onclick) {
	if (html == undefined) html = "";
	this.html = html;
	if (onclick == undefined || onclick=="") onclick = null;
	this.onclick = onclick;
	return this;
}
B.TreeLeaf.prototype.render = function(branchElement) {
	var li = document.createElement("li");
	if (this.onclick != null) {
		li.onclick = this.onclick;
		li.innerHTML = B.format.ASLINK(this.html);
	} else {
		li.innerHTML = this.html;
	}
	branchElement.appendChild(li);
}