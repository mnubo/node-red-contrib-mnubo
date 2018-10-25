module.exports = function(RED) {
   
   //mnubo-sdk
   var mnubo = require('mnubo-sdk');
   var ConfigMnuboUtils = require('../config/mnubo-utils');
   
   function GetAccessTokenFromSdk(thisNode, msg) {
      ConfigMnuboUtils.DebugLog();
      
      if (thisNode == null || thisNode.mnuboconfig == null || thisNode.mnuboconfig.credentials == null) {
         ConfigMnuboUtils.UpdateStatusErrMsg(thisNode,"missing config/credentials");
         return 0;
      }
      
      msg = msg || { payload: "GetAccessTokenFromSdk" };
      
      //Clear previous access_token:
      thisNode.mnuboconfig.credentials.access_token = "";
      thisNode.mnuboconfig.credentials.access_token_expiry = "";
      
      var client = ConfigMnuboUtils.GetNewMnuboClient(thisNode.mnuboconfig);      
      
      client.getAccessToken()
      .then(function GetAccessTokenFromSdk_OK(data) {
         ConfigMnuboUtils.DebugLog(client.token);
         thisNode.mnuboconfig.credentials.access_token = client.token.value;
         thisNode.mnuboconfig.credentials.access_token_expiry = (new Date()).getTime()/1000 + client.token.expiresIn;
         RED.nodes.addCredentials(thisNode.id,thisNode.mnuboconfig.credentials);
         ConfigMnuboUtils.UpdateStatusResponseOK(thisNode, client.token);
         msg.payload = client.token; 
         thisNode.send(msg);
      } )
      .catch(function GetAccessTokenFromSdk_ERR(error) { 
         ConfigMnuboUtils.DebugLog(error);
         ConfigMnuboUtils.UpdateStatusResponseError(thisNode,error); 
         msg.errors = [{'errorMessage': error, 'originalRequest': msg}];
         thisNode.send(msg); 
      } )
      ConfigMnuboUtils.DebugLog('exit');
      return 200;
   }
   
   function MnuboAuthenticate(thisNode) {
      ConfigMnuboUtils.DebugLog();
      RED.nodes.createNode(this,thisNode);
      
      // Retrieve the mnubo config node
      this.mnuboconfig = RED.nodes.getNode(thisNode.mnuboconfig);
      
      ConfigMnuboUtils.UpdateStatus(this);
      
      this.on('input', function(msg) {
         this.mnuboconfig = RED.nodes.getNode(thisNode.mnuboconfig);
         ConfigMnuboUtils.UpdateStatusLogMsg(this, "input ...");
         GetAccessTokenFromSdk(this, msg);         
      });
      
   }
   
   RED.nodes.registerType("mnubo auth", MnuboAuthenticate);
   
   RED.httpAdmin.post("/auth/:id/button", RED.auth.needsPermission("mnubo auth.write"), function(req,res) {
      ConfigMnuboUtils.DebugLog();
      var thisNode = RED.nodes.getNode(req.params.id);
      if (thisNode != null) {
         ConfigMnuboUtils.UpdateStatusLogMsg(thisNode, "button input ...");
         res.sendStatus(GetAccessTokenFromSdk(thisNode));
      } else {
         res.sendStatus(404);
      }
      ConfigMnuboUtils.DebugLog('exit');
   });
}
