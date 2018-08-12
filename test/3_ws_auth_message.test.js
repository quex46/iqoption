const WebSocket = require('ws');
const request = require('request-promise');

const {
  WS_ENDPOINT_URL,
  AUTH_ENDPOINT_URL,
} = process.env;

async function createUser({ login, password }) {
  return request({
    method: 'POST',
    url:    `${AUTH_ENDPOINT_URL}/register`,
    json:   true,
    body:   {
      login,
      password,
      name:   'Mike',
      avatar: 'https://api.adorable.io/avatars/128/123.png',
    },
  });
}

async function loginUser({ login, password }) {
  return request({
    method:                  'POST',
    url:                     `${AUTH_ENDPOINT_URL}/login`,
    json:                    true,
    resolveWithFullResponse: true,
    body:                    {
      login,
      password,
    },
  });
}

it('Клиент получает одно сообщение в чат-комнату Auth', async () => {
  const ws = new WebSocket(`${WS_ENDPOINT_URL}/ws`);
  const messages = [];

  await new Promise((resolve, reject) => {
    ws.once('open', resolve);
    ws.once('error', reject);
    ws.on('message', (msg) => {
      messages.push(JSON.parse(msg));
    });
  });

  const login = `user${Math.round(Math.random() * 1e8)}`;
  const password = '123456';

  await createUser({ login, password });
  await loginUser({ login, password });
  await Promise.delay(500);
  ws.close();

  const mikeAuthMessageCount = messages
    .filter(i => i.user.name === 'Mike' && i.room.name === 'Auth').length;

  assert(mikeAuthMessageCount === 1, 'invalid auth message count');
});
