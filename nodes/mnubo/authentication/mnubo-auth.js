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
         return;
      }
      
      msg = msg || { payload: "GetAccessTokenFromSdk" };
      
      //Clear previous access_token:
      thisNode.mnuboconfig.credentials.access_token = "";
      thisNode.mnuboconfig.credentials.access_token_expiry = "";
      
      ConfigMnuboUtils.DebugLog("proxy_url=",thisNode.mnuboconfig.proxy_url);
      ConfigMnuboUtils.DebugLog("httpOptions=",ConfigMnuboUtils.ProxyUrl2HtpOptions(thisNode.mnuboconfig));
      
     
      
      var client = new mnubo.Client({
         id: thisNode.mnuboconfig.credentials.id,
         secret: thisNode.mnuboconfig.credentials.secret,
         env: thisNode.mnuboconfig.env,
         httpOptions: ConfigMnuboUtils.ProxyUrl2HtpOptions(thisNode.mnuboconfig)
      });
      console.log('client=',client);
      
      client.getAccessToken()
      .then(function GetAccessTokenFromSdk_OK(data) {
         ConfigMnuboUtils.DebugLog(data);
         thisNode.mnuboconfig.credentials.access_token = data.access_token;
         thisNode.mnuboconfig.credentials.access_token_expiry = (new Date()).getTime()/1000 + data.expires_in;
         RED.nodes.addCredentials(thisNode.id,thisNode.mnuboconfig.credentials);
         ConfigMnuboUtils.UpdateStatusResponseOK(thisNode,data);
         msg.payload = data; 
         thisNode.send(msg);
      } )
      .catch(function GetAccessTokenFromSdk_ERR(error) { 
         //ConfigMnuboUtils.DebugLog(error);
         console.log('error=',error);
         ConfigMnuboUtils.UpdateStatusResponseError(thisNode,error); 
         msg.payload = error;  
         thisNode.send(msg); 
      } )
      ConfigMnuboUtils.DebugLog('exit');
   }
   
   function MnuboAuthenticate(thisNode) {
      ConfigMnuboUtils.DebugLog();
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
      ConfigMnuboUtils.DebugLog();
      var thisNode = RED.nodes.getNode(req.params.id);
      GetAccessTokenFromSdk(thisNode);
      res.sendStatus(200);
      //res.sendStatus(400);
      ConfigMnuboUtils.DebugLog('exit');
   });
}
