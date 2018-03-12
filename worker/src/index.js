const fs = require('fs');
const request = require('request');
const argv = require('yargs').argv
const amqp = require('amqplib/callback_api');
const tesseract = require('node-tesseract');
const uuid = require('uuid/v4');
const marky = require('marky');

const fila_de_entrada = "para_processamento";
const fila_de_processados = "processados";
const fila_de_nao_processados = "nao_processados";

const download = (uri, filename, callback) => {
  request.head(uri, (err, res, body) => {
    if (err)
      throw new Error(' [x] Erro ao baixar o arquivo: %s', err);

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
      console.info(' [x] Baixando %s', mensagem.url);

      const pathDaImagemBaixada = `./${uuid()}.jpg`;

      marky.mark('download');
      download(mensagem.url, pathDaImagemBaixada, () => {
        const tempo_de_download = marky.stop('download');
        console.info(' [x] Download finalizado: %s ms', tempo_de_download.duration);

        marky.mark('ocr');
        tesseract.process(pathDaImagemBaixada, tesseract_options, function(erro, text) {
          const tempo_de_ocr = marky.stop('ocr');
          console.info(' [x] OCR finalizada: %s ms', tempo_de_ocr.duration);

          if (erro) {
            console.error(erro);
            ch.nack(mensagemDaFila);

            throw new Error(erro.message);
          }

          else {
            const resposta = {texto: text, id: mensagem.id }
            const respostaEmJson = JSON.stringify(resposta);

            fs.unlink(pathDaImagemBaixada, (erro) => {
              if (erro)
                return;

              enviar_para_fila_de_processados(ch, respostaEmJson);

              ch.ack(mensagemDaFila);
              esta_processando = false;
            });
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
