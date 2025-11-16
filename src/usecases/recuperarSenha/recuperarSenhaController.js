/**
 * Controller: Recuperar Senha
 * Caso de Uso: Permite recuperação de senha via email
 */

const Usuario = require('../../models/User');
const tokenService = require('../../services/tokenService');
const emailService = require('../../services/emailService');
const RecuperarSenhaService = require('./recuperarSenhaService');
const logger = require('../../utils/logger');
const crypto = require('crypto');

/**
 * @desc    Solicitar recuperação de senha
 * @route   POST /api/recuperar-senha/solicitar
 * @access  Public
 */
exports.solicitarRecuperacao = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email é obrigatório' });
    }

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      // Não revelar se o email existe (segurança)
      return res.json({ 
        message: 'Se o email existe na nossa base, você receberá um link de recuperação' 
      });
    }

    // Gerar token de recuperação
    const tokenRecuperacao = crypto.randomBytes(32).toString('hex');
    const hashToken = crypto.createHash('sha256').update(tokenRecuperacao).digest('hex');

    usuario.resetPasswordToken = hashToken;
    usuario.resetPasswordExpire = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos
    await usuario.save();

    // Construir URL de recuperação
    const urlRecuperacao = `${process.env.FRONTEND_URL}/recuperar-senha/${tokenRecuperacao}`;

    // Enviar email
    try {
      await emailService.enviarEmailRecuperacaoSenha(usuario.email, urlRecuperacao);
    } catch (error) {
      logger.error('Erro ao enviar email de recuperação', {
        email: usuario.email,
        error: error.message
      });
      // Limpar token se falhar o email
      usuario.resetPasswordToken = undefined;
      usuario.resetPasswordExpire = undefined;
      await usuario.save();
      
      return res.status(500).json({ message: 'Erro ao enviar email de recuperação' });
    }

    res.json({ 
      message: 'Se o email existe na nossa base, você receberá um link de recuperação' 
    });

  } catch (error) {
    console.error('Erro ao solicitar recuperação:', error);
    res.status(500).json({ message: 'Erro ao solicitar recuperação de senha' });
  }
};

/**
 * @desc    Validar token de recuperação
 * @route   GET /api/recuperar-senha/validar/:token
 * @access  Public
 */
exports.validarTokenRecuperacao = async (req, res) => {
  try {
    const { token } = req.params;

    const hashToken = crypto.createHash('sha256').update(token).digest('hex');

    const usuario = await Usuario.findOne({
      resetPasswordToken: hashToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!usuario) {
      return res.status(400).json({ message: 'Token inválido ou expirado' });
    }

    res.json({ message: 'Token válido' });

  } catch (error) {
    console.error('Erro ao validar token:', error);
    res.status(500).json({ message: 'Erro ao validar token' });
  }
};

/**
 * @desc    Resetar senha com token
 * @route   PUT /api/recuperar-senha/resetar
 * @access  Public
 */
exports.resetarSenhaComToken = async (req, res) => {
  try {
    const { token, novaSenha, confirmacaoSenha } = req.body;

    if (!token || !novaSenha || !confirmacaoSenha) {
      return res.status(400).json({ message: 'Token, senha e confirmação são obrigatórios' });
    }

    if (novaSenha !== confirmacaoSenha) {
      return res.status(400).json({ message: 'As senhas não conferem' });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({ message: 'Senha deve ter no mínimo 6 caracteres' });
    }

    const hashToken = crypto.createHash('sha256').update(token).digest('hex');

    const usuario = await Usuario.findOne({
      resetPasswordToken: hashToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!usuario) {
      return res.status(400).json({ message: 'Token inválido ou expirado' });
    }

    // Atualizar senha
    usuario.password = novaSenha;
    usuario.resetPasswordToken = undefined;
    usuario.resetPasswordExpire = undefined;
    await usuario.save();

    logger.info('Senha resetada com sucesso', {
      usuarioId: usuario._id,
      email: usuario.email
    });

    res.json({ message: 'Senha alterada com sucesso' });

  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    res.status(500).json({ message: 'Erro ao resetar senha' });
  }
};
