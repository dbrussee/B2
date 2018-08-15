B.iTabset = function(id, height, width) {
	this.tabHeight = 28;
	this.id = id;
	this.height = height;
	this.tabs = {};
	this.onBeforeTabAdd = function() { return true; };
	this.onAfterTabAdd = function() { return true; };
	this.onAfterContentLoaded = function() { return true; };
	this.onBeforeTabRemove = function() { return true; };
	this.onAfterTabRemove = function() { return true; };
	this.onBeforeTabSet = function() { return true; };
	this.onAfterTabSet = function() { return true; };
	this.onBeforeTabUnset = function() { return true; };
	this.onAfterTabUnset = function() { return true; };
	this.container = document.getElementById(id);
	var inner = this.container.innerHTML;
	this.container.innerHTML = "";
	this.container.style.height = (height + this.tabHeight + 4) + "px";
	this.container.style.width = width;	
	// Add the tabs line
	this.tabline = document.createElement("div");
	this.tabline.style.cssText = "position:relative;padding:0;margin:0;width:100%;margin-left:1em;height:" + this.tabHeight + "px";
	//this.tabline.innerHTML = "|";
	this.container.appendChild(this.tabline);
	// Add the frame container (one tab will display in the container at a time,
	// but all iFrames will be contained within it.
	this.frameContainer = document.createElement("div");
	this.frameContainer.innerHTML = inner;
	this.frameContainer.style.cssText = "border:1px solid navy;display:inline-block;" +
		"background-color:white;margin:0;padding:0;overflow:hidden;" +
		"position:relative;height:" + height + "px;width:" + width;
	this.container.appendChild(this.frameContainer);
	
	this.closeTab = function(id) {
		var itm = this.tabs[id];
		itm.tab.parentNode.removeChild(itm.tab);
		itm.iframe.parentNode.removeChild(itm.iframe);
		delete(this.tabs[id]);
	};
	
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
B.iTabset.prototype.flashTab = function(id) {
    var tab = this.tabs[id];
    $(tab.tab).fadeTo("fast",0.1).fadeTo("fast",1);
};
B.iTabset.prototype.addTab = function(id, title, src, removable) {
	var rslt = this.onAfterTabAdd(id, title, src);
	if (rslt == undefined) rslt = true;
	if (!rslt) return null;
	var tab = { id:id, title:title, tabset:this, iframe:null, tab:null, window:null, setMe:null, busy:false };
	tab.freeze = function() {
		this.tabset.setBusy(this.id, true);
	};
	tab.thaw = function() {
		this.tabset.setBusy(this.id, false);
	};
	var itm = document.createElement("div");
	itm.className = "BTab";
	itm.id = "B_ITAB_" + this.id + "_" + id;
	itm.style.cssText = "padding:.2em 1.5em 0;margin:0;position:relative;top:0;height:" + this.tabHeight + "px;border-right:1px solid navy;display:inline-block;";
	itm.innerHTML = title;
	if (removable == undefined) removable = false;
	if (removable) {
		var closer = document.createElement("div");
		closer.setAttribute("data", tab);
		closer.className = "BTabCloser";
		//closer.title = "Close tab...";
		closer.innerHTML = "x";
		closer.onclick = $.proxy(function() {
			var tab = this; // set via Proxy
			askWarn("Are you sure you want to close tab '" + tab.title + "'?", "", $.proxy(function(rslt) {
				if (rslt == "YES") {
					var tab = this; // set via Proxy
					tab.tabset.closeTab(tab.id);
				}
			}, tab));
		}, tab);
		itm.appendChild(closer);
	}
	this.tabline.appendChild(itm);
	tab.tab = itm;
	var frame = document.createElement("iframe");
	frame.onload = $.proxy(function() {
		tab.tabset.onAfterContentLoaded(this);
	}, tab);
	frame.setAttribute("height", this.height);
	frame.style.cssText = "display:none;padding:0;margin:0;border:0;width:100%;postion:relative:top:" + this.tabHeight + "px;" +
		"sandbox:";
	if (src != undefined && src != null) {
		frame.src = src;
	}
	tab.iframe = frame;
	this.frameContainer.appendChild(frame);
	this.tabs[id] = tab;
	this.onAfterTabAdd(tab);
	tab.window = frame.contentWindow;
	tab.setMe = $.proxy(function(event) {
		this.tabset.setTab(this.id);
	}, tab);
    tab.tab.onclick = $.proxy(function(event) {
        var el = $(event.target)[0]; // A collection even though only one
        if (el.className == "BTabCloser") return; // User is trying to close this tab!
        var itm = $(el).closest("div")[0];            
        var id = itm.id.split("_")[3]; // B_ITAB_tabset_thisid
        this.setTab(id);
    }, this);
	return tab;
};
B.iTabset.prototype.unsetTab = function() {
	if (this.curtab == null) return;
	var rslt = this.onBeforeTabUnset(this.curtab); if (rslt == undefined) rslt = true;
	if (!rslt) return;
	B.removeClass(this.curtab.tab, "current");
	this.curtab.iframe.style.display = "none";
	this.curtab = null;
	this.onAfterTabUnset();
};
B.iTabset.prototype.setTab = function(id) {
	this.unsetTab();
	var tab = this.tabs[id];
	var rslt = this.onBeforeTabSet(tab); if (rslt == undefined) rslt = true;
	if (!rslt) return;
	this.curtab = tab;
	tab.iframe.style.display = "block";
	B.addClass(this.curtab.tab, "current");
	this.onAfterTabSet(tab);
	return this.getTabWindow(id);
};
B.iTabset.prototype.isBusy = function(id) {
	var tab = this.tabs[id];
	return tab.busy;
};
B.iTabset.prototype.setBusy = function(id, yn) {
	var tab = this.tabs[id];
	if (yn == undefined) yn = !tab.busy;
	if (yn) {
		tab.tab.style.borderTop = "5px solid orange";
		tab.busy = true;
	} else {
		tab.busy = false;
		tab.tab.style.borderTop = "";
		if (this.curtab.id != id) {
			this.flashTab(id);
		}
	}
};
B.iTabset.prototype.getTab = function(win) {
	var rslt = null;
	for (var key in this.tabs) {
		var tab = this.tabs[key];
		if (tab.window == win) {
			rslt = tab;
			break;
		}
	}
	return rslt;
};
B.iTabset.prototype.setMeBusy = function(win, yn) {
	var tab = this.getTab(win);
	if (tab != null) this.setBusy(tab.id, yn);
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
    this.container.style.cssText = "padding:0; margin:0; height:" + (height+30) + "px; width:" + width + "px; ";

    this.tabsTable = document.createElement("table");
    this.tabsTable.style.cssText = "width:100%;border-collapse: collapse;";
    this.container.appendChild(this.tabsTable);
    var tbody = document.createElement("tbody");
    this.tabsTable.appendChild(tbody);
    this.tabsRow = document.createElement("tr");
    this.tabsRow.style.cssText = "height:2.0em;";
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
};
B.DynamicTabset.prototype.addTab = function(position, id, title, width, content) {
    if (this.tabs[id]) return null;
    var tab = new B.DynamicTab(this, id, title, content);    
    var td = document.createElement("td");
    tab.tab = td;
    td.data = id;
    td.style.position = "relative";
    var bus = document.createElement("div");
    bus.style.cssText = "z-index:50;position:absolute;display:inline;height:14px;width:14px;top:0;left:0;margin-left:3px;margin-top:3px;";
    bus.id = "TAB_" + this.id + "_" + id + "_busy";
    td.appendChild(bus);
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
    tab.titleSpan = span;
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
};
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
};
B.DynamicTabset.prototype.flashTab = function(id) {
    var tab = this.findTab(id);
    $(tab.tab).effect("highlight");
    $(tab.titleSpan).effect("shake", {distance:1, times:3 });
};
B.DynamicTabset.prototype.setTabTitle = function(id, title) {
    var tab = this.findTab(pos);
    var id = "TAB_" + this.id + "_" + tab.id + "_title";
    $("#" + id).html(title);
};
B.DynamicTabset.prototype.findTab = function(id) {
    if (typeof id == "number") {
        id = this.taborder[id];
    } else if (typeof id == "string") {
        // This is the tab id already... nothing to do here
    }
    return this.tabs[id];
};
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
};
B.DynamicTabset.prototype.setTab = function(id) {
    this.unsetTab();
    var tab = this.findTab(id);
	var ok = this.onBeforeTabSet(this, tab);
	if (ok == undefined) ok = true;
	if (!ok) return;
    $(tab.div).show();
    B.addClass(document.getElementById("TAB_" + this.id + "_" + tab.id), "current");
    this.currentTab = id;
};
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
};

B.DynamicTabset.prototype.isTabBusy = function(id) {
    var tab = this.findTab(id);
    return tab.isBusy;
};
B.DynamicTabset.prototype.setTabBusy = function(id, isBusy) {
	if (isBusy == undefined) isBusy = true;
    var tab = this.findTab(id);
    tab.isBusy = isBusy;
    //var titleDiv = document.getElementById("TAB_" + tab.tabset.id + "_" + tab.id + "_title");
    var busyID = "TAB_" + tab.tabset.id + "_" + tab.id + "_busy";
    var el = document.getElementById(busyID);
    var txt = "";
    if (isBusy) {
    	txt = B.img("SPINNER");
    } else {
    	if (tab.id != this.currentTab) {
    		this.flashTab(id);
    	}
    }
    el.innerHTML = txt;
};

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
    this.isBusy = false;
};