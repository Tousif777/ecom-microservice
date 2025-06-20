const express = require('express');
const Joi = require('joi');
const { sendEmail } = require('../services/email');

const router = express.Router();

// Send email notification
router.post('/email', async (req, res) => {
  try {
    const schema = Joi.object({
      to: Joi.string().email().required(),
      subject: Joi.string().required(),
      text: Joi.string().optional(),
      html: Joi.string().optional(),
      template: Joi.string().optional(),
      data: Joi.object().optional()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const result = await sendEmail(value);

    res.json({
      message: 'Email sent successfully',
      messageId: result.messageId
    });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Send bulk emails
router.post('/email/bulk', async (req, res) => {
  try {
    const schema = Joi.object({
      recipients: Joi.array().items(Joi.string().email()).min(1).required(),
      subject: Joi.string().required(),
      text: Joi.string().optional(),
      html: Joi.string().optional(),
      template: Joi.string().optional(),
      data: Joi.object().optional()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { recipients, ...emailData } = value;
    const results = [];

    // Send emails sequentially to avoid overwhelming the SMTP server
    for (const recipient of recipients) {
      try {
        const result = await sendEmail({
          ...emailData,
          to: recipient
        });
        results.push({ recipient, success: true, messageId: result.messageId });
      } catch (error) {
        results.push({ recipient, success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    res.json({
      message: `Bulk email completed: ${successCount} sent, ${failureCount} failed`,
      results,
      summary: {
        total: results.length,
        success: successCount,
        failed: failureCount
      }
    });
  } catch (error) {
    console.error('Send bulk email error:', error);
    res.status(500).json({ error: 'Failed to send bulk emails' });
  }
});

module.exports = router;
