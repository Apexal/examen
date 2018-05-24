const Router = require('koa-router');
const router = new Router();

const Ctrl = require('../controllers/examen');

router.get('/new', Ctrl.view_new_examen);
router.get('/archive', Ctrl.view_archive);

router.get('/:id', Ctrl.view_examen);


module.exports = router.routes();