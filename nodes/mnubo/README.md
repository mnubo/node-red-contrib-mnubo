# node-red contrib mnubo 

This is the implementation of the mnubo smart oject functionality in node-red environment.

## Requirements

This package is a node-red package, so it require node-red, minimum version of tested node-red was v0.10.10

To use mnubo nodes, you will require to have a valid mnubo account, with access granted on a sandbox or production system.
Official mnubo reference API can be found in: [API documentation](https://sop.mtl.mnubo.com/apps/doc/?i=t).

This package also require the mnubo Javascript SDK [mnubo-js-sdk](https://github.com/mnubo/mnubo-js-sdk)
This package will be installed automatically by npm, as it is a dependencies

Note that if you are runing node.js < 4.0.0, the mnubo Javascript SDK need will require `es6-shim`, you will need to install it manually

    npm install --save es6-shim


## Installation

    npm install --save node-red-contrib-mnubo

## Usage

In node red, all the node are under the categorie (**mnubo**), detail info is documented on the individual node, here is a high level definition:
- `mnubo config` (**mandatory**): This is the Configuration Node that hold the Mnubo credential, all node need to have this configure.
- `mnubo auth` (*optional*): This node is use to fetch the access token for communication, if you use this node, you will be able to have information in the status about the token state.
- `mnubo owners` : This node is use to handle the Owners Ingestion API: `Create`, `Update`, `Delete`, `Claim Object`
- `mnubo objects` : This node is use to handle the Object Ingestion API: `Create`, `Update`, `Delete`
- `mnubo events` : This node is use to handle the Events Ingestion API: `Send`, `SendFromDevice`
- `mnubo analytics` : This node is use to handle analytics Search API: `getDataset`, `getDatamodel`, `CreateBasicQuery`
    
## Examples

TODO...