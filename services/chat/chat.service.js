const { Service, Errors } = require('moleculer');
const pg = require('../../mixins/postgres');
const server = require('../../mixins/server');
const router = require('./router');

const {
  CHAT_LISTEN_PORT,
} = process.env;

module.exports = class ChatService extends Service {
  constructor(broker) {
    super(broker);
    this.parseServiceSchema({
      name:   'chat',
      mixins: [pg(), server({ router })],

      settings: {
        port: Number(CHAT_LISTEN_PORT) || 5601,
      },

      async started() {
        const { port } = this.settings;

        await this.Promise.fromCallback(cb => this.server.listen(port, cb));
      },

      actions: {
        getRooms: {
          async handler() {
            return this.getRooms();
          },
        },

        getRoomById: {
          params: {
            id: { type: 'number', convert: true, integer: true },
          },
          async handler(ctx) {
            return this.getRoomById(ctx.params.id);
          },
        },

        getMessagesByRoomId: {
          params: {
            roomId: { type: 'number', convert: true, integer: true },
          },
          async handler(ctx) {
            return this.getMessagesByRoomId(ctx.params.roomId);
          },
        },

        createRoom: {
          params: {
            name: { type: 'string', max: 200, empty: false },
          },
          async handler(ctx) {
            return this.createRoom(ctx.params);
          },
        },

        createMessage: {
          params: {
            userId: { type: 'number', convert: true, integer: true },
            roomId: { type: 'number', convert: true, integer: true },
            text:   { type: 'string', max: 2000, empty: false },
          },
          async handler(ctx) {
            return this.createMessage(ctx.params);
          },
        },
      },

      events: {
        'auth.login': this.onUserLogin,
      },
    });
  }

  async createRoom({ name }) {
    const [room] = await this.pg('rooms').insert({ name }).returning('*');

    return room;
  }

  async createMessage({ userId, roomId, text }) {
    try {
      const [message] = await this.pg('messages')
        .insert({
          userId,
          roomId,
          text,
        })
        .returning('*');

      const [users, room] = await this.Promise.all([
        this.broker.call('auth.getByIds', { ids: [userId] }),
        this.getRoomById(roomId),
      ]);

      const payload = this.constructor.toMessageObject({
        message,
        user: users[0],
        room,
      });

      await this.broker.broadcast('chat.message', payload, ['ws']);

      return payload;
    } catch (err) {
      if (Number(err.code) === 23503 && err.constraint === 'messages_roomid_fkey') {
        throw new Errors.MoleculerError('Invalid room id.', 400, 'E_INVALID_ROOM');
      }

      throw err;
    }
  }

  async getRooms() {
    return this.pg('rooms').select();
  }

  async getRoomById(id) {
    const [room] = await this.pg('rooms').select().where('id', id);

    return room || null;
  }

  async getMessagesByRoomId(roomId) {
    const messages = await this.pg('messages').select().where('roomId', roomId);
    const [users, room] = await this.Promise.all([
      this.broker.call('auth.getByIds', {
        ids: messages.map(i => i.userId),
      }),
      this.getRoomById(roomId),
    ]);

    return messages
      .map(msg => this.constructor.toMessageObject({
        message: msg,
        user:    users.find(u => u.id === msg.userId) || {},
        room,
      }))
      // Filter out messages without author (e.g. user has been deleted).
      .filter(msg => !!msg.user.id);
  }

  async onUserLogin(user) {
    const [room] = await this.pg('rooms').select('id').where('name', 'Auth');

    if (!room) return;

    await this.createMessage({
      userId: user.id,
      roomId: room.id,
      text:   `User ${user.name} logged in`,
    });
  }

  static toMessageObject({ message, user, room }) {
    return {
      text: message.text,
      user: {
        id:     user.id,
        name:   user.name,
        avatar: user.avatar,
      },
      room: {
        id:   room.id,
        name: room.name,
      },
    };
  }
};
