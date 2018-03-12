const test = require('ava');
const td = require('testdouble');
const async = require('async');

const marky = require('marky');
const tesseract = require('node-tesseract');
const ocr = require('../src/ocr');

const imagem = './imagemInexistente.jpg';

let opcoesDoTesseract = {
  l: 'por'
};

test.beforeEach(t => {
  tesseract.process = td.func();
  console.info = td.func();

  marky.mark = td.func();
  marky.stop = td.func();
  td.when(marky.stop('ocr')).thenReturn({ duration: 10 });
  opcoesDoTesseract;
});

test('deve processar uma imagem usando tesseract', async t => {
  td.when(tesseract.process(imagem, td.matchers.anything())).thenCallback(null, 'textoDaImagem');

  await ocr(imagem);

  t.notThrows(() => td.verify(tesseract.process(imagem, td.matchers.anything(), td.matchers.anything())));
});

test('deve processar usando pt-br como linguagem padrão', async t => {
  td.when(tesseract.process(td.matchers.anything(), opcoesDoTesseract)).thenCallback(null, 'textoDaImagem');

  await ocr(imagem);

  t.notThrows(() => td.verify(tesseract.process(td.matchers.anything(), opcoesDoTesseract, td.matchers.anything())));
});

test('deve retornar o texto contido na imagem', async t => {
  const textoDaImagem = 'Texto extraído da imagem bla bla bla...';
  td.when(tesseract.process(imagem, opcoesDoTesseract)).thenCallback(null, textoDaImagem);

  const resultado = await ocr(imagem);

  t.is(resultado, textoDaImagem);
});

test('deve informar o erro de processamento ao falhar', async t => {
  const erroDeProcessamento = new Error('Erro ao realizar a leitura da imagem');
  td.when(tesseract.process(td.matchers.anything(), opcoesDoTesseract)).thenCallback(erroDeProcessamento);

  const erro = await t.throws(ocr(imagem));

  t.is(erroDeProcessamento, erro);
});

test('não deve processar duas imagens simultâneamente', async t => {
  tesseract.quantidadeDeChamadas = 0;
  tesseract.process = (pathDaImagem, opcoes, callback) => {
    tesseract.quantidadeDeChamadas++;

    if (tesseract.quantidadeDeChamadas === 1)
      setTimeout(() => {
        callback()
      }, 1000);
    else
      callback();
  };

  ocr(imagem);
  await ocr(imagem);

  t.is(1, tesseract.quantidadeDeChamadas);
});

test('deve marcar o tempo de inicio ao processar', async t => {
  td.replace(marky, 'mark');
  td.when(tesseract.process(imagem, opcoesDoTesseract)).thenCallback(null, 'textoDaImagem');

  await ocr(imagem);

  t.is(1, td.explain(marky.mark).callCount);
  t.notThrows(() => td.verify(marky.mark('ocr')));
});

test('deve parar de marcar o tempo ao processar', async t => {
  td.when(tesseract.process(imagem, opcoesDoTesseract)).thenCallback(null, 'textoDaImagem');

  await ocr(imagem);

  t.is(1, td.explain(marky.stop).callCount);
});

test('deve logar o tempo total de processamento ao terminar', async t => {
  td.when(tesseract.process(imagem, opcoesDoTesseract)).thenCallback(null, 'textoDaImagem');

  await ocr(imagem);

  t.is(1, td.explain(console.info).callCount);
  t.notThrows(() => td.verify(console.info(' [x] OCR finalizada: %s ms', 10)))
});
