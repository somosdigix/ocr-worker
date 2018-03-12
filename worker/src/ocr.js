const marky = require('marky');
const tesseract = require('node-tesseract');

const opcoesDoTesseract = {
  l: 'por'
};

let estaProcessando = false;

module.exports = function(pathDaImagem) {
  if (estaProcessando)
    return;

  marky.mark('ocr');

  return new Promise((resolve, reject) => {
    estaProcessando = true;

    tesseract.process(pathDaImagem, opcoesDoTesseract, function(erro, textoDaImagem) {
      const tempoDeProcessamento = marky.stop('ocr');
      console.info(' [x] OCR finalizada: %s ms', tempoDeProcessamento.duration);

      estaProcessando = false;

      if (erro)
        reject(erro);

      resolve(textoDaImagem);
    });
  });
};
