'use strict';

import appConfig from '../../config/appConfig.json';
import environment from '../utils/environment';
import assessmentService from '../services/assessment';
import connect from 'connect-ensure-login';
import moment from 'moment';
import cloudinary from 'cloudinary';

const newAnswerContent = {
  heading: 'Creative Huddle Assessments',
  subtitle: 'Admin',
  bodyText: 'New Question Answer',
  imageClass: 'home',
  pageName: 'home',
  navBack: '/admin/assessments'
};

const configure = () => {
  let cloudinaryDetails = environment.getCloudinaryDetails();
  /*jshint camelcase: false */
  cloudinary.config({
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
module.exports = app => {

  /**
   * Render form for new answer
   */
  app.get('/admin/assessments/:id/questions/:qid/newanswer',
    connect.ensureLoggedIn(), (req, res) => {
      assessmentService.getAssessmentById(req.params.id).then((assessment) => {
        let question = assessmentService.getQuestionByAssessmentAndId(assessment, req.params.qid);
        res.render('admin/answer-form', {
          meta: appConfig.app.defaultMeta,
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
  app.post('/admin/assessments/:id/questions/:qid/newanswer',
    connect.ensureLoggedIn(), (req, res) => {

      let errors = assessmentService.validateAnswer(null,
        req.body.answerText,
        req.body.answerDescription,
        !!req.files.answerImage ? req.files.answerImage.name : ''
      );

      if (errors.length > 0) {
        req.flash('invalid', errors);
        res.redirect(`/admin/assessments/${req.params.id}/questions/${req.params.qid}/newanswer`);
      } else {
        if (!!req.files.answerImage) {
          let answerImage = req.files.answerImage;
          answerImage.mv(`${global.appRoot}/tmp/${answerImage.name}`, (err) => {
            if (err) {
              return res.status(500).send(err);
            } else {
              configure();
              cloudinary.uploader.upload(
                `${global.appRoot}/tmp/${answerImage.name}`, (result) => {
                  assessmentService.getAssessmentById(req.params.id).then((assessment) => {
                    assessmentService.addAnswerToQuestion(assessment,
                      req.params.qid,
                      req.body.answerText,
                      req.body.answerDescription,
                      result.url).then((assessment) => {
                      res.render('admin/assessment-detail', {
                        moment: moment,
                        meta: appConfig.app.defaultMeta,
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
        }
      }
    });

  /**
   * Render form for edit of answer
   */
  app.get('/admin/assessments/:id/questions/:qid/editanswer/:aid',
    connect.ensureLoggedIn(), (req, res) => {
      assessmentService.getAssessmentById(req.params.id).then((assessment) => {
        let result = assessmentService.getAnswerAndParentQuestionByAssessmentAndQuestionIdAndId(assessment, req.params.qid, req.params.aid);
        res.render('admin/answer-form', {
          meta: appConfig.app.defaultMeta,
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
  app.post('/admin/assessments/:id/questions/:qid/editanswer/:aid',
    connect.ensureLoggedIn(), (req, res) => {
      assessmentService.getAssessmentById(req.params.id).then((assessment) => {
        let result = assessmentService.getAnswerAndParentQuestionByAssessmentAndQuestionIdAndId(assessment, req.params.qid, req.params.aid);

        let errors = assessmentService.validateAnswer(result[1],
          req.body.answerText,
          req.body.answerDescription,
          !!req.files.answerImage ? req.files.answerImage.name : ''
        );

        if (errors.length > 0) {
          req.flash('invalid', errors);
          res.redirect(`/admin/assessments/${req.params.id}/questions/${req.params.qid}/editanswer/${req.params.aid}`);
        } else {

          let viewBag = {
            moment: moment,
            meta: appConfig.app.defaultMeta,
            content: newAnswerContent,
            footerCta: 'Back to all assessments',
            footerLink: '/admin/assessments',
            loggedIn: true,
            assessment: assessment
          };

          if (!!req.files.answerImage) {
            let answerImage = req.files.answerImage;
            answerImage.mv(`${global.appRoot}/tmp/${answerImage.name}`, (err) => {
              if (err) {
                return res.status(500).send(err);
              } else {
                configure();
                cloudinary.uploader.upload(
                  `${global.appRoot}/tmp/${answerImage.name}`, (result) => {
                    assessmentService.editAnswerOfQuestionOfAssessment(assessment,
                      req.params.qid,
                      req.params.aid,
                      req.body.answerText,
                      req.body.answerDescription,
                      result.url).then((updatedAssessment) => {
                      viewBag.assessment = updatedAssessment;
                      res.render('admin/assessment-detail', viewBag);
                    });
                  });
              }
            });
          } else {
            assessmentService.editAnswerOfQuestionOfAssessment(assessment,
              req.params.qid,
              req.params.aid,
              req.body.answerText,
              req.body.answerDescription,
              null).then((updatedAssessment) => {
              viewBag.assessment = updatedAssessment;
              res.render('admin/assessment-detail', viewBag);
            });
          }
        }
      });
    });

  /**
   * Delete answer
   */
  app.get('/admin/assessments/:id/questions/:qid/deleteanswer/:aid',
    connect.ensureLoggedIn(), (req, res) => {
      assessmentService.getAssessmentById(req.params.id).then((assessment) => {
        assessmentService.deleteAnswerOfQuestionOfAssessment(assessment, req.params.qid, req.params.aid).then((assessment) => {
          res.render('admin/assessment-detail', {
            moment: moment,
            meta: appConfig.app.defaultMeta,
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
