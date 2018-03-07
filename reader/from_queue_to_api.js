const fs = require('fs');
const argv = require('yargs').argv
const amqp = require('amqplib/callback_api');
const queue_name = 'processados';
const send_to_api = require('./send_to_api');

let _channel;
let _messages_to_send = [];

amqp.connect(argv.amqp_uri, (error, connection) => {
  connection.createChannel((error, channel) => {
    _channel = channel;

    _channel.assertQueue(queue_name, {durable: true});
    _channel.prefetch(argv.parallel_count);
    _channel.consume(queue_name, (message) => mount_batch(message), {noAck: false});

    start_sender();
  });
});

function mount_batch(message) {
  _messages_to_send.push(message);
}

function start_sender() {
  setInterval(() => {
    console.log('send');
    send(_channel);
  }, argv.send_timeout * 1000);
}

function send(channel) {
  if (_messages_to_send.length < argv.parallel_count)
    return;

  const payload = _messages_to_send.map((message) => {
    const document = JSON.parse(message.content.toString());

    return {
      idImagem: document.id,
      resultadoDaOcr: document.texto
    };
  });

  console.log(' [x] Enviando lote:', _messages_to_send.length);
  payload.forEach((item) => console.log(' [x] %s', item.idImagem));
  console.log(' [x] ---------------');

  const error_callback = () => {
    _messages_to_send.forEach((message) => _channel.nack(message));
  };

  const success_callback = () => { 
    _messages_to_send.forEach((message) => _channel.ack(message));
  };

  send_to_api.batch(payload, error_callback, success_callback);
}