const assert = require('assert');
const Bluebird = require('bluebird');

global.assert = assert;
global.Promise = Bluebird;

Object.assign(process.env, {
  AUTH_ENDPOINT_URL: 'http://127.0.0.1:5501',
  CHAT_ENDPOINT_URL: 'http://127.0.0.1:5601',
  WS_ENDPOINT_URL:   'ws://127.0.0.1:5701',
});
