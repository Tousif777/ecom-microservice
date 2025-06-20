const amqp = require('amqplib');

let connection = null;
let channel = null;

async function connectRabbitMQ() {
  try {
    const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672';
    connection = await amqp.connect(rabbitmqUrl);
    channel = await connection.createChannel();
    
    // Create exchange for user events
    await channel.assertExchange('user_events', 'topic', { durable: true });
    
    console.log('Connected to RabbitMQ');
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
    throw error;
  }
}

async function publishMessage(routingKey, message) {
  try {
    if (!channel) {
      throw new Error('RabbitMQ channel not initialized');
    }
    
    const messageBuffer = Buffer.from(JSON.stringify(message));
    await channel.publish('user_events', routingKey, messageBuffer, {
      persistent: true,
      timestamp: Date.now()
    });
    
    console.log(`Published message to ${routingKey}:`, message);
  } catch (error) {
    console.error('Failed to publish message:', error);
  }
}

module.exports = {
  connectRabbitMQ,
  publishMessage
};
