exports.up = knex => knex.raw(`

CREATE TABLE users (
  id      bigserial PRIMARY KEY,
  name    varchar(100) NOT NULL,
  avatar  varchar(500),
  login   varchar(32) NOT NULL,
  password varchar(60) NOT NULL -- Passwords stored as bcrypt hashes.
);

CREATE UNIQUE INDEX users_login_idx ON users (login);

`);

exports.down = knex => knex.raw(`

DROP TABLE users;

`);
