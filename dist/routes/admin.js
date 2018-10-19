'use strict';

var _appConfig = require('../../config/appConfig.json');

var _appConfig2 = _interopRequireDefault(_appConfig);

var _connectEnsureLogin = require('connect-ensure-login');

var _connectEnsureLogin2 = _interopRequireDefault(_connectEnsureLogin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (app) {

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
};