const request = require('request-promise');

const {
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
      name:   'John',
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

it('Авторизация клиента', async () => {
  const login = `user${Math.round(Math.random() * 1e8)}`;
  const password = '123456';

  await createUser({ login, password });

  const { statusCode, headers, body } = await loginUser({ login, password });

  assert(statusCode === 200, 'invalid status code');
  assert(headers['set-cookie'].indexOf('sessionId=') < 0, 'cookie is not set');
  assert(/^\d+$/.test(body.id), 'user.id is empty');
  assert(typeof body.name === 'string', 'user.name is not a string');
  assert(typeof body.avatar === 'string', 'user.avatar is not a string');
});
