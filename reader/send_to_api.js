const axios = require('axios');

const endpoint = 'http://domusweb.agehab.ms.gov.br/Questionario/Horus';

module.exports = {
  batch: function(payload, error_callback, success_callback) {
    axios.post(`${endpoint}/AtualizarOcr`, payload)
      .then(function (response) {
        success_callback(response);
        console.log(' [x] Enviado lote de %s', payload.length);
      })
      .catch(function (error) {
        error_callback(error);
        console.log(' [x] Erro ao enviar para API: %s', payload.id);
        console.log(' [x] Erro: %s', error);
        console.log(' [x] ----------------------------');
      });
  },

  single: function(payload, error_callback, success_callback) {
    axios.post(`${endpoint}/AtualizarOcr`, payload)
      .then(function (response) {
        success_callback(response);
        console.log(' [x] Enviado %s', payload.id);
      })
      .catch(function (error) {
        error_callback(error);
        console.log(' [x] Erro ao enviar para API: %s', payload.id);
        console.log(' [x] Erro: %s', error);
        console.log(' [x] ----------------------------');
      });
  }
};
