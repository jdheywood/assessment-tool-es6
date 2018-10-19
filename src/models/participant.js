'use strict';

import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import moment from 'moment';

/**
 * Represents the answer given to a question by participant during assessment
 */
const QuestionAnsweredSchema = new Schema({
  questionId: String,
  answerId: String
});

/**
 * ResultSchema represents the participation by the participant with an assessment,
 * the questions seen and answered for the specified assessment
 */
const ResultSchema = new Schema({
  assessmentId: String,
  questionsAnswered: [QuestionAnsweredSchema]
});

/**
 * ParticipantSchema represents a uniquely identified (via email) participant of one or more
 * assessments over time.
 * This schema has not yet been implemented, MVP will likely use ParticipationSchema to reduce the
 * development effort needed to get a working client SPA up and running.
 */
const ParticipantSchema = new Schema({
  email: {type: String, index: {unique: true, dropDups: true}},
  created: { type: Date, default: moment().format() },
  lastAssessment: { type: Date, default: moment().format() },
  assessmentsStarted: { type: Number, default: 0 },
  assessmentsCompleted: { type: Number, default: 0 },
  results:[ResultSchema],
  visits: { type: Number, default: 0 }
});

/**
 * Pre-save function to update lastAssessment date and time field, will be called
 * automatically by mongoose just before schema instance is saved
 */
ParticipantSchema.pre('save', function (next) {
  this.lastAssessment = moment().format();
  next();
});

/**
 * Schema extension method, call this on assessment start to update visit count
 */
ParticipantSchema.methods.incrementVisits = function() {
  this.visits++;
};

const Participant = mongoose.model('Participant', ParticipantSchema);

module.exports = { Participant };
