// Remote calls
B.settings.Growl = {  
    width: "280px",
    defaultEdge: "bottom",
    defaultTimeout: 9000
}

B.Growl = function(edge) {
    if (edge == undefined) edge = B.settings.Growl.defaultEdge;
    this.edge = edge;
}
B.Growl.prototype.popup = function(typ, title, msg, timeout, icon) {
    if (icon == undefined) icon = "";
    if (timeout == undefined) timeout = B.settings.Growl.defaultTimeout;
    var container = document.getElementById("BGrowlContainer");
    if (container == null) {
        container = document.createElement("div");
        container.id = "BGrowlContainer";
        container.style.cssText = "position:absolute;right:5px;width:" + B.settings.Growl.width + ";";
        if (this.edge == "bottom") {
            container.style.bottom = "5px";
        } else {
            container.style.top = "5px";
        }
        $("body").append(container.outerHTML);
        container = document.getElementById("BGrowlContainer");
    }
    var div = document.createElement("div");
    div.style.cssText = "padding:4px;border-radius:6px;margin-bottom:5px;";
    var clr = "black";
    var bclr = "cyan";
    if (typ == "ERROR") { clr = "black"; bclr = "lightpink"; }
    if (typ == "WARNING") { clr = "brown"; bclr = "yellow"; }
    div.style.backgroundColor = bclr;
    div.style.color = clr;
    var h = "<table style='border-bottom:1px solid silver;width:100%'><tr>";
    if (icon != "") h += "<td style='width:2.1em;'>" + B.img(icon, "2em") + "</td>";
    h += "<td style='font-weight:bold;'>" + title + "</td>";
    h += "<td style='width:4em;text-align:right;font-size:8pt;color:black;'>" + B.format.TS(new Date()) + "&nbsp;</td>";
    if (timeout == 0) h += "<td style='width:1em'>" + B.img("CANCEL") + "</td>";
    h += "</tr></table>";
    h += msg;
    div.innerHTML = h;
    if (this.edge == "bottom") {
        if (container.childNodes.length > 0) {
            container.insertBefore(div, container.childNodes[0]);
        } else {
            container.appendChild(div);
        }    
    } else {
        container.appendChild(div);
    }
    $(div).fadeTo(0,.8);

    if (timeout > 0) {
        window.setTimeout($.proxy(function() {
            $(div).fadeTo(300,0, function() { this.parentElement.removeChild(this); });
        }, div),timeout);
    } else {
        div.onclick = $.proxy(function() { this.parentElement.removeChild(this); }, div);
    }
}
B.Growl.prototype.msg = function(title, msg, timeout) {
    if (timeout == undefined) timeout = B.settings.Growl.defaultTimeout;
    this.popup("NORMAL", title, msg, timeout, "LEDBLUE");
}
B.Growl.prototype.errmsg = function(title, msg, timeout) {
    if (timeout == undefined) timeout = B.settings.Growl.defaultTimeout;
    this.popup("ERROR", title, msg, timeout, "LEDRED");
}
B.Growl.prototype.warnmsg = function(title, msg, timeout) {
    if (timeout == undefined) timeout = B.settings.Growl.defaultTimeout;
    this.popup("WARNING", title, msg, timeout, "LEDYELLOW");
}