// src/controllers/verificacaoController.js

const Verificacao = require('../models/Verificacao');
const Usuario = require('../models/User');
const notificacaoService = require('../services/notificacaoService');
const path = require('path');
const fs = require('fs');

// @desc    Enviar documentos de verificação
// @route   POST /api/verificacao/documentos
// @access  Private (Usuário autenticado)
exports.enviarDocumentos = async (req, res) => {
  try {
    const { files } = req;

    if (!files || !files.identidade || !files.comprovante) {
      return res.status(400).json({ message: 'Envie os dois arquivos: identidade e comprovante de residência.' });
    }

    const usuario = await Usuario.findById(req.user.id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Cria registro de verificação
    const verificacao = new Verificacao({
      usuario: usuario._id,
      documentos: {
        identidade: files.identidade[0].path,
        comprovante: files.comprovante[0].path
      },
      status: 'pendente',
      dataEnvio: new Date()
    });

    await verificacao.save();

    // Notificar administradores (ou equipe responsável)
    await notificacaoService.criarNotificacao({
      tipo: 'verificacao_nova',
      titulo: 'Nova verificação pendente',
      mensagem: `O usuário ${usuario.nome} enviou documentos para verificação.`,
      dadosAdicionais: { verificacaoId: verificacao._id, usuarioId: usuario._id }
    });

    res.status(201).json({
      message: 'Documentos enviados com sucesso! Aguardando análise.',
      verificacao
    });

  } catch (error) {
    console.error('Erro ao enviar documentos:', error);
    res.status(500).json({ message: 'Erro ao enviar documentos' });
  }
};

// @desc    Buscar documentos de verificação de um usuário
// @route   GET /api/verificacao/documentos/:userId
// @access  Private (Admin ou usuário dono)
exports.buscarDocumentos = async (req, res) => {
  try {
    const { userId } = req.params;

    const verificacao = await Verificacao.findOne({ usuario: userId })
      .populate('usuario', 'nome email');

    if (!verificacao) {
      return res.status(404).json({ message: 'Nenhum documento encontrado para este usuário.' });
    }

    // Permitir apenas o próprio usuário ou admin (caso tenha sistema de permissões)
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    res.json(verificacao);
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    res.status(500).json({ message: 'Erro ao buscar documentos' });
  }
};

// @desc    Aprovar documento de verificação
// @route   PUT /api/verificacao/documentos/:documentoId/aprovar
// @access  Private (Admin)
exports.aprovarDocumento = async (req, res) => {
  try {
    const { documentoId } = req.params;

    const verificacao = await Verificacao.findById(documentoId).populate('usuario', 'nome email');
    if (!verificacao) {
      return res.status(404).json({ message: 'Documento não encontrado.' });
    }

    verificacao.status = 'aprovado';
    verificacao.dataVerificacao = new Date();
    await verificacao.save();

    // Notificar usuário
    await notificacaoService.criarNotificacao({
      destinatario: verificacao.usuario._id,
      tipo: 'verificacao_aprovada',
      titulo: 'Verificação aprovada',
      mensagem: 'Seus documentos foram aprovados com sucesso!',
      dadosAdicionais: { verificacaoId: verificacao._id }
    });

    res.json({ message: 'Documentos aprovados com sucesso.' });
  } catch (error) {
    console.error('Erro ao aprovar documento:', error);
    res.status(500).json({ message: 'Erro ao aprovar documento' });
  }
};

// @desc    Rejeitar documento de verificação
// @route   PUT /api/verificacao/documentos/:documentoId/rejeitar
// @access  Private (Admin)
exports.rejeitarDocumento = async (req, res) => {
  try {
    const { documentoId } = req.params;
    const { motivo } = req.body;

    const verificacao = await Verificacao.findById(documentoId).populate('usuario', 'nome email');
    if (!verificacao) {
      return res.status(404).json({ message: 'Documento não encontrado.' });
    }

    verificacao.status = 'rejeitado';
    verificacao.motivoRejeicao = motivo || 'Motivo não especificado';
    verificacao.dataVerificacao = new Date();
    await verificacao.save();

    // Notificar usuário
    await notificacaoService.criarNotificacao({
      destinatario: verificacao.usuario._id,
      tipo: 'verificacao_rejeitada',
      titulo: 'Verificação rejeitada',
      mensagem: `Seus documentos foram rejeitados. Motivo: ${verificacao.motivoRejeicao}`,
      dadosAdicionais: { verificacaoId: verificacao._id }
    });

    res.json({ message: 'Documentos rejeitados com sucesso.' });
  } catch (error) {
    console.error('Erro ao rejeitar documento:', error);
    res.status(500).json({ message: 'Erro ao rejeitar documento' });
  }
};

// @desc    Verificar status de verificação de um usuário
// @route   GET /api/verificacao/status/:userId
// @access  Private (Usuário ou admin)
exports.verificarStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const verificacao = await Verificacao.findOne({ usuario: userId })
      .select('status motivoRejeicao dataVerificacao');

    if (!verificacao) {
      return res.status(404).json({ message: 'Nenhum registro de verificação encontrado.' });
    }

    // Permitir apenas o próprio usuário ou admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    res.json({
      status: verificacao.status,
      motivoRejeicao: verificacao.motivoRejeicao,
      dataVerificacao: verificacao.dataVerificacao
    });
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    res.status(500).json({ message: 'Erro ao verificar status' });
  }
};
