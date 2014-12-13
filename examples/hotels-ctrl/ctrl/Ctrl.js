/**
 * Created by miuan on 6/12/14.
 */
module.exports = (function(){
"use strict"
    var self = {};

    self.get = function(request, reply){
        reply.view('messages');
    }


    return self;
})();