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
      var options = {
                  'reportResults': thisNode.reportResults,
                  'objectsMustExist': thisNode.objectsMustExist
      };

      try {
          if (typeof(msg.payload) == 'string') {
             msg.payload = JSON.parse(msg.payload)
          }
      } catch(e) {
         ConfigMnuboUtils.UpdateStatusErrMsg(thisNode,"Input must be a valid JSON");
         return;
      }

      if (return_promise == 1) {
         return client.events.send(msg.payload, options);
      }
      else {
         client.events.send(msg.payload, options)
             .then((result) => {
                ConfigMnuboUtils.CheckMultiStatusResult(thisNode, result, msg.payload);
             })
             .catch((error) => {
                ConfigMnuboUtils.UpdateStatusResponseError(thisNode, error);
                msg.errors = [{'errorMessage': error, 'originalRequest': msg.payload}];
                thisNode.send(msg);
             });
      }
      ConfigMnuboUtils.DebugLog('exit');      
   }  
   
   //If return_promise is 1, this function will return the promise result
   function PostEventFromDeviceFromSdk(thisNode, msg, return_promise) {    
      ConfigMnuboUtils.DebugLog();
      return_promise = return_promise || 0;
      
      var client = ConfigMnuboUtils.GetNewMnuboClient(thisNode.mnuboconfig);
      var options = {
                  'reportResults': thisNode.reportResults,
                  'objectsMustExist': thisNode.objectsMustExist
      }

      try {
          if (typeof(msg.payload) == 'string') {
             msg.payload = JSON.parse(msg.payload);
          }

      } catch(e) {
         ConfigMnuboUtils.UpdateStatusErrMsg(thisNode, "Input must be a valid JSON");
         return;
      }

      if (msg.payload.length != 2) {
         ConfigMnuboUtils.UpdateStatusErrMsg(thisNode,"bad amount of arguments");
         return;
      }
      
      object = msg.payload[0];
      input = msg.payload[1];
      ConfigMnuboUtils.DebugLog('object: ', object);
      ConfigMnuboUtils.DebugLog('input: ', input);
      
      if (return_promise == 1) {
         return client.events.sendFromDevice(object, input, options);
      }
      else {
         client.events.sendFromDevice(object, input, options)
         .then((result) => {
            ConfigMnuboUtils.CheckMultiStatusResult(thisNode, result, input)
         })
         .catch((error) => {
            ConfigMnuboUtils.DebugLog(error);
            ConfigMnuboUtils.UpdateStatusResponseError(thisNode,error); 
            msg.errors = [{'errorMessage': error, 'originalRequest': msg.payload}];
            thisNode.send(msg);
         });
      }
      ConfigMnuboUtils.DebugLog('exit');
   }  
   
   function MnuboRequest(thisNode, msg) { 
      ConfigMnuboUtils.DebugLog();

      if (thisNode == null || thisNode.mnuboconfig == null || thisNode.mnuboconfig.credentials == null) {
         ConfigMnuboUtils.UpdateStatusErrMsg(thisNode,"missing config/credentials");
         return;
      }
      
      if (msg == null || msg.payload == null || msg.payload == "") {
         ConfigMnuboUtils.UpdateStatusErrMsg(thisNode,"missing input");
         return;
      }
      
      if (thisNode.functionselection == "send") {
         ConfigMnuboUtils.UpdateStatusLogMsg(thisNode, "Send...");
         PostEventFromSdk(thisNode, msg);
      } else if (thisNode.functionselection == "sendfromdevice") {
         ConfigMnuboUtils.UpdateStatusLogMsg(thisNode,"SendFromDevice...");
         PostEventFromDeviceFromSdk(thisNode, msg);
      } else {
         ConfigMnuboUtils.UpdateStatusErrMsg(thisNode,"unknown function");
      }

      ConfigMnuboUtils.DebugLog('exit');
   }
   
   
   function MnuboEvents(thisNode) {
      ConfigMnuboUtils.DebugLog();
      RED.nodes.createNode(this, thisNode);
      
      this.functionselection = thisNode.functionselection;
      this.inputtext = thisNode.inputtext;
      this.reportResults = thisNode.reportResults;
      this.objectsMustExist = thisNode.objectsMustExist;
      
      // Retrieve the mnubo config node
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
      ConfigMnuboUtils.DebugLog("Button Input - RED.httpAdmin.post");
      var thisNode = RED.nodes.getNode(req.params.id);
      msg = { payload: thisNode.inputtext };
      
      if (thisNode != null) {
         ConfigMnuboUtils.UpdateStatusLogMsg(thisNode, "button input ...");
         MnuboRequest(thisNode, msg);
         res.sendStatus(200);
      } else {
         res.sendStatus(404);
      }
      
      ConfigMnuboUtils.DebugLog('Button Input - RED.httpAdmin.post exit');
   });
}
