const { createServer } = require('http');
const Koa = require('koa');
const body = require('koa-body');

async function handleError(ctx, next) {
  try {
    await next();
  } catch (err) {
    const status = parseInt(err.status || err.statusCode || err.code, 10);

    ctx.status = status >= 100 && status <= 599 ? status : 500;
    ctx.body = { error: err.message };

    // Moleculer Validation Error
    if (err.code === 422 && err.data) {
      ctx.status = 400;
      ctx.body = {
        error: err.data[0].message,
      };
    }
  }
}

module.exports = ({ router, key = 'server' } = {}) => ({
  created() {
    const app = new Koa();

    app.proxy = true;
    app.context.service = this;

    app.use(handleError);
    app.use(body());
    app.use(router.routes());
    app.use((ctx) => {
      ctx.status = 404;
      ctx.body = { error: 'Resource not found' };
    });

    this[key] = createServer(app.callback());
  },
});
