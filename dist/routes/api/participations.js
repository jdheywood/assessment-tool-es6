'use strict';

var _appConfig = require('../../../config/appConfig.json');

var _appConfig2 = _interopRequireDefault(_appConfig);

var _participation = require('../../services/participation');

var _participation2 = _interopRequireDefault(_participation);

var _assessment = require('../../services/assessment');

var _assessment2 = _interopRequireDefault(_assessment);

var _alert = require('../../utils/alert');

var _alert2 = _interopRequireDefault(_alert);

var _sheet = require('../../utils/sheet');

var _sheet2 = _interopRequireDefault(_sheet);

var _email = require('../../utils/email');

var _email2 = _interopRequireDefault(_email);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Participation API routes, for use by SPA client application
 * @module routes/api/participation
 * @param {object} app - the express application instance
 */
module.exports = function (app) {

  /**
   * Create new participation object
   */
  app.post('/api/participations', function (req, res) {
    _participation2.default.createNewParticipation(req.body.email, req.body.assessmentId, req.body.assessmentName).then(function (participation) {
      res.json(participation);
    });
  });

  /**
   * Answer a question, update the current participation object
   */
  app.put('/api/participations/:id', function (req, res) {
    _participation2.default.getParticipationById(req.params.id).then(function (participation) {
      _participation2.default.answerQuestion(participation, req.body.questionId, req.body.questionText, req.body.answerId, req.body.answerText, req.body.resultDescription, req.body.resultImage, req.body.completed).then(function (updatedParticipation) {
        if (req.body.completed) {
          (function () {
            var link = _participation2.default.getParticipationPermaLink(updatedParticipation._id);
            _alert2.default.send('participation', 'Assessment completed, email: ' + updatedParticipation.email + ' results: ' + link);
            _sheet2.default.addParticipation(updatedParticipation.email, updatedParticipation.assessmentName, link);
            _email2.default.send('completed', _appConfig2.default.app.completedAssessmentAddress, updatedParticipation.assessmentName, link);
            _assessment2.default.getAssessmentById(updatedParticipation.assessmentId).then(function (assessment) {
              var thanksDetail = '';
              if (!!_appConfig2.default.app.completedAssessmentHtmlEmails) {
                thanksDetail = _participation2.default.getHtmlResults(updatedParticipation, assessment);
              } else {
                thanksDetail = _participation2.default.getPlainTextResults(updatedParticipation, assessment);
              }
              _email2.default.send('thanks', updatedParticipation.email, thanksDetail, link);
            });
          })();
        }
        res.json(updatedParticipation);
      });
    });
  });

  /**
   * Get a previous participation for review of results
   */
  app.get('/api/participations/:id', function (req, res) {
    _participation2.default.getParticipationById(req.params.id).then(function (participation) {
      res.json(participation);
    });
  });
};