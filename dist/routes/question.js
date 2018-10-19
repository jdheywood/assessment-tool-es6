'use strict';

var _appConfig = require('../../config/appConfig.json');

var _appConfig2 = _interopRequireDefault(_appConfig);

var _assessment = require('../services/assessment');

var _assessment2 = _interopRequireDefault(_assessment);

var _connectEnsureLogin = require('connect-ensure-login');

var _connectEnsureLogin2 = _interopRequireDefault(_connectEnsureLogin);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var newQuestionContent = {
  heading: 'Assessment Tool',
  subtitle: 'Admin',
  bodyText: 'New Assessment Question',
  imageClass: 'home',
  pageName: 'home',
  navBack: '/admin/assessments'
};

/**
 * Question routes, for CRUD operations of questions within context of an assessment
 * @module routes/question
 * @param {object} app - the express application instance
 */
module.exports = function (app) {

  /**
   * Render form for new question
   */
  app.get('/admin/assessments/:id/newquestion', _connectEnsureLogin2.default.ensureLoggedIn(), function (req, res) {
    _assessment2.default.getAssessmentById(req.params.id).then(function (assessment) {
      res.render('admin/question-form', {
        meta: _appConfig2.default.app.defaultMeta,
        content: newQuestionContent,
        footerCta: 'Back to all assessments',
        footerLink: '/admin/assessments',
        loggedIn: true,
        formAction: 'new',
        assessment: assessment,
        errors: req.flash('invalid')
      });
    });
  });

  /**
   * Create question, form submit
   */
  app.post('/admin/assessments/:id/newquestion', _connectEnsureLogin2.default.ensureLoggedIn(), function (req, res) {

    var errors = _assessment2.default.validateQuestion(req.body.questionText);

    if (errors.length > 0) {
      req.flash('invalid', errors);
      res.redirect('/admin/assessments/' + req.params.id + '/newquestion');
    } else {
      _assessment2.default.getAssessmentById(req.params.id).then(function (assessment) {
        _assessment2.default.addQuestionToAssessment(assessment, req.body.questionText, req.body.description).then(function (assessment) {
          res.render('admin/assessment-detail', {
            moment: _moment2.default,
            meta: _appConfig2.default.app.defaultMeta,
            content: newQuestionContent,
            footerCta: 'Back to all assessments',
            footerLink: '/admin/assessments',
            loggedIn: true,
            assessment: assessment
          });
        });
      });
    }
  });

  /**
   * Render form for edit of question
   */
  app.get('/admin/assessments/:id/editquestion/:qid', _connectEnsureLogin2.default.ensureLoggedIn(), function (req, res) {
    _assessment2.default.getAssessmentById(req.params.id).then(function (assessment) {
      var question = _assessment2.default.getQuestionByAssessmentAndId(assessment, req.params.qid);
      res.render('admin/question-form', {
        meta: _appConfig2.default.app.defaultMeta,
        content: newQuestionContent,
        footerCta: 'Back to all assessments',
        footerLink: '/admin/assessments',
        loggedIn: true,
        formAction: 'edit',
        assessment: assessment,
        question: question,
        errors: req.flash('invalid')
      });
    });
  });

  /**
   * Edit question, form submit
   */
  app.post('/admin/assessments/:id/editquestion/:qid', _connectEnsureLogin2.default.ensureLoggedIn(), function (req, res) {

    var errors = _assessment2.default.validateQuestion(req.body.questionText);

    if (errors.length > 0) {
      req.flash('invalid', errors);
      res.redirect('/admin/assessments/' + req.params.id + '/editquestion/' + req.params.qid);
    } else {
      _assessment2.default.getAssessmentById(req.params.id).then(function (assessment) {
        _assessment2.default.editQuestionOfAssessment(assessment, req.params.qid, req.body.questionText, req.body.description).then(function (assessment) {
          res.render('admin/assessment-detail', {
            moment: _moment2.default,
            meta: _appConfig2.default.app.defaultMeta,
            content: newQuestionContent,
            footerCta: 'Back to all assessments',
            footerLink: '/admin/assessments',
            loggedIn: true,
            assessment: assessment
          });
        });
      });
    }
  });

  /**
   * Delete question
   */
  app.get('/admin/assessments/:id/deletequestion/:qid', _connectEnsureLogin2.default.ensureLoggedIn(), function (req, res) {
    _assessment2.default.getAssessmentById(req.params.id).then(function (assessment) {
      _assessment2.default.deleteQuestionOfAssessment(assessment, req.params.qid).then(function (assessment) {
        res.render('admin/assessment-detail', {
          moment: _moment2.default,
          meta: _appConfig2.default.app.defaultMeta,
          content: newQuestionContent,
          footerCta: 'Back to all assessments',
          footerLink: '/admin/assessments',
          loggedIn: true,
          assessment: assessment
        });
      });
    });
  });
};