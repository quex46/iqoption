require('dotenv').config();

const {
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_DB,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
} = process.env;

module.exports = {
  client:     'pg',
  connection: {
    host:     POSTGRES_HOST,
    port:     POSTGRES_PORT,
    database: POSTGRES_DB,
    user:     POSTGRES_USER,
    password: POSTGRES_PASSWORD,
  },
  migrations: {
    stub:      'migrations/.migration.stub',
    tableName: '_migrations',
  },
};
