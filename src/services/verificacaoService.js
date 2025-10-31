const logger = require('../utils/logger');
const Documento = require('../models/Documentos');
const User = require('../models/User');
const notificacaoService = require('./notificacaoService');
const emailService = require('./emailService');

class VerificacaoService {
  static async enviarDocumentos(userId, arquivos) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // RN14: Validar tipos de documentos
      const tiposPermitidos = ['identidade', 'comprovante'];
      for (const tipo in arquivos) {
        if (!tiposPermitidos.includes(tipo)) {
          throw new Error(`Tipo de documento inválido: ${tipo}`);
        }
      }

      const documentos = [];
      for (const [tipo, arquivo] of Object.entries(arquivos)) {
        const documento = await Documento.create({
          usuario: userId,
          tipo,
          arquivo: arquivo[0].filename,
          status: 'pendente',
          dataEnvio: new Date()
        });
        documentos.push(documento);
      }

      // Atualizar status do usuário
      user.statusVerificacao = 'pendente';
      await user.save();

      // Criar notificação para administradores
      await notificacaoService.criarNotificacao(
        'admin',
        'DOCUMENTOS_ENVIADOS',
        `Novos documentos enviados por ${user.nome} aguardam verificação`,
        userId
      );

      logger.info('Documentos enviados com sucesso', {
        userId,
        documentos: documentos.map(d => d._id)
      });

      return documentos;
    } catch (error) {
      logger.error('Erro ao enviar documentos', {
        error: error.message,
        userId
      });
      throw error;
    }
  }

  static async avaliarDocumento(documentoId, { status, observacoes }) {
    try {
      const documento = await Documento.findById(documentoId)
        .populate('usuario');

      if (!documento) {
        throw new Error('Documento não encontrado');
      }

      // RN15: Validar status da avaliação
      if (!['aprovado', 'rejeitado'].includes(status)) {
        throw new Error('Status de avaliação inválido');
      }

      documento.status = status;
      documento.observacoes = observacoes;
      documento.dataAvaliacao = new Date();
      await documento.save();

      // Verificar se todos os documentos foram avaliados
      const todosDocumentos = await Documento.find({ usuario: documento.usuario._id });
      const todosAvaliados = todosDocumentos.every(doc => 
        ['aprovado', 'rejeitado'].includes(doc.status)
      );

      if (todosAvaliados) {
        // Determinar status geral
        const todosAprovados = todosDocumentos.every(doc => doc.status === 'aprovado');
        const statusFinal = todosAprovados ? 'verificado' : 'rejeitado';

        // Atualizar status do usuário
        await User.findByIdAndUpdate(documento.usuario._id, {
          statusVerificacao: statusFinal
        });

        // Enviar notificação
        const mensagem = todosAprovados
          ? 'Seus documentos foram aprovados! Sua conta está verificada.'
          : 'Alguns documentos foram rejeitados. Por favor, envie novos documentos.';

        await notificacaoService.criarNotificacao(
          documento.usuario._id,
          'VERIFICACAO_DOCUMENTOS',
          mensagem,
          documentoId
        );

        // Enviar e-mail
        await emailService.enviarEmail(
          documento.usuario.email,
          'Resultado da Verificação de Documentos - WorkMatch',
          `<h1>${todosAprovados ? 'Documentos Aprovados!' : 'Documentos Rejeitados'}</h1>
           <p>${mensagem}</p>
           ${!todosAprovados ? '<p>Motivo: ' + observacoes + '</p>' : ''}
           <a href="${process.env.FRONTEND_URL}/verificacao">Ver Detalhes</a>`
        );
      }

      logger.info('Documento avaliado com sucesso', {
        documentoId,
        status,
        usuarioId: documento.usuario._id
      });

      return documento;
    } catch (error) {
      logger.error('Erro ao avaliar documento', {
        error: error.message,
        documentoId
      });
      throw error;
    }
  }

  static async buscarDocumentos(userId) {
    try {
      const documentos = await Documento.find({ usuario: userId })
        .sort({ dataEnvio: -1 });

      logger.info('Documentos buscados com sucesso', {
        userId,
        quantidade: documentos.length
      });

      return documentos;
    } catch (error) {
      logger.error('Erro ao buscar documentos', {
        error: error.message,
        userId
      });
      throw error;
    }
  }

  static async verificarStatus(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      const documentos = await Documento.find({ usuario: userId });

      const status = {
        geral: user.statusVerificacao,
        documentos: documentos.map(doc => ({
          tipo: doc.tipo,
          status: doc.status,
          dataEnvio: doc.dataEnvio,
          dataAvaliacao: doc.dataAvaliacao,
          observacoes: doc.observacoes
        }))
      };

      logger.info('Status de verificação consultado', {
        userId,
        status: status.geral
      });

      return status;
    } catch (error) {
      logger.error('Erro ao verificar status', {
        error: error.message,
        userId
      });
      throw error;
    }
  }
}

module.exports = VerificacaoService;