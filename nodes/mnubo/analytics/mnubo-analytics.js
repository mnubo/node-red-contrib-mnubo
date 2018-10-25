module.exports = function(RED) {
   
   //mnubo-sdk
   var mnubo = require('mnubo-sdk');
   var ConfigMnuboUtils = require('../config/mnubo-utils');
   
   //FormatDatasets will return a formated datasets that is like a data model (thanks to JS!)
   function FormatDatasets(datasets) {
      for (var i in datasets) {
         if (datasets[i].key == 'object')
            objects = datasets[i].fields;
         if (datasets[i].key == 'event')
            events = datasets[i].fields;
         if (datasets[i].key == 'owner')
            owners = datasets[i].fields;
      }
      
      // populate the time series
      var timeseries = [];
      for (var i in events) {
         var obj = {};
         if (events[i].key.substring(0,2) != "x_" ) {
            obj[events[i].key] = events[i].highLevelType;
            
            timeseries.push(obj);
         }
      }
      timeseries=timeseries.sort()
      
      // populate the object attributes
      var objectattributes = [];
      for (var i in objects) {
         var obj = {};
         if (objects[i].key.substring(0,2) != "x_") {
            obj[objects[i].key] = objects[i].highLevelType;
            
            objectattributes.push(obj);
         }
      }
      objectattributes=objectattributes.sort()
      
      // populate the owner attributes
      var ownerattributes = [];
      for (var i in owners) {
         if (owners[i].key.substring(0,2) != "x_") {
            obj[objects[i].key] = objects[i].highLevelType;
            ownerattributes.push(obj);
         }
      }
      ownerattributes=ownerattributes.sort();
      
      return  {"events":timeseries, "objects":objectattributes, "owners":ownerattributes};
   }
   
   //If return_promise is 1, this function will return the promise result
   function GetDatasetsFromSdk(thisNode, msg, return_promise) {   
      ConfigMnuboUtils.DebugLog();
      return_promise = return_promise || 0;
      msg = msg || { payload: "GetDatasetsFromSdk" };
      
      if (thisNode == null || thisNode.mnuboconfig == null || thisNode.mnuboconfig.credentials == null) {
         ConfigMnuboUtils.UpdateStatusErrMsg(thisNode,"missing config/credentials");
         return;
      }
      
      var client = ConfigMnuboUtils.GetNewMnuboClient(thisNode.mnuboconfig);
      
      if (return_promise==1) {
         return client.search.getDatasets();
      } else {
         client.search.getDatasets()
         .then(function GetDatasetsFromSdk_OK(data) { 
            ConfigMnuboUtils.DebugLog(data);
            ConfigMnuboUtils.UpdateStatusResponseOK(thisNode,data);
            msg.payload = data; 
            thisNode.send(msg);} )
         .catch(function GetDatasetsFromSdk_ERR(error) { 
            ConfigMnuboUtils.DebugLog(error);
            ConfigMnuboUtils.UpdateStatusResponseError(thisNode,error); 
            msg.errors = [{'errorMessage': error, 'originalRequest': msg}];
            thisNode.send(msg);} );
      }
      ConfigMnuboUtils.DebugLog('exit');
   }  
   
   
   function CreateBasicQueryFromSdk(thisNode, msg) {      
      ConfigMnuboUtils.DebugLog();
      
      if (thisNode == null || thisNode.mnuboconfig == null || thisNode.mnuboconfig.credentials == null) {
         ConfigMnuboUtils.UpdateStatusErrMsg(thisNode,"missing config/credentials");
         return;
      }
      
      if (msg == null || msg.payload == null || msg.payload == "") {
         ConfigMnuboUtils.UpdateStatusErrMsg(thisNode,"missing input query");
         return;
      }
      
      var client = ConfigMnuboUtils.GetNewMnuboClient(thisNode.mnuboconfig);      
      
      client.search.createBasicQuery(msg.payload)
      .then(function CreateBasicQueryFromSdk_OK(data) { 
         ConfigMnuboUtils.DebugLog(data);
         ConfigMnuboUtils.UpdateStatusResponseOK(thisNode,data);
         msg.payload = data; 
         thisNode.send(msg);} )
      .catch(function CreateBasicQueryFromSdk_ERR(error) { 
         ConfigMnuboUtils.DebugLog(error);
         ConfigMnuboUtils.UpdateStatusResponseError(thisNode, error);
         msg.errors = [{'errorMessage': error, 'originalRequest': msg.payload}];
         thisNode.send(msg);} );
      ConfigMnuboUtils.DebugLog('exit');
   }  
   
   function MnuboRequest(thisNode, msg) {
      ConfigMnuboUtils.DebugLog();
      if (thisNode.searchtype == "getDatasets") {
         GetDatasetsFromSdk(thisNode, msg);
      } else if (thisNode.searchtype == "SearchQuery") {
         CreateBasicQueryFromSdk(thisNode, msg);
      } else if (thisNode.searchtype == "getDatamodel") {
         msg = msg || { payload: "getDatamodel" };
         GetDatasetsFromSdk(thisNode, msg, 1)
         .then(function MnuboRequest_getDatamodel_OK(data) { 
            ConfigMnuboUtils.DebugLog(data);
            ConfigMnuboUtils.UpdateStatusResponseOK(thisNode,data);
            msg.payload = FormatDatasets(data); 
            thisNode.send(msg);} )
         .catch(function MnuboRequest_getDatamodel_ERR(error) { 
            ConfigMnuboUtils.DebugLog(error);
            ConfigMnuboUtils.UpdateStatusResponseError(thisNode,error); 
            msg.errors = [{'errorMessage': error, 'originalRequest': msg}];
            thisNode.send(msg);} );
      } else {
         ConfigMnuboUtils.UpdateStatusErrMsg(thisNode,"unknown searchtype");
         return 0;
      }
      return 1;
      ConfigMnuboUtils.DebugLog('exit');
   }
   
   
   function MnuboAnalytics(thisNode) {
      ConfigMnuboUtils.DebugLog();
      RED.nodes.createNode(this,thisNode);
      
      this.searchtype = thisNode.searchtype;
      this.inputquery = thisNode.inputquery;
      
      
      // Retrieve the mnubo config node
      this.mnuboconfig = RED.nodes.getNode(thisNode.mnuboconfig);
      ConfigMnuboUtils.UpdateStatus(this);
      
      this.on('input', function(msg) {
         this.mnuboconfig = RED.nodes.getNode(thisNode.mnuboconfig);
         ConfigMnuboUtils.UpdateStatusLogMsg(this, "input ...");
         MnuboRequest(this, msg);         
      });
      
   }
   
   
   RED.nodes.registerType("mnubo analytics", MnuboAnalytics);
   
   RED.httpAdmin.post("/analytics/:id/button", RED.auth.needsPermission("mnubo analytics.write"), function(req,res) {
      ConfigMnuboUtils.DebugLog();
      var thisNode = RED.nodes.getNode(req.params.id);
      if (thisNode != null) {
         ConfigMnuboUtils.UpdateStatusLogMsg(thisNode, "button input ...");
         msg = { payload: thisNode.inputquery };
         if (MnuboRequest(thisNode, msg) == 1) {
            res.sendStatus(200);
         } else {
            res.sendStatus(400);
         }
      } else {
         res.sendStatus(404);
      }
      ConfigMnuboUtils.DebugLog('exit');
   });
}
