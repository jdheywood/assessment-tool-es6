'use strict';

var _alert = require('../utils/alert');

var _alert2 = _interopRequireDefault(_alert);

var _appConfig = require('../../config/appConfig.json');

var _appConfig2 = _interopRequireDefault(_appConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Error routes
 * @module routes/error
 * @param {object} app - the express application instance
 */
module.exports = function (app) {

  /**
   * 404 errors
   */
  app.use(function (req, res) {
    if (req.url !== '/login') {
      var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
      _alert2.default.send('error', '404 error encountered for requested url ' + fullUrl);
    }
    res.status(404);
    res.render('errors/404.pug', {
      meta: _appConfig2.default.app.defaultMeta,
      content: _appConfig2.default.app.defaultContent,
      loggedIn: false,
      environmentName: process.env.ENV_NAME,
      context: 'home',
      checkInNumber: 0,
      debugMode: false
    });
  });

  /**
   * 500 errors
   */
  /* jshint unused: vars */
  app.use(function (error, req, res, next) {
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    _alert2.default.send('error', '500 error encountered for requested url ' + fullUrl + ' ' + error);
    if ('development' === app.get('env')) {
      console.log(error);
    }
    res.status(500);
    res.render('errors/500.pug', {
      meta: _appConfig2.default.app.defaultMeta,
      content: _appConfig2.default.app.defaultContent,
      loggedIn: false,
      environmentName: process.env.ENV_NAME,
      context: 'home',
      checkInNumber: 0,
      debugMode: false
    });
  });
};