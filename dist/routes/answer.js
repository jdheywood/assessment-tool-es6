'use strict';

var _appConfig = require('../../config/appConfig.json');

var _appConfig2 = _interopRequireDefault(_appConfig);

var _environment = require('../utils/environment');

var _environment2 = _interopRequireDefault(_environment);

var _assessment = require('../services/assessment');

var _assessment2 = _interopRequireDefault(_assessment);

var _connectEnsureLogin = require('connect-ensure-login');

var _connectEnsureLogin2 = _interopRequireDefault(_connectEnsureLogin);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _cloudinary = require('cloudinary');

var _cloudinary2 = _interopRequireDefault(_cloudinary);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var newAnswerContent = {
  heading: 'Assessment Tool',
  subtitle: 'Admin',
  bodyText: 'New Question Answer',
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
 * Answer routes, for CRUD operations of answers within the context of a question (and assessment)
 * @module routes/answer
 * @param {object} app - the express application instance
 */
module.exports = function (app) {

  /**
   * Render form for new answer
   */
  app.get('/admin/assessments/:id/questions/:qid/newanswer', _connectEnsureLogin2.default.ensureLoggedIn(), function (req, res) {
    _assessment2.default.getAssessmentById(req.params.id).then(function (assessment) {
      var question = _assessment2.default.getQuestionByAssessmentAndId(assessment, req.params.qid);
      res.render('admin/answer-form', {
        meta: _appConfig2.default.app.defaultMeta,
        content: newAnswerContent,
        footerCta: 'Back to all assessments',
        footerLink: '/admin/assessments',
        loggedIn: true,
        formAction: 'new',
        assessment: assessment,
        question: question,
        errors: req.flash('invalid')
      });
    });
  });

  /**
   * Create new answer, form submit
   */
  app.post('/admin/assessments/:id/questions/:qid/newanswer', _connectEnsureLogin2.default.ensureLoggedIn(), function (req, res) {

    var errors = _assessment2.default.validateAnswer(null, req.body.answerText, req.body.answerDescription, !!req.files.answerImage ? req.files.answerImage.name : '');

    if (errors.length > 0) {
      req.flash('invalid', errors);
      res.redirect('/admin/assessments/' + req.params.id + '/questions/' + req.params.qid + '/newanswer');
    } else {
      if (!!req.files.answerImage) {
        (function () {
          var answerImage = req.files.answerImage;
          answerImage.mv(global.appRoot + '/tmp/' + answerImage.name, function (err) {
            if (err) {
              return res.status(500).send(err);
            } else {
              configure();
              _cloudinary2.default.uploader.upload(global.appRoot + '/tmp/' + answerImage.name, function (result) {
                _assessment2.default.getAssessmentById(req.params.id).then(function (assessment) {
                  _assessment2.default.addAnswerToQuestion(assessment, req.params.qid, req.body.answerText, req.body.answerDescription, result.url).then(function (assessment) {
                    res.render('admin/assessment-detail', {
                      moment: _moment2.default,
                      meta: _appConfig2.default.app.defaultMeta,
                      content: newAnswerContent,
                      footerCta: 'Back to all assessments',
                      footerLink: '/admin/assessments',
                      loggedIn: true,
                      assessment: assessment
                    });
                  });
                });
              });
            }
          });
        })();
      }
    }
  });

  /**
   * Render form for edit of answer
   */
  app.get('/admin/assessments/:id/questions/:qid/editanswer/:aid', _connectEnsureLogin2.default.ensureLoggedIn(), function (req, res) {
    _assessment2.default.getAssessmentById(req.params.id).then(function (assessment) {
      var result = _assessment2.default.getAnswerAndParentQuestionByAssessmentAndQuestionIdAndId(assessment, req.params.qid, req.params.aid);
      res.render('admin/answer-form', {
        meta: _appConfig2.default.app.defaultMeta,
        content: newAnswerContent,
        footerCta: 'Back to all assessments',
        footerLink: '/admin/assessments',
        loggedIn: true,
        formAction: 'edit',
        assessment: assessment,
        question: result[0],
        answer: result[1],
        errors: req.flash('invalid')
      });
    });
  });

  /**
   * Update answer, form submit
   */
  app.post('/admin/assessments/:id/questions/:qid/editanswer/:aid', _connectEnsureLogin2.default.ensureLoggedIn(), function (req, res) {
    _assessment2.default.getAssessmentById(req.params.id).then(function (assessment) {
      var result = _assessment2.default.getAnswerAndParentQuestionByAssessmentAndQuestionIdAndId(assessment, req.params.qid, req.params.aid);

      var errors = _assessment2.default.validateAnswer(result[1], req.body.answerText, req.body.answerDescription, !!req.files.answerImage ? req.files.answerImage.name : '');

      if (errors.length > 0) {
        req.flash('invalid', errors);
        res.redirect('/admin/assessments/' + req.params.id + '/questions/' + req.params.qid + '/editanswer/' + req.params.aid);
      } else {
        (function () {

          var viewBag = {
            moment: _moment2.default,
            meta: _appConfig2.default.app.defaultMeta,
            content: newAnswerContent,
            footerCta: 'Back to all assessments',
            footerLink: '/admin/assessments',
            loggedIn: true,
            assessment: assessment
          };

          if (!!req.files.answerImage) {
            (function () {
              var answerImage = req.files.answerImage;
              answerImage.mv(global.appRoot + '/tmp/' + answerImage.name, function (err) {
                if (err) {
                  return res.status(500).send(err);
                } else {
                  configure();
                  _cloudinary2.default.uploader.upload(global.appRoot + '/tmp/' + answerImage.name, function (result) {
                    _assessment2.default.editAnswerOfQuestionOfAssessment(assessment, req.params.qid, req.params.aid, req.body.answerText, req.body.answerDescription, result.url).then(function (updatedAssessment) {
                      viewBag.assessment = updatedAssessment;
                      res.render('admin/assessment-detail', viewBag);
                    });
                  });
                }
              });
            })();
          } else {
            _assessment2.default.editAnswerOfQuestionOfAssessment(assessment, req.params.qid, req.params.aid, req.body.answerText, req.body.answerDescription, null).then(function (updatedAssessment) {
              viewBag.assessment = updatedAssessment;
              res.render('admin/assessment-detail', viewBag);
            });
          }
        })();
      }
    });
  });

  /**
   * Delete answer
   */
  app.get('/admin/assessments/:id/questions/:qid/deleteanswer/:aid', _connectEnsureLogin2.default.ensureLoggedIn(), function (req, res) {
    _assessment2.default.getAssessmentById(req.params.id).then(function (assessment) {
      _assessment2.default.deleteAnswerOfQuestionOfAssessment(assessment, req.params.qid, req.params.aid).then(function (assessment) {
        res.render('admin/assessment-detail', {
          moment: _moment2.default,
          meta: _appConfig2.default.app.defaultMeta,
          content: newAnswerContent,
          footerCta: 'Back to all assessments',
          footerLink: '/admin/assessments',
          loggedIn: true,
          assessment: assessment
        });
      });
    });
  });
};