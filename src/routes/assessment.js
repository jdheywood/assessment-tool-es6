'use strict';

import appConfig from '../../config/appConfig.json';
import environment from '../utils/environment';
import connect from 'connect-ensure-login';
import moment from 'moment';
import assessmentService from '../services/assessment';
import cloudinary from 'cloudinary';

const newAssessmentContent = {
  heading: 'Creative Huddle Assessments',
  subtitle: 'Admin',
  bodyText: 'New Assessment',
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
 * Assessment routes, for CRUD operations of assessments
 * @module routes/assessment
 * @param {object} app - the express application instance
 */
module.exports = app => {

  /**
   * View all assessments (paginated)
   */
  app.get('/admin/assessments',
    connect.ensureLoggedIn(), (req, res) => {
      assessmentService.getAllAssessments().then((assessments) => {
        let paginatedAssessments = assessmentService.paginateAllAssessments(assessments);
        let content = {
          heading: 'Assessment Tool',
          subtitle: 'Admin',
          bodyText: 'All Assessments',
          imageClass: 'home',
          pageName: 'home',
          navBack: '/admin'
        };
        res.render('admin/assessment-list', {
          meta: appConfig.app.defaultMeta,
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
  app.get('/admin/assessments/:id',
    connect.ensureLoggedIn(), (req, res) => {
      assessmentService.getAssessmentById(req.params.id).then((assessment) => {
        let content = {
          heading: 'Assessment Tool',
          subtitle: 'Assessment Details',
          bodyText: 'lipsum',
          imageClass: 'home',
          pageName: 'home',
          navBack: '/admin/assessments',
          urlRoot: environment.getRootUrl()
        };
        res.render('admin/assessment-detail', {
          moment: moment,
          meta: appConfig.app.defaultMeta,
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
  app.get('/admin/newassessment',
    connect.ensureLoggedIn(), (req, res) => {
      res.render('admin/assessment-form', {
        meta: appConfig.app.defaultMeta,
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
  app.post('/admin/newassessment',
    connect.ensureLoggedIn(), (req, res) => {

      let errors = assessmentService.validateAssessment(null,
        req.body.name,
        req.body.description,
        req.body.callToAction,
        !!req.files.assessmentImage ? req.files.assessmentImage.name : '',
        req.body.resultCallToActionUrl);

      if (errors.length > 0) {
        req.flash('invalid', errors);
        res.redirect('/admin/newassessment/');
      } else {
        if (!!req.files.assessmentImage) {
          let assessmentImage = req.files.assessmentImage;
          assessmentImage.mv(`${global.appRoot}/tmp/${assessmentImage.name}`, (err) => {
            if (err) {
              return res.status(500).send(err);
            } else {
              configure();
              cloudinary.uploader.upload(
                `${global.appRoot}/tmp/${assessmentImage.name}`, (result) => {
                  assessmentService.createNewAssessment(req.body.name,
                    req.body.description,
                    req.body.callToAction,
                    result.url,
                    req.body.resultCallToActionHeading,
                    req.body.resultCallToActionCopy,
                    req.body.resultCallToActionButtonText,
                    req.body.resultCallToActionUrl,
                    req.user.id).then((assessment) => {
                    res.redirect('/admin/assessments/' + assessment._id);
                  });
                });
            }
          });
        }
      }
    });

  /**
   * Render form for edit of assessment
   */
  app.get('/admin/editassessment/:id',
    connect.ensureLoggedIn(), (req, res) => {
      assessmentService.getAssessmentById(req.params.id).then((assessment) => {
        res.render('admin/assessment-form', {
          meta: appConfig.app.defaultMeta,
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
  app.post('/admin/editassessment/:id',
    connect.ensureLoggedIn(), (req, res) => {
      assessmentService.getAssessmentById(req.params.id).then((assessment) => {

        let errors = assessmentService.validateAssessment(assessment,
          req.body.name,
          req.body.description,
          req.body.callToAction,
          !!req.files.assessmentImage ? req.files.assessmentImage.name: '',
          req.body.resultCallToActionUrl);

        if (errors.length > 0) {
          req.flash('invalid', errors);
          res.redirect(`/admin/editassessment/${req.params.id}`);
        } else {
          if (!!req.files.assessmentImage) {
            let assessmentImage = req.files.assessmentImage;
            assessmentImage.mv(`${global.appRoot}/tmp/${assessmentImage.name}`, (err) => {
              if (err) {
                return res.status(500).send(err);
              } else {
                configure();
                cloudinary.uploader.upload(
                  `${global.appRoot}/tmp/${assessmentImage.name}`, (result) => {
                    assessmentService.editAssessment(assessment,
                      req.body.name,
                      req.body.description,
                      req.body.callToAction,
                      result.url,
                      req.body.resultCallToActionHeading,
                      req.body.resultCallToActionCopy,
                      req.body.resultCallToActionButtonText,
                      req.body.resultCallToActionUrl,
                      req.user.id).then((updatedAssessment) => {
                      res.redirect('/admin/assessments/' + updatedAssessment._id);
                    });
                  });
              }
            });
          } else {
            assessmentService.editAssessment(assessment,
              req.body.name,
              req.body.description,
              req.body.callToAction,
              null,
              req.body.resultCallToActionHeading,
              req.body.resultCallToActionCopy,
              req.body.resultCallToActionButtonText,
              req.body.resultCallToActionUrl,
              req.user.id).then((updatedAssessment) => {
              res.redirect('/admin/assessments/' + updatedAssessment._id);
            });
          }
        }
      });
    });

  /**
   * Delete assessment
   */
  app.get('/admin/deleteassessment/:id',
    connect.ensureLoggedIn(), (req, res) => {
      assessmentService.deleteAssessment(req.params.id).then(() => {
        res.redirect('/admin/assessments/');
      });
    });

};
