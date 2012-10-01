var amqp = require('amqp');
var config = require('amqp.config.json');

// var connection = amqp.createConnection({ });
var connection = amqp.createConnection(config);

// Wait for connection to become established.
connection.on('ready', function () {

  connection.exchange('blib', {type:"fanout"}, function (exchange) {
      connection.queue('', function(q) {
        q.bind(exchange,'');

        q.subscribe(function (message) {
          // Print messages to stdout
          console.log(message.body);
        });
      });
  });
});