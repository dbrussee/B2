// B2.0 Data
B.DataColumn = function(id, typecode, req, autotrim) {
	// Example typecode: "!t_"
	// t: Normal text (dflt)	T: Always upper case text
	// #: Integer				f: Floating point number
	// @: Date					%: Timestamp (Date/Time)
	// b: Boolean				$: Dollars (2 decimal points)
	this.autotrim = autotrim; // may be undefined
	this.req = req; // may be undefined
	this.key = false;
	if (typecode == undefined) typecode = "t"; // Normal text
	this.id = id;
	this.typ = "t"; // Default in case nothing sets it differently
	for (var i = 0; i < typecode.length; i++) {
		var ch = typecode.charAt(i);
		if (ch == "_") this.autotrim = false;
		else if (ch == "*") this.key = true;
		else if (ch == "!") this.req = true;
		else (this.typ = ch);
	}
	if (this.autotrim == undefined) this.autotrim = true;
	if (this.req == undefined) this.req = false;
	if (this.key == undefined) this.key = false;
	if (this.key) this.req = true;
	return this;
};
B.DataColumnSet = function(codes) {
	this.colset = [];
	this.colsetids = {}; // Links to colset items by id
	if (codes == undefined) codes = "";
	if (typeof codes == "string" && codes.length > 0) {
		// Example: "id:*#,fn:t,ln:t,bd:!@,dsc:t_"
		var items = codes.split(",");
		for (var i = 0; i < items.length; i++) {
			var itm = items[i].split(":");
			if (itm.length == 1) {
				this.addColumn(items[i]);
			} else {
				this.addColumn(itm[0], itm[1]);
			}
		}
	}
	return this;
}
B.DataColumnSet.prototype.addColumn = function(id, typecode) {
	var dc = new B.DataColumn(id, typecode);
	this.colset.push(dc);
	this.colsetids[id] = dc; // Just another pointer to the same dc object
	return dc;
}
B.DataColumnSet.prototype.getColumn = function(id) {
	return this.colsetids[id];
}