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
server.use(express.bodyParser());
// server.use(express.static(path.normalize(__dirname + '/webroot')));
server.set('views', path.normalize(__dirname + '/views'));
server.set('view engine', 'hbs');


server.get('/',function(req,res) {
    res.render('index',{});
});

process.on('exit', function () {
    connection.end();
});

var app = server.listen(config.port);
console.log('server started on port',config.port);

var connection = amqp.createConnection(mqconfig);
connection.on('ready', function () {
    var io = socket.listen(app);
    io.sockets.on('connection', function (socket) {
        initQ(connection,socket,'blib');
        initQ(connection,socket,'hw');
    });

    initRest(connection,server);
});


function initRest(connection,server) {

    server.post('/mq/:exchange',function(req,res) {
        var en = req.params.exchange;
        var body = req.param('body');
        console.log(body);
        connection.exchange(en, {type:"fanout"}, function (exchange) {
            exchange.publish('', {body:body});
            res.end('sent');
        });
    });
}

function initQ(connection,socket,exchangeName) {
    connection.exchange(exchangeName, {type:"fanout"}, function (exchange) {
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
              socket.emit(exchangeName, message);
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