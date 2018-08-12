const knex = require('knex');

const {
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_DB,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
} = process.env;

const defaultOptions = {
  host:     POSTGRES_HOST,
  port:     POSTGRES_PORT,
  database: POSTGRES_DB,
  user:     POSTGRES_USER,
  password: POSTGRES_PASSWORD,
};

module.exports = ({ key = 'pg', options = defaultOptions } = {}) => ({
  settings: {
    [key]: options,
  },
  created() {
    this[key] = knex({
      client:     'pg',
      connection: this.settings[key],
      pool:       { min: 0, max: 8 },
    });
  },

  async stopped() {
    await this[key].destroy();
  },
});
