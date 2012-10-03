var express = require('express');
var socket = require('socket.io');
var amqp = require('amqp');
var mqconfig = require('./amqp.config.json');

var path = require('path');
var config = {
    port: 1337
};
var server = express();

server.use(express.logger('dev'));
// server.use(express.static(path.normalize(__dirname + '/webroot')));
server.set('views', path.normalize(__dirname + '/views'));
server.set('view engine', 'hbs');


server.get('/',function(req,res) {
    res.render('index',{});
});

var app = server.listen(config.port);
console.log('server started on port',config.port);

var connection = amqp.createConnection(mqconfig);
connection.on('ready', function () {
    connection.exchange('blib', {type:"fanout"}, function (exchange) {
        initQ(exchange);
    });
});

process.on('exit', function () {
    connection.end();
});

function initQ(exchange) {
    var io = socket.listen(app);
    io.sockets.on('connection', function (socket) {
        //a queue for every connection
        connection.queue('', {
            closeChannelOnUnsubscribe: true
        }, function(q) {
            var ctag;
            console.log('io connection');
            q.bind(exchange,'');

            q.subscribe(function (message) {
              // Print messages to stdout
              console.log(message);
              socket.emit('blib', message);
            }).addCallback(function(ok) {
                ctag = ok.consumerTag;
                console.log(ctag);
            });

            console.log(q);

            socket.on('disconnect', function () {
                console.log('disconnected socket');
                q.unsubscribe(ctag);
                // q.unbind(exchange,'');
                // q.destroy();
            });
        });
    });
}