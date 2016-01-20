module.exports = function(RED) {
   
   //mnubo-sdk
   require('es6-shim'); /* only if running node < 4.0.0 */
   var mnubo = require('mnubo-sdk');
   var ConfigMnuboUtils = require('../config/mnubo-utils');
   
   
   
   
   //If return_promise is 1, this function will return the promise result
   function PostEventFromSdk(thisNode, msg, return_promise) {    
      ConfigMnuboUtils.DebugLog();
      return_promise = return_promise || 0;
      
      var client = ConfigMnuboUtils.GetNewMnuboClient(thisNode.mnuboconfig);      
      
      //console.log('msg.payload=',msg.payload);
      if (return_promise==1)
      {
         return client.events.send(msg.payload);
      }
      else
      {
         client.events.send(msg.payload)
         .then(function PostEventFromSdk_OK(data) { 
            ConfigMnuboUtils.DebugLog(data);
            ConfigMnuboUtils.UpdateStatusResponseOK(thisNode,data);
            msg.payload =  data || "Event Sent"; 
            thisNode.send(msg);} )
         .catch(function PostEventFromSdk_ERR(error) { 
            ConfigMnuboUtils.DebugLog(error);
            ConfigMnuboUtils.UpdateStatusResponseError(thisNode,error); 
            msg.payload = error;  
            thisNode.send(msg);} );
      }
      ConfigMnuboUtils.DebugLog('exit');      
   }  
   
   //If return_promise is 1, this function will return the promise result
   function PostEventFromDeviceFromSdk(thisNode, msg, return_promise) {    
      ConfigMnuboUtils.DebugLog();
      return_promise = return_promise || 0;
      
      var client = ConfigMnuboUtils.GetNewMnuboClient(thisNode.mnuboconfig);      
      
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
         return client.events.sendFromDevice(object, input);
      }
      else
      {
         client.events.sendFromDevice(object, input)
         .then(function PostEventFromDeviceFromSdk_OK(data) { 
            ConfigMnuboUtils.DebugLog(data);
            ConfigMnuboUtils.UpdateStatusResponseOK(thisNode,data);
            msg.payload =  data || "Device Event Sent"; 
            thisNode.send(msg);} )
         .catch(function PostEventFromDeviceFromSdk_ERR(error) { 
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
      
      if (thisNode.functionselection == "send")
      {
         ConfigMnuboUtils.UpdateStatusLogMsg(thisNode,"Send...");
         PostEventFromSdk(thisNode, msg);
      }
      else if (thisNode.functionselection == "sendfromdevice")
      {
         ConfigMnuboUtils.UpdateStatusLogMsg(thisNode,"SendFromDevice...");
         PostEventFromDeviceFromSdk(thisNode, msg);
      }
      else
      {
         ConfigMnuboUtils.UpdateStatusErrMsg(thisNode,"unknown function");
      }
      ConfigMnuboUtils.DebugLog('exit');
   }
   
   
   function MnuboEvents(thisNode) {
      ConfigMnuboUtils.DebugLog();
      RED.nodes.createNode(this,thisNode);
      
      this.functionselection = thisNode.functionselection;
      this.inputtext = thisNode.inputtext;
      
      // Retrieve the mnubol config node
      this.mnuboconfig = RED.nodes.getNode(thisNode.mnuboconfig);
      ConfigMnuboUtils.UpdateStatus(this);
      
      this.on('input', function(msg) {
         this.mnuboconfig = RED.nodes.getNode(thisNode.mnuboconfig);
         ConfigMnuboUtils.UpdateStatusLogMsg(this, "input ...");
         MnuboRequest(this, msg);         
      });
      
   }
   
   
   RED.nodes.registerType("mnubo events", MnuboEvents);
   
   RED.httpAdmin.post("/events/:id/button", RED.auth.needsPermission("mnubo events.write"), function(req,res) {
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
