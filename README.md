happyjs
=======

library for easy way to add routes into HAPI server (http://hapijs.com) inspirate by SAILS (http://sailsjs.org/#/)


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
