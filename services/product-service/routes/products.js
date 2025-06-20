const express = require('express');
const Joi = require('joi');
const prisma = require('../lib/prisma');

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      ...(category && { category }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id }
    });

    if (!product || !product.isActive) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create product (admin only)
router.post('/', async (req, res) => {
  try {
    const schema = Joi.object({
      name: Joi.string().required(),
      description: Joi.string().optional(),
      price: Joi.number().positive().required(),
      category: Joi.string().required(),
      brand: Joi.string().optional(),
      sku: Joi.string().required(),
      stock: Joi.number().integer().min(0).default(0),
      images: Joi.array().items(Joi.string().uri()).default([])
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const product = await prisma.product.create({
      data: value
    });

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'SKU already exists' });
    }
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const schema = Joi.object({
      name: Joi.string().optional(),
      description: Joi.string().optional(),
      price: Joi.number().positive().optional(),
      category: Joi.string().optional(),
      brand: Joi.string().optional(),
      stock: Joi.number().integer().min(0).optional(),
      images: Joi.array().items(Joi.string().uri()).optional()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: value
    });

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found' });
    }
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    await prisma.product.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found' });
    }
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
