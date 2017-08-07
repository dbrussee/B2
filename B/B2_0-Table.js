// B2.0 Table

// TODO
// Link B.Dataset to table
// Add contextmenu
// Add B.Form integration

B.ScrollingTable = function(rootId, height, ColumnSet, txt1, txt2) {
	this.rootId = rootId;
	this.height = height;
	this.dataset = new B.Dataset(ColumnSet);
	this.txt1 = txt1;
	this.txt2 = txt2;
	this.header = document.getElementById(this.rootId);
	this.header.style.cssText = "border-collapse:collapse; border-right:2px solid transparent; border-left:2px solid transparent";
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
	this.onBeforeRowRender = function(rn, rd, tr, tds) { return; };
	for (var i = 0; i < row.cells.length; i++) {
		var cell = row.cells[i];
		var data = cell.getAttribute("data").split(","); // columnName, widthInPixels, attributes
		var nam = data[0];
		var wid = 100; // 100 pixels
		if (data.length > 1) wid = parseInt(data[1],10);
		this.dataWidth += wid;
		cell.style.width = wid + "px";
		cell.style.fontWeight = "bold";
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
	this.surround.style.cssText = "position:relative; overflow-x:hidden; overflow-y:auto";
	this.surround.style.height = this.height + "px";
	this.surround.style.width = (this.dataWidth + 17) + "px"; // Add width for the scroll bar
	this.surround.style.backgroundColor = B.settings.ScrollingTable.fieldBackgroundColor;

	this.container.style.width = (this.dataWidth + 17) + "px";
	
	this.dataTable = document.createElement("table");
	this.dataTableBody = document.createElement("tbody");
	this.dataTable.appendChild(this.dataTableBody);
	this.dataTable.id = this.rootId + "_data";
	this.dataTable.style.cssText = "border-left:2px solid gainsboro; border-right:2px solid gainsboro; " +
		"border-collapse:collapse; table-layout:fixed; cursor:pointer";
	this.dataTable.style.width = this.dataWidth + "px";
	this.dataTable.onclick = $.proxy(function(event) {
		var el = $(event.target)[0]; // A collection even though only one
		var cell = $(el).closest("td")[0];
		if (cell == undefined) return;
		var row = $(cell).closest("tr")[0];
		if (row == undefined) return;
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
	this.footerButtonsDIV.style.cssText = "height:23px; display:inline-block; background-color:transparent";
	this.footerDIV.appendChild(this.footerButtonsDIV);
	
	this.footerMessageDIV = document.createElement("div");
	this.footerMessageDIV.style.cssText = "text-align:right; display:inline-block; float:right; height:19px; " +
		"vertical-align:middle; padding-right:5px; padding-top:5px; color:navy; background-color:transparent; font-size:9pt";
	this.footerMessageDIV.innerHTML = "Howdy";
	this.footerDIV.appendChild(this.footerMessageDIV);
	this.container.appendChild(this.footerDIV);
	
	this.footer = {
		table: this,
		buttons: {},
		addButton: function(id, txt, onclick) {
			var div = document.createElement("div");
			div.style.cssText = "display:inline-block; background-color:transparent; vertical-align:middle; height:17px; " +
				"padding-right:5px; padding-left: 5px; padding-top: 4px; padding-bottom: 4px; border:1px solid transparent: color:navy; font-size:9pt; cursor:pointer";
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
B.ScrollingTable.prototype.addRows = function(data, clear) {
	if (clear) this.clear();
	var dtbl = this.dataTable;

	var rows = data.split("\n");
	for (var i = 0; i < rows.length; i++) {
		this.dataset.addRows(rows[i]);
		var dr = this.dataset.getRow(this.dataset.data.length-1);
		var tr = document.createElement("tr");
		var tds = {};
		for (var j = 0; j < this.columns.length; j++) {
			var tblcol = this.columns[j];
			var td = document.createElement("td");
			td.style.cssText = "border-left:1px dotted gainsboro; border-right:1px dotted gainsboro; border-bottom:1px dotted gainsboro";
			if (i == 0 && dtbl.rows.length == 0) td.style.width = tblcol.width + "px";
			td.style.textAlign = tblcol.align;
			td.style.fontWeight = (tblcol.bold ? "bold" : "normal");
			var dcol = dr[tblcol.name];
			var h = "";
			if (dcol != null) h = dcol.disp;
			td.innerHTML = h;
			tr.appendChild(td);
			tds[tblcol.name] = td;
		}
		// Call the onbefore method on the Scrolling table object
		var rslt = this.onBeforeRowRender(dtbl.rows.length, dr, tr, tds);
		if (rslt == undefined) rslt = true;
		if (rslt) this.dataTableBody.appendChild(tr);
	}
	this.setFooterMessage();
}
B.ScrollingTable.prototype.pick = function(row, cell) {
	this.unpick();
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
	this.dataTableBody.innerHTML = "";
	this.setFooterMessage();
}
