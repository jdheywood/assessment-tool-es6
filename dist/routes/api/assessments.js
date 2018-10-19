'use strict';

var _assessment = require('../../services/assessment');

var _assessment2 = _interopRequireDefault(_assessment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Assessment API routes, for use by SPA client application
 * @module routes/api/assessment
 * @param {object} app - the express application instance
 */
module.exports = function (app) {

  /**
   * Get all assessments
   */
  app.get('/api/assessments', function (req, res) {
    _assessment2.default.getAllAssessments().then(function (assessments) {
      res.json(assessments);
    });
  });

  /**
   * Get specific assessment by identifier
   */
  app.get('/api/assessments/:id', function (req, res) {
    _assessment2.default.getAssessmentById(req.params.id).then(function (assessment) {
      res.json(assessment);
    });
  });
};