'use strict';

import appConfig from '../../config/appConfig.json';
import assessmentService from '../services/assessment';
import connect from 'connect-ensure-login';
import moment from 'moment';

const newQuestionContent = {
  heading: 'Creative Huddle Assessments',
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
module.exports = app => {

  /**
   * Render form for new question
   */
  app.get('/admin/assessments/:id/newquestion',
    connect.ensureLoggedIn(), (req, res) => {
      assessmentService.getAssessmentById(req.params.id).then((assessment) => {
        res.render('admin/question-form', {
          meta: appConfig.app.defaultMeta,
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
  app.post('/admin/assessments/:id/newquestion',
    connect.ensureLoggedIn(), (req, res) => {

      let errors = assessmentService.validateQuestion(req.body.questionText);

      if (errors.length > 0) {
        req.flash('invalid', errors);
        res.redirect(`/admin/assessments/${req.params.id}/newquestion`);
      } else {
        assessmentService.getAssessmentById(req.params.id).then((assessment) => {
          assessmentService.addQuestionToAssessment(assessment,
            req.body.questionText,
            req.body.description).then((assessment) => {
            res.render('admin/assessment-detail', {
              moment: moment,
              meta: appConfig.app.defaultMeta,
              content: newQuestionContent,
              footerCta: 'Back to all assessments',
              footerLink: '/admin/assessments',
              loggedIn: true,
              assessment: assessment,
            });
          });
        });
      }
    });

  /**
   * Render form for edit of question
   */
  app.get('/admin/assessments/:id/editquestion/:qid',
    connect.ensureLoggedIn(), (req, res) => {
      assessmentService.getAssessmentById(req.params.id).then((assessment) => {
        let question = assessmentService.getQuestionByAssessmentAndId(assessment, req.params.qid);
        res.render('admin/question-form', {
          meta: appConfig.app.defaultMeta,
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
  app.post('/admin/assessments/:id/editquestion/:qid',
    connect.ensureLoggedIn(), (req, res) => {

      let errors = assessmentService.validateQuestion(req.body.questionText);

      if (errors.length > 0) {
        req.flash('invalid', errors);
        res.redirect(`/admin/assessments/${req.params.id}/editquestion/${req.params.qid}`);
      } else {
        assessmentService.getAssessmentById(req.params.id).then((assessment) => {
          assessmentService.editQuestionOfAssessment(assessment,
            req.params.qid,
            req.body.questionText,
            req.body.description).then((assessment) => {
            res.render('admin/assessment-detail', {
              moment: moment,
              meta: appConfig.app.defaultMeta,
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
  app.get('/admin/assessments/:id/deletequestion/:qid',
    connect.ensureLoggedIn(), (req, res) => {
      assessmentService.getAssessmentById(req.params.id).then((assessment) => {
        assessmentService.deleteQuestionOfAssessment(assessment, req.params.qid).then((assessment) => {
          res.render('admin/assessment-detail', {
            moment: moment,
            meta: appConfig.app.defaultMeta,
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
