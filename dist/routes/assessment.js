'use strict';

var _appConfig = require('../../config/appConfig.json');

var _appConfig2 = _interopRequireDefault(_appConfig);

var _environment = require('../utils/environment');

var _environment2 = _interopRequireDefault(_environment);

var _connectEnsureLogin = require('connect-ensure-login');

var _connectEnsureLogin2 = _interopRequireDefault(_connectEnsureLogin);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _assessment = require('../services/assessment');

var _assessment2 = _interopRequireDefault(_assessment);

var _cloudinary = require('cloudinary');

var _cloudinary2 = _interopRequireDefault(_cloudinary);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var newAssessmentContent = {
  heading: 'Assessment Tool',
  subtitle: 'Admin',
  bodyText: 'New Assessment',
  imageClass: 'home',
  pageName: 'home',
  navBack: '/admin/assessments'
};

var configure = function configure() {
  var cloudinaryDetails = _environment2.default.getCloudinaryDetails();
  /*jshint camelcase: false */
  _cloudinary2.default.config({
    cloud_name: cloudinaryDetails.cloudName,
    api_key: cloudinaryDetails.apiKey,
    api_secret: cloudinaryDetails.apiSecret
  });
};

/**
 * Assessment routes, for CRUD operations of assessments
 * @module routes/assessment
 * @param {object} app - the express application instance
 */
module.exports = function (app) {

  /**
   * View all assessments (paginated)
   */
  app.get('/admin/assessments', _connectEnsureLogin2.default.ensureLoggedIn(), function (req, res) {
    _assessment2.default.getAllAssessments().then(function (assessments) {
      var paginatedAssessments = _assessment2.default.paginateAllAssessments(assessments);
      var content = {
        heading: 'Assessment Tool',
        subtitle: 'Admin',
        bodyText: 'All Assessments',
        imageClass: 'home',
        pageName: 'home',
        navBack: '/admin'
      };
      res.render('admin/assessment-list', {
        meta: _appConfig2.default.app.defaultMeta,
        content: content,
        footerCta: 'Logout',
        footerLink: '/logout',
        loggedIn: true,
        paginatedAssessments: paginatedAssessments
      });
    });
  });

  /**
   * View specific assessment
   */
  app.get('/admin/assessments/:id', _connectEnsureLogin2.default.ensureLoggedIn(), function (req, res) {
    _assessment2.default.getAssessmentById(req.params.id).then(function (assessment) {
      var content = {
        heading: 'Assessment Tool',
        subtitle: 'Assessment Details',
        bodyText: 'lipsum',
        imageClass: 'home',
        pageName: 'home',
        navBack: '/admin/assessments',
        urlRoot: _environment2.default.getRootUrl()
      };
      res.render('admin/assessment-detail', {
        moment: _moment2.default,
        meta: _appConfig2.default.app.defaultMeta,
        content: content,
        footerCta: 'Back to all assessments',
        footerLink: '/admin/assessments',
        loggedIn: true,
        assessment: assessment
      });
    });
  });

  /**
   * Render form for new assessment
   */
  app.get('/admin/newassessment', _connectEnsureLogin2.default.ensureLoggedIn(), function (req, res) {
    res.render('admin/assessment-form', {
      meta: _appConfig2.default.app.defaultMeta,
      content: newAssessmentContent,
      footerCta: 'Back to all assessments',
      footerLink: '/admin/assessments',
      loggedIn: true,
      formAction: 'new',
      errors: req.flash('invalid')
    });
  });

  /**
   * Create assessment, form submit
   */
  app.post('/admin/newassessment', _connectEnsureLogin2.default.ensureLoggedIn(), function (req, res) {

    var errors = _assessment2.default.validateAssessment(null, req.body.name, req.body.description, req.body.callToAction, !!req.files.assessmentImage ? req.files.assessmentImage.name : '', req.body.resultCallToActionUrl);

    if (errors.length > 0) {
      req.flash('invalid', errors);
      res.redirect('/admin/newassessment/');
    } else {
      if (!!req.files.assessmentImage) {
        (function () {
          var assessmentImage = req.files.assessmentImage;
          assessmentImage.mv(global.appRoot + '/tmp/' + assessmentImage.name, function (err) {
            if (err) {
              return res.status(500).send(err);
            } else {
              configure();
              _cloudinary2.default.uploader.upload(global.appRoot + '/tmp/' + assessmentImage.name, function (result) {
                _assessment2.default.createNewAssessment(req.body.name, req.body.description, req.body.callToAction, result.url, req.body.resultCallToActionHeading, req.body.resultCallToActionCopy, req.body.resultCallToActionButtonText, req.body.resultCallToActionUrl, req.user.id).then(function (assessment) {
                  res.redirect('/admin/assessments/' + assessment._id);
                });
              });
            }
          });
        })();
      }
    }
  });

  /**
   * Render form for edit of assessment
   */
  app.get('/admin/editassessment/:id', _connectEnsureLogin2.default.ensureLoggedIn(), function (req, res) {
    _assessment2.default.getAssessmentById(req.params.id).then(function (assessment) {
      res.render('admin/assessment-form', {
        meta: _appConfig2.default.app.defaultMeta,
        content: newAssessmentContent,
        footerCta: 'Back to all assessments',
        footerLink: '/admin/assessments',
        loggedIn: true,
        formAction: 'edit',
        assessment: assessment,
        errors: req.flash('invalid')
      });
    });
  });

  /**
   * Edit assessment, form submit
   */
  app.post('/admin/editassessment/:id', _connectEnsureLogin2.default.ensureLoggedIn(), function (req, res) {
    _assessment2.default.getAssessmentById(req.params.id).then(function (assessment) {

      var errors = _assessment2.default.validateAssessment(assessment, req.body.name, req.body.description, req.body.callToAction, !!req.files.assessmentImage ? req.files.assessmentImage.name : '', req.body.resultCallToActionUrl);

      if (errors.length > 0) {
        req.flash('invalid', errors);
        res.redirect('/admin/editassessment/' + req.params.id);
      } else {
        if (!!req.files.assessmentImage) {
          (function () {
            var assessmentImage = req.files.assessmentImage;
            assessmentImage.mv(global.appRoot + '/tmp/' + assessmentImage.name, function (err) {
              if (err) {
                return res.status(500).send(err);
              } else {
                configure();
                _cloudinary2.default.uploader.upload(global.appRoot + '/tmp/' + assessmentImage.name, function (result) {
                  _assessment2.default.editAssessment(assessment, req.body.name, req.body.description, req.body.callToAction, result.url, req.body.resultCallToActionHeading, req.body.resultCallToActionCopy, req.body.resultCallToActionButtonText, req.body.resultCallToActionUrl, req.user.id).then(function (updatedAssessment) {
                    res.redirect('/admin/assessments/' + updatedAssessment._id);
                  });
                });
              }
            });
          })();
        } else {
          _assessment2.default.editAssessment(assessment, req.body.name, req.body.description, req.body.callToAction, null, req.body.resultCallToActionHeading, req.body.resultCallToActionCopy, req.body.resultCallToActionButtonText, req.body.resultCallToActionUrl, req.user.id).then(function (updatedAssessment) {
            res.redirect('/admin/assessments/' + updatedAssessment._id);
          });
        }
      }
    });
  });

  /**
   * Delete assessment
   */
  app.get('/admin/deleteassessment/:id', _connectEnsureLogin2.default.ensureLoggedIn(), function (req, res) {
    _assessment2.default.deleteAssessment(req.params.id).then(function () {
      res.redirect('/admin/assessments/');
    });
  });
};