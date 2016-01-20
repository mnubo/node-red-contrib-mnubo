module.exports = function(RED) {
   //"use strict";

   //mnubo-sdk
   require('es6-shim'); /* only if running node < 4.0.0 */
   var mnubo = require('mnubo-sdk');
   var ConfigMnuboUtils = require('../config/mnubo-utils');
   
   
   //If return_promise is 1, this function will return the promise result
   function CreateObjectFromSdk(thisNode, msg, return_promise) {    
      ConfigMnuboUtils.DebugLog();

      return_promise = return_promise || 0;
      
      var client = ConfigMnuboUtils.GetNewMnuboClient(thisNode.mnuboconfig);      
      
      if (return_promise==1)
      {
         return client.objects.create(msg.payload);
      }
      else
      {
         client.objects.create(msg.payload)
         .then(function CreateObjectFromSdk_OK(data) { 
            ConfigMnuboUtils.DebugLog(data);
            ConfigMnuboUtils.UpdateStatusResponseOK(thisNode,data);
            msg.payload = data; 
            thisNode.send(msg);} )
         .catch(function CreateObjectFromSdk_ERR(error) { 
            ConfigMnuboUtils.DebugLog(error);
            ConfigMnuboUtils.UpdateStatusResponseError(thisNode,error); 
            msg.payload = error;  
            thisNode.send(msg);} );
      }
      ConfigMnuboUtils.DebugLog('exit');      
   }  
   
   //If return_promise is 1, this function will return the promise result
   function UpdateObjectFromSdk(thisNode, msg, return_promise) {  
      ConfigMnuboUtils.DebugLog();
      return_promise = return_promise || 0;
      
      var client = ConfigMnuboUtils.GetNewMnuboClient(thisNode.mnuboconfig);      
            
      //var object = msg.payload.substr(0,msg.payload.indexOf(','));
      //var input = msg.payload.substr(msg.payload.indexOf(",")+1);

      //ConfigMnuboUtils.DebugLog("msg.payload=",msg.payload);    
      //ConfigMnuboUtils.DebugLog("typeof(msg.payload)=",typeof(msg.payload));    
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

      object = myArray[0];
      input = myArray[1];

      ConfigMnuboUtils.DebugLog('object=',object);
      ConfigMnuboUtils.DebugLog('input=',input);

      if (return_promise==1)
      {
         return client.objects.update(object, input);
      }
      else
      {
         client.objects.update(object, input)
         .then(function UpdateObjectFromSdk_OK(data) { 
            ConfigMnuboUtils.DebugLog(data);
            ConfigMnuboUtils.UpdateStatusResponseOK(thisNode,data);
            msg.payload =  data || "Object Updated"; 
            thisNode.send(msg);} )
         .catch(function UpdateObjectFromSdk_ERR(error) { 
            ConfigMnuboUtils.DebugLog(error);
            ConfigMnuboUtils.UpdateStatusResponseError(thisNode,error); 
            msg.payload = error;  
            thisNode.send(msg);} );
      }
      ConfigMnuboUtils.DebugLog('exit');
   }  
   
   //If return_promise is 1, this function will return the promise result
   function DeleteObjectFromSdk(thisNode, msg, return_promise) {  
      ConfigMnuboUtils.DebugLog();
      return_promise = return_promise || 0;
      
      var client = ConfigMnuboUtils.GetNewMnuboClient(thisNode.mnuboconfig);      
            
      if (return_promise==1)
      {
         return client.objects.create(msg.payload);
      }
      else
      {
         client.objects.delete(msg.payload)
         .then(function DeleteObjectFromSdk_OK(data) { 
            ConfigMnuboUtils.DebugLog(data);
            ConfigMnuboUtils.UpdateStatusResponseOK(thisNode,data);
            msg.payload =  data || "Object Deleted"; 
            thisNode.send(msg);} )
         .catch(function DeleteObjectFromSdk_ERR(error) { 
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
         return;
      }
      
      if (msg == null || msg.payload == null || msg.payload == "")
      {
         ConfigMnuboUtils.UpdateStatusErrMsg(thisNode,"missing input");
         return;
      }
      
      
      if (thisNode.functionselection == "create")
      {
         ConfigMnuboUtils.UpdateStatusLogMsg(thisNode,"create...");
         CreateObjectFromSdk(thisNode, msg);
      }
      else if (thisNode.functionselection == "update")
      {
         ConfigMnuboUtils.UpdateStatusLogMsg(thisNode,"update...");
         UpdateObjectFromSdk(thisNode, msg);
      }
      else if (thisNode.functionselection == "delete")
      {
         ConfigMnuboUtils.UpdateStatusLogMsg(thisNode,"delete...");
         DeleteObjectFromSdk(thisNode, msg);
      }
      else
      {
         ConfigMnuboUtils.UpdateStatusErrMsg(thisNode,"unknown function");
      }
      ConfigMnuboUtils.DebugLog('exit');
   }
   
   
   function MnuboObjects(thisNode) {
      RED.nodes.createNode(this,thisNode);
      
      this.functionselection = thisNode.functionselection;
      this.inputtext = thisNode.inputtext;
      
      
      // Retrieve the mnubo config node
      this.mnuboconfig = RED.nodes.getNode(thisNode.mnuboconfig);
      ConfigMnuboUtils.UpdateStatus(this);
      
      this.on('input', function(msg) {
         this.mnuboconfig = RED.nodes.getNode(thisNode.mnuboconfig);
         ConfigMnuboUtils.UpdateStatusLogMsg(this, "input ...");
         MnuboRequest(this, msg);         
      });
      
   }
   
   
   RED.nodes.registerType("mnubo objects", MnuboObjects);

   RED.httpAdmin.post("/objects/:id/button", RED.auth.needsPermission("mnubo objects.write"), function(req,res) {
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
