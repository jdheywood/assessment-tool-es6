'use strict';

import assessmentService from '../../services/assessment';

/**
 * Assessment API routes, for use by SPA client application
 * @module routes/api/assessment
 * @param {object} app - the express application instance
 */
module.exports = app => {

  /**
   * Get all assessments
   */
  app.get('/api/assessments', (req, res) => {
      assessmentService.getAllAssessments().then((assessments) => {
        res.json(assessments);
      });
    });

  /**
   * Get specific assessment by identifier
   */
  app.get('/api/assessments/:id', (req, res) => {
      assessmentService.getAssessmentById(req.params.id).then((assessment) => {
        res.json(assessment);
      });
    });

};
