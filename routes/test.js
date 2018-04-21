const Router = require('koa-router');
const router = new Router();

router.get('/', async ctx => {
  ctx.ok('all gooood!');
});

module.exports = router.routes();
