// https://github.com/flowjs/flow.js/blob/master/samples/Node.js/flow-node.js
// https://github.com/flowjs/flow.js/blob/master/samples/Node.js/app.js
// connect to :https://github.com/flowjs/ng-flow

var fs = require('fs'),
    path = require('path'),
    util = require('util'),
    Stream = require('stream').Stream;
/**
 * Created by miuan on 17/12/14.
 */
module.exports = flow = function(temporaryFolder, destinationFolder) {
    var $ = this;
    $.temporaryFolder = temporaryFolder;
    $.maxFileSize = null;
    $.fileParameterName = 'file';
    $.destinationFolder = destinationFolder || $.temporaryFolder;

    $.DEFAULT_PAYLOAD = {
        output : 'file'
        ,parse : true
    }

    try {
        fs.mkdirSync($.temporaryFolder);
    } catch (e) {}

    function cleanIdentifier(identifier) {
        return identifier.replace(/[^0-9A-Za-z_-]/g, '');
    }

    function getChunkFilename(chunkNumber, identifier) {
        // Clean up the identifier
        identifier = cleanIdentifier(identifier);
        // What would the file name be?
        return path.resolve($.temporaryFolder, './flow-' + identifier + '.' + chunkNumber);
    }

    function getFileName(identifier, filename){
        var indexOfLastDot = filename.lastIndexOf('.');
        var originalFileExt = '';
        if(indexOfLastDot != -1){
            originalFileExt = filename.substr(indexOfLastDot)
            // remove dot in ext
            var containExtAtPos = identifier.indexOf(originalFileExt.substr(1));
            if(containExtAtPos != -1){
                identifier = identifier.substr(0, containExtAtPos);
            }
        }

        return 'flow-' + identifier + originalFileExt;
    }

    function getDestinationFilePath(destination, descFileName){
        return path.resolve(destination, './' + descFileName);
    }

    function validateRequest(chunkNumber, chunkSize, totalSize, identifier, filename, fileSize) {
        // Clean up the identifier
        identifier = cleanIdentifier(identifier);

        // Check if the request is sane
        if (chunkNumber == 0 || chunkSize == 0 || totalSize == 0 || identifier.length == 0 || filename.length == 0) {
            return 'non_flow_request';
        }
        var numberOfChunks = Math.max(Math.floor(totalSize / (chunkSize * 1.0)), 1);
        if (chunkNumber > numberOfChunks) {
            return 'invalid_flow_request1';
        }

        // Is the file too big?
        if ($.maxFileSize && totalSize > $.maxFileSize) {
            return 'invalid_flow_request2';
        }

        if (typeof(fileSize) != 'undefined') {
            if (chunkNumber < numberOfChunks && fileSize != chunkSize) {
                // The chunk in the POST request isn't the correct size
                return 'invalid_flow_request3';
            }
            if (numberOfChunks > 1 && chunkNumber == numberOfChunks && fileSize != ((totalSize % chunkSize) + parseInt(chunkSize))) {
                // The chunks in the POST is the last one, and the fil is not the correct size
                return 'invalid_flow_request4';
            }
            if (numberOfChunks == 1 && fileSize != totalSize) {
                // The file is only a single chunk, and the data size does not fit
                return 'invalid_flow_request5';
            }
        }

        return 'valid';
    }

    function _fileAlreadyInDestination(destinationFileName, chunkFilename, filename, identifier, callback){

        fs.exists(destinationFileName, function(exists) {
            if (exists) {
                callback('dest_found', destinationFileName, filename, identifier);
            } else {
                callback('not_found', null, null, null);
            }
        });
    }

    $.get = function(request, reply, destionation){
        $.try_get(request, function(status){
            if(status !='found') {
                reply(status).code(400)
            } else {
                reply(status).code(201)
            }
        })
    }

    //'found', filename, original_filename, identifier
    //'not_found', null, null, null
    $.try_get = function(req, destination, callback) {
        if(!callback){
            callback = destination;
            destination = null;
        }

        if(!destination){
            destination = $.destinationFolder;
        }

        var chunkNumber = req.query['flowChunkNumber'] || 0;
        var chunkSize = req.query['flowChunkSize'] || 0;
        var totalSize = req.query['flowTotalSize'] || 0;
        var identifier = req.query['flowIdentifier'] || 0;
        var filename = req.query['flowFilename'] || 0;

        if (validateRequest(chunkNumber, chunkSize, totalSize, identifier, filename) == 'valid') {
            var chunkFilename = getChunkFilename(chunkNumber, identifier);
            fs.exists(chunkFilename, function(exists) {
                if (exists) {
                    callback('found', chunkFilename, filename, identifier);
                } else {
                    callback('not_found', null, null, null);
                    //var fileName = getFileName(identifier, filename);
                    //var destFilePath = getDestinationFilePath(destination, fileName);
                    //_fileAlreadyInDestination(destFilePath, chunkFilename, fileName, identifier, callback);
                }
            });
        } else {
            callback('not_found', null, null, null);
        }
    };



    $.post = function(request, reply, destination){
        $.try_post(request, destination, function(status, filename, nameDescFile, identifier){
            if(status !='found') {
                reply(nameDescFile).code(200)
            } else {
                reply(nameDescFile).code(201)
            }
        })
    }

    $.try_post = function(req, destination, callback){

        if(!callback){
            callback = destination;
            destination = null;
        }

        if(!destination){
            destination = $.destinationFolder;
        }

        $.cunks(req, function(status, pathChunkFile, original_filename, identifier){
            if(status == 'done'){
                var nameDescFile = getFileName(identifier, original_filename);
                var pathDescFile = getDestinationFilePath(destination, nameDescFile);
                var chunkSize = req.payload['flowChunkSize'];
                if(chunkSize > 1){
                    copyChunksToDestination(callback, pathDescFile, nameDescFile, identifier)
                } else {
                    moveChunkToDestination(callback, pathDescFile, pathChunkFile, nameDescFile, identifier)
                }

            } else {
                callback(status, pathChunkFile, original_filename, identifier)
            }
        })
    }

    //'partly_done', filename, original_filename, identifier
    //'done', filename, original_filename, identifier
    //'invalid_flow_request', null, null, null
    //'non_flow_request', null, null, null
    $.cunks = function(req, callback) {


        var fields = req.payload;
        var files = fields ? req.payload.file : null;

        var chunkNumber = fields['flowChunkNumber'];
        var chunkSize = fields['flowChunkSize'];
        var totalSize = fields['flowTotalSize'];
        var identifier = cleanIdentifier(fields['flowIdentifier']);
        var filename = fields['flowFilename'];

        if (!files.filename || !files.bytes) {
            callback('invalid_flow_request', null, null, null);
            return;
        }

        var original_filename = files.filename;
        var validation = validateRequest(chunkNumber, chunkSize, totalSize, identifier, filename, files.bytes);
        if (validation == 'valid') {
            var chunkFilename = getChunkFilename(chunkNumber, identifier);

            // Save the chunk (TODO: OVERWRITE)
            fs.rename(files.path, chunkFilename, function(err) {
                console.log('rename', err, chunkFilename)

                // Do we have all the chunks?
                var currentTestChunk = 1;
                var numberOfChunks = Math.max(Math.floor(totalSize / (chunkSize * 1.0)), 1);
                var testChunkExists = function() {
                    fs.exists(getChunkFilename(currentTestChunk, identifier), function(exists) {
                        if (exists) {
                            currentTestChunk++;
                            if (currentTestChunk > numberOfChunks) {
                                callback('done', filename, original_filename, identifier);
                            } else {
                                // Recursion
                                testChunkExists();
                            }
                        } else {
                            callback('partly_done', filename, original_filename, identifier);
                        }
                    });
                };
                testChunkExists();
            });
        } else {
            callback(validation, filename, original_filename, identifier);
        }
    };

    // Pipe chunks directly in to an existsing WritableStream
    //   r.write(identifier, response);
    //   r.write(identifier, response, {end:false});
    //
    //   var stream = fs.createWriteStream(filename);
    //   r.write(identifier, stream);
    //   stream.on('data', function(data){...});
    //   stream.on('finish', function(){...});
    $.write = function(identifier, writableStream, options) {


        options = options || {};
        options.end = (typeof options['end'] == 'undefined' ? true : options['end']);

        // Iterate over each chunk
        var pipeChunk = function(number) {

            var chunkFilename = getChunkFilename(number, identifier);
            fs.exists(chunkFilename, function(exists) {

                if (exists) {
                    // If the chunk with the current number exists,
                    // then create a ReadStream from the file
                    // and pipe it to the specified writableStream.
                    var sourceStream = fs.createReadStream(chunkFilename);
                    sourceStream.pipe(writableStream, {
                        end: false
                    });
                    sourceStream.on('end', function() {
                        // When the chunk is fully streamed,
                        // jump to the next one
                        pipeChunk(number + 1);
                    });
                } else {
                    // When all the chunks have been piped, end the stream
                    if (options.end) writableStream.end();
                    if (options.onDone) options.onDone();
                }
            });
        };
        pipeChunk(1);
    };

    $.clean = function(identifier, options) {
        options = options || {};

        // Iterate over each chunk
        var pipeChunkRm = function(number) {

            var chunkFilename = getChunkFilename(number, identifier);

            //console.log('removing pipeChunkRm ', number, 'chunkFilename', chunkFilename);
            fs.exists(chunkFilename, function(exists) {
                if (exists) {

                    console.log('exist removing ', chunkFilename);
                    fs.unlink(chunkFilename, function(err) {
                        if (err && options.onError) options.onError(err);
                    });

                    pipeChunkRm(number + 1);

                } else {

                    if (options.onDone) options.onDone();

                }
            });
        };
        pipeChunkRm(1);
    };

    function copyChunksToDestination(callback, status, fileDescPath, original_filename, identifier){

        var stream = fs.createWriteStream(fileDescPath);
        $.write(identifier, stream);
        stream.on('finish', function(){
            var options = {
                onDone : function(status, filename, original_filename, identifier){
                    callback('done_desc', filename, original_filename, identifier)
                }
            }
            $.clean(identifier, options);
        });
    }

    function copyChunksToDestination(callback, pathDescFile, nameDescFile, identifier){
        var stream = fs.createWriteStream(pathDescFile);
        $.write(identifier, stream);
        stream.on('finish', function(){
            var options = {
                onDone : function(status){
                    callback('done_desc', pathDescFile, nameDescFile, identifier)
                }
            }
            $.clean(identifier, options);
        });
    }

    function moveChunkToDestination(callback, pathDescFile, pathChunkFile, nameDescFile, identifier){
        fs.rename(pathDescFile, pathChunkFile, function(err){
            if(err){
                callback('error_rename', err)
            } else {
                callback('done_desc', pathDescFile, nameDescFile, identifier)
            }

        });

    }

    return $;
};