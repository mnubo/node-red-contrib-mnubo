# mnubo node-red SDK

Table of Content
================
 
[1. Introduction](#section1)

[2. Architecture](#section2) 

[3. Pre-requisites](#section3)

[4. Installation & Configuration](#section4) 

[5. Usage](#section5)

[6. Important notes](#section6) 

[7. Source code](#section7)

[8. Known limitations](#section8)

[9. References](#section9)

---
#<a name="section1"></a>1. Introduction

This is the implementation of the mnubo's SmartObjects functionality in the node-red environment.

Note that this package is also compatible with other node-red environment, like IBM Bluemix and AT&T Flow.

---
#<a name="section3"></a>2. Architecture

This is a front-end implementation of the https://www.npmjs.com/package/mnubo-sdk

Detailed info is available on the individual node in node-red. Here is a brief description of the nodes:
•	mnubo config: This is the Configuration Node that holds the mnubo's SmartObjects credential, all nodes need to have this configured.
•	SmartObjects auth: This node is used to fetch the access token for communication, with SmartObject, this node, you will allow you to get the status about the token.
•	SmartObjects owners : This node is used to handle the Owners Ingestion API: Create, Update, Delete,Claim Object
•	SmartObjects objects : This node is used to handle the Objectd Ingestion API: Create, Update, Delete
•	SmartObjects events : This node is used to handle the Events Ingestion API: Send, SendFromDevice
•	SmartObjects analytics : This node is used to handle the Search API: getDataset, getDatamodel,SearchQurery


---
#<a name="section3"></a>3. Prerequisites

This is a node-red package, so it requires node-red, The minimum version of node-red supported is v0.10.10

To use the mnubo's SmartObjects nodes, you will need to have a valid mnubo account, with access granted on a namespace.
To obtain your unique namespace in the SmartObjects platform, contact sales@mnubo.com . Please use the subject title **node-red-contrinb-mnubo** and include in the body of the email the name of your company, contact name and phone number.

Once logged into mnubo's SmartObjects, the Official reference API can be found in the following: [API documentation]

(https://sop.mtl.mnubo.com/apps/doc/?i=t).

This package also requires the following package:
- mnubo's SmartObjects Javascript SDK [mnubo-js-sdk](https://github.com/mnubo/mnubo-js-sdk)
- ECMAScript 6 (Harmony) compatibility shims for legacy JavaScript engines [es6-shim](https://www.npmjs.com/package/es6-shim)

Those packages will be installed automatically by npm, as they are dependent packages.

---
#<a name="section4"></a>4. Installation & Configuration

## Linux installation

    sudo npm install --prefix ~/.node-red node-red-contrib-mnubo
    
## Windows installation (using Cygwin)

    npm install --prefix ~/.node-red node-red-contrib-mnubo
    mkdir %homepath%/.node-red/nodes
    cp -rp %homepath%/node_modules/node-red-contrib-mnubo %homepath%/.node-red/nodes/

## AT&T flow

    Note that this node is also compatible with the AT&T Flow, to use it in flow, just edit the package.json in your flow project, and add this node 

in the depedency:

    "dependencies":{"node-red-contrib-mnubo":"^1.0.3"}

        Then, when you will " enter the Online mode", you should have access to the mnubo nodes.

## IBM Bluemix

    TBD

---
#<a name="section5"></a>5. Usage


## Examples

## Example 1: Quick Demo

Here is a quick demo that show how to authenticate, create owner, update owner, create object, update object, send event, do a basicSearchQuery, 

delete the object, delete the owner:
```
[{"id":"ec6f6c42.13909","type":"mnubo config","z":"7eca5e06.8135a","name":"Casa","env":"sandbox","proxy_url":"https://rest.sandbox.mnubo.com:443"},

{"id":"1493bc1c.eb6c44","type":"SmartObjects auth","z":"7eca5e06.8135a","name":"","mnuboconfig":"ec6f6c42.13909","x":441,"y":50,"wires":

[["c960a6e0.369f58"]]},{"id":"4a36248d.b5c9dc","type":"inject","z":"7eca5e06.8135a","name":"","topic":"Test 

All","payload":"","payloadType":"none","repeat":"","crontab":"","once":false,"x":96,"y":57,"wires":[["1493bc1c.eb6c44"]]},

{"id":"acddb7f2.532248","type":"debug","z":"7eca5e06.8135a","name":"OK","active":true,"console":"false","complete":"payload","x":925,"y":188,"wires"

:[]},{"id":"c960a6e0.369f58","type":"switch","z":"7eca5e06.8135a","name":"Token != Bearer","property":"payload.token_type","rules":

[{"t":"neq","v":"Bearer"},{"t":"eq","v":"Bearer"}],"checkall":"true","outputs":2,"x":647,"y":51,"wires":[["d7f0dab5.280f28"],

["6da9f489.92560c","2284a4fd.dd7b5c"]]},

{"id":"f6ced9a3.093128","type":"debug","z":"7eca5e06.8135a","name":"Error","active":true,"console":"false","complete":"payload","x":926,"y":157,"wir

es":[]},{"id":"97ea51fd.6815b","type":"SmartObjects 

owners","z":"7eca5e06.8135a","name":"","mnuboconfig":"ec6f6c42.13909","functionselection":"create","inputtext":"","x":496,"y":163,"wires":

[["1ac7e9da.e53816"]]},{"id":"86726b8a.798d98","type":"SmartObjects 

owners","z":"7eca5e06.8135a","name":"","mnuboconfig":"ec6f6c42.13909","functionselection":"delete","inputtext":"","x":488,"y":839,"wires":

[["f9b3e9bc.064c18"]]},{"id":"1ac7e9da.e53816","type":"switch","z":"7eca5e06.8135a","name":"errorCode is not 

null","property":"payload.errorCode","rules":[{"t":"nnull"},{"t":"null"}],"checkall":"true","outputs":2,"x":685,"y":164,"wires":

[["f6ced9a3.093128"],["acddb7f2.532248","a71ae1b7.58e52"]]},

{"id":"d7f0dab5.280f28","type":"debug","z":"7eca5e06.8135a","name":"Error","active":true,"console":"false","complete":"payload","x":933,"y":38,"wire

s":[]},

{"id":"6da9f489.92560c","type":"debug","z":"7eca5e06.8135a","name":"OK","active":true,"console":"false","complete":"payload","x":931,"y":70,"wires":

[]},

{"id":"9006d790.6ff928","type":"debug","z":"7eca5e06.8135a","name":"Error","active":true,"console":"false","complete":"payload","x":917,"y":832,"wir

es":[]},

{"id":"a4bff401.5b4008","type":"debug","z":"7eca5e06.8135a","name":"OK","active":true,"console":"false","complete":"payload","x":914,"y":864,"wires"

:[]},{"id":"2bb11e02.d44ee2","type":"inject","z":"7eca5e06.8135a","name":"","topic":"clean","payload":"node-red-

auto1@test.com","payloadType":"none","repeat":"","crontab":"","once":false,"x":91,"y":839,"wires":[["b6b35a05.494ca8"]]},

{"id":"5961f877.a69e08","type":"inject","z":"7eca5e06.8135a","name":"","topic":"","payload":"","payloadType":"none","repeat":"","crontab":"","once":

false,"x":105,"y":109,"wires":[["2284a4fd.dd7b5c"]]},{"id":"f9b3e9bc.064c18","type":"switch","z":"7eca5e06.8135a","name":"errorCode is not 

null","property":"payload.errorCode","rules":[{"t":"nnull"},{"t":"null"}],"checkall":"true","outputs":2,"x":708,"y":834,"wires":

[["9006d790.6ff928"],["a4bff401.5b4008"]]},{"id":"55802a44.aa7fd4","type":"SmartObjects 

owners","z":"7eca5e06.8135a","name":"","mnuboconfig":"ec6f6c42.13909","functionselection":"update","inputtext":"","x":486,"y":238,"wires":

[["b153b5bb.4eac48"]]},

{"id":"1b219be.fe4de64","type":"debug","z":"7eca5e06.8135a","name":"OK","active":true,"console":"false","complete":"payload","x":925,"y":262,"wires"

:[]},

{"id":"7e0286c6.81fd78","type":"debug","z":"7eca5e06.8135a","name":"Error","active":true,"console":"false","complete":"payload","x":925,"y":230,"wir

es":[]},{"id":"b153b5bb.4eac48","type":"switch","z":"7eca5e06.8135a","name":"errorCode is not null","property":"payload.errorCode","rules":

[{"t":"nnull"},{"t":"null"}],"checkall":"true","outputs":2,"x":755,"y":237,"wires":[["7e0286c6.81fd78"],["1b219be.fe4de64","ec0469f8.13fb98"]]},

{"id":"65405b9.f9abfa4","type":"SmartObjects 

objects","z":"7eca5e06.8135a","name":"","mnuboconfig":"ec6f6c42.13909","functionselection":"create","inputtext":"","x":485,"y":323,"wires":

[["e0e1cf65.1f1e3"]]},{"id":"e0e1cf65.1f1e3","type":"switch","z":"7eca5e06.8135a","name":"errorCode is not 

null","property":"payload.errorCode","rules":[{"t":"nnull"},{"t":"null"}],"checkall":"true","outputs":2,"x":690,"y":322,"wires":

[["286be3a7.d7941c"],["ddd8c47c.222738","fa88f7b.f057708"]]},

{"id":"286be3a7.d7941c","type":"debug","z":"7eca5e06.8135a","name":"Error","active":true,"console":"false","complete":"payload","x":924,"y":309,"wir

es":[]},

{"id":"ddd8c47c.222738","type":"debug","z":"7eca5e06.8135a","name":"OK","active":true,"console":"false","complete":"payload","x":924,"y":341,"wires"

:[]},{"id":"6deed747.921128","type":"SmartObjects 

objects","z":"7eca5e06.8135a","name":"","mnuboconfig":"ec6f6c42.13909","functionselection":"delete","inputtext":"","x":484,"y":761,"wires":

[["40f9eb13.bf0614"]]},{"id":"8d4caaf5.72b358","type":"inject","z":"7eca5e06.8135a","name":"","topic":"clean","payload":"node-red-

auto1@test.com","payloadType":"none","repeat":"","crontab":"","once":false,"x":92,"y":763,"wires":[["4ba72043.b458e"]]},

{"id":"75b350a5.8a4cb","type":"debug","z":"7eca5e06.8135a","name":"Error","active":true,"console":"false","complete":"payload","x":920,"y":741,"wire

s":[]},

{"id":"b0141e4d.4febe","type":"debug","z":"7eca5e06.8135a","name":"OK","active":true,"console":"false","complete":"payload","x":919,"y":773,"wires":

[]},{"id":"40f9eb13.bf0614","type":"switch","z":"7eca5e06.8135a","name":"errorCode is not null","property":"payload.errorCode","rules":

[{"t":"nnull"},{"t":"null"}],"checkall":"true","outputs":2,"x":710,"y":751,"wires":[["75b350a5.8a4cb"],["b0141e4d.4febe","b6b35a05.494ca8"]]},

{"id":"316f2be2.ce90d4","type":"SmartObjects 

objects","z":"7eca5e06.8135a","name":"","mnuboconfig":"ec6f6c42.13909","functionselection":"update","inputtext":"","x":475,"y":399,"wires":

[["852c8bf4.7ad378"]]},

{"id":"a992a44d.566d58","type":"debug","z":"7eca5e06.8135a","name":"OK","active":true,"console":"false","complete":"payload","x":922,"y":418,"wires"

:[]},

{"id":"d655cc56.29aa3","type":"debug","z":"7eca5e06.8135a","name":"Error","active":true,"console":"false","complete":"payload","x":922,"y":386,"wire

s":[]},{"id":"852c8bf4.7ad378","type":"switch","z":"7eca5e06.8135a","name":"errorCode is not null","property":"payload.errorCode","rules":

[{"t":"nnull"},{"t":"null"}],"checkall":"true","outputs":2,"x":744,"y":399,"wires":[["d655cc56.29aa3"],["a992a44d.566d58","b9dd056a.4622f8"]]},

{"id":"7bdf1a58.8420e4","type":"SmartObjects 

events","z":"7eca5e06.8135a","name":"","mnuboconfig":"ec6f6c42.13909","functionselection":"send","inputtext":"","x":470,"y":475,"wires":

[["b84f17cf.47b0e8"]]},{"id":"58759d0b.a78a64","type":"SmartObjects 

events","z":"7eca5e06.8135a","name":"","mnuboconfig":"ec6f6c42.13909","functionselection":"sendfromdevice","inputtext":"[\n    \"node-red-device-

auto1\", \n    [{\n\t\"x_event_type\": \"event_type_test\",\n\t\"x_timestamp\": \"2015-01-22T00:01:25-02:00\",\n\t\"x_latitude\": 57.876,\n\t

\"x_longitude\": 57.876,\n\t\"temperature\": 15.2\n    }]\n]","x":523.5555572509766,"y":552.1110897064209,"wires":[["99f17e6b.660e8"]]},

{"id":"225aa85f.dda558","type":"debug","z":"7eca5e06.8135a","name":"OK","active":true,"console":"false","complete":"payload","x":923,"y":495,"wires"

:[]},

{"id":"7702d78d.88fd28","type":"debug","z":"7eca5e06.8135a","name":"Error","active":true,"console":"false","complete":"payload","x":923,"y":463,"wir

es":[]},{"id":"b84f17cf.47b0e8","type":"switch","z":"7eca5e06.8135a","name":"errorCode is not null","property":"payload.errorCode","rules":

[{"t":"nnull"},{"t":"null"}],"checkall":"true","outputs":2,"x":750,"y":477,"wires":[["7702d78d.88fd28"],["225aa85f.dda558","d82988c6.27d678"]]},

{"id":"ecafad7f.13505","type":"debug","z":"7eca5e06.8135a","name":"OK","active":true,"console":"false","complete":"payload","x":921,"y":578,"wires":

[]},

{"id":"bfe6a685.401958","type":"debug","z":"7eca5e06.8135a","name":"Error","active":true,"console":"false","complete":"payload","x":921,"y":546,"wir

es":[]},{"id":"99f17e6b.660e8","type":"switch","z":"7eca5e06.8135a","name":"errorCode is not null","property":"payload.errorCode","rules":

[{"t":"nnull"},{"t":"null"}],"checkall":"true","outputs":2,"x":743,"y":553,"wires":[["bfe6a685.401958"],["ecafad7f.13505","8be41441.741be8"]]},

{"id":"405967d2.bfa698","type":"SmartObjects 

analytics","z":"7eca5e06.8135a","name":"","mnuboconfig":"ec6f6c42.13909","searchtype":"SearchQuery","inputquery":"","x":460,"y":652,"wires":

[["c656bd09.39a94","4ba72043.b458e"]]},

{"id":"2698fc72.d96704","type":"debug","z":"7eca5e06.8135a","name":"Error","active":true,"console":"false","complete":"payload","x":921,"y":629,"wir

es":[]},

{"id":"3704e552.c8fb1a","type":"debug","z":"7eca5e06.8135a","name":"rows","active":true,"console":"false","complete":"payload.rows","x":921,"y":661,

"wires":[]},{"id":"c656bd09.39a94","type":"switch","z":"7eca5e06.8135a","name":"errorCode is not null","property":"payload.errorCode","rules":

[{"t":"nnull"},{"t":"null"}],"checkall":"true","outputs":2,"x":706,"y":650,"wires":[["2698fc72.d96704"],["3704e552.c8fb1a"]]},

{"id":"cc161a0d.33e9e8","type":"function","z":"7eca5e06.8135a","name":"Create Owner","func":"msg.payload =\n{\n\t\"username\": 

context.global.mnubo.owner1,\n\t\"x_password\": \"12345678\"\n};\n\nreturn 

msg;","outputs":1,"noerr":0,"x":320.4444694519043,"y":161.88886642456055,"wires":[["97ea51fd.6815b"]]},

{"id":"ec0469f8.13fb98","type":"function","z":"7eca5e06.8135a","name":"Create an Object","func":"msg.payload = {\n\t\"x_device_id\": 

context.global.mnubo.object1,\n\t\"x_object_type\": \"test\",\n\t\"x_owner\": {\n\t\t\"username\": context.global.mnubo.owner1\n\t}\n};\nreturn 

msg;","outputs":1,"noerr":0,"x":290.4444465637207,"y":324.11110496520996,"wires":[["65405b9.f9abfa4"]]},

{"id":"b9dd056a.4622f8","type":"function","z":"7eca5e06.8135a","name":"Send an event","func":"msg.payload = [{\n\t\"x_object\": {\"x_device_id\": 

context.global.mnubo.object1},\n\t\"x_event_type\": \"event_type_test\",\n\t\"x_timestamp\": \"2015-01-22T00:01:25-02:00\",\n\t\"x_latitude\": 

57.876,\n\t\"x_longitude\": 57.876,\n\t\"temperature\": 25.6\n}];\nreturn 

msg;","outputs":1,"noerr":0,"x":277.11113357543945,"y":477.44441986083984,"wires":[["7bdf1a58.8420e4"]]},

{"id":"8be41441.741be8","type":"function","z":"7eca5e06.8135a","name":"Count Events","func":"msg.payload = {\n\t\"from\": \"event\",\n\t\"select\": 

[{\n\t\t\"count\": \"*\"\n\t}]\n};\nreturn msg;","outputs":1,"noerr":0,"x":228.22222518920898,"y":654.1111354827881,"wires":[["405967d2.bfa698"]]},

{"id":"a71ae1b7.58e52","type":"function","z":"7eca5e06.8135a","name":"Update owner","func":"msg.payload = [ \n  context.global.mnubo.owner1, \n  { 

\n\t\"x_registration_latitude\": 45.223, \n\t\"x_registration_longitude\": 73.234 \n  }\n];\nreturn 

msg;","outputs":1,"noerr":0,"x":290.44443130493164,"y":239.6666488647461,"wires":[["55802a44.aa7fd4"]]},

{"id":"fa88f7b.f057708","type":"function","z":"7eca5e06.8135a","name":"Update Object","func":"msg.payload = [\n    context.global.mnubo.object1, \n{ 

\n\t\"x_object_type\": \"test2\" \n}\n];\nreturn msg;\n","outputs":1,"noerr":0,"x":287.11111068725586,"y":400.7777976989746,"wires":

[["316f2be2.ce90d4"]]},{"id":"d82988c6.27d678","type":"function","z":"7eca5e06.8135a","name":"Send an Event FROM the object","func":"msg.payload = 

[\n    context.global.mnubo.object1, \n    [{\n\t\"x_event_type\": \"event_type_test\",\n\t\"x_timestamp\": \"2015-01-22T00:01:25-02:00\",\n\t

\"x_latitude\": 57.876,\n\t\"x_longitude\": 57.876,\n\t\"temperature\": 15.2\n    }]\n];\n\nreturn 

msg;","outputs":1,"noerr":0,"x":255.33331298828125,"y":534.7777709960938,"wires":[["58759d0b.a78a64"]]},

{"id":"2284a4fd.dd7b5c","type":"function","z":"7eca5e06.8135a","name":"set global env","func":"var mnubo = new Object();\nmnubo.owner1 = \"node-

red-auto1@test.com\"\nmnubo.object1 = \"node-red-device-auto1\"\n\n//Global context share by all functions\ncontext.global.mnubo = mnubo\n\nreturn 

msg;","outputs":1,"noerr":0,"x":328,"y":110,"wires":[["cc161a0d.33e9e8"]]},

{"id":"b6b35a05.494ca8","type":"function","z":"7eca5e06.8135a","name":"delete owner1","func":"msg.payload = context.global.mnubo.owner1\nreturn 

msg;","outputs":1,"noerr":0,"x":268,"y":842,"wires":[["86726b8a.798d98"]]},

{"id":"4ba72043.b458e","type":"function","z":"7eca5e06.8135a","name":"delete owner1","func":"msg.payload = context.global.mnubo.object1\nreturn 

msg;","outputs":1,"noerr":0,"x":266,"y":763,"wires":[["6deed747.921128"]]},

{"id":"c786d49c.387928","type":"inject","z":"7eca5e06.8135a","name":"","topic":"","payload":"","payloadType":"none","repeat":"","crontab":"","once":

false,"x":89,"y":163,"wires":[["cc161a0d.33e9e8"]]}]
```

## Example 2: Wind turbine demo

```
[{"id":"45637aea.ba9c84","type":"mnubo config","name":"sensor_loger","env":"sandbox","proxy_url":""},{"id":"b09130a5.4f6ed","type":"SmartObjects 

owners","debugBreak":false,"debugOutput":false,"name":"","mnuboconfig":"45637aea.ba9c84","functionselection":"create","inputtext":"","x":531,"y":120

,"z":"828b2334.7d74e","wires":[["9ddd4a82.6222b8"]]},

{"id":"9ddd4a82.6222b8","type":"debug","debugBreak":false,"debugOutput":false,"name":"","active":true,"console":"false","complete":"false","x":705,"

y":142,"z":"828b2334.7d74e","wires":[]},{"id":"7389cac3.8c7634","type":"SmartObjects 

objects","debugBreak":false,"debugOutput":false,"name":"","mnuboconfig":"45637aea.ba9c84","functionselection":"create","inputtext":"","x":534,"y":16

5,"z":"828b2334.7d74e","wires":[["9ddd4a82.6222b8"]]},

{"id":"464c0402.b9b3fc","type":"function","debugBreak":false,"debugOutput":false,"name":"Create an Wind Turbine","func":"msg.payload = {\n    

\"x_device_id\": \"\"+context.global.deviceid+\"\",\n    \"x_object_type\": \"windturbine\",\n    \"x_owner\":{\"username\":

\"\"+context.global.owner+\"\"},\n    \"country\": \"Canada\", \n    \"high\": \"85.0\", \n    \"make\": \"Vestas\", \n    \"max_power_output\": 

2.0, \n    \"model\": \"V90-2.0\", \n    \"rotor_diameter\": 90.0, \n    \"swept_area\": 6362.0,\n    \"x_registration_latitude\": 45.4838, \n    

\"x_registration_longitude\": -73.5622 \n};\n\nreturn msg;","outputs":1,"valid":true,"dependencies":

[],"x":315,"y":163,"z":"828b2334.7d74e","wires":[["7389cac3.8c7634"]]},

{"id":"1c713733.e38ec9","type":"inject","debugBreak":false,"debugOutput":false,"name":"","topic":"Create 

Object","payload":"","payloadType":"none","repeat":"","crontab":"","once":false,"x":103,"y":163,"z":"828b2334.7d74e","wires":

[["464c0402.b9b3fc"]]},{"id":"31e5562e.ce1aaa","type":"function","debugBreak":false,"debugOutput":false,"name":"Create an Owner","func":"msg.payload 

= {\n    \"username\": \"\"+context.global.owner+\"\", \n    \"x_password\": \"\"+context.global.owner+\"\"\n};\n\nreturn 

msg;","outputs":1,"valid":true,"dependencies":[],"x":315,"y":119,"z":"828b2334.7d74e","wires":[["b09130a5.4f6ed"]]},

{"id":"16395801.e9c6a8","type":"inject","debugBreak":false,"debugOutput":false,"name":"","topic":"Create an 

Owner","payload":"","payloadType":"none","repeat":"","crontab":"","once":false,"x":114,"y":118,"z":"828b2334.7d74e","wires":[["31e5562e.ce1aaa"]]},

{"id":"e2d951a.f1d26b","type":"inject","debugBreak":false,"debugOutput":false,"name":"","topic":"Delete Owner","payload":"node-red-

auto1@test.com","payloadType":"none","repeat":"","crontab":"","once":false,"x":104.5,"y":314,"z":"828b2334.7d74e","wires":[["f673c1f0.098c4"]]},

{"id":"5e12cf22.a1ed3","type":"SmartObjects 

owners","debugBreak":false,"debugOutput":false,"name":"","mnuboconfig":"45637aea.ba9c84","functionselection":"delete","inputtext":"","x":484.5,"y":3

13,"z":"828b2334.7d74e","wires":[["77433a39.88bcc4"]]},

{"id":"77433a39.88bcc4","type":"debug","debugBreak":false,"debugOutput":false,"name":"","active":true,"console":"false","complete":"false","x":664.5

,"y":288,"z":"828b2334.7d74e","wires":[]},{"id":"aaab6639.555498","type":"SmartObjects 

objects","debugBreak":false,"debugOutput":false,"name":"","mnuboconfig":"45637aea.ba9c84","functionselection":"delete","inputtext":"","x":486.5,"y":

263,"z":"828b2334.7d74e","wires":[["77433a39.88bcc4"]]},

{"id":"38491e39.c7b6e2","type":"inject","debugBreak":false,"debugOutput":false,"name":"","topic":"Delete Object","payload":"node-red-

auto1@test.com","payloadType":"none","repeat":"","crontab":"","once":false,"x":102.5,"y":262,"z":"828b2334.7d74e","wires":[["b8bb9830.474468"]]},

{"id":"b6b80c8f.4947f","type":"comment","debugBreak":false,"debugOutput":false,"name":"Delete","info":"","x":55,"y":214,"z":"828b2334.7d74e","wires"

:[]},

{"id":"7c7e961f.838168","type":"debug","debugBreak":false,"debugOutput":false,"name":"","active":true,"console":"false","complete":"false","x":441,"

y":552,"z":"828b2334.7d74e","wires":[]},

{"id":"6800d6c.f97ff28","type":"inject","debugBreak":false,"debugOutput":false,"name":"","topic":"","payload":"","payloadType":"none","repeat":"","c

rontab":"","once":false,"x":86,"y":435,"z":"828b2334.7d74e","wires":[["ed4095fb.12bf68"]]},

{"id":"ed4095fb.12bf68","type":"function","debugBreak":false,"debugOutput":false,"name":"Read last sample","func":"msg.payload = {\n  \"from\": 

\"event\",\n  \"limit\":1,\n  \"select\": [\n            {\"VALUE\": \"x_timestamp\" },\n    \t\t{\"VALUE\":\"instant_output_power\"},     \n    \t

\t{\"VALUE\":\"wind_speed\"}   \n\t\t],\n\t\"where\":{\n\t    \"and\":[\n\t    {\"x_object.x_device_id\":{\"eq\":\"\"+context.global.deviceid+

\"\"}}\n\t    ]\n\t    },\n\t\"orderBy\": [\n        {\"value\": \"x_timestamp\", \"direction\": \"desc\"}\n        ]\n};\n\nreturn 

msg;","outputs":1,"valid":true,"dependencies":[],"x":272,"y":435,"z":"828b2334.7d74e","wires":[["7349bb85.8cb644"]]},

{"id":"7349bb85.8cb644","type":"SmartObjects 

analytics","debugBreak":false,"debugOutput":false,"name":"","mnuboconfig":"45637aea.ba9c84","searchtype":"SearchQuery","inputquery":"","x":517,"y":4

34,"z":"828b2334.7d74e","wires":[["b2566e96.4da99"]]},{"id":"6fed489b.9012b8","type":"function","debugBreak":false,"debugOutput":false,"name":"Set 

Global Variables","func":"// set global variables\ncontext.global.owner = \"nodered\";\ncontext.global.deviceid = \"nodered-windturbine\";\n\nreturn 

msg;","outputs":1,"valid":true,"dependencies":[],"x":266,"y":20,"z":"828b2334.7d74e","wires":[[]]},

{"id":"b8bb9830.474468","type":"function","debugBreak":false,"debugOutput":false,"name":"Set Device ID","func":"msg.payload = 

\"\"+context.global.deviceid+\"\";\nreturn msg;","outputs":1,"valid":true,"dependencies":[],"x":285,"y":262,"z":"828b2334.7d74e","wires":

[["aaab6639.555498"]]},{"id":"f673c1f0.098c4","type":"function","debugBreak":false,"debugOutput":false,"name":"Set Owner","func":"msg.payload = 

\"\"+context.global.owner+\"\";\nreturn msg;","outputs":1,"valid":true,"dependencies":[],"x":279,"y":313,"z":"828b2334.7d74e","wires":

[["5e12cf22.a1ed3"]]},{"id":"a0b24b27.5f4db8","type":"function","debugBreak":false,"debugOutput":false,"name":"Read last sample","func":"var data = 

JSON.parse(msg.payload);\n\nvar output_power = data.rows[0][1];\nvar wind_speed = data.rows[0][2];\n\ncontext.global.output_power = output_power;

\ncontext.global.wind_speed = wind_speed;\n\nmsg.payload = {\n  \"from\": \"object\",\n  \"select\": [\n            {\"VALUE\": \"model\" },\n    

\t\t{\"VALUE\": \"x_owner.username\"} \n\t\t],\n\t\"where\":{\n\t    \"and\":[\n\t    {\"x_device_id\":{\"eq\":\"\"+context.global.deviceid+

\"\"}}\n\t    ]\n\t    },\n};\n\nreturn msg;","outputs":1,"valid":true,"dependencies":[],"x":259,"y":493,"z":"828b2334.7d74e","wires":

[["ea5dd459.15a228"]]},{"id":"ea5dd459.15a228","type":"SmartObjects 

analytics","debugBreak":false,"debugOutput":false,"name":"","mnuboconfig":"45637aea.ba9c84","searchtype":"SearchQuery","inputquery":"","x":505,"y":4

95,"z":"828b2334.7d74e","wires":[["98f447b6.670bb8"]]},

{"id":"98f447b6.670bb8","type":"json","debugBreak":false,"debugOutput":false,"name":"","x":690,"y":495,"z":"828b2334.7d74e","wires":

[["8659f869.79a608"]]},{"id":"8659f869.79a608","type":"function","debugBreak":false,"debugOutput":false,"name":"Read last sample","func":"var data = 

JSON.parse(msg.payload);\n\nvar model = data.rows[0][0];\nvar username = data.rows[0][1];\n\nmsg.payload = {\n    \"Output Power\": 

context.global.output_power,\n    \"Wind Speed\": context.global.wind_speed,\n    \"Model\": model,\n    \"Username\": username\n};\nreturn 

msg;","outputs":1,"valid":true,"dependencies":[],"x":254,"y":552,"z":"828b2334.7d74e","wires":[["7c7e961f.838168"]]},

{"id":"4207f5e.fbdf80c","type":"inject","debugBreak":false,"debugOutput":false,"name":"","topic":"","payload":"","payloadType":"none","repeat":"","c

rontab":"","once":true,"x":79,"y":20,"z":"828b2334.7d74e","wires":[["6fed489b.9012b8"]]},

{"id":"b2566e96.4da99","type":"json","debugBreak":false,"debugOutput":false,"name":"","x":703,"y":432,"z":"828b2334.7d74e","wires":

[["a0b24b27.5f4db8"]]},{"id":"2616035f.d9e9fc","type":"comment","debugBreak":false,"debugOutput":false,"name":"Build \"Last events\" 

secction","info":"","x":116,"y":377,"z":"828b2334.7d74e","wires":[]},

{"id":"92841059.6d7bf","type":"comment","debugBreak":false,"debugOutput":false,"name":"\"MAP\" -- Total Output 

Power","info":"","x":119,"y":615,"z":"828b2334.7d74e","wires":[]},

{"id":"5730458c.a8cfbc","type":"debug","debugBreak":false,"debugOutput":false,"name":"","active":true,"console":"false","complete":"false","x":700,"

y":672,"z":"828b2334.7d74e","wires":[]},

{"id":"d9214b42.26deb8","type":"inject","debugBreak":false,"debugOutput":false,"name":"","topic":"","payload":"","payloadType":"none","repeat":"","c

rontab":"","once":false,"x":79,"y":671,"z":"828b2334.7d74e","wires":[["6a2a254d.95d5dc"]]},

{"id":"6a2a254d.95d5dc","type":"function","debugBreak":false,"debugOutput":false,"name":"Read last sample","func":"msg.payload = {\n  \"from\": 

\"event\",\n  \"select\": [\n            {\"SUM\": \"instant_output_power\" }  \n\t\t],\n\t\"groupBy\": [\n\t

\"x_object.x_registration_country_iso_code\"\n  ]\n};\n\nreturn msg;","outputs":1,"valid":true,"dependencies":

[],"x":263,"y":672,"z":"828b2334.7d74e","wires":[["55c8c709.aa3738"]]},{"id":"55c8c709.aa3738","type":"SmartObjects 

analytics","debugBreak":false,"debugOutput":false,"name":"","mnuboconfig":"45637aea.ba9c84","searchtype":"SearchQuery","inputquery":"","x":503,"y":6

72,"z":"828b2334.7d74e","wires":[["5730458c.a8cfbc"]]},

{"id":"d7e200eb.281e","type":"comment","debugBreak":false,"debugOutput":false,"name":"Create","info":"","x":55,"y":76,"z":"828b2334.7d74e","wires":

[]}]
```

---
#<a name="section6"></a>6. Important notes

N/A

---
#<a name="section7"></a>7. Source code

https://github.com/mnubo/node-red-contrib-mnubo/tree/master/nodes/mnubo

---
#<a name="section8"></a>8. Known limitations

N/A

---
#<a name="section9"></a>9. References

http://nodered.org/

https://github.com/node-red/node-red
