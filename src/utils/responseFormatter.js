/**
 * Utilitário para padronizar respostas da API
 */

/**
 * Formata uma resposta de sucesso
 * @param {Object} res - Objeto de resposta Express
 * @param {number} status - Código HTTP de sucesso
 * @param {*} data - Dados a serem enviados na resposta
 * @param {string} message - Mensagem opcional de sucesso
 */
const successResponse = (res, status, data, message = '') => {
  const response = {
    success: true,
    data
  };
  
  if (message) {
    response.message = message;
  }
  
  return res.status(status).json(response);
};

/**
 * Formata uma resposta de erro
 * @param {Object} res - Objeto de resposta Express
 * @param {number} status - Código HTTP de erro
 * @param {string} message - Mensagem de erro
 * @param {Array} errors - Lista opcional de erros detalhados
 */
const errorResponse = (res, status, message, errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(status).json(response);
};

module.exports = {
  successResponse,
  errorResponse
};