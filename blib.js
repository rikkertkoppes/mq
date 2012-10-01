var amqp = require('amqp');
var config = require('amqp.config.json');

var connection = amqp.createConnection(config);

// Wait for connection to become established.
connection.on('ready', function () {
    connection.exchange('blib', {type:"fanout"}, function (exchange) {
        initStream(exchange);
    });
});


function initStream(exchange) {
    var blib = 0;
    setInterval(function() {
        blib+=1;
        console.log('sending blib',blib);
        exchange.publish('', {body:blib});
    },1000);
}