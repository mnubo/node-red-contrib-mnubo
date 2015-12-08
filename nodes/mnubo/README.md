# node-red contrib mnubo

This is the implementation of the mnubo's SmartObjects functionality in the node-red environment.

## Requirements

This is a node-red package, so it requires node-red, The minimum version of node-red supported is v0.10.10

To use the mnubo's SmartObjects nodes, you will need to have a valid mnubo account, with access granted on a namespace.
To obtain your unique namespace in the SmartObjects platform, contact sales@mnubo.com . Please use the subject title **node-red-contrinb-mnubo** and include in the body of the email the name of your company, contact name and phone number.

Once logged into mnubo's SmartObjects, the Official reference API can be found in the following: [API documentation](https://sop.mtl.mnubo.com/apps/doc/?i=t).

This package also requires the following package:
- mnubo's SmartObjects Javascript SDK [mnubo-js-sdk](https://github.com/mnubo/mnubo-js-sdk)
- ECMAScript 6 (Harmony) compatibility shims for legacy JavaScript engines [es6-shim](https://www.npmjs.com/package/es6-shim)

Those packages will be installed automatically by npm, as they are dependent packages.


## Installation

    sudo npm install -save --prefix ~/.node-red node-red-contrib-mnubo

## Usage

In node red, all the nodes are under the category (**Mnubo**).  Detailed info is available on the individual node.
Here is a brief description of the nodes:
- `SmartObjects config`: This is the Configuration Node that holds the SmartObjects credential, all nodes need to have this configured.
- `SmartObjects auth`: This node is used to fetch the access token for communication, with SmartObject, this node, you will allow you to get the status about the token.
- `SmartObjects owners` : This node is used to handle the Owners Ingestion API: `Create`, `Update`, `Delete`, `Claim Object`
- `SmartObjects objects` : This node is used to handle the Objectd Ingestion API: `Create`, `Update`, `Delete`
- `SmartObjects events` : This node is used to handle the Events Ingestion API: `Send`, `SendFromDevice`
- `SmartObjects analytics` : This node is used to handle the Search API: `getDataset`, `getDatamodel`, `baseSearchQurery`

## Examples

TODO...

## TODO in the sources
change mnubo analytics's CreateBasicQuery to baseSearchQuery
