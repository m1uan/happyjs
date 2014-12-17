var Hapi = require('hapi'),
    fs = require('fs')



var happy = (function(){
    var self = {};

    var defaultConfig = {
        ipaddress : 'localhost'
        ,port : 8080
        ,hapiConfig:{/*views: {
             engines: { jade: require('jade') },
             path: process.cwd() + '/views'
             },*/
            debug:{}
            ,payload:{
                maxBytes:1900000
            }
        }
        ,ctrlPath: 'ctrl'
    };


    self.route = function(params){
        log('route info','route path',params.method, params.path)
        self.server.route(params);
    }

    self.log = function(tag, log1, log2, log3){
        log(tag, log1, log2, log3);
    }

    function log(tag, log1, log2, log3){
        console.log(tag, log1, log2, log3);
    }

    self.start = function(cbBeforeStart, cbAfterStart){
        if (typeof String.prototype.endsWith !== 'function') {
            String.prototype.endsWith = function(suffix) {
                return this.indexOf(suffix, this.length - suffix.length) !== -1;
            };
        }

        _setupConfig(['/config.js', '/config/config.js']);
        _setupConfig(['/local.js','/config/local.js']);
        console.log(self.config.hapiConfig);
        self.server = new Hapi.Server(self.config.ipaddress, self.config.port, self.config.hapiConfig);
        console.log('views', self.config.views);
        if(self.config.views) {

            self.server.views(self.config.views)
        }


        //console.log('view setting : ' + config.views.path);
        _registerAssets('', self.config.assets || 'assets');


        // first database - because is linked in server
        // and server is parameter for init of controller
        //_initDB(_initDBCallback);
        _registerCtrl(cbBeforeStart, cbAfterStart);


        _initDB();
        _initMongooseClient();
        _registerFlow();
    }

    self.getHapiServer = function(){
        return self.server;
    }


    function fillUpWithConfig(addOrUdateConf){
       if(!self.config || !addOrUdateConf) {
           return self.config;
       }

        // check just the items whic his default config
        // otherwise can by taken config from localconfig for current handler as well
        for(var prop in addOrUdateConf){
            if(prop == 'hapiConfig'){
                for(var hapiProp in addOrUdateConf[prop]){
                    self.config[prop][hapiProp] = addOrUdateConf[prop][hapiProp];
                }
            } else {
                self.config[prop] = addOrUdateConf[prop];
            }

        }

        return self.config;
    }

    function _setupConfig(configPats){
        self.config = defaultConfig;
        var configured = false;

        configPats.forEach(function(path){
            var properPath = process.cwd() + path;
            if(fs.existsSync(properPath)){
                // may someone can have two files in root and in config dir
                // and make mismash between testing..
                if(configured){
                    throw 'Already configured by file: ' + configured;
                }

                try{
                    var config = require(properPath);
                    fillUpWithConfig(config);
                } catch(err){
                }

                console.log('take: ', properPath);
                configured = properPath;
            }
        });


        /*
        try{
            self.server.config_local = require(process.cwd() + '/config/local.js');
        } catch(err){
            self.server.config_local = null;
            console.warn('you can add you personal local setting');
        } */
    }

    function _registerCtrl(cbBeforeStart, cbAfterStart){

        // password
        //require(process.cwd() + '/passport.js').initialize(Hapi, self.server);

        var ctrlpath = self.config.ctrlPath;
        console.log(self.config.ctrlPath)

        self.happyCtlr = require('./happyCtrl.js')(self);

        _exploreForCtrl(ctrlpath, '');



        if(cbBeforeStart){
            cbBeforeStart(self.server);
        }
        self.server.start(function(){
            console.log(self.config.ipaddress +':' + self.config.port);
            if(cbAfterStart){
                cbAfterStart(self.server);
            }

        });
    }

    function _initDB(cb){
        var db = null;
        if(self.server.config_local && self.server.config_local.DB_NAME){
            db = require('pg');
        } else {
            return;
        }

        var dbname = server.config_local.DB_NAME;
        var dbuser = server.config_local.DB_USER;
        var dbpass = server.config_local.DB_PASS;
        var dbport = server.config_local.DB_PORT;
        var dbhost = server.config_local.DB_HOST;

        var connection = 'postgres://'+dbuser+':'+dbpass+'@'+dbhost+':'+dbport+'/' + dbname;
        console.info('db connection: ' + connection);
        var pgclient = new db.Client(connection);
        pgclient.connect(function(err){
            cb(err, pgclient);

            // test query
            pgclient.query('SELECT NOW() AS "theTime"', function(err, result) {
                if(err) {
                    return console.error('error running query', err);
                }
                console.log(result.rows[0].theTime);
                //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
                //client.end();
            });
        });
    }

    /**
     * init (connect) mongoose Object Modeling
     * @private
     */
    function _initMongooseClient(){

        if(self.config.mongoose_connect){
            self.mongooseClient = require('mongoose');
            self.mongooseClient.connect(self.config.mongoose_connect);
        } else {
            self.mongooseClient = null;
        }
    }


    function _registerAssets(assetspath, assets){
        var filePath = assetspath + assets + '/';
        var properPath = './' + filePath;

        fs.exists(properPath, function(exists){
            if(!exists){
                return;
            }

            fs.readdir(properPath, function(err, files){
                //console.log(files);
                files.forEach(function(file){
                    _registerAssets(filePath, file);
                });

            });

            console.log('assets', filePath, properPath);

            self.server.route({
                method: 'GET',
                path: '/' + filePath + '{file}',
                handler: {
                    directory: {
                        path: properPath
                        , listing: false, index: true
                    }
                }
            });


        });


    }

    function _connectCtrl(ctrlpath, file, extraPath){
        var procCwd = process.cwd();
        var filePath = ctrlpath + '/' + file;
        var filePathFull =  procCwd + '/' + filePath;
        var extraPathWithFile = ctrlpath.substr(self.config.ctrlPath.length + 1);

        // if is not here the call will start without '/'
        // like api/1.0/messages/... instead /api/1.0/messages/...
        if(extraPathWithFile.length > 1){
            extraPathWithFile = '/' + extraPathWithFile;
        }


        var stats = fs.lstatSync(filePathFull);
        if(stats.isDirectory()){
            var superExtraPath = extraPath ?  extraPath + file + '/' : file + '/';
            _exploreForCtrl(filePath, superExtraPath);
            return;
        }
        else if(filePath.indexOf(self.happyCtlr.DEF_CTRL_NAME) == -1){
            console.error('sorry but file \'' + filePath + '\' is not a Controller, (engine end by ...' + self.happyCtlr.DEF_CTRL_NAME);
            return;
        } else {
            console.info('controller found:' + filePath,extraPathWithFile,self.config.ctrlPath);
        }


        var ctrlWithHandlers = self.happyCtlr.connect(filePathFull, file, extraPathWithFile);



    }


    function _exploreForCtrl(ctrlpath, extraPath){
        fs.exists(ctrlpath, function(exists){

            if(exists){
                //console.log(ctrlpath + 'exists');
                var files = fs.readdirSync(ctrlpath);
                for(var file in files){
                    _connectCtrl(ctrlpath, files[file], extraPath);
                }
            }
        });
    }


    function _registerFlow(){
        if(self.config.flow){
            if(!self.config.flow.temporaryFolder){
                throw 'config flow must have temporaryFolder with path to upload folder'
            }

            self.flowLib = require('./flow.js')(self.config.flow.temporaryFolder, self.config.flow.destinationFolder)

        }
    }

    return self;
})();



// Create a server with a host, port, and config










module.exports = happy;