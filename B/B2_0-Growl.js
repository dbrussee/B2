// Unobtrusive messaging
B.settings.Growl = {  
    width: "280px",
    defaultEdge: "top",
    defaultTimeout: 7000
};

B.growl = {
    container: null,
    edge: B.settings.Growl.defaultEdge
};
B.growl.init = function(edge) {
    B.growl.container = null;
    if (edge == undefined) edge = B.settings.Growl.defaultEdge;
    B.growl.edge = edge;
};
B.growl.popup = function(typ, title, msg, timeout, icon) {
    if (icon == undefined) icon = "";
    if (timeout == undefined) timeout = null;
    if (timeout == null) timeout = B.settings.Growl.defaultTimeout;
    if (B.growl.container == null) {
        B.growl.container = document.createElement("div");
        B.growl.container.style.cssText = "position:absolute;right:5px;width:" + B.settings.Growl.width + ";";
        if (B.growl.edge == "bottom") {
            B.growl.container.style.bottom = "5px";
        } else {
            B.growl.container.style.top = "5px";
        }
        $("body").append(B.growl.container);
    }
    var div = document.createElement("div");
    div.style.cssText = "padding:4px;border-radius:6px;margin-bottom:5px;";
    var clr = "black";
    var bclr = "cyan";
    if (typ == "ERROR") { clr = "black"; bclr = "lightpink"; }
    if (typ == "WARNING") { clr = "brown"; bclr = "yellow"; }
    div.style.backgroundColor = bclr;
    div.style.color = clr;
    var tbl = document.createElement("table");
    tbl.style.cssText = "border-bottom:1px solid silver;width:100%";
    var tr = document.createElement("tr");
    tbl.appendChild(tr);
    if (icon != "") {
        var td = document.createElement("td");
        td.style.cssText = "width:2.1em;";
        td.innerHTML = B.img(icon, "2em");
        tr.appendChild(td);
    }
    var td = document.createElement("td");
    td.style.cssText = "font-weight:bold";
    td.innerHTML = title;
    tr.appendChild(td);
    var td = document.createElement("td");
    td.style.cssText = "width:4em;text-align:right;font-size:8pt;color:black;padding-right:.2em;";
    td.innerHTML = B.format.TS(new Date());
    tr.appendChild(td);
    if (timeout == 0) {
        var td = document.createElement("td");
        td.style.cssText = "width:1em;cursor:pointer;position;";
        td.innerHTML = "<span style='font-weight:bold;color:yellow;background-color:black;padding:.2em;border-radius:.8em;'>X</span>";
        td.onclick = $.proxy(function() { this.parentElement.removeChild(this); }, div);
        tr.appendChild(td);
    }
    div.appendChild(tbl);
    var spn = document.createElement("span");
    spn.innerHTML = msg;
    div.appendChild(spn);
    if (B.growl.edge == "bottom") {
        if (B.growl.container.childNodes.length > 0) {
            B.growl.container.insertBefore(div, B.growl.container.childNodes[0]);
        } else {
            B.growl.container.appendChild(div);
        }    
    } else {
        B.growl.container.appendChild(div);
    }
    $(div).fadeTo(0,.8);

    if (timeout > 0) {
        div.growlTimer = window.setTimeout($.proxy(function() {
            $(div).fadeTo(300,0, function() { this.parentElement.removeChild(this); });
        }, div),timeout);
        div.onclick = function() {
            window.clearTimeout(this.growlTimer);
            var td = document.createElement("td");
            td.style.cssText = "width:1em;cursor:pointer;position;";
            td.innerHTML = "<span style='font-weight:bold;color:yellow;background-color:black;padding:.2em;border-radius:.8em;'>X</span>"; 
            td.onclick = $.proxy(function() { this.parentElement.removeChild(this); }, div);
            this.firstChild.rows[0].appendChild(td);
            this.onclick = null;
        };
    }
};
B.growl.msg = function(title, msg, timeout) {
    if (timeout == undefined) timeout = B.settings.Growl.defaultTimeout;
    B.growl.popup("NORMAL", title, msg, timeout, "LEDBLUE");
};
B.growl.errmsg = function(title, msg, timeout) {
    if (timeout == undefined) timeout = B.settings.Growl.defaultTimeout;
    B.growl.popup("ERROR", title, msg, timeout, "LEDRED");
};
B.growl.warnmsg = function(title, msg, timeout) {
    if (timeout == undefined) timeout = B.settings.Growl.defaultTimeout;
    B.growl.popup("WARNING", title, msg, timeout, "LEDYELLOW");
};
