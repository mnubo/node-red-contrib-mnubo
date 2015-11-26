module.exports = function(RED) { 
   
   RED.nodes.registerType("mnubo-credentials",MnuboConfigNode, {
      credentials: {
         id: {type: 'text'},
         secret: {type: 'password'},
         access_token: {type: 'password'},
         access_token_expiry: {type: 'text'},
      }
   });
   
   function MnuboConfigNode(thisNode) {
      RED.nodes.createNode(this,thisNode);
      this.name = thisNode.name;
      this.env = thisNode.env;
   }
   
   
   
   
   
   
}
