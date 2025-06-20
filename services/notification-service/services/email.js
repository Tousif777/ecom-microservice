const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mailhog',
  port: process.env.SMTP_PORT || 1025,
  secure: false, // true for 465, false for other ports
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  } : null
});

// Email templates
const templates = {
  welcome: (data) => ({
    subject: `Welcome to our platform, ${data.firstName}!`,
    html: `
      <h1>Welcome ${data.firstName}!</h1>
      <p>Thank you for joining our platform. We're excited to have you on board!</p>
      <p>Your account has been successfully created with email: ${data.email}</p>
      <p>Happy shopping!</p>
    `
  }),
  orderConfirmation: (data) => ({
    subject: `Order Confirmation - #${data.orderId}`,
    html: `
      <h1>Order Confirmed!</h1>
      <p>Thank you for your order. Here are the details:</p>
      <p><strong>Order ID:</strong> ${data.orderId}</p>
      <p><strong>Total Amount:</strong> $${data.totalAmount}</p>
      <p><strong>Status:</strong> ${data.status}</p>
      <p>We'll send you updates as your order is processed.</p>
    `
  }),
  orderStatusUpdate: (data) => ({
    subject: `Order Status Update - #${data.orderId}`,
    html: `
      <h1>Order Status Update</h1>
      <p>Your order status has been updated:</p>
      <p><strong>Order ID:</strong> ${data.orderId}</p>
      <p><strong>New Status:</strong> ${data.status}</p>
      <p>Thank you for your patience!</p>
    `
  }),
  paymentConfirmation: (data) => ({
    subject: `Payment Confirmed - #${data.orderId}`,
    html: `
      <h1>Payment Confirmed!</h1>
      <p>We've received your payment for order #${data.orderId}.</p>
      <p><strong>Amount:</strong> $${data.amount}</p>
      <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
      <p>Your order is now being processed.</p>
    `
  })
};

async function sendEmail({ to, subject, text, html, template, data }) {
  try {
    let emailContent = { subject, text, html };

    // Use template if specified
    if (template && templates[template]) {
      const templateContent = templates[template](data || {});
      emailContent = {
        subject: templateContent.subject,
        html: templateContent.html,
        text: templateContent.text
      };
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@ecommerce.com',
      to,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

module.exports = {
  sendEmail,
  templates
};
