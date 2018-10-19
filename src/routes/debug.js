'use strict';

import alert from '../utils/alert';
import appConfig from '../../config/appConfig.json';
import connect from 'connect-ensure-login';
import email from '../utils/email';

/**
 * Debug routes, to assist during development
 * @module routes/debug
 * @param {object} app - the express application instance
 */
module.exports = app => {

  /**
   * Render the debug view
   */
  app.get('/admin/debug',
    connect.ensureLoggedIn(), (req, res) => {
      if (!!req.user.canDebug) {
        let content = {
          heading: 'Creative Huddle Assessments',
          subtitle: 'Admin',
          bodyText: 'Debug Tools',
          imageClass: 'home',
          pageName: 'home',
          navBack: '/admin'
        };
        res.render('admin/debug', {
          meta: appConfig.app.defaultMeta,
          content: content,
          footerCta: 'Logout',
          footerLink: '/logout',
          loggedIn: true
        });
      }
      else {
        res.redirect('/admin');
      }
    });

  /**
   * Submit of test email functionality
   */
  app.post('/sendtestemail',
    connect.ensureLoggedIn(), (req, res) => {
      email.send('test', req.body.emailTo, null);
      res.redirect('/admin');
    });

  /**
   * Submit of test alert functionality
   */
  app.post('/sendtestalert',
    connect.ensureLoggedIn(), (req, res) => {
      alert.send('test', req.body.message);
      res.redirect('/admin');
    });

  /**
   * Throw an error, to test our error route catches it
   */
  /* jshint unused: vars */
  app.get('/throw', (req, res) => {
    throw new Error('Have an error then');
  });

};
