const Router = require('koa-router');
const router = new Router();

router.get('/', async ctx => {
  ctx.body = 'made it!';
});

module.exports = router.routes();
