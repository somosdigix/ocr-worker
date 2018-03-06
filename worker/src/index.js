const fs = require('fs');
const request = require('request');
const argv = require('yargs').argv
const amqp = require('amqplib/callback_api');
const tesseract = require('node-tesseract');
const uuid = require('uuid/v4');

const fila_de_entrada = "para_processamento";
const fila_de_processados = "processados";
const fila_de_nao_processados = "nao_processados";

const download = (uri, filename, callback) => {
  request.head(uri, (err, res, body) => {
    request(uri)
      .pipe(fs.createWriteStream(filename))
      .on('close', callback);
  });
};

const tesseract_options = {
  l: 'por'
};

let esta_processando = false;

function enviar_para_fila_de_processados(canal, mensagem) {
  canal.assertQueue(fila_de_processados, {durable: true});
  canal.sendToQueue(fila_de_processados, new Buffer(mensagem), {persistent : true});
}

function enviar_para_fila_de_nao_processados(canal, mensagem) {
  canal.assertQueue(fila_de_nao_processados, {durable: true});
  canal.sendToQueue(fila_de_nao_processados, new Buffer(mensagem), {persistent : true});
}
 
function processarDocumento(ch, mensagemDaFila) {
    try {
      esta_processando = true;

      const mensagem = JSON.parse(mensagemDaFila.content.toString());
      console.log(" [x] Baixando %s", mensagem.url);

      const pathDaImagemBaixada = `./${uuid()}.jpg`;

      download(mensagem.url, pathDaImagemBaixada, () => {
        tesseract.process(pathDaImagemBaixada, tesseract_options, function(err, text) {
          if (err) {
            console.error(err);
            throw new Error(err.message);
          } else {
            let resposta = {texto: text, id: mensagem.id }
            let respostaEmJson = JSON.stringify(resposta);
            
            fs.unlink(pathDaImagemBaixada);
            enviar_para_fila_de_processados(ch, respostaEmJson);

            console.log(" [x] Done");
            ch.ack(mensagemDaFila);
            esta_processando = false;
          }
        });
      });
    }
    catch(excecao) {
      console.error(excecao);
      
      enviar_para_fila_de_nao_processados(ch, mensagemDaFila.content.toString());

      ch.ack(mensagemDaFila);
      esta_processando = false;
    }
}

amqp.connect(argv.amqp_uri, function(err, conn) {
  conn.createChannel(function(err, ch) {
    if (esta_processando)
      return;

    ch.assertQueue(fila_de_entrada, {durable: true});
    ch.prefetch(1);
    ch.consume(fila_de_entrada, msg => processarDocumento(ch, msg), { noAck: false });
  });
})