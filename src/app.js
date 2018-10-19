'use strict';

import appConfig from  '../config/appConfig.json';

let PORT_LISTENER = appConfig.app.devPort;
console.log('I am listening to this port: http://localhost:%s', PORT_LISTENER);

import bodyParser from 'body-parser';
import environment from './utils/environment';
import errorHandler from 'errorhandler';
import express from 'express';
import expressSession from 'express-session';
import flash from 'connect-flash';
import http from 'http';
import methodOverride from 'method-override';
import morgan from 'morgan';
import mongoose from 'mongoose';
import path from 'path';
import passport from 'passport';
import serveStatic from 'serve-static';
import stringUtils from './utils/string';
import {User} from './models/user';
import fileUpload from 'express-fileupload';

/**
 * connect to our document store
 */
mongoose.connect(environment.getConnectionString());
stringUtils.initialise();

/**
 * use static authenticate method of model in LocalStrategy
 * and static serialize and deserialize of model for passport session support
 */
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/**
 * function to set up server to allow cross origin resource sharing (CORS)
 * creates headers then either intercepts OPTIONS methods and sends 200 responses or passes through for route handling
 * @param {object} req - the request object
 * @param {object} res - the response object
 * @param {function} next - function to execute the next piece of middleware in our stack
 */
let allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  if ('OPTIONS' === req.method) {
    res.send(200);
  } else {
    next();
  }
};

/**
 * Express application
 * @module app
 */
let app = express();

app.use(allowCrossDomain);
app.set('port', process.env.PORT || PORT_LISTENER);
app.set('views', process.cwd() + '/views');
app.set('view engine', 'pug');
app.use(morgan('dev'));
app.use(methodOverride());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(expressSession({ secret: environment.getSessionSecretKey(), resave: false, saveUninitialized: false }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(fileUpload({ safeFileNames: false }));

/**
 * import our routes and set up our routing
 */
import accessRoutes from './routes/access';
import debugRoutes from './routes/debug';
import answerRoutes from './routes/answer';
import assessmentRoutes from './routes/assessment';
import indexRoutes from './routes/index';
import questionRoutes from './routes/question';
import assessmentApiRoutes from './routes/api/assessments';
import participationApiRoutes from './routes/api/participations';

accessRoutes(app);
debugRoutes(app);
answerRoutes(app);
assessmentRoutes(app);
indexRoutes(app);
questionRoutes(app);
assessmentApiRoutes(app);
participationApiRoutes(app);

/**
 * serve our static content (js, img, css)
 */
app.use(serveStatic(path.join(process.cwd(), appConfig.directories.publicDir)));

app.use(function (req, res, next) {
  console.log('req.body: ' + JSON.stringify(req.body));
  next();
});

/**
 * handle 404 and 500 errors
 */
import errorRoutes from './routes/error';
errorRoutes(app);

if ('development' === app.get('env')) {
  process.env.ENV_NAME = 'development';
  app.use(errorHandler());
}

/**
 * Global variable holding application root
 */
global.appRoot = path.resolve(__dirname);

http.createServer(app).listen(app.get('port'), function () {
  console.log(`Express server listening on port ${app.get('port')}`);
  console.log(`current working directory is: ${process.cwd()}`);
  console.log(`directory of current module is: ${__dirname}`);
});