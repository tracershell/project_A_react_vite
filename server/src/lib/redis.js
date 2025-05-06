const { createClient } = require('redis');

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
});

redisClient.connect()
  .then(() => console.log(`✅ Redis connected on ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`))
  .catch((err) => console.error('❌ Redis connection error:', err));

module.exports = redisClient;
