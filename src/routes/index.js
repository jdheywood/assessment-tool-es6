'use strict';

import appConfig from '../../config/appConfig.json';
import connect from 'connect-ensure-login';
import environment from '../utils/environment';
import moment from 'moment';

const footerLinks = [
  {
    url: 'http://www.creativehuddle.co.uk/privacy-policy',
    text: 'Privacy policy'
  },
  {
    url: 'http://www.creativehuddle.co.uk/terms-conditions',
    text: 'Terms & conditions'
  },
  {
    url: 'http://www.jdheywood.com',
    text: 'Custom development by jdheywood'
  }
];

/**
 * Index routes
 * @module routes/index
 * @param {object} app - the express application instance
 */
module.exports = app => {

  /**
   * Render the home view
   */
  app.get('/', (req, res) => {
    res.render('home', {
      meta: appConfig.app.defaultMeta,
      content: appConfig.app.defaultContent,
      user: req.user,
      moment: moment,
      loggedIn: false,
      environmentName: process.env.ENV_NAME,
      context: 'home',
      debugMode: environment.getDebugMode(),
      footerLinks: footerLinks
    });
  });

  /**
   * Route for the client SPA to ensure we render the home view that loads the SPA javascript
   * The SPA in turn tales the identifier from the url and async loads the assessment details and starts the participation
   * Nice!
   */
  app.get('/participate/:id', (req, res) => {
    res.render('home', {
      meta: appConfig.app.defaultMeta,
      content: appConfig.app.defaultContent,
      user: req.user,
      moment: moment,
      loggedIn: false,
      environmentName: process.env.ENV_NAME,
      context: 'home',
      debugMode: environment.getDebugMode(),
      footerLinks: footerLinks
    });
  });

  /**
   * Route for the client SPA to ensure we render the home view that loads the SPA javascript
   * The SPA in turn takes the identifier from the url and async loads the participation details for review by the user
   * Nice!
   */
  app.get('/participation/:id', (req, res) => {
    res.render('home', {
      meta: appConfig.app.defaultMeta,
      content: appConfig.app.defaultContent,
      user: req.user,
      moment: moment,
      loggedIn: false,
      environmentName: process.env.ENV_NAME,
      context: 'home',
      debugMode: environment.getDebugMode(),
      footerLinks: footerLinks
    });
  });

  /**
   * Render the admin view, if user logged in
   */
  app.get('/admin',
    connect.ensureLoggedIn(), (req, res) => {
      res.render('admin/admin', {
        user: req.user,
        meta: appConfig.app.defaultMeta,
        content: appConfig.app.defaultContent,
        moment: moment,
        loggedIn: true,
        environmentName: process.env.ENV_NAME,
        context: 'admin',
        debugMode: environment.getDebugMode(),
        canDebug: !!req.user.canDebug,
        footerLinks: { url: 'Sign off', text: '/logout' }
      });
    });

  /**
   * Easter egg, 418
   */
  app.get('/coffee', (req, res) => {
    res.status(418);
    res.render('errors/418', {
      meta: appConfig.app.defaultMeta,
      content: appConfig.app.defaultContent,
      user: req.user,
      moment: moment,
      loggedIn: false,
      environmentName: process.env.ENV_NAME,
      context: 'home',
      debugMode: false,
      footerLinks: { url: 'Sign off', text: '/logout' }
    });
  });

};
