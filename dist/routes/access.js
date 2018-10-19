'use strict';

var _alert = require('../utils/alert');

var _alert2 = _interopRequireDefault(_alert);

var _appConfig = require('../../config/appConfig.json');

var _appConfig2 = _interopRequireDefault(_appConfig);

var _email = require('../utils/email');

var _email2 = _interopRequireDefault(_email);

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _user = require('../models/user');

var _user2 = require('../services/user');

var _user3 = _interopRequireDefault(_user2);

var _nodeUuid = require('node-uuid');

var _nodeUuid2 = _interopRequireDefault(_nodeUuid);

var _validator = require('validator');

var _validator2 = _interopRequireDefault(_validator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var content = {
  heading: 'Assessment Tool',
  subtitle: 'Hello, how can I help you today?..',
  bodyText: 'Lorem ipsum dolor sit amet',
  imageClass: 'home',
  pageName: 'home',
  navBack: '/'
};

/**
 * Access routes, for login, logout, registration and password reset
 * @module routes/access
 * @param {object} app - the express application instance
 */
module.exports = function (app) {

  /**
   * Login form render
   */
  app.get('/login', function (req, res) {
    res.render('access/login', {
      meta: _appConfig2.default.app.defaultMeta,
      content: content,
      footerCta: 'No account? Contact your administrator for access',
      footerLink: 'mailto:support@mypepcoach.com?subject=Access Request',
      loggedIn: false,
      environmentName: process.env.ENV_NAME
    });
  });

  /**
   * Login form post, attempts login and redirects based on success/failure
   */
  app.post('/login', _passport2.default.authenticate('local', { failureRedirect: '/login' }), function (req, res) {
    _user3.default.recordVisit(req.user).then(function () {
      if (process.env.ENV_NAME === 'live') {
        _alert2.default.send('login', req.user.username + ' logged in');
      }
      res.redirect('/admin/assessments');
    });
  });

  /**
   * Logout route, destroys session, logs out user and redirects to login page
   */
  app.get('/logout', function (req, res) {
    req.session.destroy(function (error) {
      console.log(error);
    });
    req.logOut();
    res.redirect('/login');
  });

  /**
   * Register form render
   */
  app.get('/register', function (req, res) {
    res.render('access/register', {
      meta: _appConfig2.default.app.defaultMeta,
      content: content,
      footerCta: 'Already registered? Login',
      footerLink: '/login',
      loggedIn: false,
      environmentName: process.env.ENV_NAME,
      message: req.flash('invalid')
    });
  });

  /**
   * Register form post, validates and redirects as appropriate
   * Sends emails to new user and admins
   * Alerts to slack
   */
  app.post('/register', function (req, res) {
    var usernameValid = _validator2.default.isEmail(req.body.username);
    var passwordValid = _validator2.default.isLength(req.body.password, { min: 5, max: undefined });
    var firstNameValid = _validator2.default.isLength(req.body.firstname, { min: 2, max: undefined });

    if (!usernameValid || !passwordValid || !firstNameValid) {
      req.flash('invalid', 'One or more fields are invalid');
      res.redirect('/register');
    }

    _user.User.register(new _user.User({
      username: req.body.username,
      displayName: req.body.firstname
    }), req.body.password, function (err, user) {
      if (err) {
        return res.render('access/register', {
          user: user,
          meta: _appConfig2.default.app.defaultMeta,
          content: content,
          message: 'One or more fields are invalid'
        });
      }
      _passport2.default.authenticate('local')(req, res, function () {
        _user3.default.recordVisit(user).then(function () {
          _email2.default.send('registration', user.username, null);
          if (process.env.ENV_NAME === 'live') {
            _email2.default.send('newRegistrationAlert', _appConfig2.default.app.newRegistrationAlertsAddress, user.username);
            _alert2.default.send('registration', 'New registration with Assessment Tool by ' + user.username + ' (' + user.displayName + ')');
          }
          res.redirect('/');
        });
      });
    });
  });

  /**
   * Forgotten password form render
   */
  app.get('/forgotten', function (req, res) {
    res.render('access/forgotten', {
      meta: _appConfig2.default.app.defaultMeta,
      content: content,
      footerCta: 'Know your details? Login',
      footerLink: '/login',
      loggedIn: false,
      environmentName: process.env.ENV_NAME
    });
  });

  /**
   * Forgotten password form post, redirects as appropriate
   * Emails reset link to user on success
   * Alerts to slack on success
   */
  app.post('/forgotten', function (req, res) {
    _user3.default.getUserByUsername(req.body.username).then(function (user) {
      if (!!user && user.length === 1) {
        (function () {
          var theUser = user[0];
          theUser.passwordResetId = _nodeUuid2.default.v4();
          _user3.default.saveUser(theUser).then(function () {
            var resetUrl = _email2.default.getPasswordResetLink(theUser.passwordResetId);
            _email2.default.send('forgotten', theUser.username, resetUrl);
            if (process.env.ENV_NAME === 'live') {
              _alert2.default.send('forgotten', theUser.username + ' has requested a password reset link');
            }
            res.redirect('/reset-link-sent');
          });
        })();
      } else {
        res.redirect('/forgotten');
      }
    });
  });

  /**
   * Reset link sent confirmation view
   */
  app.get('/reset-link-sent', function (req, res) {
    var content = {
      heading: 'Assessment Tool',
      subtitle: 'I\'ve just sent you an email.',
      bodyText: 'Please follow the link to reset your password so we can catch up, see you soon friend.',
      imageClass: 'home',
      pageName: 'home'
    };
    res.render('information', {
      meta: _appConfig2.default.app.defaultMeta,
      content: content,
      footerCta: 'Please check your email',
      footerLink: '/',
      loggedIn: false,
      environmentName: process.env.ENV_NAME
    });
  });

  /**
   * Reset link form render
   * If link valid renders form for new password capture and submission
   * If invalid redirects to information page stating link invalid or expired
   */
  app.get('/reset/:resetId', function (req, res) {
    _user3.default.getUserByPasswordResetId(req.params.resetId).then(function (user) {
      if (!!user && user.length === 1) {
        res.render('access/reset-password', {
          meta: _appConfig2.default.app.defaultMeta,
          content: content,
          footerCta: 'Know your details? Login',
          footerLink: '/login',
          loggedIn: false,
          passwordResetLink: req.params.resetId,
          message: req.flash('invalid')
        });
      } else {
        res.redirect('/reset-link-invalid');
        if (process.env.ENV_NAME === 'live') {
          _alert2.default.send('forgotten', 'No user found for password reset link: ' + req.params.resetId);
        }
      }
    });
  });

  /**
   * Reset link invalid view
   */
  app.get('/reset-link-invalid', function (req, res) {
    var content = {
      heading: 'Pep',
      subtitle: 'I\'m sorry I can\'t let you do that friend',
      bodyText: 'The link you have used is no longer valid, please check your email or request another link using the forgotten password page.',
      imageClass: 'home',
      pageName: 'home'
    };
    res.render('information', {
      meta: _appConfig2.default.app.defaultMeta,
      content: content,
      footerCta: 'Send another password reset link?',
      footerLink: '/forgotten',
      loggedIn: false,
      environmentName: process.env.ENV_NAME
    });
  });

  /**
   * Reset password form post, updates user password
   * If successful alerts to slack and redirects to information view prompting login
   * If failed validation re-renders form
   * If invalid link used redirects to invalid link view
   */
  app.post('/reset-password', function (req, res) {
    _user3.default.getUserByPasswordResetId(req.body.identifier).then(function (user) {
      if (!!user && user.length === 1) {
        var passwordValid = _validator2.default.isLength(req.body.password, { min: 5, max: undefined });
        if (!!passwordValid) {
          (function () {
            var theUser = user[0];
            theUser.setPassword(req.body.password, function () {
              theUser.passwordResetId = null;
              theUser.save();
              if (process.env.ENV_NAME === 'live') {
                _alert2.default.send('forgotten', theUser.username + ' has successfully reset their password');
              }
              res.redirect('/reset-successful');
            });
          })();
        } else {
          req.flash('invalid', 'Password must be at least 5 characters long');
          res.redirect('/reset/' + req.body.identifier);
        }
      } else {
        res.redirect('/reset-link-invalid');
        if (process.env.ENV_NAME === 'live') {
          _alert2.default.send('forgotten', 'No user found for POSTed password reset link: ' + req.body.identifier);
        }
      }
    });
  });

  /**
   * Reset password successful confirmation view
   */
  app.get('/reset-successful', function (req, res) {
    var content = {
      heading: 'Assessment Tool',
      subtitle: 'Ok friend your password has been reset',
      bodyText: 'Why don\'t you login now so we can catch up?',
      imageClass: 'home',
      pageName: 'home'
    };
    res.render('information', {
      meta: _appConfig2.default.app.defaultMeta,
      content: content,
      footerCta: 'Login',
      footerLink: '/login',
      loggedIn: false,
      environmentName: process.env.ENV_NAME
    });
  });
};