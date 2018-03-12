const fs = require('fs');

module.exports = function(canal, mensagem, resultado) {
  const respostaEmJson = JSON.stringify({ texto: resultado, id: mensagem.id });

  fs.unlink(nomeDoArquivoBaixado, (erro) => {
    if (erro)
      throw erro;

    canal.assertQueue(fila_de_processados, {durable: true});
    canal.sendToQueue(fila_de_processados, new Buffer(respostaEmJson), {persistent : true});
    canal.ack(mensagemDaFila);
  });
};
