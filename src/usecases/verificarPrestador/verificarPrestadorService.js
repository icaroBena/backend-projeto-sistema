const logger = require('../../utils/logger');
const Documento = require('../../models/Documentos');
const User = require('../../models/User');
const notificacaoService = require('../../services/notificacaoService');
const emailService = require('../../services/emailService');
const { PrestadorStatus, DocumentosStatus } = require('../../utils/systemEnums');

/**
 * Serviço para gerenciar verificação de prestadores
 * Responsável por validação de documentos e determinação de status
 */
class VerificarPrestadorService {
  /**
   * Valida tipos de documentos permitidos
   * @param {Array<string>} tipos - Tipos de documentos
   * @returns {boolean} - True se todos os tipos são válidos
   */
  static validarTiposDocumentos(tipos) {
    try {
      const tiposPermitidos = ['identidade', 'comprovante'];

      for (const tipo of tipos) {
        if (!tiposPermitidos.includes(tipo)) {
          throw new Error(`Tipo de documento inválido: ${tipo}`);
        }
      }

      return true;
    } catch (error) {
      logger.error('Erro ao validar tipos de documentos', {
        error: error.message,
        tipos
      });
      throw error;
    }
  }

  /**
   * Avalia documentos e determina status geral do prestador
   * @param {Array<Document>} documentos - Lista de documentos do usuário
   * @returns {string} - Status final (aprovado, reprovado, pendente)
   */
  static determinarStatusGeral(documentos) {
    try {
      if (!documentos || documentos.length === 0) {
        return PrestadorStatus.PENDENTE;
      }

      // Verificar se todos foram avaliados
      const todosAvaliados = documentos.every(doc => 
        [DocumentosStatus.APROVADO, DocumentosStatus.REJEITADO].includes(doc.status)
      );

      if (!todosAvaliados) {
        return PrestadorStatus.PENDENTE;
      }

      // Se todos foram aprovados
      const todosAprovados = documentos.every(doc => doc.status === DocumentosStatus.APROVADO);

      return todosAprovados ? PrestadorStatus.APROVADO : PrestadorStatus.REPROVADO;
    } catch (error) {
      logger.error('Erro ao determinar status geral', {
        error: error.message
      });
      throw new Error('Erro ao determinar status geral');
    }
  }

  /**
   * Verifica se todos os documentos foram avaliados
   * @param {Array<Document>} documentos - Lista de documentos
   * @returns {boolean} - True se todos foram avaliados
   */
  static todoAvaliados(documentos) {
    try {
      if (!documentos || documentos.length === 0) {
        return false;
      }

      return documentos.every(doc => 
        [DocumentosStatus.APROVADO, DocumentosStatus.REJEITADO].includes(doc.status)
      );
    } catch (error) {
      logger.error('Erro ao verificar se todos foram avaliados', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Formata resposta de verificação de status
   * @param {User} user - Documento do usuário
   * @param {Array<Document>} documentos - Lista de documentos
   * @returns {Object} - Status formatado
   */
  static formatarStatusVerificacao(user, documentos) {
    try {
      return {
        geral: user.statusVerificacao || PrestadorStatus.PENDENTE,
        documentos: documentos.map(doc => ({
          tipo: doc.tipo,
          status: doc.status,
          dataEnvio: doc.dataEnvio,
          dataAvaliacao: doc.dataAvaliacao,
          observacoes: doc.observacoes
        }))
      };
    } catch (error) {
      logger.error('Erro ao formatar status de verificação', {
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = VerificarPrestadorService;
