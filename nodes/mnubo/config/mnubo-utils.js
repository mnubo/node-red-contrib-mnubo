function UpdateStatus(thisNode) {
   if (thisNode == null || thisNode.mnuboconfig == null || thisNode.mnuboconfig.credentials == null)
   {
      thisNode.status({fill: "red", shape: "ring", text: "no mnubo config"});
      return;
   }

   if (thisNode.mnuboconfig.credentials_type === "app_token") {
    var myCredential = thisNode.mnuboconfig.credentials;
    if (myCredential.app_token == null || myCredential.app_token === "") {
      thisNode.status({fill: "red", shape: "ring", text: "empty token"});
    } else {
      thisNode.status({fill: "green", shape: "ring", text: "valid token"});
    }
   } else {
    var myCredential = thisNode.mnuboconfig.credentials;
    var seconds = (new Date()).getTime()/1000;
    if (myCredential.id == null || myCredential.id === "" || myCredential.secret == null || myCredential.secret === "") {
      thisNode.status({fill: "red", shape: "ring", text: "empty credentials"});
    } else if ( myCredential.access_token == null || myCredential.access_token === "") {
      thisNode.status({fill: "red", shape: "ring", text: "unauthorized"});
    } else if (myCredential.access_token_expiry == null || myCredential.access_token_expiry === "" ) {
      thisNode.status({fill: "yellow", shape: "ring", text: "unknown token expiry"});
    } else if (seconds > myCredential.access_token_expiry ) {
      thisNode.status({fill: "yellow", shape: "ring", text: "token expired"});
    } else {
      thisNode.status({fill: "green", shape: "ring", text: "valid token"});
    }
   }
}
exports.UpdateStatus = UpdateStatus;


function UpdateStatusResponseOK(thisNode, data) {
   thisNode.status({fill: "green", shape: "dot", text: "OK"});
}
exports.UpdateStatusResponseOK = UpdateStatusResponseOK;

function UpdateStatusResponseWarning(thisNode, data) {
   thisNode.status({fill: "yellow", shape: "dot", text: "Multi Status"});
}
exports.UpdateStatusResponseWarning = UpdateStatusResponseWarning;

function UpdateStatusResponseError(thisNode, error) {
   if (error) {
      if (typeof error === 'object') {
       if (error.errorCode) {
             thisNode.status({fill: "red", shape: "dot", text: error.errorCode + ": " + error.message});
          }
          else if (error.code) {
             thisNode.status({fill: "red", shape: "dot", text: error.code});
          }
          else if (error.message) {
            if (error.stack) {
             thisNode.status({fill: "red", shape: "dot", text: error.stack});
            } else {
              thisNode.status({fill: "red", shape: "dot", text: error.message});
            }
          }
          else if (error.payload) {
            if (error.payload.error_description) {
              thisNode.status({fill: "red", shape: "dot", text: error.payload.error_description});
            } else {
              thisNode.status({fill: "red", shape: "dot", text: error.payload});
            }
          }
          else {
             thisNode.status({fill: "red", shape: "dot", text: JSON.stringify(error)});
          }
      } else if (Array.isArray(error)) {
        thisNode.status({fill: "red", shape: "dot", text: JSON.stringify(error)});
      } else {
        thisNode.status({fill: "red", shape: "dot", text: error });
      }
   }
   else {
        thisNode.status({fill: "red", shape: "dot", text: "Empty Error"});
   }
}
exports.UpdateStatusResponseError = UpdateStatusResponseError;

function UpdateStatusErrMsg(thisNode, msg) {
   thisNode.status({fill: "red", shape: "ring", text:msg});
}
exports.UpdateStatusErrMsg = UpdateStatusErrMsg;

function UpdateStatusWarnMsg(thisNode, msg) {
   thisNode.status({fill: "yellow", shape: "ring", text:msg});
}
exports.UpdateStatusWarnMsg = UpdateStatusWarnMsg;

