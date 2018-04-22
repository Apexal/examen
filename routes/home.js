const Router = require('koa-router');
const router = new Router();

const Ctrl = require('../controllers/home');

router.get('/', Ctrl.index);
router.get('reply', Ctrl.reply);

module.exports = router.routes();
