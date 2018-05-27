const Router = require('koa-router');
const router = new Router();

const Ctrl = require('../controllers/home');

router.get('/', Ctrl.index);

module.exports = router.routes();
