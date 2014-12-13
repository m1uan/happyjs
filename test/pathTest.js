var FakeHapi = function(){
    return {
        route : function(){}
    }
}

var expect = require('expect.js'),
    happyCtrl = require('../lib/happyCtrl')(FakeHapi);

describe('ctrl', function(){
    before(function(){
        if (typeof String.prototype.endsWith !== 'function') {
            String.prototype.endsWith = function(suffix) {
                return this.indexOf(suffix, this.length - suffix.length) !== -1;
            };
        }
    })

    describe('paths',function(){
        it('index', function(){
            var name = 'get';
            var ctrl = function(){}
            var hapiConfig = happyCtrl.generatePath(name, ctrl, null);


            expect(hapiConfig).to.be.an('object');
            expect(hapiConfig).to.have.property('path')
            expect(hapiConfig.path).to.equal('/');
        })

        it('hotels post', function(){
            var name = 'hotels_post';
            var ctrl = function(){}
            var hapiConfig = happyCtrl.generatePath(name, ctrl, null);


            expect(hapiConfig).to.be.an('object');
            expect(hapiConfig).to.have.property('path')
            expect(hapiConfig).to.have.property('method')
            expect(hapiConfig.path).to.equal('/hotels');
            expect(hapiConfig.method).to.equal('POST');
        })

        it('hotels/{idhotel} delete', function(){
            var config = {
                params: '{idhotel}'
            }
            var name = 'hotels_delete';
            var ctrl = function(){}
            var hapiConfig = happyCtrl.generatePath(name, ctrl, config);


            expect(hapiConfig).to.be.an('object');
            expect(hapiConfig).to.have.property('path')
            expect(hapiConfig).to.have.property('method')
            expect(hapiConfig.path).to.equal('/hotels/{idhotel}');
            expect(hapiConfig.method).to.equal('DELETE');
        })

        it('hotels/{idhotel}/rooms put', function(){
            var config = {
                params: {
                    hotels: '{idhotel}'
                }
            }
            var name = 'hotels_rooms_put';
            var ctrl = function(){}
            var hapiConfig = happyCtrl.generatePath(name, ctrl, config);


            expect(hapiConfig).to.be.an('object');
            expect(hapiConfig).to.have.property('path')
            expect(hapiConfig).to.have.property('method')
            expect(hapiConfig.path).to.equal('/hotels/{idhotel}/rooms');
            expect(hapiConfig.method).to.equal('PUT');
        })


        it('{idhotel}/message/{idmessage} patch', function(){
            var config = {
                params: {
                    _: '{idhotel}',
                    message: '{idmessage}'
                }
            }
            var name = 'message_patch';
            var ctrl = function(){}
            var hapiConfig = happyCtrl.generatePath(name, ctrl, config);


            expect(hapiConfig).to.be.an('object');
            expect(hapiConfig).to.have.property('path')
            expect(hapiConfig).to.have.property('method')
            expect(hapiConfig.path).to.equal('/{idhotel}/message/{idmessage}');
            expect(hapiConfig.method).to.equal('PATCH');
        })
    })

    describe('ctrls', function(){
        it('simple ctrl', function(cb){
            var ctrl = {
                modules_get : function(){

                }
            }

            FakeHapi.route = function(hapiConfig){
                expect(hapiConfig).to.be.an('object');
                expect(hapiConfig).to.have.property('path');
                expect(hapiConfig).to.have.property('config');
                expect(hapiConfig.config).to.have.property('handler')
                expect(hapiConfig.config.handler).to.be.equal(ctrl.modules_get)
                expect(hapiConfig.path).to.equal('/modules')
                cb();
            }



            happyCtrl.handleCtrl('Ctrl',ctrl);
        })


        it('simple ctrl with config', function(cb){
            var ctrl = {
                $global : {
                    // or could be just
                    auth: false,
                    cache : {
                        expiresIn: 5000
                    }
                },
                $post : {
                    auth : 'session',
                    validate :{
                        payload: {
                            some_joi_testing : {}
                        }
                    }
                },
                post : function(){

                }
            }

            FakeHapi.route = function(hapiConfig){
                expect(hapiConfig).to.be.an('object');
                expect(hapiConfig).to.have.property('path');
                expect(hapiConfig).to.have.property('config');
                expect(hapiConfig.config).to.have.property('handler')
                expect(hapiConfig.config).to.have.property('validate')
                expect(hapiConfig.config.validate).to.have.property('payload')
                expect(hapiConfig.config).to.have.property('cache')
                expect(hapiConfig.config.cache).to.have.property('expiresIn')
                expect(hapiConfig.config).to.have.property('auth')
                expect(hapiConfig.config.auth).to.be.equal('session')
                expect(hapiConfig.config.handler).to.be.equal(ctrl.post)
                expect(hapiConfig.path).to.equal('/api/1.0/messages')
                cb();
            }



            happyCtrl.handleCtrl('api/1.0/MessagesCtrl',ctrl);
        })
    });

    describe('conect', function(){
        it('example 1', function(cb){
            FakeHapi.route = function(hapiConfig){
                expect(hapiConfig).to.be.an('object');
                expect(hapiConfig).to.have.property('path');
                expect(hapiConfig).to.have.property('config');
                expect(hapiConfig.config).to.have.property('handler')
                expect(hapiConfig.path).to.equal('/')
                cb();
            }

            happyCtrl.connect('../examples/simple-ctrl/ctrl/IndexCtrl.js','Ctrl');
        })

        it.skip('example 1', function(cb){
            FakeHapi.route = function(hapiConfig){
                expect(hapiConfig).to.be.an('object');
                expect(hapiConfig).to.have.property('path');
                expect(hapiConfig).to.have.property('config');
                expect(hapiConfig.config).to.have.property('handler')
                expect(hapiConfig.path).to.equal('/')
                cb();
            }

            happyCtrl.connect('../examples/messages-ctrl/ctrl/api/1.0/MessagesCtrl.js','ctrl/api/1.0/MessagesCtrl');
        })
    })


})