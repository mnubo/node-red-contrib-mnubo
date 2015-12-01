function UpdateStatus(thisNode) {
   if (thisNode ==  null || thisNode.mnuboconfig == null || thisNode.mnuboconfig.credentials == null)
   {
      thisNode.status({fill:"red", shape:"ring", text:"no mnubo config"});
      return;
   }
   
   var myCredential = thisNode.mnuboconfig.credentials;;  
   var seconds = (new Date()).getTime()/1000;
   
   if (myCredential.id==null || myCredential.id == "" || myCredential.secret==null || myCredential.secret == "")
   {
      thisNode.status({fill:"red", shape:"ring", text:"empty credentials"});
   }
   else if ( myCredential.access_token == null || myCredential.access_token == "")
   {
      thisNode.status({fill:"red", shape:"ring", text:"unauthorized"});
   }
   else if (myCredential.access_token_expiry == null || myCredential.access_token_expiry == "" )
   {
      thisNode.status({fill:"yellow", shape:"ring", text:"unknown token expiry"});
   }
   else if (seconds > myCredential.access_token_expiry ) 
   {
      thisNode.status({fill:"yellow", shape:"ring", text:"token expired"});
   }
   else
   {
      thisNode.status({fill:"green", shape:"ring", text:"valid token"});
   }
}
exports.UpdateStatus = UpdateStatus;


function UpdateStatusResponseOK(thisNode,data) {
   thisNode.status({fill:"green", shape:"dot", text:"OK"});
}
exports.UpdateStatusResponseOK = UpdateStatusResponseOK;

function UpdateStatusResponseError(thisNode,error) {
   thisNode.status({fill:"red", shape:"dot", text:error.errorCode+":"+error.message});
}
exports.UpdateStatusResponseError = UpdateStatusResponseError;

function UpdateStatusErrMsg(thisNode,msg) {
   thisNode.status({fill:"red", shape:"ring", text:msg});
}
exports.UpdateStatusErrMsg = UpdateStatusErrMsg;

function UpdateStatusWarnMsg(thisNode,msg) {
   thisNode.status({fill:"yellow", shape:"ring", text:msg});
}
exports.UpdateStatusWarnMsg = UpdateStatusWarnMsg;

function UpdateStatusLogMsg(thisNode,msg) {
   thisNode.status({fill:"green", shape:"ring", text:msg});
}
exports.UpdateStatusLogMsg = UpdateStatusLogMsg;

function simpleStringify (object){
    var simpleObject = {};
    for (var prop in object ){
        if (!object.hasOwnProperty(prop)){
            continue;
        }
        if (typeof(object[prop]) == 'object'){
            continue;
        }
        if (typeof(object[prop]) == 'function'){
            continue;
        }
        simpleObject[prop] = object[prop];
    }
    return JSON.stringify(simpleObject); // returns cleaned up JSON
};

var debug = true;
//var debug = false;
function DebugLog() {
   if (debug) {
      date = new Date();
      var args_vals="";
      if (arguments.length > 0) {
         for(var i=0; i<arguments.length; i++) {
            //console.log("typeof(arguments[i]=",typeof(arguments[i]));
            if (typeof(arguments[i]) == 'string')
            {
               args_vals += arguments[i]
            }
            else
            {
               //let JSON stringify the object
               args_vals += JSON.stringify(arguments[i]);
            }
         }
      }
      console.log(date.toISOString()+":", arguments.callee.caller.name, args_vals);
      //console.log(date.toISOString()+":", arguments.callee.caller, args_vals);
   }
}
exports.DebugLog = DebugLog;

var url=require('url');
function ProxyUrl2HtpOptions(mnuboconfig) {
   if (mnuboconfig.env != 'useproxyurl' || mnuboconfig.proxy_url == null || mnuboconfig.proxy_url == '') {
      return '';
   }
   return {
      protocol: url.parse(mnuboconfig.proxy_url).protocol.replace(':',''),
      hostname: url.parse(mnuboconfig.proxy_url).hostname,
      port:     url.parse(mnuboconfig.proxy_url).port
   }
}
exports.ProxyUrl2HtpOptions = ProxyUrl2HtpOptions;
