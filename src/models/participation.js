'use strict';

import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import moment from 'moment';

/**
 * The questions answered, have included the question and answer text here for ease of use later
 * when replaying the participation data to the user/participant in the client SPA UI
 */
const QuestionAnsweredSchema = new Schema({
  questionId: String,
  questionText: String,
  answerId: String,
  answerText: String,
  resultDescription: String,
  resultImage: String
});

/**
 * ParticipationSchema, this is the MVP needed to record participation in assessments
 * We can simply record email address here, along with the questions answered and not have to
 * manage the set of Participants (with unique emails) described by ParticipantSchema.
 * May eventually upgrade from this to ParticipantSchema but
 * let's start with this simpler implementation
 */
const ParticipationSchema = new Schema({
  email: String,
  started: { type: Date, default: moment().format() },
  completed: { type: Boolean, default: false },
  assessmentId: String,
  assessmentName: String,
  questionsAnswered:[QuestionAnsweredSchema]
});

const Participation = mongoose.model('Participation', ParticipationSchema);
const QuestionAnswered = mongoose.model('QuestionAnswered', QuestionAnsweredSchema);

module.exports = { Participation, QuestionAnswered };
