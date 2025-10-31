const User = require('../models/User');
const Servico = require('../models/Servico');
const Proposta = require('../models/Proposta');
const Pagamento = require('../models/Pagamento');
const Verificacao = require('../models/Verificacao');
const GatewayDePagamento = require('../models/GatewayDePagamento');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

class AdminController {
  // Usuários
  async listarUsuarios(req, res) {
    try {
      const { tipo, verificado, page = 1, limit = 10 } = req.query;
      const query = {};
      
      if (tipo) query.tipo = tipo;
      if (verificado) query.verificado = verificado === 'true';

      const usuarios = await User.find(query)
        .select('-senha')
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ dataCriacao: -1 });

      const total = await User.countDocuments(query);

      return successResponse(res, 200, {
        usuarios,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      return errorResponse(res, 500, 'Erro ao listar usuários', error);
    }
  }

  async bloquearUsuario(req, res) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;

      if (!motivo) {
        return errorResponse(res, 400, 'Motivo do bloqueio é obrigatório');
      }

      const usuario = await User.findByIdAndUpdate(id, {
        bloqueado: true,
        motivoBloqueio: motivo,
        dataBloqueio: new Date()
      }, { new: true });

      if (!usuario) {
        return errorResponse(res, 404, 'Usuário não encontrado');
      }

      return successResponse(res, 200, usuario);
    } catch (error) {
      return errorResponse(res, 500, 'Erro ao bloquear usuário', error);
    }
  }

  // Dashboard
  async getDashboardStats(req, res) {
    try {
      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

      // Estatísticas gerais
      const stats = {
        usuarios: {
          total: await User.countDocuments(),
          clientes: await User.countDocuments({ tipo: 'cliente' }),
          prestadores: await User.countDocuments({ tipo: 'prestador' }),
          verificados: await User.countDocuments({ verificado: true })
        },
        servicos: {
          total: await Servico.countDocuments(),
          abertos: await Servico.countDocuments({ status: 'aberto' }),
          emAndamento: await Servico.countDocuments({ status: 'em_andamento' }),
          concluidos: await Servico.countDocuments({ status: 'concluido' })
        },
        propostas: {
          total: await Proposta.countDocuments(),
          aceitas: await Proposta.countDocuments({ status: 'aceita' }),
          pendentes: await Proposta.countDocuments({ status: 'pendente' })
        },
        pagamentos: {
          total: await Pagamento.countDocuments(),
          aprovados: await Pagamento.countDocuments({ status: 'aprovado' }),
          pendentes: await Pagamento.countDocuments({ status: 'pendente' }),
          mesAtual: await Pagamento.aggregate([
            {
              $match: {
                status: 'aprovado',
                dataPagamento: { $gte: inicioMes }
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$valor' }
              }
            }
          ]).then(result => result[0]?.total || 0)
        },
        verificacoes: {
          pendentes: await Verificacao.countDocuments({ status: 'pendente' }),
          aprovadas: await Verificacao.countDocuments({ status: 'aprovada' }),
          rejeitadas: await Verificacao.countDocuments({ status: 'rejeitada' })
        }
      };

      return successResponse(res, 200, stats);
    } catch (error) {
      return errorResponse(res, 500, 'Erro ao obter estatísticas', error);
    }
  }

  // Configurações de Pagamento
  async configurarGateway(req, res) {
    try {
      const {
        nome,
        chavePublica,
        chavePrivada,
        webhookSecret,
        ambiente,
        taxas
      } = req.body;

      const gateway = await GatewayDePagamento.create({
        nome,
        chavePublica,
        chavePrivada,
        webhookSecret,
        ambiente,
        taxas
      });

      return successResponse(res, 201, gateway);
    } catch (error) {
      return errorResponse(res, 500, 'Erro ao configurar gateway', error);
    }
  }

  // Relatórios
  async gerarRelatorioFinanceiro(req, res) {
    try {
      const { dataInicio, dataFim } = req.query;
      
      const query = {
        status: 'aprovado'
      };

      if (dataInicio && dataFim) {
        query.dataPagamento = {
          $gte: new Date(dataInicio),
          $lte: new Date(dataFim)
        };
      }

      const relatorio = await Pagamento.aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              mes: { $month: '$dataPagamento' },
              ano: { $year: '$dataPagamento' }
            },
            totalTransacoes: { $sum: 1 },
            valorTotal: { $sum: '$valor' },
            taxasTotal: { $sum: '$taxas' }
          }
        },
        { $sort: { '_id.ano': 1, '_id.mes': 1 } }
      ]);

      return successResponse(res, 200, relatorio);
    } catch (error) {
      return errorResponse(res, 500, 'Erro ao gerar relatório', error);
    }
  }
}

module.exports = new AdminController();