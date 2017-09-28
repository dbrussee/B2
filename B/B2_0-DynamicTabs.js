B.DynamicTabset = function(id, width, height) {
    this.id = id;
    var template = document.getElementById(id);
    this.tabs = {};
    this.taborder = [];
    this.currentTab = null;

    this.container = document.createElement("div");
    this.container.style.cssText = "padding:0; margin:0; border-collapse: collapse; height:" + (height+30) + "px; width:" + width + "px; ";

    this.tabsTable = document.createElement("table");
    this.tabsTable.style.cssText = "width:100%;";
    this.container.appendChild(this.tabsTable);
    var tbody = document.createElement("tbody");
    this.tabsTable.appendChild(tbody);
    this.tabsRow = document.createElement("tr");
    this.tabsRow.style.cssText = "height:2.2em;";
    tbody.appendChild(this.tabsRow);
    this.spacer = document.createElement("td");
    this.spacer.style.cssText = "border-bottom:1px solid navy; border-left:1px solid transparent; border-right:1px solid transparent; border-top:6px solid transparent;";
    this.tabsRow.appendChild(this.spacer);

    this.body = document.createElement("div");
    this.body.style.cssText = "height:" + height + "px; border-left:1px solid navy; border-right:1px solid navy; border-bottom:1px solid navy; padding:3px;";
    this.container.appendChild(this.body);

    template.parentElement.insertBefore(this.container, template);

    var kids = template.childNodes;
    for (var i = 0; i < kids.length; i++) {
        var kid = kids[i];
        if (kid.tagName == "DIV") {
            var dta = kid.getAttribute("data");
            if (dta != null) {
                var parts = dta.split(",");
                var title = parts[0];
                var width = "100px";
                if (parts.length > 1) width = parts[1];
                this.addTab(kid.id, title, width, kid);
            }
        
        }
    }

    return this;
}
B.DynamicTabset.prototype.addTab = function(id, title, width, content) {
    var tab = new B.DynamicTab(this, id, title, content);

    var td = document.createElement("td");
    td.data = id;
    td.onclick = $.proxy(function(event) {
        var el = $(event.target)[0]; // A collection even though only one
        var td = $(el).closest("td")[0];            
        var dta = td.data;
        if (this.currentTab != dta) this.setTab(dta);
    }, this);
    td.id = "TAB_" + this.id + "_" + id;
    td.style.width = width;
    td.className = "BTab";
    td.innerHTML = title;
    this.tabsRow.insertBefore(td, this.spacer);

}
B.DynamicTabset.prototype.setTab = function(id) {
    if (typeof id == "number") id = this.taborder[id];
    var tab = this.tabs[id];
    if (this.currentTab != null) {
        this.body.removeChild(this.body.childNodes[0]);
        B.removeClass(document.getElementById("TAB_" + this.id + "_" + this.currentTab), "current");
    }
    this.body.appendChild(tab.div);
    B.addClass(document.getElementById("TAB_" + this.id + "_" + id), "current");
    this.currentTab = id;
}
B.DynamicTab = function(tabset, id, title, content) {
    this.tabset = tabset;
    this.div = null;
    if (content != undefined) {
        this.div = content.parentElement.removeChild(content);
    } else {
        this.div = document.createElement("div");
    }

    this.tabset.tabs[id] = this;
    this.tabset.taborder.push(id);
    this.title = title;
    this.id = id;
}