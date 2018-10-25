module.exports = function(RED) {
   
   //mnubo-sdk
   var mnubo = require('mnubo-sdk');
   var ConfigMnuboUtils = require('../config/mnubo-utils');
   
   
   //If return_promise is 1, this function will return the promise result
   function CreateOwnerFromSdk(thisNode, msg, return_promise) {    
      ConfigMnuboUtils.DebugLog();
      return_promise = return_promise || 0;
      
      var client = ConfigMnuboUtils.GetNewMnuboClient(thisNode.mnuboconfig);      
      try {
          if (typeof(msg.payload) == 'string') {
             msg.payload = JSON.parse(msg.payload)
          }
      } catch(e) {
         ConfigMnuboUtils.UpdateStatusErrMsg(thisNode,"Input must be a valid JSON");
         return;
      }

      if (return_promise == 1) {
         if (msg.payload.length > 0) {  // Bulk creation
            return client.owners.createUpdate(msg.payload);  
         } else {                       // Single creation
            return client.owners.create(msg.payload);  
         }
      }
      else {
         if (msg.payload.length > 0) { // Bulk creation
            client.owners.createUpdate(msg.payload)  
              .then((result) => {
                 ConfigMnuboUtils.CheckMultiStatusResult(thisNode, result, msg.payload)
              })
              .catch((error) => {
                 ConfigMnuboUtils.UpdateStatusResponseError(thisNode, error);
                 msg.errors = [{'errorMessage': error, 'originalRequest': msg.payload}];
                 thisNode.send(msg);
              });
         } else {                   // Single creation
             client.owners.create(msg.payload)  
               .then((result) => {
                  ConfigMnuboUtils.DebugLog(result);
                  ConfigMnuboUtils.UpdateStatusResponseOK(thisNode, result);
                  msg.payload = result;
                  thisNode.send(msg);
               })
               .catch((error) => {
                  ConfigMnuboUtils.DebugLog(error);
                  ConfigMnuboUtils.UpdateStatusResponseError(thisNode, error);
                  msg.errors = [{'errorMessage': error, 'originalRequest': msg.payload}];
                  thisNode.send(msg);
               });
         }
      }
       ConfigMnuboUtils.DebugLog('exit');
   }  
   
   //If return_promise is 1, this function will return the promise result
   function UpdateOwnerFromSdk(thisNode, msg, return_promise) {  
      ConfigMnuboUtils.DebugLog();
      return_promise = return_promise || 0;
      
      var client = ConfigMnuboUtils.GetNewMnuboClient(thisNode.mnuboconfig);      
      
      try {
          if (typeof(msg.payload) == 'string') {
             msg.payload = JSON.parse(msg.payload)
          }
      } catch(e) {
         ConfigMnuboUtils.UpdateStatusErrMsg(thisNode,"Input must be a valid JSON");
         return;
      }

      if (typeof(msg.payload[0]) == 'string') { //[username, body] Update a single Object
        if (msg.payload.length == 2) {
            var owner = msg.payload[0];
            var input = msg.payload[1];

            ConfigMnuboUtils.DebugLog('owner: ', typeof(owner));
            ConfigMnuboUtils.DebugLog('input: ',  typeof(input));

            if (return_promise == 1) {
               return client.owners.update(owner, input);
            } else {
               client.owners.update(owner, input)
                 .then((result) => {
                    ConfigMnuboUtils.UpdateStatusResponseOK(thisNode, result);
                    msg.payload =  result || "Owner Updated";
                    thisNode.send(msg);
                 })
                 .catch((error) => {
                    ConfigMnuboUtils.UpdateStatusResponseError(thisNode,error);
                    msg.errors = [{'errorMessage': error, 'originalRequest': msg.payload}];
                    thisNode.send(msg);
                 });
            }
        } else {
              ConfigMnuboUtils.UpdateStatusErrMsg(thisNode,"bad amount of arguments");
              return;
        }
      } else {          //[body] Batch Update
          if (return_promise == 1) {
            return client.owners.createUpdate(msg.payload)
          } else {
              client.owners.createUpdate(msg.payload)
                .then((result) => {
                   ConfigMnuboUtils.CheckMultiStatusResult(thisNode, result, msg.payload)
                })
                .catch((error) => {
                   ConfigMnuboUtils.UpdateStatusResponseError(thisNode, error);
                   msg.errors = [{'errorMessage': error, 'originalRequest': msg.payload}];
                   thisNode.send(msg);
                });
          }
      }
      ConfigMnuboUtils.DebugLog('exit');
   }  
   
   //If return_promise is 1, this function will return the promise result
   function DeleteOwnerFromSdk(thisNode, msg, return_promise) {  
      ConfigMnuboUtils.DebugLog();
      return_promise = return_promise || 0;
      
      var client = ConfigMnuboUtils.GetNewMnuboClient(thisNode.mnuboconfig);      
      
      if (return_promise == 1) {
         return client.owners.delete(msg.payload);
      } else {
         client.owners.delete(msg.payload)
         .then((result) => {
            ConfigMnuboUtils.DebugLog(result);
            ConfigMnuboUtils.UpdateStatusResponseOK(thisNode, result);
            msg.payload =  result || "Owner Deleted";
            thisNode.send(msg);
         })
         .catch((error) => {
            ConfigMnuboUtils.DebugLog(error);
            ConfigMnuboUtils.UpdateStatusResponseError(thisNode, error);
            msg.errors = [{'errorMessage': error, 'originalRequest': msg.payload}];
            thisNode.send(msg);
         });
      }
      ConfigMnuboUtils.DebugLog('exit');
   }  
   
   //If return_promise is 1, this function will return the promise result
   function ClaimOrUnClaimOwnerFromSdk(thisNode, msg, action, return_promise) {
      ConfigMnuboUtils.DebugLog();
      return_promise = return_promise || 0;
      
      var client = ConfigMnuboUtils.GetNewMnuboClient(thisNode.mnuboconfig);      

      try {
          if (typeof(msg.payload) == 'string') {
             msg.payload = JSON.parse(msg.payload)
          }
      } catch(e) {
         ConfigMnuboUtils.UpdateStatusErrMsg(thisNode,"Input must be a valid JSON");
         return;
      }

      if (msg.payload.every(el => typeof(el) == 'string')) {  //[username, deviceid] Single Claim/ UnClaim
        if (msg.payload.length == 2) {
            var owner = msg.payload[0];
            var object_id = msg.payload[1];
            ConfigMnuboUtils.DebugLog('owner: ', owner);
            ConfigMnuboUtils.DebugLog('object_id: ',  object_id);

            if (return_promise == 1) {
               if (action == "claim") {     // CLAIM
                  return client.owners.claim(owner, object_id);
               } else {     // unCLAIM
                  return client.owners.unclaim(owner, object_id);
               }
            } else {
               if (action == "claim") {  // CLAIM
                   client.owners.claim(owner, object_id)
                   .then((result) => {
                      ConfigMnuboUtils.DebugLog(result);
                      ConfigMnuboUtils.UpdateStatusResponseOK(thisNode, result);
                      msg.payload =  result || "Owner Claimed";
                      thisNode.send(msg);
                   })
                   .catch((error) => {
                      ConfigMnuboUtils.DebugLog(error);
                      ConfigMnuboUtils.UpdateStatusResponseError(thisNode, error);
                      msg.errors = [{'errorMessage': error, 'originalRequest': msg.payload}];
                      thisNode.send(msg);
                   });
               } else {         // unCLAIM
                   client.owners.unclaim(owner, object_id)
                   .then((result) => {
                      ConfigMnuboUtils.DebugLog(result);
                      ConfigMnuboUtils.UpdateStatusResponseOK(thisNode, result);
                      msg.payload =  result || "Owner UnClaimed";
                      thisNode.send(msg);
                   })
                   .catch((error) => {
                      ConfigMnuboUtils.DebugLog(error);
                      ConfigMnuboUtils.UpdateStatusResponseError(thisNode, error);
                      msg.errors = [{'errorMessage': error, 'originalRequest': msg.payload}];
                      thisNode.send(msg);
                   });
               }
            }
        } else {
              ConfigMnuboUtils.UpdateStatusErrMsg(thisNode,"bad amount of arguments");
              return;
        }
      } else {          //[body] Batch Claim/ UnClaim
          if (return_promise == 1) {
            if (action == "claim") {    // CLAIM
               return client.owners.batchClaim(msg.payload);
            } else {        // unCLAIM
               return client.owners.batchUnclaim(msg.payload);
            }
          } else {
              if (action == "claim") {      // CLAIM
                  client.owners.batchClaim(msg.payload)
                    .then((result) => {
                       ConfigMnuboUtils.CheckMultiStatusResult(thisNode, result, msg.payload)
                    })
                    .catch((error) => {
                       ConfigMnuboUtils.UpdateStatusResponseError(thisNode, error);
                       msg.errors = [{'errorMessage': error, 'originalRequest': msg.payload}];
                       thisNode.send(msg);
                    });
              } else {      // unCLAIM
                  client.owners.batchUnclaim(msg.payload)
                    .then((result) => {
                       ConfigMnuboUtils.CheckMultiStatusResult(thisNode, result, msg.payload)
                    })
                    .catch((error) => {
                       ConfigMnuboUtils.UpdateStatusResponseError(thisNode, error);
                       msg.errors = [{'errorMessage': error, 'originalRequest': msg.payload}];
                       thisNode.send(msg);
                    });
              }
          }
      }
      ConfigMnuboUtils.DebugLog('exit');
   }

   //If return_promise is 1, this function will return the promise result
  function ExistOwnerFromSdk(thisNode, msg, return_promise) {
     ConfigMnuboUtils.DebugLog();
     return_promise = return_promise || 0;

     var client = ConfigMnuboUtils.GetNewMnuboClient(thisNode.mnuboconfig);

     try {
         if (typeof msg.payload == 'string') {
            msg.payload = msg.payload.replace(/'/g, '"');
            if (msg.payload.indexOf("\"") > -1) {
               msg.payload = JSON.parse(msg.payload);
            }
         }

     } catch(e) {
        ConfigMnuboUtils.UpdateStatusErrMsg(thisNode,"invalid arguments");
        return;
     }

     if (return_promise == 1) {
        return client.owners.exists(msg.payload);
     } else {
        client.owners.exists(msg.payload)
        .then((result) => {
           ConfigMnuboUtils.UpdateStatusResponseOK(thisNode, result);
           msg.payload =  result;
           thisNode.send(msg);
        })
        .catch((error) => {
           ConfigMnuboUtils.DebugLog(error);
           ConfigMnuboUtils.UpdateStatusResponseError(thisNode, error);
           msg.errors = [{'errorMessage': error, 'originalRequest': msg.payload}];
           thisNode.send(msg);} );
     }
     ConfigMnuboUtils.DebugLog('exit');
  }
   
   
   
   function MnuboRequest(thisNode, msg) {
      ConfigMnuboUtils.DebugLog();
      if (thisNode == null || thisNode.mnuboconfig == null || thisNode.mnuboconfig.credentials == null) {
         ConfigMnuboUtils.UpdateStatusErrMsg(thisNode,"missing config/credentials");
         ConfigMnuboUtils.DebugLog("missing config/credentials");
         return;
      }
      
      if (msg == null || msg.payload == null || msg.payload == "") {
         ConfigMnuboUtils.UpdateStatusErrMsg(thisNode,"missing input");
         ConfigMnuboUtils.DebugLog("missing input");
         return;
      }
      
      if (thisNode.functionselection == "create") {
         ConfigMnuboUtils.UpdateStatusLogMsg(thisNode,"create...");
         CreateOwnerFromSdk(thisNode, msg);
      }
      else if (thisNode.functionselection == "update") {
         ConfigMnuboUtils.UpdateStatusLogMsg(thisNode,"update...");
         UpdateOwnerFromSdk(thisNode, msg);
      }
      else if (thisNode.functionselection == "delete") {
         ConfigMnuboUtils.UpdateStatusLogMsg(thisNode,"delete...");
         DeleteOwnerFromSdk(thisNode, msg);
      }
      else if (thisNode.functionselection == "claim") {
         ConfigMnuboUtils.UpdateStatusLogMsg(thisNode,"claim...");
         ClaimOrUnClaimOwnerFromSdk(thisNode, msg, "claim");
      }
      else if (thisNode.functionselection == "unclaim") {
         ConfigMnuboUtils.UpdateStatusLogMsg(thisNode,"unclaim...");
         ClaimOrUnClaimOwnerFromSdk(thisNode, msg, "unclaim");
      }
      else if (thisNode.functionselection == "exists") {
         ConfigMnuboUtils.UpdateStatusLogMsg(thisNode,"checking...");
         ExistOwnerFromSdk(thisNode, msg);
      }
      else {
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
   
   RED.nodes.registerType("mnubo owners", MnuboOwners);
   
   RED.httpAdmin.post("/owners/:id/button", RED.auth.needsPermission("mnubo owners.write"), function mnubo_owners_button(req,res) {
      ConfigMnuboUtils.DebugLog();
      var thisNode = RED.nodes.getNode(req.params.id);
      msg = { payload: thisNode.inputtext };
      
      if (thisNode != null) {
         ConfigMnuboUtils.UpdateStatusLogMsg(thisNode, "button input ...");
         MnuboRequest(thisNode, msg);
         res.sendStatus(200);
      } else {
         res.sendStatus(404);
      }
      
      ConfigMnuboUtils.DebugLog('exit');
   });
}


