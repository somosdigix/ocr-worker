const fs = require('fs');
const argv = require('yargs').argv
const amqp = require('amqplib/callback_api');
const request = require('request');

fs.readdir(argv.folder, (error, document) => {
  text_documents = document.filter((documento) => documento.indexOf('.txt') > -1);
  send(text_documents);
});

function send(documents) {
  let send_count = 0;
  
  documents.forEach((document) => {
    if (send_count > 0)
      return;

    send_count++;

    send_to_api({
      idImagem: parseInt(document.replace('.txt')),
      resultadoDaOcr: fs.readFileSync(document, 'utf8')
    },
    () => channel.nack(),
    () => channel.ack());
  });
}