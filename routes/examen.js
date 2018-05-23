const Router = require('koa-router');
const router = new Router();

const Ctrl = require('../controllers/examen');

router.get('/archive', Ctrl.view_archive);

module.exports = router.routes();
