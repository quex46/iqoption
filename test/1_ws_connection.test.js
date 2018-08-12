const WebSocket = require('ws');

const {
  WS_ENDPOINT_URL,
} = process.env;

it('Клиент подключается к WebSocket серверу', async () => {
  const ws = new WebSocket(`${WS_ENDPOINT_URL}/ws`);

  await new Promise((resolve, reject) => {
    ws.once('open', () => {
      resolve();
      ws.close();
    });

    ws.once('error', (err) => {
      assert.fail(err.message);
      reject(err);
    });
  });
});
