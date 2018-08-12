const request = require('request-promise');

const {
  CHAT_ENDPOINT_URL,
} = process.env;

it('Клиент запрашивает список чат-комнат', async () => {
  const { statusCode, body } = await request({
    url:                     `${CHAT_ENDPOINT_URL}/room`,
    json:                    true,
    resolveWithFullResponse: true,
  });

  assert(statusCode === 200, 'invalid status code');
  assert(Array.isArray(body), 'response is not array');

  const room = body[0];

  if (room) {
    assert(/^\d+$/.test(room.id), 'invalid room.id');
    assert(typeof room.name === 'string', 'invalid room.name');
  }
});
