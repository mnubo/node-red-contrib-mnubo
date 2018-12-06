module.exports = function(RED) {
  //mnubo-sdk
  var mnubo = require('mnubo-sdk');
  var ConfigMnuboUtils = require('../config/mnubo-utils');

  function GetAccessTokenFromSdk(thisNode, msg) {
    ConfigMnuboUtils.DebugLog();

    if (thisNode == null || thisNode.mnuboconfig == null || thisNode.mnuboconfig.credentials == null) {
      ConfigMnuboUtils.UpdateStatusErrMsg(thisNode, 'missing config/credentials');
      return;
    }

    //Clear previous access_token:
    thisNode.mnuboconfig.credentials.access_token = '';
    thisNode.mnuboconfig.credentials.access_token_expiry = '';

    var client = ConfigMnuboUtils.GetNewMnuboClient(thisNode.mnuboconfig);
    client
      .getAccessToken()
      .then(function GetAccessTokenFromSdk_OK(data) {
        ConfigMnuboUtils.DebugLog(client.token);
        thisNode.mnuboconfig.credentials.access_token = client.token.value;
        thisNode.mnuboconfig.credentials.access_token_expiry = new Date().getTime() / 1000 + client.token.expiresIn;
        RED.nodes.addCredentials(thisNode.id, thisNode.mnuboconfig.credentials);
        ConfigMnuboUtils.UpdateStatusResponseOK(thisNode, client.token);
        msg.payload = client.token;
        thisNode.send(msg);
      })
      .catch(function GetAccessTokenFromSdk_ERR(error) {
        ConfigMnuboUtils.DebugLog(error ? error.toString() : 'error');
        ConfigMnuboUtils.UpdateStatusResponseError(thisNode, error);
        msg.errors = {
          errorMessage: error ? error : 'error',
          originalRequest: { acction: 'Get Access Token', mnuboconfig: thisNode.mnuboconfig },
        };
        thisNode.send(msg);
      });
    return 1;
    ConfigMnuboUtils.DebugLog('exit');
  }

  function MnuboAuthenticate(thisNode) {
    ConfigMnuboUtils.DebugLog();
    RED.nodes.createNode(this, thisNode);

    // Retrieve the mnubo config node
    this.mnuboconfig = RED.nodes.getNode(thisNode.mnuboconfig);

    ConfigMnuboUtils.UpdateStatus(this);

    this.on('input', function(msg) {
      this.mnuboconfig = RED.nodes.getNode(thisNode.mnuboconfig);
      ConfigMnuboUtils.UpdateStatusLogMsg(this, 'input ...');
      GetAccessTokenFromSdk(this, msg);
    });
  }

  RED.nodes.registerType('mnubo auth', MnuboAuthenticate);

  RED.httpAdmin.post('/auth/:id/button', RED.auth.needsPermission('mnubo auth.write'), function(req, res) {
    ConfigMnuboUtils.DebugLog('auth button input');
    var thisNode = RED.nodes.getNode(req.params.id);
    if (thisNode != null) {
      ConfigMnuboUtils.UpdateStatusLogMsg(thisNode, 'button input ...');
      msg = { payload: thisNode.inputtext };
      GetAccessTokenFromSdk(thisNode, msg);
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
    ConfigMnuboUtils.DebugLog('exit');
  });
};
