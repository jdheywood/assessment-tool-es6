'use strict';

import alert from '../utils/alert';
import appConfig from '../../config/appConfig.json';

/**
 * Error routes
 * @module routes/error
 * @param {object} app - the express application instance
 */
module.exports = app => {

  /**
   * 404 errors
   */
  app.use((req, res) => {
    if (req.url !== '/login') {
      let fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      alert.send('error', `404 error encountered for requested url ${fullUrl}`);
    }
    res.status(404);
    res.render('errors/404.pug', {
      meta: appConfig.app.defaultMeta,
      content: appConfig.app.defaultContent,
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
  app.use((error, req, res, next) => {
    let fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    alert.send('error', `500 error encountered for requested url ${fullUrl} ${error}`);
    if ('development' === app.get('env')) {
      console.log(error);
    }
    res.status(500);
    res.render('errors/500.pug', {
      meta: appConfig.app.defaultMeta,
      content: appConfig.app.defaultContent,
      loggedIn: false,
      environmentName: process.env.ENV_NAME,
      context: 'home',
      checkInNumber: 0,
      debugMode: false
    });
  });

};
