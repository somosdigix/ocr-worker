const fs = require('fs');
const argv = require('yargs').argv
const amqp = require('amqplib/callback_api');
const retry = require('retry');
const marky = require('marky');

const send_to_api = require('./send_to_api');
send_to_api.configure(argv.endpoint);

console.log(argv.endpoint);

let queue_name = argv.queue;

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

      start_send_timer();
    });
  });
}

function mount_batch(message) {
  if (_sending_batch)
    return;

  _messages_to_send.push(message);
}

function start_send_timer() {
  const timeout_in_seconds = argv.send_timeout * 1000;

  setTimeout(() => {
    send(_channel);
  }, timeout_in_seconds);
}

function send(channel) {
  if (_sending_batch)
    return;

  if (_messages_to_send.length === 0) {
    restart();
    return;
  }

  _sending_batch = true;

  const payload = _messages_to_send.map((message) => {
    const document = JSON.parse(message.content.toString());

    return {
      id: document.id,
      texto: document.texto
    };
  });

  const error_callback = () => {
    _messages_to_send.forEach((message) => _channel.nack(message));
    show_request_timer();
    restart();
  };

  const success_callback = () => {
    _messages_to_send.forEach((message) => _channel.ack(message));
    show_request_timer();
    restart();
  };

  marky.mark('send');
  send_to_api.batch(payload, error_callback, success_callback);
}

function show_request_timer() {
  const request_time = marky.stop('send');
  console.info(' [x] Requisição finalizada em %s ms', request_time.duration);
}

function restart() {
  _messages_to_send = [];
  _sending_batch = false;
  start_send_timer();
}