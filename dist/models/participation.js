'use strict';

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _mongoose2.default.Schema;


/**
 * The questions answered, have included the question and answer text here for ease of use later
 * when replaying the participation data to the user/participant in the client SPA UI
 */
var QuestionAnsweredSchema = new Schema({
  questionId: String,
  questionText: String,
  answerId: String,
  answerText: String,
  resultDescription: String,
  resultImage: String
});

/**
 * ParticipationSchema, this is the MVP needed to record participation in assessments
 * We can simply record email address her, along with the questions answered and not have to
 * manage the set of Participants (with unique emails) described by ParticipantSchema.
 * May eventually upgrade from this to ParticipantSchema but
 * let's start with this simpler implementation
 */
var ParticipationSchema = new Schema({
  email: String,
  started: { type: Date, default: (0, _moment2.default)().format() },
  completed: { type: Boolean, default: false },
  assessmentId: String,
  assessmentName: String,
  questionsAnswered: [QuestionAnsweredSchema]
});

var Participation = _mongoose2.default.model('Participation', ParticipationSchema);
var QuestionAnswered = _mongoose2.default.model('QuestionAnswered', QuestionAnsweredSchema);

module.exports = { Participation: Participation, QuestionAnswered: QuestionAnswered };