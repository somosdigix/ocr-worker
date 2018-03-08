const fs = require('fs');
const argv = require('yargs').argv
const amqp = require('amqplib/callback_api');
const retry = require('retry');

const send_to_api = require('./send_to_api');
const queue_name = 'processados';

let _channel;
let _messages_to_send = [];
let _sending_batch = false;

const retry_operation = retry.operation({ retries: 20 });
retry_operation.attempt(start_connection);

function start_connection(attempt_number) {
  amqp.connect(argv.amqp_uri, (error, connection) => {
    console.info(' [x] Conectando a fila, tentativa número %s...', attempt_number);

    if (retry_operation.retry(error))
      return;

    if (error) {
      console.warn(' [x] Não foi possível realizar a conexão. Motivo: %s', error);
      return;
    }

    console.info(' [x] Fila conectada');

    connection.on('error', (error) => {
      console.warn(' [x] Conexão encerrada inesperadamente');
      console.warn(error);

      retry_operation.retry(error);
    });
  
    connection.createChannel((error, channel) => {
      _channel = channel;
  
      _channel.assertQueue(queue_name, {durable: true});
      _channel.prefetch(argv.parallel_count);
      _channel.consume(queue_name, (message) => mount_batch(message), {noAck: false});
  
      start_sender();
    });
  });
}

function mount_batch(message) {
  if (!_sending_batch)
    _messages_to_send.push(message);
}

function start_sender() {
  setInterval(() => {
    send(_channel);
  }, argv.send_timeout * 1000);
}

function send(channel) {
  if (_sending_batch)
    return;

  _sending_batch = true;

  const payload = _messages_to_send.map((message) => {
    const document = JSON.parse(message.content.toString());

    return {
      idImagem: document.id,
      resultadoDaOcr: document.texto
    };
  });

  const error_callback = () => {
    _messages_to_send.forEach((message) => _channel.nack(message));
    _messages_to_send = [];
    _sending_batch = false;
  };

  const success_callback = () => { 
    _messages_to_send.forEach((message) => _channel.ack(message));
    _messages_to_send = [];
    _sending_batch = false;
  };

  send_to_api.batch(payload, error_callback, success_callback);
}