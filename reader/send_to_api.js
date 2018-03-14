const axios = require('axios');
const moment = require('moment');

let _endpoint;

module.exports = {
  configure: (endpoint) => {
    _endpoint = endpoint;
  },

  batch: (payload, error_callback, success_callback) => {
    axios.post(`${_endpoint}/AtualizarOcr`, payload)
      .then((response) => {
        success_callback(response);
        console.log(' [x] Enviado lote de %s às %s', payload.length, moment().format('DD/MM - HH:mm'));
      })
      .catch((error) => {
        error_callback(error);
        console.log(' [x] Erro ao enviar para API: %s', payload.id);
        console.log(' [x] Erro: %s', error);
        console.log(' [x] ----------------------------');
      });
  }
};
