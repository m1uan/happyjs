happyjs
=======

library for easy way to add routes into HAPI server (http://hapijs.com) inspirate by SAILS (http://sailsjs.org/#/)

Create server
-------------

create file `server.js` :

`var Happy = require('./lib/happy.js');`<br>
`Happy.start();`

now you can run node server.js

Create controller
-----------------

create file `IndexCtrl` in directory `ctrls` directory with controllers you can chagne in `config.js` file:

`module.exports = function(){`<br>
  `index_get = function(request, reply){`<br>
      `reply('get index'); }`<br>
  `index_post = function(request, reply){`<br>
      `reply('post index'); }`<br>
  `hello_get = function(request, reply){`<br>
      `reply('hello world'); }`<br>
`}`<br>

Than you can reach
GET / : `get index` 200<br>
POST / : `post index` 200<br>
GET /hello : `hello world` 200<br>

{you are right word index is reserved}

Co-existenci two controller with similar name
---------------------------------------------
Let's have two controllers in two directories

`ctrls/IndexCtrl`:

`module.exports = function(){`<br>
  `index_get = function(request, reply){`<br>
      `reply('index 1'); }`<br>
  `messages_get = function(request, reply){`<br>
      `reply('messages 1'); }`<br>
`}`<br>

`ctrls/messages/IndexCtrl`:

`module.exports = function(){`<br>
  `index_get = function(request, reply){`<br>
      `reply('index 2'); }`<br>
  `messages_get = function(request, reply){`<br>
      `reply('messages 2'); }`<br>
`}`<br>

result will be:
---------------
GET / : `index 1` 200<br>
GET /messages : `messages 1` 200<br>
GET /messages/ : `index 2` 200<br>
GET /messages/messages : `messages 2` 200<br>
GET /messages/messages/ : `not found` 401<br>
