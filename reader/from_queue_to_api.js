const fs = require('fs');
const argv = require('yargs').argv
const amqp = require('amqplib/callback_api');
const request = require('request');
const queue_name = 'processados';

amqp.connect(argv.amqp_uri, (error, connection) => {
  connection.createChannel((error, channel) => {
    channel.assertQueue(queue_name, {durable: true});
    channel.prefetch(argv.parallel_count);
    channel.consume(queue_name, (message) => send_to_api(channel, message), {noAck: false});
  });
});
 
function send_to_api(channel, message) {
  const document = JSON.parse(message.content.toString());
  const payload = {
    idImagem: document.id,
    resultadoDaOcr: document.texto
  };

  console.log(' [x] Enviando %s', payload.idImagem);
  console.log(' [x] Enviando %s', message.content.toString()));
  
  request.post('http://hom.domusweb.agehab.ms.gov.br/questionario/api/documento/atualizarOcr', payload, (error, response, body) => {
    console.log(' [x] StatusCode: %s - %s', payload.idImagem, response.statusCode);

      if (error) {
        console.log(' [x] Erro ao enviar para API: %s');
        console.log(' [x] Erro: %s', error);
        console.log(' [x] Body: %s', body);
        console.log(' [x] ----------------------------');

        channel.nack(message);
        return;
      }

      channel.ack(message);
      console.log(' [x] Enviando %s', payload.idImagem);
    });
}