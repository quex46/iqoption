const Router = require('koa-router');

const router = module.exports = new Router();

router.get('/room', async (ctx) => {
  ctx.body = await ctx.service.broker.call('chat.getRooms');
});

router.post('/room', async (ctx) => {
  ctx.status = 201;
  ctx.body = await ctx.service.broker.call('chat.createRoom', ctx.request.body);
});

router.param('roomId', async (roomId, ctx, next) => {
  ctx.state.room = await ctx.service.broker.call('chat.getRoomById', { id: roomId });
  ctx.assert(ctx.state.room, 404, 'Room not found');

  return next();
});

router.get('/room/:roomId/messages', async (ctx) => {
  ctx.body = await ctx.service.broker.call('chat.getMessagesByRoomId', {
    roomId: ctx.state.room.id,
  });
});

// Handle user authentication
router.use('/message', async (ctx, next) => {
  const sessionId = ctx.cookies.get('sessionId');

  if (sessionId) {
    ctx.state.user = await ctx.service.broker.call('auth.getBySessionId', { sessionId });
  }

  if (!ctx.state.user) {
    ctx.cookies.set('sessionId', ''); // Invalid cookie passed so we should remove it.
  }

  return next();
});

router.post('/message', async (ctx) => {
  ctx.assert(ctx.state.user, 401);

  ctx.status = 201;
  ctx.body = await ctx.service.broker.call('chat.createMessage', {
    userId: ctx.state.user.id,
    roomId: ctx.request.body.roomId,
    text:   ctx.request.body.text,
  });
});
