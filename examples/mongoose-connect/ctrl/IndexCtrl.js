/**
 * Created by miuan on 6/12/14.
 */

// import async to make control flow simplier
var async = require('async');

module.exports = (function($mongoose){
"use strict"
    var Person = require('../model/Person.js')($mongoose);

    var data = [
        { name : 'bill', age : 25, birthday : new Date().setFullYear((new
            Date().getFullYear() - 25)), gender : "Male",
            likes : ['movies', 'games', 'dogs']},
        { name : 'mary', age : 30, birthday : new Date().setFullYear((new
            Date().getFullYear() - 30)), gender : "Female",
            likes : ['movies', 'birds', 'cats']},
        { name : 'bob', age : 21, birthday : new Date().setFullYear((new
            Date().getFullYear() - 21)), gender : "Male",
            likes : ['tv', 'games', 'rabbits']},
        { name : 'lilly', age : 26, birthday : new Date().setFullYear((new
            Date().getFullYear() - 26)), gender : "Female",
            likes : ['books', 'cats', 'dogs']},
        { name : 'alucard', age : 1000, birthday : new Date().setFullYear((new
            Date().getFullYear() - 1000)), gender : "Male",
            likes : ['glasses', 'wine', 'the night']},
    ];


    var self = {};


    self.index_get = function(request, reply){
        async.each(data, function (item, cb) {
            Person.create(item, cb);
        }, function (err) {

            // lean queries return just plain javascript objects, not
            // MongooseDocuments. This makes them good for high performance read
            // situations

            // when using .lean() the default is true, but you can explicitly set the
            // value by passing in a boolean value. IE. .lean(false)
            var q = Person.find({ age : { $lt : 1000 }}).sort('age').limit(2).lean();
            q.exec(function (err, results) {
                reply(results);
            });
        });
    }


    return self;
});