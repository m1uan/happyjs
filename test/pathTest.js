var expect = require('expect.js'),
    happyCtrl = require('../lib/happyCtrl');

describe('path', function(){
    before(function(){
        if (typeof String.prototype.endsWith !== 'function') {
            String.prototype.endsWith = function(suffix) {
                return this.indexOf(suffix, this.length - suffix.length) !== -1;
            };
        }
    })

    it('index', function(){
        var name = 'get';
        var ctrl = function(){}
        var hapiConfig = happyCtrl.generatePath(name, ctrl, null);


        expect(hapiConfig).to.be.an('object');
        expect(hapiConfig).to.have.property('path')
        expect(hapiConfig.path).to.equal('');
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