function UpdateStatusLogMsg(thisNode, msg) {
   thisNode.status({fill: "green", shape: "ring", text:msg});
}
exports.UpdateStatusLogMsg = UpdateStatusLogMsg;

function CheckMultiStatusResult(thisNode, data, request) {
  var failed_events = [];
  var message = {};
  request = (typeof request === 'string') ? JSON.parse(request) : request
  
  data.forEach((obj, index) => {
        if (obj.result === "error") {
            failed_events.push({
                'errorMessage':  obj.message,
                'originalRequest': request[index]
            })
        }
  });

  if (failed_events.length > 0) { // Some errors
    if (failed_events.length === request.length) { //All request have failed
      UpdateStatusResponseError(thisNode, {"errorCode": 400, "message": "all requests have failed"});
    } else {  // ok + failed
      UpdateStatusResponseWarning(thisNode, data);
    }
      message.errors =  failed_events;
      message.payload =  data.filter( (value, index, array) => {
        return value.result !== "error" 
      });

  } else { // No errors
      UpdateStatusResponseOK(thisNode, data);
      message.payload =  data;
  }
  thisNode.send(message)
}
exports.CheckMultiStatusResult = CheckMultiStatusResult;

function simpleStringify (object){
    var simpleObject = {};
    for (var prop in object){
        if (!object.hasOwnProperty(prop)){
            continue;
        }
        if (typeof(object[prop]) === 'object'){
            continue;
        }
        if (typeof(object[prop]) === 'function'){
            continue;
        }
        simpleObject[prop] = object[prop];
    }
    return JSON.stringify(simpleObject); // returns a cleaned JSON
};



function ProxyUrl2HttpOptions(mnuboconfig) {

   if (mnuboconfig.env !== 'useproxyurl' || mnuboconfig.proxy_url == null || mnuboconfig.proxy_url === '') {
      //console.log('not using Proxy URL');
      return '';
   }
   //console.log('using Proxy URL');
   var url=require('url');
   var protocol = url.parse(mnuboconfig.proxy_url).protocol.replace(':','')
   var port = url.parse(mnuboconfig.proxy_url).port ? url.parse(mnuboconfig.proxy_url).port : (protocol === "https") ? 443 : 80
   return {
      protocol: protocol,
      hostname: url.parse(mnuboconfig.proxy_url).hostname,
      port:     port
   }
}

function GetNewMnuboClient(mnuboconfig) {
  var mnubo = require('mnubo-sdk');
  var options = {}

  if (mnuboconfig.env === 'useproxyurl') {
    options.httpOptions = ProxyUrl2HttpOptions(mnuboconfig)
  } else {
    options.env = mnuboconfig.env
  }

  switch(mnuboconfig.credentials_type) {
    case "client_credentials":
      options.id = mnuboconfig.credentials.id
      options.secret = mnuboconfig.credentials.secret
      break;
    case "app_token":
      options.token = mnuboconfig.credentials.app_token
      break;
    default:
      DebugLog("credentials_type: " + mnuboconfig.credentials_type + "is not valid")
  }

   if (mnuboconfig.retries) {
      options.exponentialBackoff = {
         numberOfAttempts: parseInt(mnuboconfig.numberOfAttempts),
         initialDelayInMillis: parseInt(mnuboconfig.initialDelayInMillis),
      }
   }

   var client = new mnubo.Client(options);
   return client;
}
exports.GetNewMnuboClient = GetNewMnuboClient;

//var debug = true;
var debug = false;
function DebugLog() {
   if (debug) {
      date = new Date();
      var args_vals="";
      if (arguments.length > 0) {
         for(var i=0; i<arguments.length; i++) {
            //console.log("typeof(arguments[i]=",typeof(arguments[i]));
            if (typeof(arguments[i]) === 'string')
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
      console.log(date.toISOString() + ": ", arguments.callee.caller.name, args_vals);
      //console.log(date.toISOString()+":", arguments.callee.caller, args_vals);
   }
}
exports.DebugLog = DebugLog;


