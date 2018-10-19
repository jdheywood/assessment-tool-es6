'use strict';

import alert from '../utils/alert';
import appConfig from '../../config/appConfig.json';
import email from '../utils/email';
import passport from 'passport';
import {User} from '../models/user';
import userService from '../services/user';
import uuid from 'node-uuid';
import validator from 'validator';

const content = {
  heading: 'Creative Huddle Assessments',
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
module.exports = app => {

  /**
   * Login form render
   */
  app.get('/login', (req, res) => {
    res.render('access/login', {
      meta: appConfig.app.defaultMeta,
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
  app.post('/login',
    passport.authenticate('local', {failureRedirect: '/login'}), (req, res) => {
      userService.recordVisit(req.user).then(function () {
        if (process.env.ENV_NAME === 'live') {
          alert.send('login', req.user.username + ' logged in');
        }
        res.redirect('/admin/assessments');
      });
    });

  /**
   * Logout route, destroys session, logs out user and redirects to login page
   */
  app.get('/logout', (req, res) => {
    req.session.destroy((error) => {
      console.log(error);
    });
    req.logOut();
    res.redirect('/login');
  });

  /**
   * Register form render
   */
  app.get('/register', (req, res) => {
    res.render('access/register', {
      meta: appConfig.app.defaultMeta,
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
  app.post('/register', (req, res) => {
    let usernameValid = validator.isEmail(req.body.username);
    let passwordValid = validator.isLength(req.body.password, {min: 5, max: undefined});
    let firstNameValid = validator.isLength(req.body.firstname, {min: 2, max: undefined});

    if (!usernameValid || !passwordValid || !firstNameValid) {
      req.flash('invalid', 'One or more fields are invalid');
      res.redirect('/register');
    }

    User.register(new User({
      username: req.body.username,
      displayName: req.body.firstname
    }), req.body.password, (err, user) => {
      if (err) {
        return res.render('access/register', {
          user: user,
          meta: appConfig.app.defaultMeta,
          content: content,
          message: 'One or more fields are invalid'
        });
      }
      passport.authenticate('local')(req, res, () => {
        userService.recordVisit(user).then(() => {
          email.send('registration', user.username, null);
          if (process.env.ENV_NAME === 'live') {
            email.send('newRegistrationAlert', appConfig.app.newRegistrationAlertsAddress, user.username);
            alert.send('registration', `New registration with Assessment Tool by ${user.username} (${user.displayName})`);
          }
          res.redirect('/');
        });
      });
    });
  });

  /**
   * Forgotten password form render
   */
  app.get('/forgotten', (req, res) => {
    res.render('access/forgotten', {
      meta: appConfig.app.defaultMeta,
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
  app.post('/forgotten', (req, res) => {
    userService.getUserByUsername(req.body.username).then((user) => {
      if (!!user && user.length === 1) {
        let theUser = user[0];
        theUser.passwordResetId = uuid.v4();
        userService.saveUser(theUser).then(() => {
          let resetUrl = email.getPasswordResetLink(theUser.passwordResetId);
          email.send('forgotten', theUser.username, resetUrl);
          if (process.env.ENV_NAME === 'live') {
            alert.send('forgotten', `${theUser.username} has requested a password reset link`);
          }
          res.redirect('/reset-link-sent');
        });
      } else {
        res.redirect('/forgotten');
      }
    });
  });

  /**
   * Reset link sent confirmation view
   */
  app.get('/reset-link-sent', (req, res) => {
    let content = {
      heading: 'Creative Huddle Assessments',
      subtitle: 'I\'ve just sent you an email.',
      bodyText: 'Please follow the link to reset your password so we can catch up, see you soon friend.',
      imageClass: 'home',
      pageName: 'home'
    };
    res.render('information', {
      meta: appConfig.app.defaultMeta,
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
  app.get('/reset/:resetId', (req, res) => {
    userService.getUserByPasswordResetId(req.params.resetId).then((user) => {
      if (!!user && user.length === 1) {
        res.render('access/reset-password', {
          meta: appConfig.app.defaultMeta,
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
          alert.send('forgotten', `No user found for password reset link: ${req.params.resetId}`);
        }
      }
    });
  });

  /**
   * Reset link invalid view
   */
  app.get('/reset-link-invalid', (req, res) => {
    let content = {
      heading: 'Creative Huddle Assessments',
      subtitle: 'I\'m sorry I can\'t let you do that friend',
      bodyText: 'The link you have used is no longer valid, please check your email or request another link using the forgotten password page.',
      imageClass: 'home',
      pageName: 'home'
    };
    res.render('information', {
      meta: appConfig.app.defaultMeta,
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
  app.post('/reset-password', (req, res) => {
    userService.getUserByPasswordResetId(req.body.identifier).then((user) => {
      if (!!user && user.length === 1) {
        let passwordValid = validator.isLength(req.body.password, {min: 5, max: undefined});
        if (!!passwordValid) {
          let theUser = user[0];
          theUser.setPassword(req.body.password, () => {
            theUser.passwordResetId = null;
            theUser.save();
            if (process.env.ENV_NAME === 'live') {
              alert.send('forgotten', `${theUser.username} has successfully reset their password`);
            }
            res.redirect('/reset-successful');
          });
        } else {
          req.flash('invalid', 'Password must be at least 5 characters long');
          res.redirect('/reset/' + req.body.identifier);
        }
      } else {
        res.redirect('/reset-link-invalid');
        if (process.env.ENV_NAME === 'live') {
          alert.send('forgotten', `No user found for POSTed password reset link: ${req.body.identifier}`);
        }
      }
    });
  });

  /**
   * Reset password successful confirmation view
   */
  app.get('/reset-successful', (req, res) => {
    let content = {
      heading: 'Creative Huddle Assessments',
      subtitle: 'Ok friend your password has been reset',
      bodyText: 'Why don\'t you login now so we can catch up?',
      imageClass: 'home',
      pageName: 'home'
    };
    res.render('information', {
      meta: appConfig.app.defaultMeta,
      content: content,
      footerCta: 'Login',
      footerLink: '/login',
      loggedIn: false,
      environmentName: process.env.ENV_NAME
    });
  });

};
