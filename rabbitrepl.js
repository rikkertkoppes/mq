var repl = require('repl');
var amqp = require('amqp');
var config = require('./amqp.config.json');

// var connection = amqp.createConnection({host: '192.168.0.108' });
// var connection = amqp.createConnection({host: 'camarillo' });
var connection = amqp.createConnection(config);
// var connection = amqp.createConnection();

// Wait for connection to become established.
connection.on('ready', function () {
    connection.exchange('twitter', {type:"fanout"}, function (exchange) {

    // Use the default 'amq.topic' exchange
    // connection.queue('my-queue', function(q){

        function myeval(cmd, context, filename, callback) {
            var result = cmd+'-'+context+'-'+filename;
            try {
                cmd = eval(cmd);
            } catch(e) {
                cmd = cmd.replace(/^\(|\)$/g,'').replace(/[\n\r]+$/g,'');
            }
            // connection.publish('my-queue', {body:cmd});
            exchange.publish('', {body:cmd});
            // connection.publish('my-queue', cmd, {
            //     contentType: 'text/plain'
            // });
            result = 'ok';
            callback(null, cmd);
        }


        repl.start({
            prompt: 'amqp> ',
            eval: myeval
        });
    });
});

process.on('exit', function () {
  connection.end();
});