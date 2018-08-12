const { createServer } = require('http');
const url = require('url');
const { Service } = require('moleculer');
const WebSocket = require('ws');

const {
  WS_LISTEN_PORT,
} = process.env;

module.exports = class WebSocketService extends Service {
  constructor(broker) {
    super(broker);
    this.parseServiceSchema({
      name: 'ws',

      settings: {
        port: Number(WS_LISTEN_PORT) || 5701,
      },

      created() {
        this.init();
      },

      async started() {
        const { port } = this.settings;

        await this.Promise.fromCallback(cb => this.server.listen(port, cb));
      },

      events: {
        'chat.message': this.broadcast,
      },
    });
  }

  init() {
    const server = this.server = createServer();
    const ws = this.ws = new WebSocket.Server({ noServer: true });

    server.on('upgrade', (request, socket, head) => {
      const { pathname } = url.parse(request.url);

      if (pathname === '/ws') {
        ws.handleUpgrade(request, socket, head, (client) => {
          ws.emit('connection', client, request);
        });
      } else {
        socket.destroy();
      }
    });
  }

  broadcast(data) {
    this.ws.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) client.send(JSON.stringify(data));
    });
  }
};

