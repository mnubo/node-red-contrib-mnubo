module.exports = function(RED) {
   
   //mnubo-sdk
   var mnubo = require('mnubo-sdk');
   var ConfigMnuboUtils = require('../config/mnubo-utils');

   
   //If return_promise is 1, this function will return the promise result
   function GetDataModel(thisNode, msg, return_promise) {   
      ConfigMnuboUtils.DebugLog();
      return_promise = return_promise || 0;
      
      if (thisNode == null || thisNode.mnuboconfig == null || thisNode.mnuboconfig.credentials == null) {
         ConfigMnuboUtils.UpdateStatusErrMsg(thisNode, "missing config/credentials");
         return;
      }
      var client = ConfigMnuboUtils.GetNewMnuboClient(thisNode.mnuboconfig);
      if (return_promise == 1) {
         return client.model.export();
      } else {
         client.model.export()
         .then(function GetModelFromSdk_OK(data) { 
            ConfigMnuboUtils.DebugLog(data);
            ConfigMnuboUtils.UpdateStatusResponseOK(thisNode,data);
            msg.payload = data; 
            thisNode.send(msg);} )
         .catch(function GetModelFromSdk_ERR(error) { 
            ConfigMnuboUtils.DebugLog(error?error.toString():'error');
            ConfigMnuboUtils.UpdateStatusResponseError(thisNode, error);
            msg.payload = "failed";
            msg.errors = {'errorMessage': error?error:'error', 'originalRequest': {"acction": "Get Data Model", "mnuboconfig": thisNode.mnuboconfig}};
            thisNode.send(msg);} );
      }
      ConfigMnuboUtils.DebugLog('exit');
   }

   function getDataModelElements (data) {
      var object_types = [];
      var object_attributes = [];
      var event_types = [];
      var timeseries = []; 
      var owner_attributes = [];

      if (data.hasOwnProperty('objectTypes') && data.objectTypes.length > 0) {
         data.objectTypes.map( (objectType) => {
            object_types.push({
               "key": objectType.key,
               "displayName": objectType.displayName? objectType.displayName : "",
               "description": objectType.description? objectType.description : "",
            })

            if (objectType.hasOwnProperty('objectAttributes')) {
               objectType.objectAttributes.map( (object_attribute) => {
                  if (!object_attributes.find( attribute => attribute.key === object_attribute.key)) {
                     object_attributes.push({
                        "key": object_attribute.key,
                        "displayName": object_attribute.displayName,
                        "description": object_attribute.description,
                        "type": object_attribute.type,
                        "objectTypeKeys": [objectType.key]
                     })
                  } else {
                     object_attributes.find( attribute => attribute.key === object_attribute.key).objectTypeKeys.push(objectType.key)
                  }
               })
            }
         })
      }

      if (data.hasOwnProperty('eventTypes') && data.eventTypes.length > 0) {
         data.eventTypes.map( (eventType) => {
            event_types.push({
               "key": eventType.key,
               "displayName": eventType.displayName? eventType.displayName : "",
               "description": eventType.description? eventType.description : "",
               "origin": eventType.origin,
            })

            if (eventType.hasOwnProperty('timeseries')) {
               eventType.timeseries.map( (ts) => {
                  if (!timeseries.find( timeseries => timeseries.key === ts.key)) {
                     timeseries.push({
                        "key": ts.key,
                        "displayName": ts.displayName? ts.displayName : "",
                        "description": ts.description? description: "",
                        "type": ts.type,
                        "eventTypeKeys": [eventType.key]
                     })
                  } else {
                     timeseries.find( timeseries => timeseries.key === ts.key).eventTypeKeys.push(eventType.key)
                  }
               })
            }
         })
      }

      if (data.hasOwnProperty('ownerAttributes') && data.ownerAttributes.length > 0) {
         owner_attributes = data.ownerAttributes;
      }
      return {
         "event_types": event_types,
         "timeseries": timeseries,
         "object_types": object_types,
         "object_attributes": object_attributes,
         "owner_attributes": owner_attributes,
      }
   }

   function CreateUpdateDataModel(thisNode, msg) {      
      ConfigMnuboUtils.DebugLog();

      if (thisNode == null || thisNode.mnuboconfig == null || thisNode.mnuboconfig.credentials == null) {
         ConfigMnuboUtils.UpdateStatusErrMsg(thisNode, "missing config/credentials");
         return;
      }
      if (msg == null || msg.payload == null || msg.payload == "") {
         ConfigMnuboUtils.UpdateStatusErrMsg(thisNode, "missing input query");
         return;
      }
      
      try {
          if (typeof(msg.payload) === 'string') {
             msg.payload = JSON.parse(msg.payload)
          }
      } catch(e) {
         ConfigMnuboUtils.UpdateStatusErrMsg(thisNode, "Input must be a valid JSON");
         return;
      }

      var client = ConfigMnuboUtils.GetNewMnuboClient(thisNode.mnuboconfig);
      data_model = getDataModelElements(msg.payload)

      let new_event_types;
      let new_object_types;
      let new_timeseries;
      let new_object_attributes;
      let new_owner_attributes;

      if (data_model.event_types.length > 0 || data_model.object_types.length > 0) {
         client.model.export()
            .then( (currentDataModel) => { 
               ConfigMnuboUtils.DebugLog({"currentDataModel": currentDataModel});
               current_data_model = getDataModelElements(currentDataModel)
               
               new_event_types = data_model.event_types.filter(item => !current_data_model.event_types.some(other => item.key === other.key));
               new_object_types = data_model.object_types.filter(item => !current_data_model.object_types.some(other => item.key === other.key));
               new_timeseries = data_model.timeseries.filter(item => !current_data_model.timeseries.some(other => item.key === other.key));
               new_object_attributes = data_model.object_attributes.filter(item => !current_data_model.object_attributes.some(other => item.key === other.key));
               new_owner_attributes = data_model.owner_attributes.filter(item => !current_data_model.owner_attributes.some(other => item.key === other.key));
               
               const promises = []
               if (new_event_types.length > 0) {
                  promises.push(client.model.sandboxOps.eventTypesOps.create(new_event_types))
               }
               if (new_object_types.length > 0) {
                  promises.push(client.model.sandboxOps.objectTypesOps.create(new_object_types))
               }
               return Promise.all(promises)
            })
            .then( (data) => {
               data = (data.filter(function(e){ return e === 0 || e }).length > 0)? (a.filter(function(e){ return e === 0 || e })) : "OK"
               ConfigMnuboUtils.DebugLog({"evt_obj_type_created": data});

               const promises = []
               if (new_timeseries.length > 0) {
                  promises.push(client.model.sandboxOps.timeseriesOps.create(new_timeseries))
               }
               if (new_object_attributes.length > 0) {
                  promises.push(client.model.sandboxOps.objectAttributesOps.create(new_object_attributes))
               }
               if (new_owner_attributes.length > 0) {
                  promises.push(client.model.sandboxOps.ownerAttributesOps.create(new_owner_attributes))
               }
               return Promise.all(promises)               
            })
            .then( (data) => {
               data = (data.filter(function(e){ return e === 0 || e }).length > 0)? (a.filter(function(e){ return e === 0 || e })) : "OK"
               ConfigMnuboUtils.DebugLog({"ts_obj_own_attr_created": data});
               ConfigMnuboUtils.UpdateStatusResponseOK(thisNode, data);
               msg.payload = data;
               thisNode.send(msg)
            })
            .catch( (error) => { 
               ConfigMnuboUtils.DebugLog({"error": error?error.toString():'error'});
               ConfigMnuboUtils.UpdateStatusResponseError(thisNode, error);
               msg.errors = {'errorMessage': error?error:'error', 'originalRequest': msg.payload};
               thisNode.send(msg);
            });
      }

   }

   function PromoteDataModel(thisNode, msg, return_promise) {   
      ConfigMnuboUtils.DebugLog();

      if (thisNode == null || thisNode.mnuboconfig == null || thisNode.mnuboconfig.credentials == null) {
         ConfigMnuboUtils.UpdateStatusErrMsg(thisNode, "missing config/credentials");
         return;
      }
      if (msg == null || msg.payload == null || msg.payload == "") {
         ConfigMnuboUtils.UpdateStatusErrMsg(thisNode, "missing input query");
         return;
      }
      try {
          if (typeof(msg.payload) === 'string') {
             msg.payload = JSON.parse(msg.payload)
          }
      } catch(e) {
         ConfigMnuboUtils.UpdateStatusErrMsg(thisNode, "Input must be a valid JSON");
         return;
      }

      let elements_to_deploy = [];
      if (msg.payload.hasOwnProperty('timeseries') &&  msg.payload.timeseries.length > 0) {
         elements_to_deploy = elements_to_deploy.concat(msg.payload.timeseries.map( el => { return {"type": "timeseries", "name": el }}))
      }
      if (msg.payload.hasOwnProperty('objectAttributes') &&  msg.payload.objectAttributes.length > 0) {
         elements_to_deploy = elements_to_deploy.concat(msg.payload.objectAttributes.map( el => { return {"type": "object_attribute", "name": el }}))
      }
      if (msg.payload.hasOwnProperty('ownerAttributes') &&  msg.payload.ownerAttributes.length > 0) {
         elements_to_deploy = elements_to_deploy.concat(msg.payload.ownerAttributes.map( el => { return {"type": "owner_attribute", "name": el }}))
      }

      deployElements(elements_to_deploy, thisNode, msg)
   }

   const model = {
      deploy: (el, client) => {
         if (el.type === "timeseries") {
            return client.model.sandboxOps.timeseriesOps.deploy(el.name)
         } else if (el.type === "object_attribute") {
            return client.model.sandboxOps.objectAttributesOps.deploy(el.name)
         } else if (el.type === "owner_attribute") {
            return client.model.sandboxOps.ownerAttributesOps.deploy(el.name)
         } else {
            ConfigMnuboUtils.DebugLog(`invalid deploy type: '${el.type}'`);
            return Promise.reject(`invalid deploy type: '${el.type}'`);
         }
      }
   };

   function deployElements(array, thisNode, msg) {
      var client = ConfigMnuboUtils.GetNewMnuboClient(thisNode.mnuboconfig);
      const deployementPromises = array.map(el => {
       return model
         .deploy(el, client)
         .then(() => {
           ConfigMnuboUtils.DebugLog(`succesfully deployed: ${el.name}`);
           return {"ok": true, "name": el.name};
         })
         .catch(error => {
           ConfigMnuboUtils.DebugLog(`unable to deploy ${el.name}`);
           return {"ok": false, "name": el.name, "errorMessage": error};
         });
     });

     return Promise.all(deployementPromises).then(done => {
        const failed = done.filter(el => el.ok === false);
        
        if (failed.length > 0) {
         ConfigMnuboUtils.DebugLog(`failed: ${failed.map(el => {return el.name}).toString()}`);
         if (done.length === failed.length) {
             ConfigMnuboUtils.UpdateStatusResponseError(thisNode, "all deployment failed");
             msg.errors = {'errorMessage': failed, 'originalRequest': {"acction": "Deploy to Production", "payload": msg.payload}};
             msg.payload = "failed";
             thisNode.send(msg)
         } else {
            ConfigMnuboUtils.UpdateStatusResponseWarning(thisNode, done);
            msg.errors = {'errorMessage': failed, 'originalRequest': {"acction": "Deploy to Production", "payload": msg.payload}};
            msg.payload = done.filter(el => el.ok === true);
            thisNode.send(msg)
         }
        } else {
         ConfigMnuboUtils.DebugLog("all deploys were successful");
         ConfigMnuboUtils.UpdateStatusResponseOK(thisNode, done);
         msg.payload = done; 
         thisNode.send(msg)
        }

        ConfigMnuboUtils.DebugLog('exit');
     });
   }

   function ResetDataModel(thisNode, msg, return_promise) {   
      ConfigMnuboUtils.DebugLog();
      return_promise = return_promise || 0;      
      if (thisNode == null || thisNode.mnuboconfig == null || thisNode.mnuboconfig.credentials == null) {
         ConfigMnuboUtils.UpdateStatusErrMsg(thisNode,"missing config/credentials");
         return 0;
      }
      var client = ConfigMnuboUtils.GetNewMnuboClient(thisNode.mnuboconfig);
      if (return_promise == 1) {
         return client.model.sandboxOps.resetOps.reset();
      } else {
         client.model.sandboxOps.resetOps.reset()
         .then(function ResetModelFromSdk_OK(data) {
            data = (data)? data : "OK"
            ConfigMnuboUtils.DebugLog(data);
            ConfigMnuboUtils.UpdateStatusResponseOK(thisNode, data);
            msg.payload = data; 
            thisNode.send(msg);} )
         .catch(function ResetModelFromSdk_ERR(error) { 
            ConfigMnuboUtils.DebugLog(error?error.toString():'error');
            ConfigMnuboUtils.UpdateStatusResponseError(thisNode, error); 
            msg.payload = "failed";
            msg.errors = {'errorMessage': error?error:'error', 'originalRequest': {"acction": "Reset Data Model", "mnuboconfig": thisNode.mnuboconfig}};
            thisNode.send(msg);} );
      }
      ConfigMnuboUtils.DebugLog('exit');
   }
   
   function MnuboRequest(thisNode, msg) {
      ConfigMnuboUtils.DebugLog();
      if (thisNode.functionselection === "getDatamodel") {
         GetDataModel(thisNode, msg);
      } else if (thisNode.functionselection === "createDatamodel") {
         CreateUpdateDataModel(thisNode, msg);
      } else if (thisNode.functionselection === "promoteDatamodel") {
         PromoteDataModel(thisNode, msg);
      } else if (thisNode.functionselection === "resetDatamodel") {
         ResetDataModel(thisNode, msg);
      } else {
         ConfigMnuboUtils.UpdateStatusErrMsg(thisNode, "unknown selected function: " + thisNode.functionselection);
         return;
      }
      return 1;
      ConfigMnuboUtils.DebugLog('exit');
   }
   
   
   function MnuboModel(thisNode) {
      ConfigMnuboUtils.DebugLog("Model input connection");
      RED.nodes.createNode(this, thisNode);
      
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
   
   RED.nodes.registerType("mnubo model", MnuboModel);
   
   RED.httpAdmin.post("/model/:id/button", RED.auth.needsPermission("mnubo model.write"), function(req,res) {
      ConfigMnuboUtils.DebugLog("Model button input");
      var thisNode = RED.nodes.getNode(req.params.id);
      if (thisNode != null) {
         ConfigMnuboUtils.UpdateStatusLogMsg(thisNode, "button input ...");
         msg = { payload: thisNode.inputtext };
         MnuboRequest(thisNode, msg)
         res.sendStatus(200);
      } else {
         res.sendStatus(404);
      }
      ConfigMnuboUtils.DebugLog('exit');
   });
}
