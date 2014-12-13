/**
 * Created by miuan on 13/12/14.
 */
module.exports = (function(){
    "use strict"
    var self = {};

    var HOTELS = [
        {id:1,name:'hello', services : 'text', rooms : [{room: '200', guest:'Jan Hus'}, {room: '201', guest:'Jan Amos Komensky'}, {room: '202', guest:'Karel Jaromir Erben'}, {room: '203', guest:'Jan Nepomucky'}]}
        ,{id:2,name:'world', services : 'text', rooms : [{room: '200', guest:'Milan Kundera'},{room: '201', guest:'Karel Havlicek Borovsky'}, {room: '203', guest:'Frantisek Palacky'}]}]


    // the params are seting from routing in HAPI
    // GET : api/1.0/hotels/
    // or
    // GET : api/1.0/hotels/1
    self.$get = {
        params: '{id?}'
    }

    self.get = function(request, reply){
        if(request.params.id){
            var hotel = getHotelById(request.params.id)
            reply(hotel ? hotel : new Error(request.params.id + " is wrong id"));
        } else {
            reply(HOTELS);
        }

    }

    // the params are seting from routing in HAPI
    // GET : api/1.0/hotels/1/rooms
    // or
    // GET : api/1.0/hotels/1/rooms/201
    self.$rooms_get = {
        params: {
            _ : '{id}',
            rooms: '{room?}'
        }
    }
    self.rooms_get = function(request, reply){
        var hotel = getHotelById(request.params.id);

        if(request.params.room){
            var room = getRoomByNumber(hotel.rooms, request.params.room)
            reply(room ? room : new Error(request.params.room + " is wrong room number"));
        } else {
            reply(hotel.rooms);
        }
    }


    self.$post = {
        /*
        auth : 'session'
         */
        /*,validate : {

            payload : {
                text : Joi.string()
            }
        }*/
    }
    self.post = function(request, reply){
        request.payload.id = HOTELS.length;
        HOTELS.push(request.payload);
        reply('ok')
    }


    function getHotelById(id){
        var hotel;
        HOTELS.some(function(h){
            if(h.id = id){
                hotel = h;
                return true;
            }
        });

        return hotel;
    }

    function getRoomByNumber(rooms, number){
        var hotel;
        rooms.some(function(h){
            if(h.room == number){
                hotel = h;
                return true;
            }
        });

        return hotel;
    }

    return self;
})();