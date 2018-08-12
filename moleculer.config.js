global.Promise = require('bluebird');

require('dotenv').config();

const {
  LOGLEVEL,
  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASSWORD,
  RABBITMQ_HOST,
  RABBITMQ_PORT,
  RABBITMQ_USER,
  RABBITMQ_PASSWORD,
} = process.env;

module.exports = {
  logger:      console,
  logLevel:    LOGLEVEL,
  namespace:   'iqoption',
  transporter: {
    type:    'AMQP',
    options: {
      url:             `amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}:${RABBITMQ_PORT}`,
      eventTimeToLive: 5000,
      prefetch:        1,
    },
  },
  cacher: {
    type:    'Redis',
    options: {
      ttl:     30,
      monitor: false,
      redis:   {
        host:     REDIS_HOST,
        port:     REDIS_PORT,
        password: REDIS_PASSWORD,
      },
    },
  },
  replCommands: [
    {
      command:     'restart',
      alias:       'rs',
      description: 'Restart nodemon',
      action:      () => {},
    },
  ],
};
