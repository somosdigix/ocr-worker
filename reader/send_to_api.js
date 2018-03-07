const axios = require('axios');

module.exports = {
  batch: function(payload, error_callback, success_callback) {
    axios.post('http://hom.domusweb.agehab.ms.gov.br/questionario/api/documentos/atualizarOcr', payload)
      .then(function (response) {
        success_callback(response);
        console.log(' [x] Enviado %s', payload.idImagem);
      })
      .catch(function (error) {
        error_callback(error);
        console.log(' [x] Erro ao enviar para API: %s', payload.idImagem);
        console.log(' [x] Erro: %s', error);
        console.log(' [x] ----------------------------');
      });
  },

  single: function(payload, error_callback, success_callback) {
    console.log(' [x] Enviando %s', payload.idImagem);
  
    axios.post('http://hom.domusweb.agehab.ms.gov.br/questionario/api/documento/atualizarOcr', payload)
      .then(function (response) {
        success_callback(response);
        console.log(' [x] Enviado %s', payload.idImagem);
      })
      .catch(function (error) {
        error_callback(error);
        console.log(' [x] Erro ao enviar para API: %s', payload.idImagem);
        console.log(' [x] Erro: %s', error);
        console.log(' [x] ----------------------------');
      });
  }
};