module.exports = router => {
  router.use('/', require('./home'));
  router.use('/examen', require('./examen'));
};
