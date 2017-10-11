B.DynamicTabset = function(id, width, height) {
    this.id = id;
    var template = document.getElementById(id);
    this.tabs = {};
    this.taborder = [];
    this.currentTab = null;
    this.onBodyClick = function() { };

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
    this.container.onclick = $.proxy(function() {
        this.onBodyClick.call(this);
    }, this);

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
    if (this.tabs[id]) return null;
    var tab = new B.DynamicTab(this, id, title, content);    
    var td = document.createElement("td");
    td.data = id;
    td.style.position = "relative";
    var btn = document.createElement("div");
    btn.className = "BTabCloser";
    btn.innerHTML = "X";
    btn.onclick = $.proxy(function(event) {
        var tab = this;
        this.tabset.setTab(tab.id);
        askWarn("Are you sure you want to close the tab '" + tab.title + "'?", "Close Tab?", function(rslt, data) {
            if (rslt == "YES") {
                data.removeTab(data.currentTab);
            }
        });
        $("#B-Say-Dialog").dialog("option", "BData", this.tabset);
    }, tab);
    td.appendChild(btn);
    td.onclick = $.proxy(function(event) {
        var el = $(event.target)[0]; // A collection even though only one
        var td = $(el).closest("td")[0];            
        var id = td.id.split("_")[2];
        if (this.currentTab != id) this.setTab(id);
    }, this);
    td.id = "TAB_" + this.id + "_" + id;
    td.style.width = width;
    td.className = "BTab";
    var span = document.createElement("span");
    span.id = td.id + "_title";
    span.innerHTML = title;
    td.appendChild(span);
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
    return tab;
}
B.DynamicTabset.prototype.removeTab = function(pos, thenpick) {
    var tab = this.findTab(pos);
    if (tab == null) return;
    if (typeof pos == "string") {
        for (var i = 0; i < this.taborder.length; i++) {
            if (this.taborder[i] == pos) {
                pos = i;
                break;
            }
        }
    }
    this.unsetTab();
    var div = tab.div;
    delete this.tabs[tab.id];
    this.taborder.splice(pos,1);
    this.tabsRow.removeChild(this.tabsRow.cells[pos]);
    if (thenpick != undefined) this.setTab(thenpick);
    return div;
}
B.DynamicTabset.prototype.setTabTitle = function(id, title) {
    var tab = this.findTab(pos);
    var id = "TAB_" + this.id + "_" + tab.id + "_TITLE";
    $("#" + id).html(title);
}
B.DynamicTabset.prototype.findTab = function(id) {
    if (typeof id == "number") {
        id = this.taborder[id];
    } else if (typeof id == "string") {
        // This is the tab id already... nothing to do here
    }
    return this.tabs[id];
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
    var tab = this.findTab(id);
    this.unsetTab();
    $(tab.div).show();
    B.addClass(document.getElementById("TAB_" + this.id + "_" + tab.id), "current");
    this.currentTab = id;
}
B.DynamicTabset.prototype.unsetTab = function() {
    if (this.currentTab != null) {
        if (this.body.childNodes.length > 0) {
            var tab = this.findTab(this.currentTab);
            $(tab.div).hide();
            B.removeClass(document.getElementById("TAB_" + this.id + "_" + tab.id), "current");
        }
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
    this.tabset.body.appendChild(this.div);
    $(this.div).hide();
    this.title = title;
    this.id = id;
}