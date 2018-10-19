'use strict';

var _alert = require('../utils/alert');

var _alert2 = _interopRequireDefault(_alert);

var _appConfig = require('../../config/appConfig.json');

var _appConfig2 = _interopRequireDefault(_appConfig);

var _connectEnsureLogin = require('connect-ensure-login');

var _connectEnsureLogin2 = _interopRequireDefault(_connectEnsureLogin);

var _email = require('../utils/email');

var _email2 = _interopRequireDefault(_email);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Debug routes, to assist during development
 * @module routes/debug
 * @param {object} app - the express application instance
 */
module.exports = function (app) {

  /**
   * Render the debug view
   */
  app.get('/admin/debug', _connectEnsureLogin2.default.ensureLoggedIn(), function (req, res) {
    if (!!req.user.canDebug) {
      var content = {
        heading: 'Assessment Tool',
        subtitle: 'Admin',
        bodyText: 'Debug Tools',
        imageClass: 'home',
        pageName: 'home',
        navBack: '/admin'
      };
      res.render('admin/debug', {
        meta: _appConfig2.default.app.defaultMeta,
        content: content,
        footerCta: 'Logout',
        footerLink: '/logout',
        loggedIn: true
      });
    } else {
      res.redirect('/admin');
    }
  });

  /**
   * Submit of test email functionality
   */
  app.post('/sendtestemail', _connectEnsureLogin2.default.ensureLoggedIn(), function (req, res) {
    _email2.default.send('test', req.body.emailTo, null);
    res.redirect('/admin');
  });

  /**
   * Submit of test alert functionality
   */
  app.post('/sendtestalert', _connectEnsureLogin2.default.ensureLoggedIn(), function (req, res) {
    _alert2.default.send('test', req.body.message);
    res.redirect('/admin');
  });

  /**
   * Throw an error, to test our error route catches it
   */
  /* jshint unused: vars */
  app.get('/throw', function (req, res) {
    throw new Error('Have an error then');
  });
};