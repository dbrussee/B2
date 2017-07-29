// B2.0 Table

// TODO
// Link B.Dataset to table
// Add contextmenu
// Add B.Form integration

B.ScrollingTable = function(rootId, height, dataColumnSet, txt1, txt2) {
	this.rootId = rootId;
	this.height = height;
	this.dataColumnSet = dataColumnSet;
	this.txt1 = txt1;
	this.txt2 = txt2;
	this.header = document.getElementById(this.rootId);
	this.header.style.borderCollapse = "collapse";
	this.header.style.borderRight = "2px solid transparent";
	this.header.style.borderLeft = "2px solid transparent";
	// Create the container div
	this.container = document.createElement("div");
	this.container.id = rootId + "_container";
	// Insert it before the existing header table
	this.header.parentNode.insertBefore(this.container, this.header);
	// Move the header table inside the container.
	this.container.appendChild(this.header.parentNode.removeChild(this.header));

	this.columns = [];
	this.dataWidth = 0;
	var row = this.header.rows[0];
	if (B.settings.ScrollingTable.JQTheme) {
		B.addClass(row, "ui-widget-header,ui-priority-primary");
	}
	for (var i = 0; i < row.cells.length; i++) {
		var cell = row.cells[i];
		var data = cell.getAttribute("data").split(","); // columnName, widthInPixels, attributes
		var nam = data[0];
		var wid = 100; // 100 pixels
		if (data.length > 1) wid = parseInt(data[1],10);
		this.dataWidth += wid;
		cell.style.width = wid + "px";
		cell.style.fontWeight = "normal";
		var weight = "N";
		var col = { pos:i, name:nam, width:wid, bold:false, align:'left' };
		this.columns.push(col);
		var attribs = "L"; // Left justification as default
		if (data.length > 2) attribs = data[2].toUpperCase(); // CB (Center Bold), etc
		if (attribs.indexOf("C")>=0) col.align = "center";
		if (attribs.indexOf("R")>=0) col.align = "right";
		if (attribs.indexOf("B")>=0) col.bold = true;
		cell.style.textAlign = col.align;
		cell.style.border = "1px solid transparent";
	}
	this.header.style.tableLayout = "fixed";

	this.surround = document.createElement("div");
	this.surround.id = this.rootId + "_surround";
	this.surround.style.height = this.height + "px";
	this.surround.style.width = (this.dataWidth + 17) + "px"; // Add width for the scroll bar
	this.surround.style.position = "relative";
	this.surround.style.overflowX = "hidden";
	this.surround.style.overflowY = "auto";
	this.surround.style.backgroundColor = B.settings.ScrollingTable.fieldBackgroundColor;
	this.container.style.width = (this.dataWidth + 17) + "px";
	
	this.dataTable = document.createElement("table");
	this.dataTable.id = this.rootId + "_data";
	this.dataTable.style.borderLeft = "2px solid gainsboro";
	this.dataTable.style.borderRight = "2px solid gainsboro";
	this.dataTable.style.width = this.dataWidth + "px";
	this.dataTable.style.borderCollapse = "collapse";
	this.dataTable.style.tableLayout = "fixed";
	this.dataTable.style.cursor = "pointer";
	this.dataTable.onclick = $.proxy(function() {
		var el = $(event.target)[0]; // A collection even though only one
		var cell = $(el).closest("td")[0];
		var row = $(cell).closest("tr")[0];
		var rslt = this.onclick(this.dataTable, row, cell, row.rowIndex, cell.cellIndex, row.rowIndex != this.current.rownum);
		if (rslt == undefined) rslt = true;
		if (rslt) {
			this.pick(row, cell);
		}
	}, this);		
	this.surround.appendChild(this.dataTable);
	
	this.container.appendChild(this.surround);
	B.addClass(this.header,"BTable,BTableHeader");
	B.addClass(this.dataTable,"BTable,BTableData");
	
	
	this.footerDIV = document.createElement("div");
	this.footerDIV.style.width = this.dataWidth + "px";
	this.footerDIV.style.backgroundColor = B.settings.ScrollingTable.footerBackgroundColor;
	this.footerDIV.style.height = "25px";
	this.footerButtonsDIV = document.createElement("div");
	this.footerButtonsDIV.style.height = "23px";
	this.footerButtonsDIV.style.display = "inline-block";
	this.footerButtonsDIV.style.backgroundColor = "transparent";
	this.footerDIV.appendChild(this.footerButtonsDIV);
	
	this.footerMessageDIV = document.createElement("div");
	this.footerMessageDIV.style.textAlign = "right";
	this.footerMessageDIV.style.display = "inline-block";
	this.footerMessageDIV.style.float = "right";
	this.footerMessageDIV.style.height = "19px";
	this.footerMessageDIV.style.verticalAlign = "middle";
	this.footerMessageDIV.style.paddingRight = "5px";
	this.footerMessageDIV.style.paddingTop = "6px";
	this.footerMessageDIV.style.color = "navy";
	this.footerMessageDIV.style.backgroundColor = "transparent";
	this.footerMessageDIV.style.fontSize = "9pt";
	this.footerMessageDIV.innerHTML = "Howdy";
	this.footerDIV.appendChild(this.footerMessageDIV);
	this.container.appendChild(this.footerDIV);
	
	this.footer = {
		table: this,
		buttons: {},
		addButton: function(id, txt, onclick) {
			var div = document.createElement("div");
			div.style.display = "inline-block";
			div.style.backgroundColor = "transparent";
			div.style.verticalAlign = "middle";
			div.style.height = "17px";
			div.style.paddingRight = "10px";
			div.style.paddingLeft = "10px";
			div.style.paddingTop = "4px";
			div.style.border = "1px solid transparent";
			div.style.color = "navy";
			div.style.backgroundColor = "transparent";
			div.style.fontSize = "9pt";
			div.style.cursor = "pointer";
			div.id = this.rootId + "_footer_" + id;
			div.onmouseover = function() { this.style.backgroundColor = B.settings.ScrollingTable.footerHoverColor; }
			div.onmouseout = function() { this.style.backgroundColor = "transparent"; }
			div.innerHTML = txt;
			if (onclick == undefined) onclick = function() {};
			div.onclick = onclick;
			this.table.footerButtonsDIV.appendChild(div);
			this.buttons[id] = { id:id, div:div, onclick:onclick, disabled: false };
			return this; // The footer
		},
		disableButton: function(id) {
			var div = this.buttons[id].div;
			div.onclick = function() {};
			div.onmouseover = function() { };
			div.style.color = "goldenrod";
			div.style.cursor = "default";
			return this;
		},
		enableButton: function(id) {
			var btn = this.buttons[id];
			var div = btn.div;
			div.onclick = btn.onclick;
			div.onmouseover = function() { this.style.backgroundColor = B.settings.ScrollingTable.footerHoverColor; }
			div.style.color = "navy";
			div.style.cursor = "pointer";
			return this;
		}
	};
	
	this.onclick = function() {};
	this.current = { rownum:-1, cellnum:-1 };
	this.setFooterMessage();
}
B.ScrollingTable.prototype.setFooterMessage = function(txt) {
	if (txt == undefined) {
		txt = this.dataTable.rows.length + " " + (this.dataTable.rows.length == 1 ? this.txt1 : this.txt2)
	}
	this.footerMessageDIV.innerHTML = txt;
}
B.ScrollingTable.prototype.pick = function(row, cell) {
	this.unpick();
	if (typeof row != "object") {
		row = this.dataTable.rows[parseInt(row,10)];
	}
	if (cell == undefined) cell = 0;
	if (typeof cell != "object") {
		cell = row.cells[parseInt(cell,10)];
	}
	this.current.rownum = row.rowIndex;
	this.current.cellnum = cell.cellIndex;
	B.addClass(row, "picked");	
};
B.ScrollingTable.prototype.unpick = function() {
	if (this.current.rownum >= 0) {
		B.removeClass(this.dataTable.rows[this.current.rownum], "picked");
	}
	this.current.rownum = -1;
	this.current.cellnum = -1;
};
B.ScrollingTable.prototype.clear = function() {
	this.unpick();
	this.dataTable.innerHTML = "";
	this.setFooterMessage();
}
B.ScrollingTable.prototype.addTestRows = function(numrows) {
	var dtbl = this.dataTable;
	var numcells = this.columns.length;
	var isFirstRow = (dtbl.rows.length ==0);
	for (var i = 0; i < numrows; i++) {
		var tr = document.createElement("tr");
		for (var c = 0; c < numcells; c++) {
			var col = this.columns[c];
			var td = document.createElement("td");
			td.style.width = col.width + "px";
			td.style.textAlign = col.align;
			td.style.fontWeight = (col.bold ? "bold" : "normal");
			td.style.borderLeft = "1px dotted gainsboro";
			td.style.borderRight = "1px dotted gainsboro";
			td.style.borderBottom = "1px dotted gainsboro";
			td.innerHTML = this.dataTable.rows.length + "." + c;

			tr.appendChild(td);
		}
		dtbl.appendChild(tr);	
	}	
	this.setFooterMessage();
}
