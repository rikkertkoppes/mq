var keys = require('./twitter.config.json');
var config = require('./amqp.config.json');

var amqp = require('amqp');
var tu = require('tuiter')(keys);

var connection = amqp.createConnection(config);

// Wait for connection to become established.
connection.on('ready', function () {
    connection.exchange('twitter', {type:"fanout"}, function (exchange) {
        initStream(exchange);
    });
});


function initStream(exchange) {
    tu.filter({track: ['lego']}, function(stream){
      // tweets :)
      stream.on('tweet', function(data){
        console.log(data.text);
        // connection.publish('my-queue', {body:data.text});
        exchange.publish('', {body:data.text});
      });
    });
}

process.on('exit', function () {
  connection.end();
});