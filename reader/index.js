const fs = require('fs');
const argv = require('yargs').argv
const amqp = require('amqplib/callback_api');
const fila_de_processados = "processados";

amqp.connect(argv.amqp_uri, function(err, conn) {
  conn.createChannel(function(err, ch) {
    ch.assertQueue(fila_de_processados, {durable: true});
    ch.prefetch(1);
    ch.consume(fila_de_processados, msg => processarDocumento(ch, msg), {noAck: false});
  });
});
 
function processarDocumento(ch, mensagemDaFila) {
    const mensagem = JSON.parse(mensagemDaFila.content.toString());
    ch.ack(mensagemDaFila);
    fs.writeFile(`${mensagem.id}.txt`, mensagem.texto);
}