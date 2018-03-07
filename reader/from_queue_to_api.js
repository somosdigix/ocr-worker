const fs = require('fs');
const argv = require('yargs').argv
const amqp = require('amqplib/callback_api');
const queue_name = 'processados';
const send_to_api = require('./send_to_api');

amqp.connect(argv.amqp_uri, (error, connection) => {
  connection.createChannel((error, channel) => {
    channel.assertQueue(queue_name, {durable: true});
    channel.prefetch(argv.parallel_count);
    channel.consume(queue_name, (message) => send(channel, message), {noAck: false});
  });
});
 
function send(channel, message) {
  const document = JSON.parse(message.content.toString());

  const payload = {
    idImagem: document.id,
    resultadoDaOcr: document.texto
  };

  const error_callback = () => {
    channel.nack(message);
  };

  const success_callback = () => { 
    channel.ack(message)
  };

  send_to_api(payload, error_callback, success_callback);
}