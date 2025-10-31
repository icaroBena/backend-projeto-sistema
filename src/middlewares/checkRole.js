const { errorResponse } = require('../utils/responseFormatter');

/**
 * checkRole middleware
 * @param {Array<string>} roles - Lista de roles permitidos (ex: ['admin', 'user'])
 * Retorna middleware Express que verifica se req.user.role está em roles.
 */
function checkRole(roles = []) {
  // permitir passar uma string única
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return errorResponse(res, 401, 'Não autorizado');
      }

      // role pode ser 'user' ou 'admin'
      if (!roles.length) {
        // sem roles especificados, permitir acesso
        return next();
      }

      if (!roles.includes(user.role)) {
        return errorResponse(res, 403, 'Acesso negado');
      }

      return next();
    } catch (err) {
      return errorResponse(res, 500, 'Erro ao verificar permissões');
    }
  };
}

module.exports = {
  checkRole
};