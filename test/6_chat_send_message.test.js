const WebSocket = require('ws');
const request = require('request-promise');

const {
  CHAT_ENDPOINT_URL,
  AUTH_ENDPOINT_URL,
  WS_ENDPOINT_URL,
} = process.env;

async function createUser({ login, password }) {
  return request({
    method: 'POST',
    url:    `${AUTH_ENDPOINT_URL}/register`,
    json:   true,
    body:   {
      login,
      password,
      name:   'Rachel',
      avatar: 'https://api.adorable.io/avatars/128/123.png',
    },
  });
}

async function loginUser({ login, password, jar }) {
  return request({
    jar,
    method: 'POST',
    url:    `${AUTH_ENDPOINT_URL}/login`,
    json:   true,
    body:   {
      login,
      password,
    },
  });
}

async function createRoom({ name }) {
  return request({
    method: 'POST',
    url:    `${CHAT_ENDPOINT_URL}/room`,
    json:   true,
    body:   {
      name,
    },
  });
}

async function sendMessage({ text, roomId, jar }) {
  return request({
    jar,
    method: 'POST',
    url:    `${CHAT_ENDPOINT_URL}/message`,
    json:   true,
    body:   {
      text,
      roomId,
    },
  });
}

async function createUserAndSendMessage() {
  const login = `login${Math.round(Math.random() * 1e8)}`;
  const password = '123456';
  const roomName = `room${Math.round(Math.random() * 1e8)}`;

  const jar = request.jar();
  const { id: roomId } = await createRoom({ name: roomName });

  await createUser({ login, password });
  await loginUser({ login, password, jar });

  return sendMessage({
    text: `My sample message ${Math.random()}`,
    roomId,
    jar,
  });
}

it('Клиент отправляет сообщение в любую чат-комнату и получает его за <200мс', async () => {
  const ws = new WebSocket(`${WS_ENDPOINT_URL}/ws`);
  const messages = [];

  await new Promise((resolve, reject) => {
    ws.once('open', resolve);
    ws.once('error', reject);
    ws.on('message', (msg) => {
      messages.push(JSON.parse(msg));
    });
  });

  const message = await createUserAndSendMessage();

  await Promise.delay(190); // Message must be delivered in 200ms

  const foundCount = messages.filter(i => i.text === message.text).length;

  if (foundCount < 1) {
    assert.fail('messages is not delivered in 200ms');
  } else if (foundCount > 1) {
    assert.fail('messages is delivered more than once');
  }

  ws.close();
});

it('Клиент может увидеть в списке сообщений свое сообщение', async () => {
  const message = await createUserAndSendMessage();
  const messages = await request({
    url:  `${CHAT_ENDPOINT_URL}/room/${message.room.id}/messages`,
    json: true,
  });

  assert(messages.find(i => i.text === message.text), 'message not found');
});
