const fs = require('fs');
const argv = require('yargs').argv
const amqp = require('amqplib/callback_api');
const queue_name = argv.queue;

const _root_dir = './scripts';

create_root_dir();

amqp.connect(argv.amqp_uri, (error, connection) => {
  connection.createChannel((error, channel) => {
    channel.assertQueue(queue_name, {durable: true});
    channel.prefetch(1);
    channel.consume(queue_name, (message) => save_to_file(channel, message), {noAck: false});
  });
});

function create_root_dir() {
  if (fs.existsSync(_root_dir))
    return;

  fs.mkdirSync(_root_dir);
}

function save_to_file(channel, message) {
  const document = JSON.parse(message.content.toString());
  const sql = `UPDATE imagens SET resultadoocr = '${document.texto.replace('\'', '\\\'')}' WHERE imagem_cd = ${document.id}`;

  fs.writeFile(`./scripts/${document.id}.sql`, sql, { encoding: 'utf8' }, (error) => {
    if (error) {
      console.log(' [x] Erro');
      channel.nack(message);
      return;
    }

    console.log(` [x] Gerado ${document.id}`);

    channel.nack(message);
  });
}