module.exports = function(RED) {
   
   //mnubo-sdk
   require('es6-shim'); /* only if running node < 4.0.0 */
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
      return_promise = return_promise || 0;
      msg = msg || { payload: "GetDatasetsFromSdk" };
      //if (msg == null)
      //{
      //   msg = { payload: "GetDatasetsFromSdk" };
      //}
      
      if (thisNode == null || thisNode.mnuboconfig == null || thisNode.mnuboconfig.credentials == null)
      {
         ConfigMnuboUtils.MnuboConfigUpdateStatusMsg(thisNode,"missing config/credentials");
         return;
      }
      
      var client = new mnubo.Client({
         id: thisNode.mnuboconfig.credentials.id,
         secret: thisNode.mnuboconfig.credentials.secret,
         env: thisNode.mnuboconfig.env
      });
      
      if (return_promise==1)
      {
         return client.search.getDatasets();
      }
      else
      {
         client.search.getDatasets()
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
   
   
   function CreateBasicQueryFromSdk(thisNode, msg) {      
      //console.log('thisNode=',thisNode);
      
      if (thisNode == null || thisNode.mnuboconfig == null || thisNode.mnuboconfig.credentials == null)
      {
         ConfigMnuboUtils.MnuboConfigUpdateStatusMsg(thisNode,"missing config/credentials");
         return;
      }
      
      if (msg == null || msg.payload == null || msg.payload == "")
      {
         ConfigMnuboUtils.MnuboConfigUpdateStatusMsg(thisNode,"missing input query");
         return;
      }
      
      var client = new mnubo.Client({
         id: thisNode.mnuboconfig.credentials.id,
         secret: thisNode.mnuboconfig.credentials.secret,
         env: thisNode.mnuboconfig.env
      });
      
      client.search.createBasicQuery(msg.payload)
      .then(function(data) { 
         ConfigMnuboUtils.MnuboConfigUpdateStatusResponseOK(thisNode,data);
         msg.payload = data; 
         thisNode.send(msg);} )
      .catch(function(error) { 
         ConfigMnuboUtils.MnuboConfigUpdateStatusResponseError(thisNode,error); 
         msg.payload = error;  
         thisNode.send(msg);} );
   }  
   
   function MnuboRequest(thisNode, msg) {
      if (thisNode.searchtype == "getDatasets")
      {
         //console.log('MnuboRequest: getDatasets');
         GetDatasetsFromSdk(thisNode, msg);
      }
      else if (thisNode.searchtype == "createBasicQuery")
      {
         //console.log('MnuboRequest: createBasicQuery');
         CreateBasicQueryFromSdk(thisNode, msg);
      }
      else if (thisNode.searchtype == "getDatamodel")
      {
         //console.log('MnuboRequest: getDatamodel');
         msg = msg || { payload: "getDatamodel" };
         GetDatasetsFromSdk(thisNode, msg, 1)
         .then(function(data) { 
            ConfigMnuboUtils.MnuboConfigUpdateStatusResponseOK(thisNode,data);
            msg.payload = FormatDatasets(data); 
            thisNode.send(msg);} )
         .catch(function(error) { 
            ConfigMnuboUtils.MnuboConfigUpdateStatusResponseError(thisNode,error); 
            msg.payload = error;  
            thisNode.send(msg);} );
      }
      else
      {
         ConfigMnuboUtils.MnuboConfigUpdateStatusMsg(thisNode,"unknown searchtype");
      }
   }
   
   
   function MnuboAnalytics(thisNode) {
      //console.log('MnuboAnalytics');
      RED.nodes.createNode(this,thisNode);
      
      this.searchtype = thisNode.searchtype;
      this.inputquery = thisNode.inputquery;
      
      
      // Retrieve the mnubo-credential config node
      this.mnuboconfig = RED.nodes.getNode(thisNode.mnuboconfig);
      ConfigMnuboUtils.MnuboConfigUpdateStatus(this);
      
      this.on('input', function(msg) {
         this.mnuboconfig = RED.nodes.getNode(thisNode.mnuboconfig);
         MnuboRequest(this, msg);         
      });
      
   }
   
   
   RED.nodes.registerType("mnubo analytics", MnuboAnalytics);
   
   RED.httpAdmin.post("/analytics/:id/button", RED.auth.needsPermission("mnubo analytics.write"), function(req,res) {
      var thisNode = RED.nodes.getNode(req.params.id);
      //console.log('thisNode=',thisNode);
      msg = { payload: thisNode.inputquery };
      MnuboRequest(thisNode, msg);
   });
}
