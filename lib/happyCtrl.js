module.exports.DEF_CTRL_METHODS = ['_get', '_post', '_delete', '_put'];
module.exports.DEF_CTRL_NAME = "Ctrl.js";
/**
 * /*  Output:

 [{
        HAPPY - not method: 'try_get',
        HAPPY - not path: '/test/{p}/end',
        settings: {
            handler: [Function],
            method: 'try_get',
            plugins: {},
            app: {},
            validate: {},
            payload: 'stream',
            auth: undefined,
            cache: [Object] }
    }]
/**
 * http://spumko.github.io/resource/api/#server-route-routes-
 * @type {{auth: boolean, params: string}}
 */
var ctrlConfigDefault = {
    /**
     * authorisation - example 'password'
     */
    auth : false,
    /**
     * params - examples:
     *      {params*}
     *      {name?}
     */
    params : ''
}

function fillUpWithConfig(localConf, upConf){
    var conf = localConf;
    if(!conf){
        conf = {};
    }

    // check just the items whic his default config
    // otherwise can by taken config from localconfig for current handler as well
    for(var prop in ctrlConfigDefault){
        if(typeof conf[prop] === 'undefined'){
            // fill up by upConf or default conf
            conf[prop] = upConf ? upConf[prop] : ctrlConfigDefault[prop];
        }
    }

    return conf;
}

var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(func) {
    var fnStr = func.toString().replace(STRIP_COMMENTS, '')
    var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES)
    if(result === null)
        result = []
    return result
}

module.exports = (function(HAPPY){
    var self = { }

    var DEF_CTRL_METHODS = ['get', 'post', 'delete', 'put', 'patch', 'options'];
    self.DEF_CTRL_NAME = "Ctrl.js";

    self.connect = function(ctrlPath, fileName, pathExtra){
        var ctrlWithHandlers = require(ctrlPath);

        if(typeof ctrlWithHandlers === 'function'){
            var parameters = getParamNames(ctrlWithHandlers);
            var par = [];

            parameters.forEach(function(parameter,idx){
                par[idx] = getParameter(parameter)
            })

            HAPPY.server.log('info', parameters);
            ctrlWithHandlers = ctrlWithHandlers(par[0], par[1], par[2], par[3], par[4], par[5], par[6], par[7], par[8], par[9], par[10], par[11]);

            function getParameter(parameter){
                if(parameter=='$server'){
                    return HAPPY.server;
                } else if(parameter=='$pg'){
                    return HAPPY.pgClient;
                } else if(parameter=='$mongo'){
                    return HAPPY.mongoClient;
                }  else if(parameter=='$mongoose'){
                    return HAPPY.mongooseClient;
                } else if(parameter=='$config'){
                    return HAPPY.config;
                }else if(parameter=='$flow'){
                    return HAPPY.flowLib;
                } else {
                    return 'unknown param';
                }
            }
        }

        self.handleCtrl(fileName, ctrlWithHandlers, pathExtra);
    }

    self.handleCtrl = function(name, ctrl, pathExtra){
        pathExtra = pathExtra || ''
        if(typeof ctrl !== 'object'){
            throw 'controller is not object'
        }

        var globalConfig;
        if(ctrl.hasOwnProperty('$')){
            globalConfig = ctrl.$;
        } else if(ctrl.hasOwnProperty('$global')){
            globalConfig = ctrl.$global;
        }

        for(var propertyName in ctrl) {
            if(propertyName[0] != '_' && propertyName[0] != '$'){
                var extra = pathExtra + _generateHandlerName(name);
                var handler = ctrl[propertyName];

                var config = ctrl['$'+propertyName];
                // old notation with _config on end
                if(!config){
                    config = ctrl['$'+propertyName + '_config'];
                }

                var configLocalAndGlobal = _mergeGlobalWithLocalConfig(globalConfig, config);

                var hapiConfig = self.generatePath(propertyName, handler, configLocalAndGlobal, extra);


                var path = '';
                // add 'api/1.0/'
                if(extra.length > 0){
                    path += extra;
                }

                // add method
                if(hapiConfig.path.length > 0){
                    // 'api/1.0' doesnt end with '/' or method doesn't start with '/'
                    if(!hapiConfig.path.endsWith('/') && hapiConfig.path[0] != '/'){
                        path += '/';
                    }

                    path += hapiConfig.path;
                }

                // api/1.0/messages/ -> cut the end '/'
                if(path.endsWith('/')){
                    path = path.substr(0, path.length-1);
                }

                if(path[0] != '/'){
                    hapiConfig.path = '/' + path;
                } else {
                    hapiConfig.path = path;
                }

                HAPPY.route(hapiConfig);
            }

            // propertyName is  what you want
            // you can try_get the value like this: myObject[propertyName]
        }
    }

    self.generatePath = function(path, handler, config){
        var hapiConfig = config || {};
        var hapiRoute = {

        }

        var method;
        DEF_CTRL_METHODS.some(function(met){
            if(path.endsWith(met)){
                method = met;
                return true;
            }
        });

        if(!method){
            throw 'unknow method';
        }



        hapiRoute.path = _generatePath(method, path, config);
        hapiRoute.config = hapiConfig;
        hapiRoute.method = method.toUpperCase();

        // params could be clean after _generatePath
        hapiConfig.params = undefined;
        hapiConfig.handler = handler;

        return hapiRoute;

    }

    function _generatePath(method, path, config){
        var params = config ? config.params : null;
        var paramsIsObject = params && typeof params === 'object';

        path = path.substr(0, path.length - method.length);

        var paths = path.split('_');
        path = '';

        paths.forEach(function(p, idx){
            path += '/' + p;


            if(paramsIsObject && params.hasOwnProperty(p)) {
                    path +='/' + params[p];
            }
        })

        if(params && typeof params === 'string'){
            path += params;
        } else if(paramsIsObject && params.hasOwnProperty('_')){
            path = '/' + params._ + path;
        }

        // used to was with " && path.length > 1"
        // but test in pathTest : "simple ctrl with config" was return
        // Error: expected '/api/1.0/messages/' to equal (insted of) '/api/1.0/messages'
        if(path.endsWith('/')){
            path = path.substr(0, path.length-1);

        }

        return path;
    }

    function _generateHandlerName(name){
        // remove Ctrl on the end with .js
        var name = name.substr(0, name.length-7).toLowerCase();

        //if we add '/' into Ctrl
        // they try_get two '//'
        if(name.length > 0){
            name = '/' + name;
        }

        return name;
    }

    function _mergeGlobalWithLocalConfig(globalConfig, localConfig){
        localConfig = localConfig || {}
        if(!globalConfig) {
            return localConfig;
        }

        for(var global in globalConfig){
            // don't add properyt to local if is already setup
            // may in global is auth : false but in local could be auth : 'session'
            // don't change these setting
            if(globalConfig.hasOwnProperty(global) && !localConfig.hasOwnProperty(global)){
                localConfig[global] = globalConfig[global];
            }
        }

        return localConfig;
    }

    return self;
});


