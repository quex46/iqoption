const assert = require('assert');
const Bluebird = require('bluebird');

require('dotenv').config();

const {
  AUTH_LISTEN_PORT,
  CHAT_LISTEN_PORT,
  WS_LISTEN_PORT,
} = process.env;

global.assert = assert;
global.Promise = Bluebird;

Object.assign(process.env, {
  AUTH_ENDPOINT_URL: `http://127.0.0.1:${AUTH_LISTEN_PORT}`,
  CHAT_ENDPOINT_URL: `http://127.0.0.1:${CHAT_LISTEN_PORT}`,
  WS_ENDPOINT_URL:   `ws://127.0.0.1:${WS_LISTEN_PORT}`,
});
