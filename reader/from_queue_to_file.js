const fs = require('fs');
const argv = require('yargs').argv
const amqp = require('amqplib/callback_api');
const queue_name = "processados";

amqp.connect(argv.amqp_uri, (error, connection) => {
  connection.createChannel((error, channel) => {
    channel.assertQueue(queue_name, {durable: true});
    channel.prefetch(1);
    channel.consume(queue_name, (message) => save_to_file(channel, message), {noAck: false});
  });
});
 
function save_to_file(channel, message) {
  const document = JSON.parse(message.content.toString());
  
  fs.writeFile(`./files/${document.id}.txt`, document.texto, (error) => {
    if (error) {
      channel.nack(message);
      return;
    }

    channel.ack(message);
  });
}