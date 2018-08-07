B.VALIDABAROUTINGNUMBER = function(val) {
    val = B.trim(val);
    if (val.length != 9) return "Not 9 digits";
    if (!B.is.ALLDIGITS(val)) return "Not numeric";
    var a = parseInt(val.charAt(0),10) + parseInt(val.charAt(3),10) + parseInt(val.charAt(6),10);
    var b = parseInt(val.charAt(1),10) + parseInt(val.charAt(4),10) + parseInt(val.charAt(7),10);
    var c = parseInt(val.charAt(2),10) + parseInt(val.charAt(5),10) + parseInt(val.charAt(8),10);
    var tot = (a*3) + (b*7) + c;
    if (tot % 10 != 0) return "Fails checksum";
    var rslt = { type:'', fedbank:'' };
    var chk = val.substr(0,1); // First Digit
    if (B.is.ONEOF(chk,"0,1")) rslt.type = "Primary";
    else if (B.is.ONEOF(chk,"2,3")) rslt.type = "Thrift";
    else if (B.is.ONEOF(chk,"6,7")) rslt.type = "Electronic";
    else if (B.is.ONEOF(chk,"8")) rslt.type = "Travelers Checks";
    if (rslt.type == "") return "Invalid type";
    chk = val.substr(0,2); // Two digits
    if (B.is.ONEOF(chk,"01,21,61")) rslt.fedbank = "Boston";
    else if (B.is.ONEOF(chk,"02,22,62")) rslt.fedbank = "New York";
    else if (B.is.ONEOF(chk,"03,23,63")) rslt.fedbank = "Philadelphia";
    else if (B.is.ONEOF(chk,"04,24,64")) rslt.fedbank = "Cleveland";
    else if (B.is.ONEOF(chk,"05,25,65")) rslt.fedbank = "Richmond";
    else if (B.is.ONEOF(chk,"06,26,66")) rslt.fedbank = "Atlanta";
    else if (B.is.ONEOF(chk,"07,27,67")) rslt.fedbank = "Chicago";
    else if (B.is.ONEOF(chk,"08,28,68")) rslt.fedbank = "St Louis";
    else if (B.is.ONEOF(chk,"09,29,69")) rslt.fedbank = "Minneapolis";
    else if (B.is.ONEOF(chk,"10,30,70")) rslt.fedbank = "Kansas City";
    else if (B.is.ONEOF(chk,"11,31,71")) rslt.fedbank = "Dallas";
    else if (B.is.ONEOF(chk,"12,32,72")) rslt.fedbank = "San Francisco";
    else if (B.is.ONEOF(chk,"00")) rslt.fedbank = "Federal Government";
    else if (B.is.ONEOF(chk,"80")) rslt.fedbank = "Travelers Checks";
    if (rslt.type == "") return "Invalid Fed Bank value";
    return rslt;
};