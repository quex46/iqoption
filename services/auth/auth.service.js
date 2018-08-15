const { randomBytes } = require('crypto');
const { Service, Errors } = require('moleculer');
const bcrypt = require('bcrypt');
const pg = require('../../mixins/postgres');
const redis = require('../../mixins/redis');
const server = require('../../mixins/server');
const router = require('./router');

const {
  AUTH_LISTEN_PORT,
} = process.env;

module.exports = class AuthService extends Service {
  constructor(broker) {
    super(broker);
    this.parseServiceSchema({
      name:   'auth',
      mixins: [pg(), redis(), server({ router })],

      settings: {
        port: Number(AUTH_LISTEN_PORT) || 5501,
      },

      async started() {
        const { port } = this.settings;

        await this.Promise.fromCallback(cb => this.server.listen(port, cb));
      },

      actions: {
        login: {
          params: {
            login:    { type: 'string', max: 32, empty: false },
            password: { type: 'string', max: 100, empty: false },
          },
          async handler(ctx) {
            return this.login(ctx.params);
          },
        },

        register: {
          params: {
            login:    { type: 'string', max: 32, empty: false },
            password: { type: 'string', max: 100, empty: false },
            name:     { type: 'string', max: 100, empty: false },
            avatar:   { type: 'url', max: 500, optional: true },
          },
          async handler(ctx) {
            return this.createUser(ctx.params);
          },
        },

        getBySessionId: {
          params: {
            sessionId: { type: 'string', max: 500, empty: false },
          },
          async handler(ctx) {
            return this.getBySessionId(ctx.params);
          },
        },

        getByIds: {
          params: {
            ids: {
              type:  'array',
              items: {
                type:    'number',
                convert: true,
                integer: true,
              },
            },
          },
          async handler(ctx) {
            return this.getByIds(ctx.params.ids);
          },
        },
      },
    });
  }

  async createUser(data) {
    const {
      name,
      avatar,
      login,
      password,
    } = data;

    try {
      const [user] = await this.pg('users')
        .insert({
          name,
          avatar,
          login,
          password: await this.constructor.hashPassword({ password }),
        })
        .returning('*');

      return this.constructor.toUserObject(user);
    } catch (error) {
      // Unique constraint violation
      if (Number(error.code) === 23505 && error.constraint === 'users_login_idx') {
        throw new Errors.MoleculerError(`Login "${login}" already in use`, 400, 'E_INVALID_LOGIN');
      }

      throw new Errors.MoleculerError(error.message, 500, 'E_SERVER', { error });
    }
  }

  async createSessionId({ userId }) {
    const rand = await this.Promise.fromCallback(cb => randomBytes(32, cb));
    const sessionId = rand.toString('hex');

    await this.redis.set(`sessions:${sessionId}`, userId, 'EX', 3600, 'NX');

    return sessionId;
  }

  async login({ login, password }) {
    const [user] = await this.pg('users').select().where('login', login);

    if (!user) {
      throw new Errors.MoleculerError('Invalid login', 401, 'E_INVALID_LOGIN');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new Errors.MoleculerError('Invalid password', 401, 'E_INVALID_PASSWORD');
    }

    await this.broker.emit('auth.login', user);

    return {
      user:      this.constructor.toUserObject(user),
      sessionId: await this.createSessionId({ userId: user.id }),
    };
  }

  async getBySessionId({ sessionId }) {
    const userId = await this.redis.get(`sessions:${sessionId}`);

    if (!userId) return null;

    const [user] = await this.pg('users').select().where('id', Number(userId));

    if (!user) return null;

    await this.redis.expire(`sessions:${sessionId}`, 3600); // Prolongate session.

    return this.constructor.toUserObject(user);
  }

  async getByIds(ids) {
    const users = await this.pg('users').select().whereIn('id', ids);

    return users.map(i => this.constructor.toUserObject(i));
  }

  static async hashPassword({ password }) {
    return bcrypt.hash(password, 10);
  }

  static toUserObject(row) {
    return {
      id:     row.id,
      name:   row.name,
      avatar: row.avatar || undefined,
    };
  }
};
