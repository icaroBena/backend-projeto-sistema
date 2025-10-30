const { check } = require('express-validator');

// Funções auxiliares de validação
const validateCPF = (cpf) => {
  cpf = cpf.replace(/[^\d]/g, '');
  
  if (cpf.length !== 11) return false;
  
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf.charAt(10))) return false;
  
  return true;
};

const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
};

const validateEmail = (email) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

const validatePhone = (phone) => {
  phone = phone.replace(/\D/g, '');
  return phone.length >= 10 && phone.length <= 11;
};

const validateCEP = (cep) => {
  cep = cep.replace(/\D/g, '');
  return cep.length === 8;
};

// Express-validator schemas
const validators = {
  // Validações de usuário
  userValidations: {
    registro: [
      check('nome')
        .notEmpty().withMessage('Nome é obrigatório')
        .isLength({ min: 3 }).withMessage('Nome deve ter no mínimo 3 caracteres'),
      check('email')
        .notEmpty().withMessage('E-mail é obrigatório')
        .isEmail().withMessage('E-mail inválido')
        .normalizeEmail(),
      check('senha')
        .notEmpty().withMessage('Senha é obrigatória')
        .custom((value) => {
          if (!validatePassword(value)) {
            throw new Error('Senha deve ter no mínimo 8 caracteres, incluir maiúsculas, minúsculas, números e caracteres especiais');
          }
          return true;
        }),
      check('cpf')
        .notEmpty().withMessage('CPF é obrigatório')
        .custom((value) => {
          if (!validateCPF(value)) {
            throw new Error('CPF inválido');
          }
          return true;
        }),
      check('tipo')
        .notEmpty().withMessage('Tipo de usuário é obrigatório')
        .isIn(['cliente', 'prestador']).withMessage('Tipo de usuário inválido')
    ],
    login: [
      check('email')
        .notEmpty().withMessage('E-mail é obrigatório')
        .isEmail().withMessage('E-mail inválido'),
      check('senha')
        .notEmpty().withMessage('Senha é obrigatória')
    ],
    atualizarPerfil: [
      check('nome')
        .optional()
        .isLength({ min: 3 }).withMessage('Nome deve ter no mínimo 3 caracteres'),
      check('telefone')
        .optional()
        .custom((value) => {
          if (!validatePhone(value)) {
            throw new Error('Telefone inválido');
          }
          return true;
        }),
      check('endereco.cep')
        .optional()
        .custom((value) => {
          if (!validateCEP(value)) {
            throw new Error('CEP inválido');
          }
          return true;
        }),
      check('endereco.cidade')
        .optional()
        .isLength({ min: 2 }).withMessage('Cidade deve ter no mínimo 2 caracteres'),
      check('endereco.estado')
        .optional()
        .isLength({ min: 2, max: 2 }).withMessage('Estado deve ter 2 caracteres')
    ]
  },

  // Validações de serviço
  servicoValidations: {
    criar: [
      check('titulo')
        .notEmpty().withMessage('Título é obrigatório')
        .isLength({ min: 5 }).withMessage('Título deve ter no mínimo 5 caracteres'),
      check('descricao')
        .notEmpty().withMessage('Descrição é obrigatória')
        .isLength({ min: 20 }).withMessage('Descrição deve ter no mínimo 20 caracteres'),
      check('categoriaId')
        .notEmpty().withMessage('Categoria é obrigatória')
        .isMongoId().withMessage('ID de categoria inválido'),
      check('localServico.tipo')
        .notEmpty().withMessage('Tipo de local é obrigatório')
        .isIn(['presencial', 'remoto', 'hibrido']).withMessage('Tipo de local inválido'),
      check('localServico.endereco')
        .if(check('localServico.tipo').equals('presencial'))
        .notEmpty().withMessage('Endereço é obrigatório para serviços presenciais'),
      check('prazoEstimado')
        .notEmpty().withMessage('Prazo estimado é obrigatório')
        .isInt({ min: 1 }).withMessage('Prazo estimado deve ser um número positivo')
    ]
  },

  // Validações de proposta
  propostaValidations: {
    criar: [
      check('servicoId')
        .notEmpty().withMessage('ID do serviço é obrigatório')
        .isMongoId().withMessage('ID de serviço inválido'),
      check('valor')
        .notEmpty().withMessage('Valor é obrigatório')
        .isFloat({ min: 0 }).withMessage('Valor deve ser um número positivo'),
      check('prazoEntrega')
        .notEmpty().withMessage('Prazo de entrega é obrigatório')
        .isInt({ min: 1 }).withMessage('Prazo deve ser um número positivo'),
      check('descricao')
        .notEmpty().withMessage('Descrição é obrigatória')
        .isLength({ min: 20 }).withMessage('Descrição deve ter no mínimo 20 caracteres')
    ]
  },

  // Validações de pagamento
  pagamentoValidations: {
    criar: [
      check('propostaId')
        .notEmpty().withMessage('ID da proposta é obrigatório')
        .isMongoId().withMessage('ID de proposta inválido'),
      check('valor')
        .notEmpty().withMessage('Valor é obrigatório')
        .isFloat({ min: 0 }).withMessage('Valor deve ser um número positivo'),
      check('metodoPagamento')
        .notEmpty().withMessage('Método de pagamento é obrigatório')
        .isIn(['credito', 'debito', 'pix']).withMessage('Método de pagamento inválido')
    ],
    estornar: [
      check('motivo')
        .notEmpty().withMessage('Motivo é obrigatório')
        .isLength({ min: 10 }).withMessage('Motivo deve ter no mínimo 10 caracteres')
    ]
  },

  // Validações de avaliação
  avaliacaoValidations: {
    criar: [
      check('nota')
        .notEmpty().withMessage('Nota é obrigatória')
        .isInt({ min: 1, max: 5 }).withMessage('Nota deve ser entre 1 e 5'),
      check('comentario')
        .notEmpty().withMessage('Comentário é obrigatório')
        .isLength({ min: 10 }).withMessage('Comentário deve ter no mínimo 10 caracteres')
    ]
  },

  // Validações de categoria
  categoriaValidations: {
    criar: [
      check('nome')
        .notEmpty().withMessage('Nome é obrigatório')
        .isLength({ min: 3 }).withMessage('Nome deve ter no mínimo 3 caracteres'),
      check('descricao')
        .notEmpty().withMessage('Descrição é obrigatória')
        .isLength({ min: 10 }).withMessage('Descrição deve ter no mínimo 10 caracteres')
    ]
  }
};

module.exports = {
  validateCPF,
  validatePassword,
  validateEmail,
  validatePhone,
  validateCEP,
  ...validators
};