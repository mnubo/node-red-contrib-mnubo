module.exports = function(RED) {
   
   //mnubo-sdk
   require('es6-shim'); /* only if running node < 4.0.0 */
   var mnubo = require('mnubo-sdk');
   var ConfigMnuboUtils = require('../config/mnubo-utils');
   
   
   //If return_promise is 1, this function will return the promise result
   function CreateObjectFromSdk(thisNode, msg, return_promise) {    
      //console.log('CreateObjectFromSdk');
      return_promise = return_promise || 0;
      
      var client = new mnubo.Client({
         id: thisNode.mnuboconfig.credentials.id,
         secret: thisNode.mnuboconfig.credentials.secret,
         env: thisNode.mnuboconfig.env
      });
      
      if (return_promise==1)
      {
         return client.objects.create(msg.payload);
      }
      else
      {
         client.objects.create(msg.payload)
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
   function UpdateObjectFromSdk(thisNode, msg, return_promise) {  
      //console.log('UpdateObjectFromSdk');
      return_promise = return_promise || 0;
      
      var client = new mnubo.Client({
         id: thisNode.mnuboconfig.credentials.id,
         secret: thisNode.mnuboconfig.credentials.secret,
         env: thisNode.mnuboconfig.env
      });
      
      var object = msg.payload.substr(0,msg.payload.indexOf(','));
      var input = msg.payload.substr(msg.payload.indexOf(",")+1);
      if (return_promise==1)
      {
         return client.objects.update(object, input);
      }
      else
      {
         client.objects.update(object, input)
         .then(function(data) { 
            ConfigMnuboUtils.MnuboConfigUpdateStatusResponseOK(thisNode,data);
            msg.payload =  data || "Object Updated"; 
            thisNode.send(msg);} )
         .catch(function(error) { 
            ConfigMnuboUtils.MnuboConfigUpdateStatusResponseError(thisNode,error); 
            msg.payload = error;  
            thisNode.send(msg);} );
      }
   }  
   
   //If return_promise is 1, this function will return the promise result
   function DeleteObjectFromSdk(thisNode, msg, return_promise) {  
      //console.log('DeleteObjectFromSdk');
      return_promise = return_promise || 0;
      
      var client = new mnubo.Client({
         id: thisNode.mnuboconfig.credentials.id,
         secret: thisNode.mnuboconfig.credentials.secret,
         env: thisNode.mnuboconfig.env
      });
      
      if (return_promise==1)
      {
         return client.objects.create(msg.payload);
      }
      else
      {
         client.objects.delete(msg.payload)
         .then(function(data) { 
            ConfigMnuboUtils.MnuboConfigUpdateStatusResponseOK(thisNode,data);
            msg.payload =  data || "Object Deleted"; 
            thisNode.send(msg);} )
         .catch(function(error) { 
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
         CreateObjectFromSdk(thisNode, msg);
      }
      else if (thisNode.functionselection == "update")
      {
         ConfigMnuboUtils.MnuboConfigUpdateStatusLogMsg(thisNode,"update...");
         UpdateObjectFromSdk(thisNode, msg);
      }
      else if (thisNode.functionselection == "delete")
      {
         ConfigMnuboUtils.MnuboConfigUpdateStatusLogMsg(thisNode,"delete...");
         DeleteObjectFromSdk(thisNode, msg);
      }
      else
      {
         ConfigMnuboUtils.MnuboConfigUpdateStatusErrMsg(thisNode,"unknown function");
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
   
   
   RED.nodes.registerType("mnubo objects", MnuboAnalytics);
   
   RED.httpAdmin.post("/objects/:id/button", RED.auth.needsPermission("mnubo objects.write"), function(req,res) {
      var thisNode = RED.nodes.getNode(req.params.id);
      //console.log('thisNode=',thisNode);
      msg = { payload: thisNode.inputtext };
      MnuboRequest(thisNode, msg);
   });
}
