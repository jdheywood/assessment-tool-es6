'use strict';

import appConfig from '../../../config/appConfig.json';
import participationService from '../../services/participation';
import assessmentService from '../../services/assessment';
import alert from '../../utils/alert';
import sheet from '../../utils/sheet';
import email from '../../utils/email';

/**
 * Participation API routes, for use by SPA client application
 * @module routes/api/participation
 * @param {object} app - the express application instance
 */
module.exports = app => {

  /**
   * Create new participation object
   */
  app.post('/api/participations', (req, res) => {
    participationService.createNewParticipation(req.body.email, req.body.assessmentId, req.body.assessmentName).then((participation) => {
      res.json(participation);
    });
  });

  /**
   * Answer a question, update the current participation object
   */
  app.put('/api/participations/:id', (req, res) => {
    participationService.getParticipationById(req.params.id).then((participation) => {
      participationService.answerQuestion(participation,
        req.body.questionId, req.body.questionText,
        req.body.answerId, req.body.answerText,
        req.body.resultDescription, req.body.resultImage,
        req.body.completed).then((updatedParticipation) => {
          if (req.body.completed) {
            let link = participationService.getParticipationPermaLink(updatedParticipation._id);
            alert.send('participation', `Assessment completed, email: ${updatedParticipation.email} results: ${link}`);
            sheet.addParticipation(updatedParticipation.email, updatedParticipation.assessmentName, link);
            if (!!appConfig.app.sendEmailsToAdminsOnCompletedAssessment) {
              email.send('completed', appConfig.app.completedAssessmentAddress, updatedParticipation.assessmentName, link);
            }
            assessmentService.getAssessmentById(updatedParticipation.assessmentId).then((assessment) => {
              let thanksDetail = '';
              if (!!appConfig.app.completedAssessmentHtmlEmails) {
                thanksDetail = participationService.getHtmlResults(updatedParticipation, assessment);
              } else {
                thanksDetail = participationService.getPlainTextResults(updatedParticipation, assessment);
              }
              email.send('thanks', updatedParticipation.email, thanksDetail, link);
            });
          }
        res.json(updatedParticipation);
      });
    });
  });

  /**
   * Get a previous participation for review of results
   */
  app.get('/api/participations/:id', (req, res) => {
    participationService.getParticipationById(req.params.id).then((participation) => {
      res.json(participation);
    });
  });

};
