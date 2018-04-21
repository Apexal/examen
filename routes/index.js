module.exports = router => {
  router.use('/', require('./home'));
  router.use('/test', require('./test'));
};
