const Redis = require('ioredis');

const {
  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASSWORD,
} = process.env;

const defaultOptions = {
  host:        REDIS_HOST,
  port:        REDIS_PORT,
  password:    REDIS_PASSWORD,
  lazyConnect: true,
};

module.exports = ({ key = 'redis', options = defaultOptions } = {}) => ({
  settings: {
    [key]: options,
  },
  created() {
    this[key] = new Redis(this.settings[key]);
  },
  async started() {
    await this[key].connect();
  },
  stopped() {
    this[key].disconnect();
  },
});
