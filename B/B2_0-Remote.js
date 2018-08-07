// Remote calls
B.settings.RemoteMethod = { URL: '/pcmedit/rpc' };
B.RestfulService = function(baseURL) {
	this.baseURL = baseURL;
	this.getText = function(urlEnd, callback) {
		$.get(this.baseURL + urlEnd, callback);
	};
};

// Blank or null cls does not call remote
// Blank or null cls and numeric mth simulates running with a timeout
// RemoteMethod has only been tested against a Java servlet with custom code.
// However, it should work fine with similar code dealing with running a method by name
// and returning values is a specially formatted way using \f and \b seperators
B.RemoteMethod = function(cls,mth,onBeforeStart,onComplete) {
	if (cls == "") cls = null;
	if (mth == "") mth = null;
	this.cls = cls;
	this.mth = mth;
	this.error = "";
	this.running = false;
	this.aborted = false;
	this.results = { };
	this.resultXhr = null;
	this.timings = { start: null, end: null, remotemillis: 0, overheadmillis: 0, totalmillis: 0 };

	this.params = { };
	this.setParam = this.setParams;
	this.setParameter = this.setParams;
	this.setParameters = this.setParams;
	this.getParameter = this.getParam;
	// props are just values to set related to this function call. 
	// They are not passed to the Java function
	this.props = { };  
	this.setProperty = this.setProps;
	this.setProp = this.setProps;
	this.getProperty = this.getProp;
	this.getError = function() { return this.error; };
	this.isError = function() { return (this.error != ""); };
	if (onComplete == undefined) {
		this.onComplete = function(isSuccess) { };
	} else {
		this.onComplete = onComplete;
	}
	if (onBeforeStart == undefined) {
		this.onBeforeStart = function() { return true; };
	} else {
		this.onBeforeStart = onBeforeStart;
	}
	this.onAbort = function() { };
};
B.RemoteMethod.prototype.setResult = function(key, val) {  // Override result value
	this.results[key.toUpperCase()] = val; 
};
B.RemoteMethod.prototype.getResult = function(key) {
	var rslt = this.results[key.toUpperCase()];
	if (rslt == undefined) rslt = "";
	return rslt; 
};
B.RemoteMethod.prototype.setProps = function() {
	if (arguments.length == 1) { // Pass in a collection?
		var args = arguments[0];
		for (var itm in args) {
			this.props[itm.toUpperCase()] = args[itm]; 
		}
	}
	for (var i = 0; i < arguments.length; i+=2) {
		this.props[arguments[i].toUpperCase()] = arguments[i+1];
	}
};
B.RemoteMethod.prototype.getProp = function(key) { return this.props[key.toUpperCase()]; };
B.RemoteMethod.prototype.setParams = function() {
	if (arguments.length == 1) { // Pass in a collection?
		var args = arguments[0];
		for (var itm in args) {
			var key = B.trim(itm).toUpperCase();
			this.params[key] = args[itm]; 
		}
	}
	for (var i = 0; i < arguments.length; i+=2) {
		var key = B.trim(arguments[i]).toUpperCase();
		this.params[key] = arguments[i+1];
	}
	return this;
};
B.RemoteMethod.prototype.getParam = function(key) { 
	return this.params[key.toUpperCase()]; 
};
B.RemoteMethod.prototype.abort = function() { 
	this.aborted = true; 
	this.onComplete(true,this); 
	return this.running;
};
B.RemoteMethod.prototype.setTimings = function() {
	this.timings.end = new Date();
    this.timings.totalmillis = this.timings.end.getTime() - this.timings.start.getTime();
	if (this.getResult("RUNTIME_MILLIS") == undefined) {
		this.timings.remotemillis = this.timings.remotemillis;
		this.timings.overheadmillis = 0;
	} else {
		this.timings.remotemillis = parseInt(this.getResult("RUNTIME_MILLIS"), 10);
		this.timings.overheadmillis = this.timings.totalmillis - this.timings.remotemillis;
	}
};
B.RemoteMethod.prototype.run = function() {
	this.setParams.apply(this, arguments);
	this.aborted = false;
	this.timings.start = new Date();
	this.timings.end = null;
	this.timings.remotemillis = 0;
	this.timings.overheadmillis = 0;
	this.timings.totalmillis = 0;

	this.resultXhr = null;
	var ok = this.onBeforeStart(this);
	if (ok == undefined) ok = true;
	if (!ok) return;
	var d = { callClass: this.cls, callMethod: this.mth, RPCCallType: 'CALLBUNDLE' };
	for (key in this.params) { d[key] = this.params[key]; }
	this.error = "";
	this.results = { };
	this.loc = window.location;
	this.running =  true;
	if (this.cls == null) {
		if (this.mth != null) {
			// Check if you sent in a millisecond counter for test purposes
			if (!isNaN(this.mth)) {
				window.setTimeout($.proxy(function() {
					this.onComplete(true, this);
					if (window.B_DEFAULT_FOCUS_ELEMENT != undefined) $(window.B_DEFAULT_FOCUS_ELEMENT).focus();
				}, this), parseInt(this.mth, 10));
				return;
			}
		} else {
			this.onComplete(true, this);
			if (window.B_DEFAULT_FOCUS_ELEMENT != undefined) $(window.B_DEFAULT_FOCUS_ELEMENT).focus();
			return;
		}
	}
	$.ajax({
		url: B.settings.RemoteMethod.URL, context: this, cache: false, type: "POST", dataType: "text", data: d,
		contentType: "application/x-www-form-urlencoded;charset=UTF-8"
	}).fail(function( xhr, status, errmsg ) {
		this.running = false;
		if (this.aborted) return;
		this.resultXhr = xhr;
		// Check Response Headers. If they are empty, then the request
		// was aborted. Perhaps the user is leaving the page??
		if (!xhr.getAllResponseHeaders()) {
			this.error = errmsg;
			this.onAbort(this);
			// Do not call onComplete. If an abort is to be dealt with
			// the user should have an onAbort handler defined.
		} else {
			var msg = "";
			if (status != null) msg = status;
			if (errmsg != null) {
				if (msg == "") {
					msg = errmsg;
				} else {
					msg += ": " + errmsg;
				}
			} else {
				if (msg == "") msg = "Unknown error";
			}
			this.error = "Error in " + this.cls + "." + this.mth + ": " + msg;
			this.setTimings();
			this.onComplete(false, this);
			if (window.B_DEFAULT_FOCUS_ELEMENT != undefined) $(window.B_DEFAULT_FOCUS_ELEMENT).focus();
		}
	}).done(function( data ) {
		this.setTimings();
		this.running = false;
		if (this.aborted) return;
        this.resultXhr = null; // Only available on error
        // parts of result are seperated by formfeeds
        var parts = data.split("\f");
        // part 0 is the error message (if any)
        // part 1+ are result names and values. 
        // Name and values are seperated by backspace characters
		this.error = parts[0].split("\b")[1]; //ERROR\bText of error\f
		for (var i = 1; i < parts.length; i++) {
			var itm = parts[i].split("\b"); // ITEMNAME\bItem value\f
			this.results[itm[0]] = itm[1];
		}
		this.setTimings();
		this.onComplete(this.error == "", this);
		if (window.B_DEFAULT_FOCUS_ELEMENT != undefined) $(window.B_DEFAULT_FOCUS_ELEMENT).focus();
	});
	
}

