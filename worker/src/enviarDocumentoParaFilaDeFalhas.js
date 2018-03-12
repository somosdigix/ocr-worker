const fs = require('fs');

module.exports = function(canal, mensagem) {
  canal.assertQueue(fila_de_nao_processados, {durable: true});
  canal.sendToQueue(fila_de_nao_processados, new Buffer(mensagem), {persistent : true});
  canal.ack(mensagemDaFila);
};
