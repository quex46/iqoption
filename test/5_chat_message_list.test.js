const request = require('request-promise');

const {
  CHAT_ENDPOINT_URL,
} = process.env;

it('Клиент получает список сообщений для любой чат-комнаты', async () => {
  const { statusCode, body } = await request({
    url:                     `${CHAT_ENDPOINT_URL}/room/1/messages`,
    json:                    true,
    resolveWithFullResponse: true,
  });

  assert(statusCode === 200, 'invalid status code');
  assert(Array.isArray(body), 'response is not array');

  const message = body[0];

  assert(typeof message.text === 'string', 'message.text is not a string');

  assert(message.user && typeof message.user === 'object', 'message.user is not an object');
  assert(/^\d+$/.test(message.user.id), 'message.user.id is not a number');
  assert(typeof message.user.name === 'string', 'message.user.name is not a string');

  assert(message.room && typeof message.room === 'object', 'message.room is not an object');
  assert(/^\d+$/.test(message.room.id), 'invalid room.id');
  assert(typeof message.room.name === 'string', 'invalid room.name');
});
