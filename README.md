happyjs
=======

library for easy way to add routes into HAPI server (http://hapijs.com) inspirate by SAILS (http://sailsjs.org/#/)


# Create server

create file `server.js` :

```JavaScript
var Happy = require('./lib/happy.js');
Happy.start();
```

now you can run node server.js


# Create controllers

create file `IndexCtrl` in directory `ctrls` directory with controllers you can chagne in `config.js` file:

```JavaScript
module.exports = function(){
  hello_get = function(request, reply){
      reply('hello world'); }
}
```
after you type in your browser `localhost/hello` you get `hello world` . Lets make something more complex...

```JavaScript
module.exports = function(){
  index_get = function(request, reply){
      reply('get index'); 
  }
  
  index_post = function(request, reply){
      reply('post index'); 
  }
  
  hello_get = function(request, reply){
      reply('hello world'); 
  }
}
```

Than you can reach
```Request
GET / : get index 200
POST / : post index 200
GET /hello : hello world 200
```

{you are right word index is reserved}

# Co-existenci two controller with similar name

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
