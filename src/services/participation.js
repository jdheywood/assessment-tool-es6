'use strict';

import { Participation, QuestionAnswered } from '../models/participation';
import q from 'q';
import _ from 'underscore';

/**
 * Participation service
 * @module services/participation
 */
module.exports = {

  /**
   * Creates a new participation document for reference later
   * @param {string} email - the email address of the participant
   * @param {string} assessmentId - the assessment identifier of the assessment the participant is taking
   * @param {string} assessmentName - the name of the assessment the participant is taking
   * @returns {object} participation - the new participation object
   */
  createNewParticipation(email, assessmentId, assessmentName) {
    let participation = new Participation({
      email: email,
      assessmentId: assessmentId,
      assessmentName: assessmentName
    });
    return q(participation.save());
  },

  /**
   * Updates a participation document with an answered question, also marks completed when answering final question
   * Completion triggers alerts, emails and write to google sheet
   * @param {object} participation - the participation object to record a new answer against
   * @param {string} questionId - the identifier of the question answered
   * @param {string} questionText - the text of the question answered to reduce need for further queries later
   * @param {string} answerId - the identifier of the answer selected
   * @param {string} answerText - the text of the answer selected to reduce need for further queries later
   * @param {string} resultDescription - the result description shown to the participant at end of assessment
   * @param {string} resultImage - the result image shown alongside the description to the participant at end of assessment
   * @param {boolean} completed - indicating if this is the last question and therefore whether or not participation is complete
   * @returns {object} participation - the updated participation object
   */
  answerQuestion(participation, questionId, questionText, answerId, answerText, resultDescription, resultImage, completed) {
    let questionAnswered = new QuestionAnswered({
      questionId: questionId,
      questionText: questionText,
      answerId: answerId,
      answerText: answerText,
      resultDescription: resultDescription,
      resultImage: resultImage
    });
    participation.questionsAnswered.push(questionAnswered);
    participation.completed = completed;
    return q(participation.save());
  },

  /**
   * Get a participation document by it's unique identifier
   * @param {string} participationId - the identifier of the participation object we want to fetch
   * @returns {object} participation - the participation object found, or null if not found
   */
  getParticipationById(participationId) {
    return q(Participation.findById(participationId).exec());
  },

  /**
   * Get the permanent link to participation results
   * @param {string} participationId - the identifier of the participation object to construct link
   * @returns {string} permaLink - a permanent link to the results of the particpation
   */
  getParticipationPermaLink(participationId) {
    return `http://assessment-tool-live.herokuapp.com/participation/${participationId}`;
  },

  /**
   * Get a formatted string of the results for plain text email to participant
   * @param {object} participation - the participation object in question
   * @param {object} assessment - the assessment that this participation was for
   * @returns {string} content - the formatted text content for emailing to participant
   */
  getPlainTextResults(participation, assessment) {
    let content = '';

    if (participation.assessmentName.toLowerCase().includes('assessment')) {
      content += `Thanks for participating in the ${participation.assessmentName}.`;
    } else {
      content += `Thanks for participating in our assessment, ${participation.assessmentName}.`;
    }

    content += '\r\n\r\n\r\nYour Results:';

    _.each(participation.questionsAnswered, (questionAnswered) => {
      content += `\r\n\r\n\r\n${questionAnswered.questionText}`;
      content += `\r\n\r\n${questionAnswered.answerText}`;
      content += `\r\n\r\n${questionAnswered.resultDescription}`;
    });

    content += `\r\n\r\n\r\nYour results can be viewed online here: ${this.getParticipationPermaLink(participation._id)}`;

    if (!!assessment.resultCallToAction) {
      content += `\r\n\r\n\r\n${assessment.resultCallToAction.heading}`;
      content += `\r\n\r\n${assessment.resultCallToAction.copy}`;
      content += `\r\n\r\n${assessment.resultCallToAction.url}`;
    } else {
      content += '\r\n\r\n\r\nFor help setting and realising your goals look no further than the http://goalgettingclub.com';
    }

    return content;
  },

  /**
   * Get a formatted string of the results for html email to participant
   * @param {object} participation - the participation object in question
   * @param {object} assessment - the assessment that this participation was for
   * @returns {string} content - the formatted html content for emailing to participant
   */
  getHtmlResults(participation, assessment) {
    let content = '';

    if (participation.assessmentName.toLowerCase().includes('assessment')) {
      content += `Thanks for participating in the <strong>${participation.assessmentName}.</strong>`;
    } else {
      content += `Thanks for participating in our assessment, <strong>${participation.assessmentName}.</strong>`;
    }

    content += '<br/><br/><br/>Your Results:';

    _.each(participation.questionsAnswered, (questionAnswered) => {
      content += `<br/><br/><br/><strong>${questionAnswered.questionText}</strong>`;
      content += `<br/><br/>You answered: ${questionAnswered.answerText}`;
      content += `<br/><br/>${questionAnswered.resultDescription}`;
    });

    content += `<br/><br/><br/>Your results can be <a href="${this.getParticipationPermaLink(participation._id)}", target="_blank">viewed online here</a>`;

    if (!!assessment.resultCallToAction && !!assessment.resultCallToAction.url) {
      content += `<br/><br/><br/><strong>${assessment.resultCallToAction.heading}</strong>`;
      content += `<br/><br/>${assessment.resultCallToAction.copy}`;
      content += `<br/><br/><a href="${assessment.resultCallToAction.url}", target="_blank">${assessment.resultCallToAction.buttonText}</a>`;
    } else {
      content += '<br/><br/><br/>For help setting and realising your goals look no further than the <a href="http://goalgettingclub.com", target="_blank">Goal Getting Club</a>';
    }

    return content;
  },

};
