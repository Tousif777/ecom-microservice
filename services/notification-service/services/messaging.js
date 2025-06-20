const amqp = require('amqplib');
const { sendEmail } = require('./email');

let connection = null;
let channel = null;

async function connectRabbitMQ() {
  try {
    const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672';
    connection = await amqp.connect(rabbitmqUrl);
    channel = await connection.createChannel();
    
    // Listen for user events
    await channel.assertExchange('user_events', 'topic', { durable: true });
    const userQueue = await channel.assertQueue('notifications.user', { durable: true });
    await channel.bindQueue(userQueue.queue, 'user_events', 'user.created');
    
    channel.consume(userQueue.queue, async (msg) => {
      if (msg) {
        try {
          const data = JSON.parse(msg.content.toString());
          console.log('Received user event:', data);
          
          // Send welcome email
          await sendEmail({
            to: data.email,
            template: 'welcome',
            data: data
          });
          
          channel.ack(msg);
        } catch (error) {
          console.error('Failed to process user event:', error);
          channel.nack(msg, false, false); // Don't requeue
        }
      }
    });
    
    // Listen for order events
    await channel.assertExchange('order_events', 'topic', { durable: true });
    const orderQueue = await channel.assertQueue('notifications.order', { durable: true });
    await channel.bindQueue(orderQueue.queue, 'order_events', 'order.*');
    
    channel.consume(orderQueue.queue, async (msg) => {
      if (msg) {
        try {
          const data = JSON.parse(msg.content.toString());
          const routingKey = msg.fields.routingKey;
          console.log('Received order event:', routingKey, data);
          
          // Send appropriate email based on routing key
          if (routingKey === 'order.created') {
            await sendEmail({
              to: data.userEmail,
              template: 'orderConfirmation',
              data: data
            });
          } else if (routingKey === 'order.status_updated') {
            await sendEmail({
              to: data.userEmail,
              template: 'orderStatusUpdate',
              data: data
            });
          }
          
          channel.ack(msg);
        } catch (error) {
          console.error('Failed to process order event:', error);
          channel.nack(msg, false, false);
        }
      }
    });
    
    // Listen for payment events
    await channel.assertExchange('payment_events', 'topic', { durable: true });
    const paymentQueue = await channel.assertQueue('notifications.payment', { durable: true });
    await channel.bindQueue(paymentQueue.queue, 'payment_events', 'payment.completed');
    
    channel.consume(paymentQueue.queue, async (msg) => {
      if (msg) {
        try {
          const data = JSON.parse(msg.content.toString());
          console.log('Received payment event:', data);
          
          // Send payment confirmation email
          await sendEmail({
            to: data.userEmail,
            template: 'paymentConfirmation',
            data: data
          });
          
          channel.ack(msg);
        } catch (error) {
          console.error('Failed to process payment event:', error);
          channel.nack(msg, false, false);
        }
      }
    });
    
    console.log('Connected to RabbitMQ and listening for events');
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
    throw error;
  }
}

module.exports = {
  connectRabbitMQ
};
