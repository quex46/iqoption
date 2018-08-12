const Router = require('koa-router');

const router = module.exports = new Router();

router.post('/login', async (ctx) => {
  const { user, sessionId } = await ctx.service.broker.call('auth.login', ctx.request.body);

  ctx.body = user;
  ctx.cookies.set('sessionId', sessionId);
});

router.post('/register', async (ctx) => {
  const user = await ctx.service.broker.call('auth.register', ctx.request.body);

  ctx.status = 201;
  ctx.body = user;
});
