module.exports = function(RED) {
  //"use strict";

  //mnubo-sdk
  var mnubo = require('mnubo-sdk');
  var ConfigMnuboUtils = require('../config/mnubo-utils');

  //If return_promise is 1, this function will return the promise result
  function CreateObjectFromSdk(thisNode, msg, return_promise) {
    ConfigMnuboUtils.DebugLog();

    return_promise = return_promise || 0;

    var client = ConfigMnuboUtils.GetNewMnuboClient(thisNode.mnuboconfig);

    try {
      msg.payload = typeof msg.payload === 'string' ? JSON.parse(msg.payload) : msg.payload;
    } catch (e) {
      ConfigMnuboUtils.UpdateStatusErrMsg(thisNode, 'Input must be a valid JSON');
      return;
    }

    if (return_promise == 1) {
      if (Array.isArray(msg.payload)) {
        return client.objects.createUpdate(msg.payload);
      } else {
        return client.objects.create(msg.payload);
      }
    } else {
      if (Array.isArray(msg.payload)) {
        // Bulk Creation
        client.objects
          .createUpdate(msg.payload)
          .then((result) => {
            ConfigMnuboUtils.CheckMultiStatusResult(thisNode, result, msg.payload);
          })
          .catch((error) => {
            ConfigMnuboUtils.UpdateStatusResponseError(thisNode, error);
            msg.errors = { errorMessage: error ? error : 'error', originalRequest: msg.payload };
            thisNode.send(msg);
          });
      } else {
        // Single Creation
        client.objects
          .create(msg.payload)
          .then((result) => {
            ConfigMnuboUtils.UpdateStatusResponseOK(thisNode, result);
            msg.payload = result;
            thisNode.send(msg);
          })
          .catch((error) => {
            ConfigMnuboUtils.UpdateStatusResponseError(thisNode, error);
            msg.errors = { errorMessage: error ? error : 'error', originalRequest: msg.payload };
            thisNode.send(msg);
          });
      }
    }
    ConfigMnuboUtils.DebugLog('exit');
  }

  //If return_promise is 1, this function will return the promise result
  function UpdateObjectFromSdk(thisNode, msg, return_promise) {
    ConfigMnuboUtils.DebugLog();
    return_promise = return_promise || 0;

    var client = ConfigMnuboUtils.GetNewMnuboClient(thisNode.mnuboconfig);

    try {
      if (typeof msg.payload == 'string') {
        msg.payload = JSON.parse(msg.payload);
      }
    } catch (e) {
      ConfigMnuboUtils.UpdateStatusErrMsg(thisNode, 'Input must be a valid JSON');
      return;
    }

    if (typeof msg.payload[0] == 'string') {
      //[dev_id, body] Update a single Object
      if (msg.payload.length == 2) {
        var object = msg.payload[0];
        var input = msg.payload[1];

        if (return_promise == 1) {
          return client.objects.update(object, input);
        } else {
          client.objects
            .update(object, input)
            .then((result) => {
              ConfigMnuboUtils.UpdateStatusResponseOK(thisNode, result);
              msg.payload = result || 'Object Updated';
              thisNode.send(msg);
            })
            .catch((error) => {
              ConfigMnuboUtils.UpdateStatusResponseError(thisNode, error);
              msg.errors = { errorMessage: error ? error : 'error', originalRequest: msg.payload };
              thisNode.send(msg);
            });
        }
      } else {
        ConfigMnuboUtils.UpdateStatusErrMsg(thisNode, 'bad amount of arguments');
        return;
      }
    } else {
      //[body] Batch Update

      if (return_promise == 1) {
        return client.objects.createUpdate(msg.payload);
      } else {
        client.objects
          .createUpdate(msg.payload)
          .then((result) => {
            ConfigMnuboUtils.CheckMultiStatusResult(thisNode, result, msg.payload);
          })
          .catch((error) => {
            ConfigMnuboUtils.UpdateStatusResponseError(thisNode, error);
            msg.errors = { errorMessage: error ? error : 'error', originalRequest: msg.payload };
            thisNode.send(msg);
          });
      }
    }

    ConfigMnuboUtils.DebugLog('exit');
  }

  //If return_promise is 1, this function will return the promise result
  function DeleteObjectFromSdk(thisNode, msg, return_promise) {
    ConfigMnuboUtils.DebugLog();
    return_promise = return_promise || 0;

    var client = ConfigMnuboUtils.GetNewMnuboClient(thisNode.mnuboconfig);

    if (return_promise == 1) {
      return client.objects.delete(msg.payload);
    } else {
      client.objects
        .delete(msg.payload)
        .then((result) => {
          ConfigMnuboUtils.UpdateStatusResponseOK(thisNode, result);
          msg.payload = result || 'Object Deleted';
          thisNode.send(msg);
        })
        .catch((error) => {
          ConfigMnuboUtils.UpdateStatusResponseError(thisNode, error);
          msg.errors = { errorMessage: error ? error : 'error', originalRequest: msg.payload };
          thisNode.send(msg);
        });
    }
    ConfigMnuboUtils.DebugLog('exit');
  }

  //If return_promise is 1, this function will return the promise result
  function ExistsObjectFromSdk(thisNode, msg, return_promise) {
    ConfigMnuboUtils.DebugLog();
    return_promise = return_promise || 0;

    var client = ConfigMnuboUtils.GetNewMnuboClient(thisNode.mnuboconfig);

    try {
      if (typeof msg.payload == 'string') {
        msg.payload = msg.payload.replace(/'/g, '"');
        if (msg.payload.indexOf('"') > -1) {
          msg.payload = JSON.parse(msg.payload);
        }
      }
    } catch (e) {
      ConfigMnuboUtils.UpdateStatusErrMsg(thisNode, 'invalid arguments');
      return;
    }

    if (return_promise == 1) {
      return client.objects.exists(msg.payload);
    } else {
      client.objects
        .exists(msg.payload)
        .then((result) => {
          ConfigMnuboUtils.UpdateStatusResponseOK(thisNode, result);
          msg.payload = result;
          thisNode.send(msg);
        })
        .catch((error) => {
          ConfigMnuboUtils.DebugLog(error ? error.toString() : 'error');
          ConfigMnuboUtils.UpdateStatusResponseError(thisNode, error);
          msg.errors = { errorMessage: error ? error : 'error', originalRequest: msg.payload };
          thisNode.send(msg);
        });
    }
    ConfigMnuboUtils.DebugLog('exit');
  }

  function MnuboRequest(thisNode, msg) {
    ConfigMnuboUtils.DebugLog();
    if (thisNode == null || thisNode.mnuboconfig == null || thisNode.mnuboconfig.credentials == null) {
      ConfigMnuboUtils.UpdateStatusErrMsg(thisNode, 'missing config/credentials');
      return;
    }

    if (msg == null || msg.payload == null || msg.payload == '') {
      ConfigMnuboUtils.UpdateStatusErrMsg(thisNode, 'missing input');
      return;
    }

    if (thisNode.functionselection == 'create') {
      ConfigMnuboUtils.UpdateStatusLogMsg(thisNode, 'creating...');
      CreateObjectFromSdk(thisNode, msg);
    } else if (thisNode.functionselection == 'update') {
      ConfigMnuboUtils.UpdateStatusLogMsg(thisNode, 'updating...');
      UpdateObjectFromSdk(thisNode, msg);
    } else if (thisNode.functionselection == 'delete') {
      ConfigMnuboUtils.UpdateStatusLogMsg(thisNode, 'deleting...');
      DeleteObjectFromSdk(thisNode, msg);
    } else if (thisNode.functionselection == 'exists') {
      ConfigMnuboUtils.UpdateStatusLogMsg(thisNode, 'checking...');
      ExistsObjectFromSdk(thisNode, msg);
    } else {
      ConfigMnuboUtils.UpdateStatusErrMsg(thisNode, 'unknown function');
    }
    ConfigMnuboUtils.DebugLog('exit');
  }

  function MnuboObjects(thisNode) {
    RED.nodes.createNode(this, thisNode);

    this.functionselection = thisNode.functionselection;
    this.inputtext = thisNode.inputtext;

    // Retrieve the mnubo config node
    this.mnuboconfig = RED.nodes.getNode(thisNode.mnuboconfig);
    ConfigMnuboUtils.UpdateStatus(this);

    this.on('input', function(msg) {
      this.mnuboconfig = RED.nodes.getNode(thisNode.mnuboconfig);
      ConfigMnuboUtils.UpdateStatusLogMsg(this, 'input ...');
      MnuboRequest(this, msg);
    });
  }

  RED.nodes.registerType('mnubo objects', MnuboObjects);

  RED.httpAdmin.post('/objects/:id/button', RED.auth.needsPermission('mnubo objects.write'), function(req, res) {
    ConfigMnuboUtils.DebugLog('Button Input - RED.httpAdmin.post');
    var thisNode = RED.nodes.getNode(req.params.id);
    msg = { payload: thisNode.inputtext };

    if (thisNode != null) {
      ConfigMnuboUtils.UpdateStatusLogMsg(thisNode, 'button input ...');
      MnuboRequest(thisNode, msg);
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }

    ConfigMnuboUtils.DebugLog('Button Input - RED.httpAdmin.post exit');
  });
};
