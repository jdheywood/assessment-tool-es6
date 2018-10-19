'use strict';

var _appConfig = require('../../config/appConfig.json');

var _appConfig2 = _interopRequireDefault(_appConfig);

var _connectEnsureLogin = require('connect-ensure-login');

var _connectEnsureLogin2 = _interopRequireDefault(_connectEnsureLogin);

var _environment = require('../utils/environment');

var _environment2 = _interopRequireDefault(_environment);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var footerLinks = [{
  url: 'http://www.creativehuddle.co.uk/privacy-policy',
  text: 'Privacy policy'
}, {
  url: 'http://www.creativehuddle.co.uk/terms-conditions',
  text: 'Terms & conditions'
}, {
  url: 'https://www.upwork.com/o/profiles/users/_~018b189edb3ffaab80/',
  text: 'Custom development by jdheywood'
}];

/**
 * Index routes
 * @module routes/index
 * @param {object} app - the express application instance
 */
module.exports = function (app) {

  /**
   * Render the home view
   */
  app.get('/', function (req, res) {
    res.render('home', {
      meta: _appConfig2.default.app.defaultMeta,
      content: _appConfig2.default.app.defaultContent,
      user: req.user,
      moment: _moment2.default,
      loggedIn: false,
      environmentName: process.env.ENV_NAME,
      context: 'home',
      debugMode: _environment2.default.getDebugMode(),
      footerLinks: footerLinks
    });
  });

  /**
   * Route for the client SPA to ensure we render the home view that loads the SPA javascript
   * The SPA in turn tales the identifier from the url and async loads the assessment details and starts the participation
   * Nice!
   */
  app.get('/participate/:id', function (req, res) {
    res.render('home', {
      meta: _appConfig2.default.app.defaultMeta,
      content: _appConfig2.default.app.defaultContent,
      user: req.user,
      moment: _moment2.default,
      loggedIn: false,
      environmentName: process.env.ENV_NAME,
      context: 'home',
      debugMode: _environment2.default.getDebugMode(),
      footerLinks: footerLinks
    });
  });

  /**
   * Route for the client SPA to ensure we render the home view that loads the SPA javascript
   * The SPA in turn tales the identifier from the url and async loads the participation details for review by the user
   * Nice!
   */
  app.get('/participation/:id', function (req, res) {
    res.render('home', {
      meta: _appConfig2.default.app.defaultMeta,
      content: _appConfig2.default.app.defaultContent,
      user: req.user,
      moment: _moment2.default,
      loggedIn: false,
      environmentName: process.env.ENV_NAME,
      context: 'home',
      debugMode: _environment2.default.getDebugMode(),
      footerLinks: footerLinks
    });
  });

  /**
   * Render the admin view, if user logged in
   */
  app.get('/admin', _connectEnsureLogin2.default.ensureLoggedIn(), function (req, res) {
    res.render('admin/admin', {
      user: req.user,
      meta: _appConfig2.default.app.defaultMeta,
      content: _appConfig2.default.app.defaultContent,
      moment: _moment2.default,
      loggedIn: true,
      environmentName: process.env.ENV_NAME,
      context: 'admin',
      debugMode: _environment2.default.getDebugMode(),
      canDebug: !!req.user.canDebug,
      footerLinks: { url: 'Sign off', text: '/logout' }
    });
  });

  /**
   * Easter egg, 418
   */
  app.get('/coffee', function (req, res) {
    res.status(418);
    res.render('errors/418', {
      meta: _appConfig2.default.app.defaultMeta,
      content: _appConfig2.default.app.defaultContent,
      user: req.user,
      moment: _moment2.default,
      loggedIn: false,
      environmentName: process.env.ENV_NAME,
      context: 'home',
      debugMode: false,
      footerLinks: { url: 'Sign off', text: '/logout' }
    });
  });
};