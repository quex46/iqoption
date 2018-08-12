const { resolve } = require('path');
const { ServiceBroker } = require('moleculer');
const config = require('./moleculer.config.js');

const dir = resolve(__dirname, 'services');
const services = process.argv.slice(2);

const mask = services.length
  ? `*/@(${services.join('|')}).service.js`
  : '*/*.service.js';

const broker = new ServiceBroker(config);

broker.loadServices(dir, mask);

// Handle nodemon restart.
process.once('SIGUSR2', async () => {
  await broker.stop();
  process.kill(process.pid, 'SIGUSR2');
});

broker.start();
