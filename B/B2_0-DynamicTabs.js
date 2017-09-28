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
                this.addTab(-1, kid.id, title, width, kid);
            }
        
        }
    }

    return this;
}
B.DynamicTabset.prototype.addTab = function(position, id, title, width, content) {
    var tab = new B.DynamicTab(this, id, title, content);    
    var td = document.createElement("td");
    td.data = id;
    td.onclick = $.proxy(function(event) {
        var el = $(event.target)[0]; // A collection even though only one
        var td = $(el).closest("td")[0];            
        var id = td.id.split("_")[2];
        if (this.currentTab != id) this.setTab(id);
    }, this);
    td.id = "TAB_" + this.id + "_" + id;
    td.style.width = width;
    td.className = "BTab";
    td.innerHTML = title;
    var beforeTab = this.spacer;
    if (position >= 0) {
        if (position < this.taborder.length) {
            beforeTab = this.tabs[this.taborder[position]]; // This is the tab object
            beforeTab = document.getElementById("TAB_" + this.id + "_" + beforeTab.id);
        }
    }
    this.tabsRow.insertBefore(td, beforeTab);
    this.tabs[id] = tab;
    if (position < 0) {
        this.taborder.push(id);
    } else {
        if (position >= this.taborder.length) {
            this.taborder.push(id);
        } else {
            this.taborder.splice(position, 0, id);
        }
    }

}
B.DynamicTabset.prototype.removeTab = function(pos) {
    if (pos < 0 || pos > (this.taborder.length-1)) return;
    this.unsetTab();
    var tab = this.tabs[this.taborder[pos]];
    var div = tab.div;
    delete this.tabs[tab.id];
    this.taborder.splice(pos,1);
    this.tabsRow.removeChild(this.tabsRow.cells[pos]);
    return div;
}
B.DynamicTabset.prototype.moveTab = function(frompos, topos, pickit) {
    if (frompos < 0 || frompos > (this.taborder.length-1) || frompos == topos) return;
    if (topos < 0 || topos > (this.taborder.length-1)) return;
    this.unsetTab();
    var tmp = this.taborder[frompos];
    tmpid = this.tabsRow.cells[frompos].id;
    tmphtml = this.tabsRow.cells[frompos].innerHTML;
    this.tabsRow.cells[frompos].id = "";
    this.tabsRow.cells[frompos].innerHTML = "Beef";
    if (frompos < topos) {
        for (var i = frompos; i < topos; i++) {
            this.taborder[i] = this.taborder[i+1];
            this.tabsRow.cells[i].id = this.tabsRow.cells[i+1].id;
            this.tabsRow.cells[i].innerHTML = this.tabsRow.cells[i+1].innerHTML;
        }
    } else {
        for (var i = frompos; i > topos; i--) {
            this.taborder[i] = this.taborder[i-1];
            this.tabsRow.cells[i].id = this.tabsRow.cells[i-1].id;
            this.tabsRow.cells[i].innerHTML = this.tabsRow.cells[i-1].innerHTML;
        }
    }
    this.taborder[topos] = tmp;
    this.tabsRow.cells[topos].id = tmpid;
    this.tabsRow.cells[topos].innerHTML = tmphtml;
    if (pickit != undefined && pickit) this.setTab(topos);
}
B.DynamicTabset.prototype.setTab = function(id) {
    if (typeof id == "number") id = this.taborder[id];
    var tab = this.tabs[id];
    this.unsetTab();
    this.body.appendChild(tab.div);
    B.addClass(document.getElementById("TAB_" + this.id + "_" + id), "current");
    this.currentTab = id;
}
B.DynamicTabset.prototype.unsetTab = function() {
    if (this.currentTab != null) {
        if (this.body.childNodes.length > 0) this.body.removeChild(this.body.childNodes[0]);
        B.removeClass(document.getElementById("TAB_" + this.id + "_" + this.currentTab), "current");
    }
    this.currentTab = null;    
}
B.DynamicTab = function(tabset, id, title, content) {
    this.tabset = tabset;
    this.div = null;
    if (content != undefined) {
        this.div = content.parentElement.removeChild(content);
    } else {
        this.div = document.createElement("div");
    }

    this.title = title;
    this.id = id;
}