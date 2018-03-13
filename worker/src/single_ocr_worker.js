const download = require('./download');
const ocr = require('./ocr');
const amqp = require('amqplib/callback_api');
const argv = require('yargs').argv
const finalizarProcessamentoDoDocumento = require('./finalizarProcessamentoDoDocumento');
const enviarDocumentoParaFilaDeFalhas = require('./enviarDocumentoParaFilaDeFalhas');

/*

ed.ms.gov.br/hserverbeta/rest/documentos/1488/paginas/7/jpg"}
{"id":466512,"url":"http://horus.sed.ms.gov.br/hserverbeta/rest/documentos/1488/paginas/8/jpg"}
{"id":466513,"url":"http://horus.sed.ms.gov.br/hserverbeta/rest/documentos/1488/paginas/9/jpg"}
{"id":466514,"url":"http://horus.sed.ms.gov.br/hserverbeta/rest/documentos/1488/paginas/10/jpg"}
{"id":466515,"url":"http://horus.sed.ms.gov.br/hserverbeta/rest/documentos/1488/paginas/11/jpg"}
{"id":466516,"url":"http://horus.sed.ms.gov.br/hserverbeta/rest/documentos/1488/paginas/12/jpg"}

*/

async function processarDocumento(canal, mensagemDaFila) {
  try {
    const mensagem = JSON.parse(mensagemDaFila.content.toString());
    const nomeDoArquivoBaixado = await download(mensagem.url);

    try {
      const resultado = await ocr(nomeDoArquivoBaixado);
      finalizarProcessamentoDoDocumento(canal, mensagem, resultado);
    }
    catch(erroAoLerArquivo) {
      console.error(erroAoLerArquivo);
      canal.nack(mensagemDaFila);
    }
  }
  catch(erroAoProcessarArquivo) {
    console.error(erroAoProcessarArquivo);
    enviarDocumentoParaFilaDeFalhas(canal, mensagemDaFila)
  }
}

function enviar_para_fila_de_nao_processados(canal, mensagem) {
  canal.assertQueue(fila_de_nao_processados, {durable: true});
  canal.sendToQueue(fila_de_nao_processados, new Buffer(mensagem), {persistent : true});
}

amqp.connect(argv.amqp_uri, function(erro, conexao) {
  conexao.createChannel((erro, canal) {
    canal.assertQueue('para_processamento', {durable: true});
    canal.prefetch(1);
    canal.consume('para_processamento', msg => processarDocumento(canal, msg), { noAck: false });
  });
});
