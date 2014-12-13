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

    it.only('hotels/{idhotel} delete', function(){
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

})