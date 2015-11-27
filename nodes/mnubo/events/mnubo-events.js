module.exports = function(RED) {
   
   //mnubo-sdk
   require('es6-shim'); /* only if running node < 4.0.0 */
   var mnubo = require('mnubo-sdk');
   var ConfigMnuboUtils = require('../config/mnubo-utils');
   
   
   
   
   //If return_promise is 1, this function will return the promise result
   function PostEventFromSdk(thisNode, msg, return_promise) {    
      //console.log('PostEventFromSdk');
      return_promise = return_promise || 0;
      
      var client = new mnubo.Client({
         id: thisNode.mnuboconfig.credentials.id,
         secret: thisNode.mnuboconfig.credentials.secret,
         env: thisNode.mnuboconfig.env
      });
      
      //console.log('msg.payload=',msg.payload);
      if (return_promise==1)
      {
         return client.events.send(msg.payload);
      }
      else
      {
         client.events.send(msg.payload)
         .then(function(data) { 
            ConfigMnuboUtils.UpdateStatusResponseOK(thisNode,data);
            msg.payload =  data || "Event Sent"; 
            thisNode.send(msg);} )
         .catch(function(error) { 
            ConfigMnuboUtils.UpdateStatusResponseError(thisNode,error); 
            msg.payload = error;  
            thisNode.send(msg);} );
      }
      
   }  
   
   //If return_promise is 1, this function will return the promise result
   function PostEventFromDeviceFromSdk(thisNode, msg, return_promise) {    
      //console.log('PostEventFromDeviceFromSdk');
      return_promise = return_promise || 0;
      
      var client = new mnubo.Client({
         id: thisNode.mnuboconfig.credentials.id,
         secret: thisNode.mnuboconfig.credentials.secret,
         env: thisNode.mnuboconfig.env
      });
      
      var object = msg.payload.substr(0,msg.payload.indexOf(','));
      var input = msg.payload.substr(msg.payload.indexOf(",")+1);
      //console.log('object=',object);
      //console.log('input=',input);
      if (return_promise==1)
      {
         return client.events.sendFromDevice(object, input);
      }
      else
      {
         client.events.sendFromDevice(object, input)
         .then(function(data) { 
            ConfigMnuboUtils.UpdateStatusResponseOK(thisNode,data);
            msg.payload =  data || "Device Event Sent"; 
            thisNode.send(msg);} )
         .catch(function(error) { 
            ConfigMnuboUtils.UpdateStatusResponseError(thisNode,error); 
            msg.payload = error;  
            thisNode.send(msg);} );
      }
      
   }  
   
   function MnuboRequest(thisNode, msg) { 
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
   }
   
   
   function MnuboEvents(thisNode) {
      //console.log('MnuboEvents');
      RED.nodes.createNode(this,thisNode);
      
      this.functionselection = thisNode.functionselection;
      this.inputtext = thisNode.inputtext;
      
      // Retrieve the mnubo-credential config node
      this.mnuboconfig = RED.nodes.getNode(thisNode.mnuboconfig);
      ConfigMnuboUtils.UpdateStatus(this);
      
      this.on('input', function(msg) {
         this.mnuboconfig = RED.nodes.getNode(thisNode.mnuboconfig);
         MnuboRequest(this, msg);         
      });
      
   }
   
   
   RED.nodes.registerType("mnubo events", MnuboEvents);
   
   RED.httpAdmin.post("/events/:id/button", RED.auth.needsPermission("mnubo events.write"), function(req,res) {
      var thisNode = RED.nodes.getNode(req.params.id);
      //console.log('thisNode=',thisNode);
      msg = { payload: thisNode.inputtext };
      MnuboRequest(thisNode, msg);
   });
}
