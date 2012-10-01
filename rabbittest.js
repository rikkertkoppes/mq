var amqp = require('amqp');
var config = require('amqp.config.json');

// var connection = amqp.createConnection({ });
var connection = amqp.createConnection(config);

// Wait for connection to become established.
connection.on('ready', function () {

  connection.exchange('twitter', {type:"fanout"}, function (exchange) {
      connection.queue('', function(q) {
        q.bind(exchange,'');

        q.subscribe(function (message) {
          // Print messages to stdout
          console.log(message.body);
        });
      });
  });

  connection.exchange('msg', {type:"fanout"}, function (exchange) {
      connection.queue('', function(q) {
        q.bind(exchange,'');

        q.subscribe(function (message) {
          // Print messages to stdout
          console.log(message.body);
        });
      });
  });

  // // Use the default 'amq.topic' exchange
  // connection.queue('my-queue', function(q){
  //     // Catch all messages
  //     q.bind('#');

  //     // Receive messages
  //     q.subscribe(function (message) {
  //       // Print messages to stdout
  //       console.log(message.body);
  //     });
  // });
});