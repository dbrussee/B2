// Written by Dan Brussee
// Version 2.0: Released <unreleased>
// Added to bettway GIT

var style = document.createElement('style');
style.type = 'text/css';
var B = ".BDialog { z-index: 9999; display: none; } ";
B += ".ui-dialog .ui-dialog-titlebar, " +
		".ui-dialog .ui-dialog-buttonpane, " +
		".ui-dialog .ui-dialog-content, " +
		".ui-button { font-size: .8em; }";
B += ".no-close .ui-dialog-titlebar-close { display: none; } ";
B += ".no-title .ui-dialog .ui-dialog-titlebar { display: none; } ";
B += "table.form tr th { padding-right:.3em; text-align:right; font-weight:bold; background-color:transparent; } ";
B += "label { display:inline; } ";
style.innerHTML = B;
document.getElementsByTagName('head')[0].appendChild(style);

B = { };
B.version = "2.0"; // B2_0.js

// Cusomize these settings to work as you want them
B.settings = {
	say: {
		defTitle: 'System Message'
	},
	RemoteMethod: {
		URL: 'rpc/method'
	}
};
B.choiceValue = null;

$(document).ready(function() {
	$(".BDialog").dialog({ autoOpen: false, resizable: false, modal: true, beforeClose: function() {  } });
	$('form').bind('submit',function(e){e.preventDefault();});
    $( document ).tooltip({ track: true });
	$(":button").button();
    $("input[type='text'], textarea").attr('spellcheck',false);
    if (typeof init === 'function') init();
});
