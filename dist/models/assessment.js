'use strict';

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _mongoose2.default.Schema;


/**
 * AnswerSchema represents the MongoDb document holding answer details,
 * nested within the QuestionSchema
 */
var AnswerSchema = new Schema({
  textId: String,
  displayText: String,
  resultDescription: String,
  resultImage: String,
  selectedCount: { type: Number, default: 0 }
});

/**
 * QuestionSchema represents the MongoDb document holding question details,
 * nested within the AssessmentSchema
 */
var QuestionSchema = new Schema({
  textId: String,
  displayText: String,
  description: String,
  answers: [AnswerSchema],
  shownCount: { type: Number, default: 0 }
});

var ResultCallToActionSchema = new Schema({
  heading: String,
  copy: String,
  buttonText: String,
  url: String
});

/**
 * AssessmentSchema represents the MongoDb document holding assessment details
 */
var AssessmentSchema = new Schema({
  textId: String,
  shortUrl: String,
  name: String,
  description: String,
  callToAction: String,
  imageUrl: String,
  resultCallToAction: ResultCallToActionSchema,
  questions: [QuestionSchema],
  startedCount: { type: Number, default: 0 },
  completedCount: { type: Number, default: 0 },
  created: { type: Date, default: (0, _moment2.default)().format() },
  createdBy: String,
  lastModified: { type: Date, default: (0, _moment2.default)().format() },
  lastModifiedBy: String
});

var Assessment = _mongoose2.default.model('Assessment', AssessmentSchema);
var Question = _mongoose2.default.model('Question', QuestionSchema);
var Answer = _mongoose2.default.model('Answer', AnswerSchema);
var ResultCallToAction = _mongoose2.default.model('ResultCallToAction', ResultCallToActionSchema);

module.exports = { Assessment: Assessment, Question: Question, Answer: Answer, ResultCallToAction: ResultCallToAction };