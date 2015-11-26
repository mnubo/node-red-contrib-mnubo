module.exports = function(RED) {
   
   //mnubo-sdk
   require('es6-shim'); /* only if running node < 4.0.0 */
   var mnubo = require('mnubo-sdk');
   var ConfigMnuboUtils = require('../config/mnubo-utils');
   
   
   //If return_promise is 1, this function will return the promise result
   function CreateOwnerFromSdk(thisNode, msg, return_promise) {    
      //console.log('CreateOwnerFromSdk');
      return_promise = return_promise || 0;
      
      var client = new mnubo.Client({
         id: thisNode.mnuboconfig.credentials.id,
         secret: thisNode.mnuboconfig.credentials.secret,
         env: thisNode.mnuboconfig.env
      });
      
      if (return_promise==1)
      {
         return client.owners.create(msg.payload);
      }
      else
      {
         client.owners.create(msg.payload)
         .then(function(data) { 
            ConfigMnuboUtils.MnuboConfigUpdateStatusResponseOK(thisNode,data);
            msg.payload = data; 
            thisNode.send(msg);} )
         .catch(function(error) { 
            ConfigMnuboUtils.MnuboConfigUpdateStatusResponseError(thisNode,error); 
            msg.payload = error;  
            thisNode.send(msg);} );
      }
      
   }  
   
   //If return_promise is 1, this function will return the promise result
   function UpdateOwnerFromSdk(thisNode, msg, return_promise) {  
      //console.log('UpdateOwnerFromSdk');
      return_promise = return_promise || 0;
      
      var client = new mnubo.Client({
         id: thisNode.mnuboconfig.credentials.id,
         secret: thisNode.mnuboconfig.credentials.secret,
         env: thisNode.mnuboconfig.env
      });
      
      var owner = msg.payload.substr(0,msg.payload.indexOf(','));
      var input = msg.payload.substr(msg.payload.indexOf(",")+1);
      if (return_promise==1)
      {
         return client.owners.update(owner, input);
      }
      else
      {
         client.owners.update(owner, input)
         .then(function(data) { 
            ConfigMnuboUtils.MnuboConfigUpdateStatusResponseOK(thisNode,data);
            msg.payload =  data || "Owner Updated"; 
            thisNode.send(msg);} )
         .catch(function(error) { 
            ConfigMnuboUtils.MnuboConfigUpdateStatusResponseError(thisNode,error); 
            msg.payload = error;  
            thisNode.send(msg);} );
      }
   }  
   
   //If return_promise is 1, this function will return the promise result
   function DeleteOwnerFromSdk(thisNode, msg, return_promise) {  
      //console.log('DeleteOwnerFromSdk');
      return_promise = return_promise || 0;
      
      var client = new mnubo.Client({
         id: thisNode.mnuboconfig.credentials.id,
         secret: thisNode.mnuboconfig.credentials.secret,
         env: thisNode.mnuboconfig.env
      });
      
      if (return_promise==1)
      {
         return client.owners.create(msg.payload);
      }
      else
      {
         client.owners.delete(msg.payload)
         .then(function(data) { 
            ConfigMnuboUtils.MnuboConfigUpdateStatusResponseOK(thisNode,data);
            msg.payload =  data || "Owner Deleted"; 
            thisNode.send(msg);} )
         .catch(function(error) { 
            ConfigMnuboUtils.MnuboConfigUpdateStatusResponseError(thisNode,error); 
            msg.payload = error;  
            thisNode.send(msg);} );
      }
   }  
   
   //If return_promise is 1, this function will return the promise result
   function ClaimOwnerFromSdk(thisNode, msg, return_promise) {  
      console.log('ClaimOwnerFromSdk');
      return_promise = return_promise || 0;
      
      var client = new mnubo.Client({
         id: thisNode.mnuboconfig.credentials.id,
         secret: thisNode.mnuboconfig.credentials.secret,
         env: thisNode.mnuboconfig.env
      });
      
      var owner = msg.payload.substr(0,msg.payload.indexOf(','));
      var input = msg.payload.substr(msg.payload.indexOf(",")+1);
      if (return_promise==1)
      {
         return client.owners.claim(owner, input);
      }
      else
      {
         client.owners.claim(owner, input)
         .then(function(data) { 
            ConfigMnuboUtils.MnuboConfigUpdateStatusResponseOK(thisNode,data);
            msg.payload =  data || "Owner Claimed"; 
            thisNode.send(msg);} )
         .catch(function(error) { 
            console.log('error=',error);
            ConfigMnuboUtils.MnuboConfigUpdateStatusResponseError(thisNode,error); 
            msg.payload = error;  
            thisNode.send(msg);} );
      }
   }  
   
   
   
   function MnuboRequest(thisNode, msg) {
      
      if (thisNode == null || thisNode.mnuboconfig == null || thisNode.mnuboconfig.credentials == null)
      {
         ConfigMnuboUtils.MnuboConfigUpdateStatusErrMsg(thisNode,"missing config/credentials");
         return;
      }
      
      if (msg == null || msg.payload == null || msg.payload == "")
      {
         ConfigMnuboUtils.MnuboConfigUpdateStatusErrMsg(thisNode,"missing input");
         return;
      }
      
      
      if (thisNode.functionselection == "create")
      {
         ConfigMnuboUtils.MnuboConfigUpdateStatusLogMsg(thisNode,"create...");
         CreateOwnerFromSdk(thisNode, msg);
      }
      else if (thisNode.functionselection == "update")
      {
         ConfigMnuboUtils.MnuboConfigUpdateStatusLogMsg(thisNode,"update...");
         UpdateOwnerFromSdk(thisNode, msg);
      }
      else if (thisNode.functionselection == "delete")
      {
         ConfigMnuboUtils.MnuboConfigUpdateStatusLogMsg(thisNode,"delete...");
         DeleteOwnerFromSdk(thisNode, msg);
      }
      else if (thisNode.functionselection == "claim")
      {
         ConfigMnuboUtils.MnuboConfigUpdateStatusLogMsg(thisNode,"claim...");
         ClaimOwnerFromSdk(thisNode, msg);
      }
      else
      {
         ConfigMnuboUtils.MnuboConfigUpdateStatusErrMsg(thisNode,"unknown searchtype");
      }
   }
   
   
   function MnuboAnalytics(thisNode) {
      //console.log('MnuboAnalytics');
      RED.nodes.createNode(this,thisNode);
      
      this.functionselection = thisNode.functionselection;
      this.inputtext = thisNode.inputtext;
      
      
      // Retrieve the mnubo-credential config node
      this.mnuboconfig = RED.nodes.getNode(thisNode.mnuboconfig);
      ConfigMnuboUtils.MnuboConfigUpdateStatus(this);
      
      this.on('input', function(msg) {
         this.mnuboconfig = RED.nodes.getNode(thisNode.mnuboconfig);
         MnuboRequest(this, msg);         
      });
      
   }
   
   
   RED.nodes.registerType("mnubo owners", MnuboAnalytics);
   
   RED.httpAdmin.post("/owners/:id/button", RED.auth.needsPermission("mnubo owners.write"), function(req,res) {
      var thisNode = RED.nodes.getNode(req.params.id);
      //console.log('thisNode=',thisNode);
      msg = { payload: thisNode.inputtext };
      MnuboRequest(thisNode, msg);
   });
}
