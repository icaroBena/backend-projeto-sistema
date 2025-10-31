// src/controllers/categoriaController.js

const Categoria = require('../models/Categoria');

// @desc    Criar nova categoria
// @route   POST /api/categorias
// @access  Private (Admin)
exports.criarCategoria = async (req, res) => {
  try {
    const { nome, descricao, icone, subCategorias } = req.body;

    const existente = await Categoria.findOne({ nome });
    if (existente) {
      return res.status(400).json({ message: 'Esta categoria já existe.' });
    }

    const categoria = new Categoria({
      nome,
      descricao,
      icone,
      subCategorias
    });

    await categoria.save();

    res.status(201).json(categoria);
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({ message: 'Erro ao criar categoria.' });
  }
};

// @desc    Listar todas as categorias
// @route   GET /api/categorias
// @access  Public
exports.listarCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.find();
    res.json(categorias);
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    res.status(500).json({ message: 'Erro ao listar categorias.' });
  }
};

// @desc    Buscar categoria por ID
// @route   GET /api/categorias/:id
// @access  Public
exports.buscarCategoriaPorId = async (req, res) => {
  try {
    const categoria = await Categoria.findById(req.params.id);
    if (!categoria) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }
    res.json(categoria);
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    res.status(500).json({ message: 'Erro ao buscar categoria.' });
  }
};

// @desc    Atualizar categoria
// @route   PUT /api/categorias/:id
// @access  Private (Admin)
exports.atualizarCategoria = async (req, res) => {
  try {
    const { nome, descricao, icone, status, subCategorias } = req.body;

    const categoria = await Categoria.findByIdAndUpdate(
      req.params.id,
      { nome, descricao, icone, status, subCategorias },
      { new: true }
    );

    if (!categoria) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }

    res.json(categoria);
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({ message: 'Erro ao atualizar categoria.' });
  }
};

// @desc    Deletar categoria
// @route   DELETE /api/categorias/:id
// @access  Private (Admin)
exports.deletarCategoria = async (req, res) => {
  try {
    const categoria = await Categoria.findByIdAndDelete(req.params.id);
    if (!categoria) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }

    res.json({ message: 'Categoria removida com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    res.status(500).json({ message: 'Erro ao deletar categoria.' });
  }
};

// @desc    Alterar status da categoria (ativa/inativa)
// @route   PATCH /api/categorias/:id/status
// @access  Private (Admin)
exports.alterarStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['ativa', 'inativa'].includes(status)) {
      return res.status(400).json({ message: 'Status inválido.' });
    }

    const categoria = await Categoria.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!categoria) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }

    res.json({ message: `Status alterado para "${status}".`, categoria });
  } catch (error) {
    console.error('Erro ao alterar status da categoria:', error);
    res.status(500).json({ message: 'Erro ao alterar status da categoria.' });
  }
};
