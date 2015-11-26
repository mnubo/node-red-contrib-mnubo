you can install node-red following http://nodered.org/docs/getting-started/installation.html

On ubuntu:
sudo npm install -g --unsafe-perm node-red

To start node-red, you can just call node-red

You can connect to the server using the default port:
http://localhost:1880/


to use this repository on your node-red server, your should edit the ~/.node-red/setting.js, and set:
    debugMaxLength: 5000,
    nodesDir: '<your git full dir>/node-red/nodes',

To install package locally (to the user/dir, not the system)
cd ~/.node-red
npm install <package>

