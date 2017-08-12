// B2.0 Tabset
B.TabSet = function(target, contentWidth, contentHeight) {
    if (typeof target == "string") target = document.getElementById(target);
    this.target = target;
    this.contentWidth = contentWidth;
    this.contentHeight = contentHeight;
    this.tabs = {}; // Collection of tabs by id
    this.tablist = []; // Keeps the correct order
    this.currentTab = null;
}
B.TabSet.prototype.setCurrentTab = function(tab) {
    if (this.currentTab != null) {
        this.contentContainer.removeChild(this.currentTab.div);
    }
    for (var key in this.tabs) {
        var itm = this.tabs[key];
        if (itm == tab) {
            B.addClass(itm.tab, "current");
            this.contentContainer.appendChild(itm.div);
        } else {
            B.removeClass(itm.tab, "current");
        }
    }
    this.currentTab = tab;
}
B.TabSet.prototype.addTab = function(id, width, title, div) {
    this.tabs[id] = new B.Tab(id, width, title, div);
    this.tablist.push(id);
}
B.TabSet.prototype.render = function() {
    this.target.innerHTML = "";
    this.tbl = document.createElement("table");
    this.tbl.style.borderCollapse = "collapse";
    this.tbl.style.borderSpacing = "5px";
    this.tbl.style.height = "100%";
    this.tbl.style.width = "100%";
    this.tbody = document.createElement("tbody");
    this.tbl.appendChild(this.tbody);
    this.tabrow = document.createElement("tr")
    this.tabrow.style.height = "1.8em";
    this.tbody.appendChild(this.tabrow);
    for (var i = 0; i < this.tablist.length; i++) {
        var tab = this.tabs[this.tablist[i]];
        var td = document.createElement("td");
        tab.tab = td;
        td.data = tab;
        td.className = "BTab";
        if (tab == this.currentTab) td.className += " current";
        td.style.width = tab.width;
        td.innerHTML = tab.title;
        this.tabrow.appendChild(td);
        td.onclick = $.proxy(function(event) {
            var el = $(event.target)[0]; // A collection even though only one
            var td = $(el).closest("td")[0];            
            var dta = td.data;
            if (dta != this.currentTab) this.setCurrentTab(dta);
        }, this);
    }
    this.tabrow.appendChild(document.createElement("td")); // One more to take up remaining space

    this.contentrow = document.createElement("tr");
    this.tbody.appendChild(this.contentrow);
    var td = document.createElement("td");
    td.style.border = "1px solid navy";
    // This will change as we add tabs
    td.colSpan = this.tablist.length + 1; // Take into account the "extra" td in the tabs
    this.contentrow.appendChild(td);
    this.contentContainer = document.createElement("div");
    this.contentContainer.style.height = this.contentHeight;
    this.contentContainer.style.width = this.contentWidth;
    this.contentContainer.style.position = "relative";
    this.contentContainer.style.overflowY = "auto";
    this.contentContainer.style.padding = "3px";
    //this.contentContainer.style.backgroundColor = "ivory";
    td.appendChild(this.contentContainer);
    this.contentrow.appendChild(td)

    this.target.appendChild(this.tbl);
}


B.Tab = function(id, width, title, div) {
    this.id = id;
    this.width = width;
    this.title = title;
    if (div != undefined) {
        if (typeof div == "string") div = document.getElementById(div);
        div.parentNode.removeChild(div);
        this.div = div;
    } else {
        // Initialized just as a detached element.
        this.div = document.createElement("div");    
    }
    this.tab = null; // Will be matched up with a visual tab element
}
B.Tab.prototype.setTitle =function(title) {
    this.tab.innerHTML = title;
}