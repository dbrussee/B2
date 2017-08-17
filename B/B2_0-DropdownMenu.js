B.DropdownMenu = function(onbeforeshow) {
    this.menus = {};
    this.menulist = [];
    this.object = null;
    if (onbeforeshow == undefined) onbeforeshow = null;
    if (onbeforeshow == null) onbeforeshow = function() { return true; };
    this.onbeforeshow = onbeforeshow;
}
B.DropdownMenu.prototype.addMenu = function(id, text, onclick) {
    var pop = new B.PopupMenu();
    if (onclick == undefined) onclick = function() { return true; };
    var mnu = { id:id, ddmenu:this, text:text, submenu:pop, onclick:onclick };
    this.menus[id] = mnu;
    this.menulist.push(mnu);
    return mnu.submenu;
}
B.DropdownMenu.prototype.setText = function(id, text) {
    var menu = this.menus[id];
    menu.text = text;
    if (this.object != null) {
        menu.td.innerHTML = text;
    }
}
B.DropdownMenu.prototype.getMenu = function(code) {
    // code is <menuid>.<submenuid>.<submenuid>
    // example: a.aa 
    //    a is the main dropdown menu
    //    aa is a submenu in that dropdown
    var parts = code.split(".");
    var menu = this.menus[parts[0]].submenu;
    menu = menu.getSubmenu(parts.slice(1).join("."));
    return menu;
}
B.DropdownMenu.prototype.enableItem = function(code, id) {
    var menu = this.getMenu(code);
    menu.enable(id);
}
B.DropdownMenu.prototype.disableItem = function(code, id) {
    var menu = this.getMenu(code);
    menu.disable(id);
}
B.DropdownMenu.prototype.render = function(div) {
    if (typeof div == "string") div = document.getElementById(div);
    this.object = div;
    this.object.innerHTML = "";
    var tbl = document.createElement("table");
    tbl.style.cssText = "border-collapse:collapse;";
    var tbody = document.createElement("tbody");
    tbl.appendChild(tbody);
    var tr = document.createElement('tr');
    tbody.appendChild(tr);
    for (var i = 0; i < this.menulist.length; i++) {
        var mnu = this.menulist[i]; // pointers to menu objects
        var td = document.createElement("td");
        mnu.td = td;
        td.innerHTML = mnu.text;
        td.style.cssText = "padding-left:.5em; padding-right:.5em; border-right:1px solid navy;";
        td.className = "BAction";
        td.onclick = $.proxy(function() {
            this.onclick();
            if (this.submenu.itemlist.length == 0) return;
            var mnu = this;
            var el = $(mnu.td);
            var pos = el.offset();
            this.submenu.onclose = $.proxy(function() { 
                this.style.color = "";
                this.style.backgroundColor = "";
            }, mnu.td);
            mnu.td.style.color = "white";
            mnu.td.style.backgroundColor = "navy";        
            mnu.submenu.showAt(pos.left, pos.top + el.outerHeight());
        }, mnu);
        tr.appendChild(td);
    }
    this.object.appendChild(tbl);
}
