const marky = require('marky')
const request = require('request');
const uuid = require('uuid/v4');
const fs = require('fs');

module.exports = (uri) => {
  return new Promise((resolve, reject) => {
    console.info(' [x] Baixando %s', uri);
    marky.mark('download');

    request.head(uri, (erro) => {
      if (erro) {
        console.error(' [x] Erro ao baixar o arquivo: %s', erro);
        reject();
      }

      const nomeDoArquivo = `./${uuid()}.jpg`;

      request(uri)
        .pipe(fs.createWriteStream(nomeDoArquivo))
        .on('close', () => {
          const tempo_de_download = marky.stop('download');
          console.info(' [x] Download finalizado em %s ms', tempo_de_download.duration);

          resolve(nomeDoArquivo);
        });
    });
  });
};
