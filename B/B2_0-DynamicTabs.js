B.iTabset = function(id, height, width) {
      this.tabHeight = 28;
      this.id = id;
      this.height = height;
      this.tabs = {};
      this.onBeforeAddTab = function() { return true; };
      this.onAfterAddTab = function() { return true; };
      this.onBeforeRemoveTab = function() { return true; };
      this.onAfterRemoveTab = function() { return true; };
      this.onBeforeSetTab = function() { return true; };
      this.onAfterSetTab = function() { return true; };
      this.onBeforeUnsetTab = function() { return true; };
      this.onAfterUnsetTab = function() { return true; };
      this.container = document.getElementById(id);
      this.container.style.height = (height + this.tabHeight + 4) + "px";
      this.container.style.width = width;
      // Add the tabs line
      this.tabline = document.createElement("div");
      this.tabline.style.cssText = "position:relative;padding:0;margin:0;width:100%;margin-left:1em;height:" + this.tabHeight + "px";
      this.container.appendChild(this.tabline);
      // Add the frame container (one tab will display in the container at a time,
      // but all iFrames will be contained within it.
      this.frameContainer = document.createElement("div");
      this.frameContainer.style.cssText = "border:1px solid navy;display:inline-block;" +
            "background-color:white;margin:0;padding:0;overflow:hidden;" +
            "position:relative;height:" + height + "px;width:" + width;
      this.container.appendChild(this.frameContainer);

      this.getTabWindow = function(id) {
            var rslt = null;
            var tab = this.tabs[id];
            if (tab != null) {
                  rslt = tab.iframe.contentWindow;
            }
            return rslt;
      };
      this.curtab = null;
};

B.iTabset.prototype.addTab = function(id, title, src, setme) {
      var rslt = this.onAfterAddTab(id, title, src);
      if (rslt == undefined) rslt = true;
      if (!rslt) return null;
      var tab = { id:id, tabset:this, iframe:null, tab:null, window:null, setMe:null };
      var itm = document.createElement("div");
      itm.className = "BTab";
      itm.style.cssText = "padding:.2em .75em 0;margin:0;position:relative;top:0;height:" + this.tabHeight + "px;border-right:1px solid navy;display:inline-block;";
      itm.innerHTML = title;
      itm.id = this.id + "_" + id;
      this.tabline.appendChild(itm);
      tab.tab = itm;
      var frame = document.createElement("iframe");
      frame.setAttribute("height", this.height);
      frame.style.cssText = "display:none;padding:0;margin:0;border:0;width:100%;postion:relative:top:" + this.tabHeight + "px;" +
            "sandbox:";
      if (src != undefined && src != null) {
            frame.src = src;
      }
      tab.iframe = frame;
      this.frameContainer.appendChild(frame);
      this.tabs[id] = tab;
      this.onAfterAddTab(tab);
      if (setme) this.setTab(id);
      tab.window = frame.contentWindow;
      tab.setMe = $.proxy(function(event) {
            this.tabset.setTab(this.id);
      }, tab);
    tab.tab.onclick = $.proxy(function(event) {
        var el = $(event.target)[0]; // A collection even though only one
        var itm = $(el).closest("div")[0];           
        var id = itm.id.split("_")[1];
        this.setTab(id);
    }, this);
      return tab;
};

B.iTabset.prototype.unsetTab = function() {
      if (this.curtab == null) return;
      var rslt = this.onBeforeUnsetTab(this.curtab); if (rslt == undefined) rslt = true;
      if (!rslt) return;
      B.curtab = null;
      B.removeClass(this.curtab.tab, "current");
      this.curtab.iframe.style.display = "none";
      this.onAfterUnsetTab();
};

B.iTabset.prototype.setTab = function(id) {
      this.unsetTab();
      var tab = this.tabs[id];
      var rslt = this.onBeforeSetTab(tab); if (rslt == undefined) rslt = true;
      if (!rslt) return;
      this.curtab = tab;
      tab.iframe.style.display = "block";
      B.addClass(this.curtab.tab, "current");
};
	
	


B.DynamicTabset = function(id, width, height) {
    this.id = id;
    var template = document.getElementById(id);
    this.tabs = {};
    this.taborder = [];
    this.currentTab = null;
    this.onBodyClick = function() { };
    this.onRemoveTab = function() { };
    this.onBeforeTabSet = function() { return true; };

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
    if (!B.hasClass(content, "noclose")) {
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
    }
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
    this.onRemoveTab();
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
    this.unsetTab();
    var tab = this.findTab(id);
	var ok = this.onBeforeTabSet(this, tab);
	if (ok == undefined) ok = true;
	if (!ok) return;
    $(tab.div).show();
    B.addClass(document.getElementById("TAB_" + this.id + "_" + tab.id), "current");
    this.currentTab = id;
}
B.DynamicTabset.prototype.unsetTab = function() {
	var ok = this.onBeforeTabSet(this, null);
	if (ok == undefined) ok = true;
	if (!ok) return;
	
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