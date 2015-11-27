module.exports = function(RED) {
   
   //mnubo-sdk
   require('es6-shim'); /* only if running node < 4.0.0 */
   var mnubo = require('mnubo-sdk');
   var ConfigMnuboUtils = require('../config/mnubo-utils');
   
   function GetAccessTokenFromSdk(thisNode, msg) {
      //console.log('GetAccessTokenFromSdk');
      //console.log('thisNode=',thisNode);
      
      if (thisNode == null || thisNode.mnuboconfig == null || thisNode.mnuboconfig.credentials == null)
      {
         ConfigMnuboUtils.UpdateStatusErrMsg(thisNode,"missing config/credentials");
         return;
      }
      
      msg = msg || { payload: "GetAccessTokenFromSdk" };
      
      //Clear previous access_token:
      thisNode.mnuboconfig.credentials.access_token = "";
      thisNode.mnuboconfig.credentials.access_token_expiry = "";
      
      var client = new mnubo.Client({
         id: thisNode.mnuboconfig.credentials.id,
         secret: thisNode.mnuboconfig.credentials.secret,
         env: thisNode.mnuboconfig.env
      });
      //console.log('client=',client);
      
      client.getAccessToken()
      .then(function(data) {
         thisNode.mnuboconfig.credentials.access_token = data.access_token;
         thisNode.mnuboconfig.credentials.access_token_expiry = (new Date()).getTime()/1000 + data.expires_in;
         RED.nodes.addCredentials(thisNode.id,thisNode.mnuboconfig.credentials);
         
         ConfigMnuboUtils.UpdateStatusResponseOK(thisNode,data);
         msg.payload = data; 
         thisNode.send(msg);
      } )
      .catch(function(error) { 
         ConfigMnuboUtils.UpdateStatusResponseError(thisNode,error); 
         msg.payload = error;  
         thisNode.send(msg); 
      } )
   }
   
   function MnuboAuthenticate(thisNode) {
      //console.log('MnuboAuthenticate');
      RED.nodes.createNode(this,thisNode);
      
      //console.log('thisNode=',thisNode);
      
      // Retrieve the mnubo-credential config node
      this.mnuboconfig = RED.nodes.getNode(thisNode.mnuboconfig);
      //console.log('mnuboconfig=',this.mnuboconfig);
      
      ConfigMnuboUtils.UpdateStatus(this);
      
      this.on('input', function(msg) {
         this.mnuboconfig = RED.nodes.getNode(thisNode.mnuboconfig);
         GetAccessTokenFromSdk(this, msg);         
      });
      
   }
   
   RED.nodes.registerType("mnubo auth", MnuboAuthenticate);
   
   RED.httpAdmin.post("/auth/:id/button", RED.auth.needsPermission("mnubo auth.write"), function(req,res) {
      var thisNode = RED.nodes.getNode(req.params.id);
      GetAccessTokenFromSdk(thisNode);
   });
}
