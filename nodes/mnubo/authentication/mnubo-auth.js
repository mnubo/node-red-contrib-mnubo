module.exports = function(RED) {
   
   //mnubo-sdk
   require('es6-shim'); /* only if running node < 4.0.0 */
   var mnubo = require('mnubo-sdk');
   var ConfigMnuboUtils = require('../config/mnubo-utils');
   
   function GetAccessTokenFromSdk(thisNode, msg) {
      ConfigMnuboUtils.DebugLog();
      
      if (thisNode == null || thisNode.mnuboconfig == null || thisNode.mnuboconfig.credentials == null)
      {
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
         ConfigMnuboUtils.DebugLog(data);
         thisNode.mnuboconfig.credentials.access_token = data.access_token;
         thisNode.mnuboconfig.credentials.access_token_expiry = (new Date()).getTime()/1000 + data.expires_in;
         RED.nodes.addCredentials(thisNode.id,thisNode.mnuboconfig.credentials);
         ConfigMnuboUtils.UpdateStatusResponseOK(thisNode, data);
         msg.payload = data; 
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
      if (thisNode != null)
      {
         ConfigMnuboUtils.UpdateStatusLogMsg(thisNode, "button input ...");
         res.sendStatus(GetAccessTokenFromSdk(thisNode));
      }
      else
      {
         res.sendStatus(404);
      }
      ConfigMnuboUtils.DebugLog('exit');
   });
}
