// B2.0 Data
// Added to bettway GIT
B.DataColumn = function(id, typecode) {
	// Example typecode: "!T_"
	// t: Normal text (dflt)	T: Always upper case text
	// #/n: Integer				f: Floating point number
	// @/d: Date				%: Timestamp (Date/Time)
	// b: Boolean				$: Dollars (2 decimal points)
	// _: Trailing underscore means it is not autotrimmed
	// !: The field is required
	// *: The field is a key (and therefore automatcially required)
	if (typecode == undefined) typecode = "t";
	this.typ = "t";
	this.id = id;
	this.autotrim = true;
	this.req = false;
	this.key = false;
	for (var i = 0; i < typecode.length; i++) {
		var ch = typecode.charAt(i);
		if (ch == "_") this.autotrim = false;
		else if (ch == "*") { this.key = true; this.req = true; }
		else if (ch == "!") this.req = true;
		else {
			if (ch == "d") ch = "@";
			if (ch == "n") ch = "#";
			this.typ = ch;
		}
	}
	return this;
};
/**
 * Returns a collection with { raw:'10.2322', val:10.23, disp:'$10.23', err:'' }
 * based on the value passed and the data type and properties
 * of the column
 */
B.DataColumn.prototype.parse = function(val) {
	if (val == undefined) val = "";
	if (val == null) val = "";
	var rslt = { "raw":val, "val":val, "disp":val, "err":"" };
	if (this.autotrim) rslt.val = B.trim(val);
	if (this.req && rslt.val == "") {
		if (this.key) {
			rslt.err = "Required (key)";
		} else {
			rslt.err = "Required";
		}
	} else if (this.typ == "t") { // Normal text
		// Leave it alone
	} else if (this.typ == "T") { // UPPER text
		rslt.val = val.toUpperCase();
		rslt.disp = rslt.val;
	} else if (this.typ == "#") { // Integer
		var test = parseInt(val,10);
		if (isNaN(test)) {
			rslt.err = "Invalid value";
			rslt.val = -1;
			rslt.disp = "-1";
		} else {
			rslt.val = test;
			rslt.disp = test.toString();
		}
	} else if (this.typ == "f") { // Float
		var test = parseFloat(val);
		if (isNaN(test)) {
			rslt.err = "Invalid value";
			rslt.val = -1;
			rslt.disp = "-1";
		} else {
			rslt.val = test;
			rslt.disp = test.toString();
		}
	} else if (this.typ == "@") { // Date (only)
		var test = new Date(val);
		if (isNaN(test)) {
			rslt.err = "Invalid date";
			rslt.val = "";
			rslt.disp = "";
		} else {
			rslt.disp = B.format.MDYYYY(test);
			rslt.val = new Date(rslt.disp); // Strip off time data
		}
	} else if (this.typ == "%") { // Timestamp
		var test = new Date(val);
		if (isNaN(test)) {
			rslt.err = "Invalid date";
			rslt.val = "";
			rslt.disp = "";
		} else {
			rslt.val = test;
			rslt.disp = B.format.TS(val);
		}
	} else if (this.typ == "b") { // boolean (Y/N)
		if (typeof val == "boolean") {
			rslt.val == val;
		} else {
			rslt.val = (B.trim(val).toUpperCase().charAt(0) == "Y");
		}
		rslt.disp = (rslt.val ? B.char.CHECK : "");
	} else if (this.typ == "$") {
		var test = parseFloat(val);
		if (isNaN(test)) {
			rslt.err = "Invalid value";
			rslt.val = "";
			rslt.disp = "";
		} else {
			rslt.val = B.parseFloat(B.format.DECIMALPLACES(val, 2));
			rslt.disp = B.format.DOLLARS(rslt.val,2);
		}
	} else {
		// No idea what type this is... sorry.
	}
	return rslt;
}
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
				this.addColumn(items[i], "t");
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

// A dataset is combination of a B.DataColumnSet and 
// a big string that can be split into rows and columns 
// using \n and \t delimiters.
B.Dataset = function(columnSet, data) {
	this.columnSet = columnSet;
	if (typeof columnSet == "string") this.columnSet = new B.DataColumnSet(columnSet);
	this.data = [];
	this.rownumber = -1; // Before first row
	this.addRows(data, true);
}
/**
 * Adds rows based on existing columnSet
 * Optionally clears out initial data;
 */
B.Dataset.prototype.addRows = function(data, clearFirst) {
	if (clearFirst == undefined) clearFirst = false;
	if (clearFirst) {
		this.data = [];
		this.rownumber = -1;
	}
	if (data != undefined) {
		var ary = data.split("\n");
		if (ary.length == 0 && tary[0] == "") return;
		for (var i = 0; i < ary.length; i++) {
			this.data.push(ary[i]);
		}
	}
}
/**
 * Returns a collection of items in the format:
 * { raw:'str', val:<obj>, disp:'str', err:'str' }
 */
B.Dataset.prototype.getRow = function(rownum, valsonly) {
	if (valsonly == undefined) valsonly = false;
	if (rownum == undefined) rownum = this.rownumber; // Whatever row is current
	var row = this.data[rownum];
	if (row == null) return null; // Row not found
	// Build a result set from columnset properties
	var rawcols = row.split("\t");
	var rslt = {};
	for (var i = 0; i < this.columnSet.colset.length; i++) {
		var col = this.columnSet.colset[i];
		// There may not be enough raw data for colset
		if (rawcols.length < (i+1)) {
			rslt[col.id] = col.parse("");
		} else {
			rslt[col.id] = col.parse(rawcols[i]);
		}
		if (valsonly) rslt[col.id] = rslt.val;
	}
	// There may be more in the data than in the colset
	for (var i = i; i < rawcols.length; i++) {
		if (valsonly) {
			rslt["COL_" + (i+1)] = rawcols[i];
		} else {
			rslt["COL_" + (i+1)] = { "raw":rawcols[i], "val":rawcols[i], "disp":rawcols[i], "err":"" };
		}
	}
	return rslt;
}

