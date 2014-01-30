(function(){
    'use strict';
    
    var http        = require('http'),
        express     = require('express'),
        mime        = require('mime'),
        fs          = require('fs'),
        
        PORT        = 4321,
        OK          = 200,
        MOVED       = [301, 302],
        app         = express(),
        DIR         = __dirname + '/img/',
        EXT         = '.png',
        OK_IMG      = DIR + 'ok'    + EXT,
        ERROR_IMG   = DIR + 'error' + EXT,
        MOVED_IMG   = DIR + 'moved' + EXT,
        TYPE        = mime.lookup(OK_IMG),
        TWO_SECONDS = 2000;
    
    http.createServer(app).listen(PORT);
    
    console.log('server: ' + PORT + '\npid: ' + process.pid);
    
    app.use('/', express.static(__dirname));
    
    app.get('/', function(req, res) {
        send(res, 'README.md', console.log.bind(console));
    });
    
    app.get('/host/*', function(request, response) {
        var host = 'http://' + request.params[0],
            sended;
        
        console.log(request.params);
        
        if (host) {
            response.contentType(TYPE);
            
            setTimeout(function() {
                sended = true;
                send(response, MOVED_IMG);
            }, TWO_SECONDS);
            
            http.get(host, function(res) {
                var status = res.statusCode;
                
                console.log(status);
                if (!sended)
                    if (status === OK)
                        send(response, OK_IMG);
                    else if(status === MOVED[0] || status === MOVED[1])
                        send(response, MOVED_IMG);
                    else
                        send(response, ERROR_IMG);
                
                sended = true;
            }).on('error', function(e) {
                response.contentType(TYPE);
                send(response, ERROR_IMG);
            });
        } else
            response.send('/:host');
    });
    
    function send(res, name, callback) {
        var read   = fs.createReadStream(name),
            error   = function (error) {
                res.send(error);
            },
            success = function () {
                if (typeof callback === 'function')
                    callback(name);
            };
        
        res.on('error', error);
        read.on('error', error);
        read.on('open', function() {
            read.pipe(res);
            read.on('end', success);
        });
    }
})();