/**
 * Created by miuan on 6/12/14.
 */
module.exports = (function(){
"use strict"
    var self = {};

    self.get = function(request, reply){
        reply('<html><h1>hotel</h1>' +
            'api/1.0/hotels <a href="api/1.0/hotels">[all]</a><br/>' +
            'api/1.0/hotels/1 <a href="api/1.0/hotels/1">[hotel:1]</a><br/>' +
            'api/1.0/hotels/1/rooms/201 <a href="api/1.0/hotels/1/rooms/201">[room:201]</a><br/>' +
            'api/1.0/hotels/1/rooms/202 <a href="api/1.0/hotels/1/rooms/202">[room:202]</a><br/>' +
            'api/1.0/hotels/1/rooms/203 <a href="api/1.0/hotels/1/rooms/203">[room:203]</a><br/>' +
            'api/1.0/hotels/2 <a href="api/1.0/hotels/1">[hotel:2]</a><br/>' +
            'api/1.0/hotels/2/rooms/201 <a href="api/1.0/hotels/2/rooms/201">[room:201]</a><br/>' +
            'api/1.0/hotels/2/rooms/202 <a href="api/1.0/hotels/2/rooms/202">[room:202]</a><br/>' +
            'api/1.0/hotels/2/rooms/203 <a href="api/1.0/hotels/2/rooms/203">[room:203]</a><br/>' +
            '</html>');
    }


    return self;
})();