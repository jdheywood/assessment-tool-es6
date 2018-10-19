'use strict';

import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import moment from 'moment';

/**
 * AnswerSchema represents the MongoDb document holding answer details,
 * nested within the QuestionSchema
 */
const AnswerSchema = new Schema({
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
const QuestionSchema = new Schema({
  textId: String,
  displayText: String,
  description: String,
  answers: [AnswerSchema],
  shownCount: { type: Number, default: 0 }
});

const ResultCallToActionSchema = new Schema({
  heading: String,
  copy: String,
  buttonText: String,
  url: String
});

/**
 * AssessmentSchema represents the MongoDb document holding assessment details
 */
const AssessmentSchema = new Schema({
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
  created: { type: Date, default: moment().format() },
  createdBy: String,
  lastModified: {type: Date, default: moment().format() },
  lastModifiedBy: String
});

const Assessment = mongoose.model('Assessment', AssessmentSchema);
const Question = mongoose.model('Question', QuestionSchema);
const Answer = mongoose.model('Answer', AnswerSchema);
const ResultCallToAction = mongoose.model('ResultCallToAction', ResultCallToActionSchema);

module.exports = { Assessment, Question, Answer, ResultCallToAction };
