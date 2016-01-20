module.exports = function(RED) {
   
   //mnubo-sdk
   require('es6-shim'); /* only if running node < 4.0.0 */
   var mnubo = require('mnubo-sdk');
   var ConfigMnuboUtils = require('../config/mnubo-utils');
   
   
   //If return_promise is 1, this function will return the promise result
   function CreateOwnerFromSdk(thisNode, msg, return_promise) {    
      ConfigMnuboUtils.DebugLog();
      return_promise = return_promise || 0;
      
      var client = ConfigMnuboUtils.GetNewMnuboClient(thisNode.mnuboconfig);      
      
      //ConfigMnuboUtils.DebugLog('msg=',msg);
      if (return_promise==1)
      {
         return client.owners.create(msg.payload);
      }
      else
      {
         client.owners.create(msg.payload)
         .then(function CreateOwnerFromSdk_OK(data) { 
            ConfigMnuboUtils.DebugLog(data);
            ConfigMnuboUtils.UpdateStatusResponseOK(thisNode,data);
            msg.payload = data; 
            thisNode.send(msg);} )
         .catch(function CreateOwnerFromSdk_ERR(error) { 
            ConfigMnuboUtils.DebugLog(error);
            ConfigMnuboUtils.UpdateStatusResponseError(thisNode,error); 
            msg.payload = error;  
            thisNode.send(msg);} );
      }
       ConfigMnuboUtils.DebugLog('exit');
   }  
   
   //If return_promise is 1, this function will return the promise result
   function UpdateOwnerFromSdk(thisNode, msg, return_promise) {  
      ConfigMnuboUtils.DebugLog();
      return_promise = return_promise || 0;
      
      var client = ConfigMnuboUtils.GetNewMnuboClient(thisNode.mnuboconfig);      
      
      try{
         
         if (typeof(msg.payload) == 'string')
         {
            myString = msg.payload;
         }
         else if (typeof(msg.payload) == 'object')
         {
            myString = JSON.stringify(msg.payload);
         }
         else
         {
            ConfigMnuboUtils.UpdateStatusErrMsg(thisNode,"not a string or object");
            return;
         }
         myArray = JSON.parse(myString);
         if (myArray.length !=2) {
            ConfigMnuboUtils.UpdateStatusErrMsg(thisNode,"bad amount of arguments");
            return;
         }
      } catch(e) {
         ConfigMnuboUtils.UpdateStatusErrMsg(thisNode,"invalid arguments");
         return;
      }
      owner = myArray[0];
      input = myArray[1];

      
      ConfigMnuboUtils.DebugLog('owner=',owner);
      ConfigMnuboUtils.DebugLog('input=',input);

      if (return_promise==1)
      {
         return client.owners.update(owner, input);
      }
      else
      {
         client.owners.update(owner, input)
         .then(function UpdateOwnerFromSdk_OK(data) { 
            ConfigMnuboUtils.DebugLog(data);
            ConfigMnuboUtils.UpdateStatusResponseOK(thisNode,data);
            msg.payload =  data || "Owner Updated"; 
            thisNode.send(msg);} )
         .catch(function UpdateOwnerFromSdk_ERR(error) { 
            ConfigMnuboUtils.DebugLog(error);
            ConfigMnuboUtils.UpdateStatusResponseError(thisNode,error); 
            msg.payload = error;  
            thisNode.send(msg);} );
      }
      ConfigMnuboUtils.DebugLog('exit');
   }  
   
   //If return_promise is 1, this function will return the promise result
   function DeleteOwnerFromSdk(thisNode, msg, return_promise) {  
      ConfigMnuboUtils.DebugLog();
      return_promise = return_promise || 0;
      
      var client = ConfigMnuboUtils.GetNewMnuboClient(thisNode.mnuboconfig);      
      
      if (return_promise==1)
      {
         return client.owners.create(msg.payload);
      }
      else
      {
         client.owners.delete(msg.payload)
         .then(function DeleteOwnerFromSdk_OK(data) { 
            ConfigMnuboUtils.DebugLog(data);
            ConfigMnuboUtils.UpdateStatusResponseOK(thisNode,data);
            msg.payload =  data || "Owner Deleted"; 
            thisNode.send(msg);} )
         .catch(function DeleteOwnerFromSdk_ERR(error) { 
            ConfigMnuboUtils.DebugLog(error);
            ConfigMnuboUtils.UpdateStatusResponseError(thisNode,error); 
            msg.payload = error;  
            thisNode.send(msg);} );
      }
      ConfigMnuboUtils.DebugLog('exit');
   }  
   
   //If return_promise is 1, this function will return the promise result
   function ClaimOwnerFromSdk(thisNode, msg, return_promise) {  
      ConfigMnuboUtils.DebugLog();
      return_promise = return_promise || 0;
      
      var client = ConfigMnuboUtils.GetNewMnuboClient(thisNode.mnuboconfig);      

      try{
         
         if (typeof(msg.payload) == 'string')
         {
            myString = msg.payload;
         }
         else if (typeof(msg.payload) == 'object')
         {
            myString = JSON.stringify(msg.payload);
         }
         else
         {
            ConfigMnuboUtils.UpdateStatusErrMsg(thisNode,"not a string or object");
            return;
         }
         myArray = JSON.parse(myString);
         if (myArray.length !=2) {
            ConfigMnuboUtils.UpdateStatusErrMsg(thisNode,"bad amount of arguments");
            return;
         }
      } catch(e) {
         ConfigMnuboUtils.UpdateStatusErrMsg(thisNode,"invalid arguments");
         return;
      }
      owner = myArray[0];
      input = myArray[1];      
      
      ConfigMnuboUtils.DebugLog('owner=', owner);
      ConfigMnuboUtils.DebugLog('input=', input);
      if (return_promise==1)
      {
         return client.owners.claim(owner, input);
      }
      else
      {
         client.owners.claim(owner, input)
         .then(function ClaimOwnerFromSdk_OK(data) {
            ConfigMnuboUtils.DebugLog(data);
            ConfigMnuboUtils.UpdateStatusResponseOK(thisNode,data);
            msg.payload =  data || "Owner Claimed"; 
            thisNode.send(msg);} )
         .catch(function ClaimOwnerFromSdk_ERR(error) { 
            ConfigMnuboUtils.DebugLog(error);
            ConfigMnuboUtils.UpdateStatusResponseError(thisNode,error); 
            msg.payload = error;  
            thisNode.send(msg);} );
      }
      ConfigMnuboUtils.DebugLog('exit');
   }  
   
   
   
   function MnuboRequest(thisNode, msg) {
      ConfigMnuboUtils.DebugLog();
      if (thisNode == null || thisNode.mnuboconfig == null || thisNode.mnuboconfig.credentials == null)
      {
         ConfigMnuboUtils.UpdateStatusErrMsg(thisNode,"missing config/credentials");
         ConfigMnuboUtils.DebugLog("missing config/credentials");
         return;
      }
      
      if (msg == null || msg.payload == null || msg.payload == "")
      {
         ConfigMnuboUtils.UpdateStatusErrMsg(thisNode,"missing input");
         ConfigMnuboUtils.DebugLog("missing input");
         return;
      }
      
      if (thisNode.functionselection == "create")
      {
         ConfigMnuboUtils.UpdateStatusLogMsg(thisNode,"create...");
         CreateOwnerFromSdk(thisNode, msg);
      }
      else if (thisNode.functionselection == "update")
      {
         ConfigMnuboUtils.UpdateStatusLogMsg(thisNode,"update...");
         UpdateOwnerFromSdk(thisNode, msg);
      }
      else if (thisNode.functionselection == "delete")
      {
         ConfigMnuboUtils.UpdateStatusLogMsg(thisNode,"delete...");
         DeleteOwnerFromSdk(thisNode, msg);
      }
      else if (thisNode.functionselection == "claim")
      {
         ConfigMnuboUtils.UpdateStatusLogMsg(thisNode,"claim...");
         ClaimOwnerFromSdk(thisNode, msg);
      }
      else
      {
         ConfigMnuboUtils.UpdateStatusErrMsg(thisNode,"unknown function");
         ConfigMnuboUtils.DebugLog("unknown function ["+thisNode.functionselection+"]");
      }
      ConfigMnuboUtils.DebugLog('exit');
   }
   
   
   function MnuboOwners(thisNode) {
      ConfigMnuboUtils.DebugLog();
      
      RED.nodes.createNode(this,thisNode);
      
      this.functionselection = thisNode.functionselection;
      this.inputtext = thisNode.inputtext;
      
      // Retrieve the mnubo config node
      this.mnuboconfig = RED.nodes.getNode(thisNode.mnuboconfig);
      ConfigMnuboUtils.UpdateStatus(this);
      
      this.on('input', function MnuboOwners_input(msg) {
         ConfigMnuboUtils.DebugLog();
         this.mnuboconfig = RED.nodes.getNode(thisNode.mnuboconfig);
         ConfigMnuboUtils.UpdateStatusLogMsg(this, "input ...");
         MnuboRequest(this, msg);         
      });
      
   }
   
   RED.nodes.registerType("Owners", MnuboOwners);
   
   RED.httpAdmin.post("/owners/:id/button", RED.auth.needsPermission("Owners.write"), function mnubo_owners_button(req,res) {
      ConfigMnuboUtils.DebugLog();
      var thisNode = RED.nodes.getNode(req.params.id);
      msg = { payload: thisNode.inputtext };
      
      if (thisNode != null)
      {
         ConfigMnuboUtils.UpdateStatusLogMsg(thisNode, "button input ...");
         MnuboRequest(thisNode, msg);
         res.sendStatus(200);
       }
      else
      {
         res.sendStatus(404);
      }
      
      ConfigMnuboUtils.DebugLog('exit');
   });
}


