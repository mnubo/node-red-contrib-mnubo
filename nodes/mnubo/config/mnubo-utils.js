function MnuboConfigUpdateStatus(thisNode) {
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
exports.MnuboConfigUpdateStatus = MnuboConfigUpdateStatus;


function MnuboConfigUpdateStatusResponseOK(thisNode,data) {
   thisNode.status({fill:"green", shape:"dot", text:"OK"});
}
exports.MnuboConfigUpdateStatusResponseOK = MnuboConfigUpdateStatusResponseOK;

function MnuboConfigUpdateStatusResponseError(thisNode,error) {
   thisNode.status({fill:"red", shape:"dot", text:error.errorCode+":"+error.message});
}
exports.MnuboConfigUpdateStatusResponseError = MnuboConfigUpdateStatusResponseError;

function MnuboConfigUpdateStatusMsg(thisNode,msg) {
   thisNode.status({fill:"red", shape:"ring", text:msg});
}
exports.MnuboConfigUpdateStatusMsg = MnuboConfigUpdateStatusMsg;