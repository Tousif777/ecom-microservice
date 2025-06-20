const express = require('express');
const Joi = require('joi');
const prisma = require('../lib/prisma');

const router = express.Router();

// Process payment
router.post('/process', async (req, res) => {
  try {
    const schema = Joi.object({
      orderId: Joi.string().required(),
      userId: Joi.string().required(),
      amount: Joi.number().positive().required(),
      currency: Joi.string().default('USD'),
      paymentMethod: Joi.string().required(),
      paymentToken: Joi.string().optional() // For card payments
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { orderId, userId, amount, currency, paymentMethod, paymentToken } = value;

    // Check if payment already exists for this order
    const existingPayment = await prisma.payment.findUnique({
      where: { orderId }
    });

    if (existingPayment) {
      return res.status(409).json({ error: 'Payment already exists for this order' });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId,
        userId,
        amount,
        currency,
        paymentMethod,
        status: 'PROCESSING'
      }
    });

    // Simulate payment processing
    let paymentResult;
    try {
      paymentResult = await processPayment({
        amount,
        currency,
        paymentMethod,
        paymentToken
      });

      // Update payment with result
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: paymentResult.success ? 'COMPLETED' : 'FAILED',
          transactionId: paymentResult.transactionId,
          gatewayResponse: paymentResult
        }
      });

      res.json({
        message: paymentResult.success ? 'Payment processed successfully' : 'Payment failed',
        payment: updatedPayment,
        success: paymentResult.success
      });
    } catch (paymentError) {
      // Update payment status to failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          gatewayResponse: { error: paymentError.message }
        }
      });

      res.status(400).json({
        message: 'Payment processing failed',
        error: paymentError.message
      });
    }
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get payment by ID
router.get('/:id', async (req, res) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({ payment });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get payment by order ID
router.get('/order/:orderId', async (req, res) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { orderId: req.params.orderId }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({ payment });
  } catch (error) {
    console.error('Get payment by order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Refund payment
router.post('/:id/refund', async (req, res) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Payment cannot be refunded' });
    }

    // Process refund (simulate)
    const refundResult = await processRefund({
      transactionId: payment.transactionId,
      amount: payment.amount
    });

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: refundResult.success ? 'REFUNDED' : payment.status,
        gatewayResponse: {
          ...payment.gatewayResponse,
          refund: refundResult
        }
      }
    });

    res.json({
      message: refundResult.success ? 'Refund processed successfully' : 'Refund failed',
      payment: updatedPayment,
      success: refundResult.success
    });
  } catch (error) {
    console.error('Refund payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mock payment processing function
async function processPayment({ amount, currency, paymentMethod, paymentToken }) {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulate success/failure (90% success rate)
  const success = Math.random() > 0.1;

  return {
    success,
    transactionId: success ? `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : null,
    message: success ? 'Payment processed successfully' : 'Payment declined',
    amount,
    currency,
    paymentMethod,
    timestamp: new Date().toISOString()
  };
}

// Mock refund processing function
async function processRefund({ transactionId, amount }) {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Simulate success (95% success rate)
  const success = Math.random() > 0.05;

  return {
    success,
    refundId: success ? `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : null,
    originalTransactionId: transactionId,
    amount,
    message: success ? 'Refund processed successfully' : 'Refund failed',
    timestamp: new Date().toISOString()
  };
}

module.exports = router;
