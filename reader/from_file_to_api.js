const fs = require('fs');
const argv = require('yargs').argv
const amqp = require('amqplib/callback_api');
const request = require('request');

fs.readdir(argv.folder, (error, document) => {
  text_documents = document.filter((documento) => documento.indexOf('.txt') > -1);
  send_documents(text_documents);
});

function send_documents(documents) {
  let send_count = 0;
  
  documents.forEach((document) => {
    if (send_count > 0)
      return;

    send_count++;
    const payload = {
      idImagem: parseInt(document.replace('.txt')),
      resultadoDaOcr: fs.readFileSync(document, 'utf8')
    };

    // console.log(' [x] Sending %s - %s', payload.idImagem, payload.resultadoDaOcr);

    request.post('http://hom.domusweb.agehab.ms.gov.br/questionario/api/documento/atualizarOcr', payload, (error, response, body) => {
      if (error) {
        console.log(' [x] Erro ao enviar para API: %s');
        console.log(' [x] Erro: %s', error);
        console.log(' [x] StatusCode: %s', response.statusCode);
        console.log(' [x] Body: %s', body);
        console.log(' [x] ----------------------------');
        return;
      }

      fs.unlink(document);
    });
  });
}