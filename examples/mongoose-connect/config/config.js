module.exports = {
    views: {
        engines: { jade: require('jade') }
        ,path: process.cwd() + '/views'
    }
    ,mongoose_connect:'mongodb://localhost/test'
    ,port:5000
}