'use strict';

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _appConfig = require('../../config/appConfig.json');

var _appConfig2 = _interopRequireDefault(_appConfig);

var _assessment = require('../models/assessment');

var _generateUrl = require('generate-url');

var _generateUrl2 = _interopRequireDefault(_generateUrl);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Assessment service
 * @module services/assessment
 */
module.exports = {

  /**
   * Fetch all assessments in the system
   * @returns {array} assessments - all assessments in the system, sorted by name ascending
   */
  getAllAssessments: function getAllAssessments() {
    return (0, _q2.default)(_assessment.Assessment.find({}).sort({ 'name': 'asc' }).exec());
  },


  /**
   * Fetch specific assessment by it's identifier
   * @param {string} id - the unique identifier of the assessment to fetch
   * @returns {object} assessment - the assessment found, or null if not found
   */
  getAssessmentById: function getAssessmentById(id) {
    return (0, _q2.default)(_assessment.Assessment.findById(id).exec());
  },


  /**
   * Fetch specific question by it's parent assessment and unique identifier
   * @param {object} assessment - the parent assessment
   * @param {string} questionId - the question identifier for the question we want to fetch from the assessment
   * @returns {object} question - the question object we found, or null if not found
   */
  getQuestionByAssessmentAndId: function getQuestionByAssessmentAndId(assessment, questionId) {
    var result = null;
    _underscore2.default.each(assessment.questions, function (question) {
      if (question._id.toString() === questionId.toString()) {
        result = question;
      }
    });
    return result;
  },


  /**
   * Get the question, and answer by assessment, question id and answer id
   * @param {object} assessment - the grandparent assessment object
   * @param {string} questionId - the parent question identifier
   * @param {string} answerId - the answer identifier for the answer we ant to fetch
   * @returns {Array} question and answer - the parent question of the answer in position 0, the answer in position 1, or empty array if not found
   */
  getAnswerAndParentQuestionByAssessmentAndQuestionIdAndId: function getAnswerAndParentQuestionByAssessmentAndQuestionIdAndId(assessment, questionId, answerId) {
    var result = [];
    _underscore2.default.each(assessment.questions, function (question) {
      if (question._id.toString() === questionId.toString()) {
        result.push(question);
        _underscore2.default.each(question.answers, function (answer) {
          if (answer._id.toString() === answerId.toString()) {
            result.push(answer);
          }
        });
      }
    });
    return result;
  },


  /**
   * Paginate an array of assessments to the page size specified in configuration
   * @param {array} assessments - all assessments in the system
   * @returns {array} chunks - array of arrays of assessments, each chunk representing a page of data
   */
  paginateAllAssessments: function paginateAllAssessments(assessments) {
    var pageSize = _appConfig2.default.app.assessmentAdminListPageSize;
    var chunks = [],
        i = 0,
        n = assessments.length;
    while (i < n) {
      chunks.push(assessments.slice(i, i += pageSize));
    }
    return chunks;
  },


  /**
   * Validate the creation or edit of an assessment
   * @param {object} assessment - the assessment, if validating edit of existing, null if validating creation of new
   * @param {string} name - assessment name
   * @param {string} description - assessment description
   * @param {string} callToAction - assessment call to action for start button
   * @param {string} imageName - name of the assessment image file being uploaded, or empty string if no image uploaded
   * @param {string} resultCtaUrl - url of the optional results screen call to action
   * @returns {Array} errors - array of error objects {field : message} - if empty then the validation passed, otherwise failed
   */
  validateAssessment: function validateAssessment(assessment, name, description, callToAction, imageName, resultCtaUrl) {
    var errors = [];
    if (!name) {
      errors.push({ 'field': 'name', 'message': 'Please specify a name' });
    }
    if (!description) {
      errors.push({ 'field': 'description', 'message': 'Please specify a description' });
    }
    if (!callToAction) {
      errors.push({ 'field': 'callToAction', 'message': 'Please specify a call to action' });
    }
    // if editing and assessment already has image url, do not enforce change
    if (!!assessment) {
      if (!assessment.imageUrl && !imageName) {
        errors.push({ 'field': 'assessmentImage', 'message': 'Please select an image to upload' });
      }
    } else {
      // else enforce image for creation
      if (!imageName) {
        errors.push({ 'field': 'assessmentImage', 'message': 'Please select an image to upload' });
      }
    }
    // resultsCTA url must start with http:// or https://
    if (!!resultCtaUrl) {
      if (!resultCtaUrl.startsWith('http://') && !resultCtaUrl.startsWith('https://')) {
        errors.push({ 'field': 'resultCtaUrl', 'message': 'Result CTA Url must start with either http:// or https://' });
      }
    }
    return errors;
  },


  /**
   * Create a new assessment, assumes valid input
   * @param {string} name - the name of the assessment we want to create
   * @param {string} description - the description of the assessment we want to create
   * @param {string} callToAction - the text for the button to start the assessment
   * @param {string} imageUrl - the url of the image to show on the introduction screen for participants
   * @param {string} resultCallToActionHeading - the heading for an optional call to action on the results screen
   * @param {string} resultCallToActionCopy - the copy for an optional call to action on the results screen
   * @param {string} resultCallToActionButtonText - the button text for an optional call to action on the results screen
   * * @param {string} resultCallToActionUrl - the url for the optional call to action on the results screen
   * @param {string} userId - the user creating this assessment
   * @returns {object} assessment - the new assessment just created
   */
  createNewAssessment: function createNewAssessment(name, description, callToAction, imageUrl, resultCallToActionHeading, resultCallToActionCopy, resultCallToActionButtonText, resultCallToActionUrl, userId) {
    var resultCallToAction = new _assessment.ResultCallToAction({
      heading: resultCallToActionHeading,
      copy: resultCallToActionCopy,
      buttonText: resultCallToActionButtonText,
      url: resultCallToActionUrl
    });
    var assessment = new _assessment.Assessment({
      created: (0, _moment2.default)().format(),
      name: name,
      description: description,
      callToAction: callToAction,
      imageUrl: imageUrl,
      createdBy: userId,
      shortUrl: (0, _generateUrl2.default)(name),
      resultCallToAction: resultCallToAction
    });
    return (0, _q2.default)(assessment.save());
  },


  /**
   * Edit an existing assessment, assumes valid input
   * @param {object} assessment - the assessment to edit
   * @param {string} name - the name of the assessment, possibly edited
   * @param {string} description - possibly edited description
   * @param {string} callToAction - possibly edited text for the assessment start button
   * @param {string} imageUrl - the url of the image to show on the introduction screen for participants
   * @param {string} resultCallToActionHeading - the heading for an optional call to action on the results screen
   * @param {string} resultCallToActionCopy - the copy for an optional call to action on the results screen
   * @param {string} resultCallToActionButtonText - the button text for an optional call to action on the results screen
   * @param {string} resultCallToActionUrl - the url for the optional call to action on the results screen
   * @param {string} userId - userId of the user editing the assessment
   * @returns {object} assessment - the edited assessment
   */
  editAssessment: function editAssessment(assessment, name, description, callToAction, imageUrl, resultCallToActionHeading, resultCallToActionCopy, resultCallToActionButtonText, resultCallToActionUrl, userId) {
    assessment.name = name;
    assessment.description = description;
    assessment.callToAction = callToAction;
    // if no change to image null will be passed in so only update when param set
    if (!!imageUrl) {
      assessment.imageUrl = imageUrl;
    }
    assessment.lastModified = (0, _moment2.default)().format();
    assessment.lastModifiedBy = userId;
    assessment.shortUrl = (0, _generateUrl2.default)(name);
    if (!assessment.resultCallToAction) {
      assessment.resultCallToAction = new _assessment.ResultCallToAction({
        heading: resultCallToActionHeading,
        copy: resultCallToActionCopy,
        buttonText: resultCallToActionButtonText,
        url: resultCallToActionUrl
      });
    } else {
      assessment.resultCallToAction.heading = resultCallToActionHeading;
      assessment.resultCallToAction.copy = resultCallToActionCopy;
      assessment.resultCallToAction.buttonText = resultCallToActionButtonText;
      assessment.resultCallToAction.url = resultCallToActionUrl;
    }
    return (0, _q2.default)(assessment.save());
  },


  /**
   * Delete an assessment by id
   * @param {string} assessmentId - the unique identifier of an assessment
   * @returns {object} assessment - the assessment if found by its id, null if not
   */
  deleteAssessment: function deleteAssessment(assessmentId) {
    return (0, _q2.default)(_assessment.Assessment.findByIdAndRemove(assessmentId).exec());
  },


  /**
   * Validate creation or edit of a question
   * @param {string} questionText - the text to display when asking the participant the question
   */
  validateQuestion: function validateQuestion(questionText) {
    var errors = [];
    if (!questionText) {
      errors.push({ 'field': 'displayText', 'message': 'Please specify the question text' });
    }
    return errors;
  },


  /**
   * Create a new question (within an assessment), assumes valid input
   * @param {object} assessment - the assessment to add the question to
   * @param {string} questionText - the text of the question
   * @param {string} description - the description to support the question text
   * @returns {object} assessment - the updated assessment, now with new question added
   */
  addQuestionToAssessment: function addQuestionToAssessment(assessment, questionText, description) {
    var question = new _assessment.Question({
      textId: (0, _generateUrl2.default)(questionText),
      displayText: questionText,
      description: description,
      answers: []
    });
    assessment.questions.push(question);
    return (0, _q2.default)(assessment.save());
  },


  /**
   * Edit an existing question of an assessment, assumes valid input
   * @param {object} assessment - the assessment containing the question to edit
   * @param {string} questionId - the identifier of the question to edit
   * @param {string} questionText - the edited question text
   * @param {string} description - the description to support the question text
   * @returns {object} assessment - the updated assessment with edited question
   */
  editQuestionOfAssessment: function editQuestionOfAssessment(assessment, questionId, questionText, description) {
    var question = this.getQuestionByAssessmentAndId(assessment, questionId);
    question.displayText = questionText;
    question.description = description;
    return (0, _q2.default)(assessment.save());
  },


  /**
   * Delete a question by assessment and identifier
   * @param {object} assessment - the assessment to delete a question from
   * @param {string} questionId - the identifier of the question to delete
   * @returns {object} assessment - the updated assessment, with question deleted from it
   */
  deleteQuestionOfAssessment: function deleteQuestionOfAssessment(assessment, questionId) {
    assessment.questions = _underscore2.default.reject(assessment.questions, function (question) {
      return question._id.toString() === questionId.toString();
    });
    return (0, _q2.default)(assessment.save());
  },


  /**
   * Validate creation or edit of an answer
   * @param {object} answer - the answer object, if validating the edit of an answer, null if validating creation
   * @param {string} answerText - the display text of the answer to show during participation
   * @param {string} description - description to show on the results screen of participation UI
   * @param {string} imageName - name of the answer image file being uploaded, or empty string if no image uploaded
   */
  validateAnswer: function validateAnswer(answer, answerText, description, imageName) {
    var errors = [];
    if (!answerText) {
      errors.push({ 'field': 'displayText', 'message': 'Please specify the answer text' });
    }
    if (!description) {
      errors.push({ 'field': 'description', 'message': 'Please specify a description for the results screen' });
    }
    // if editing and answer already has image url, do not enforce change
    if (!!answer) {
      if (!answer.resultImage && !imageName) {
        errors.push({ 'field': 'answerImage', 'message': 'Please select an image to upload' });
      }
    } else {
      // else enforce image for creation
      if (!imageName) {
        errors.push({ 'field': 'answerImage', 'message': 'Please select an image to upload' });
      }
    }
    return errors;
  },


  /**
   * Create answer for an existing question within a given assessment, assumes valid input
   * @param {object} assessment - the assessment object, parent of the question, grandparent of the new answer
   * @param {string} questionId - the question identifier
   * @param {string} answerText - the display text of the answer, for use in the UI when taking an assessment
   * @param {string} answerDescription - the description of the answer, for use in the UI when describing a result
   * @param {string} answerImageUrl - the url of the uploaded image held in S3
   * @returns {object} assessment - the updated assessment, with the new answer added to the relevant question
   */
  addAnswerToQuestion: function addAnswerToQuestion(assessment, questionId, answerText, answerDescription, answerImageUrl) {
    var answer = new _assessment.Answer({
      textId: (0, _generateUrl2.default)(answerText),
      displayText: answerText,
      resultDescription: answerDescription,
      resultImage: answerImageUrl
    });
    _underscore2.default.each(assessment.questions, function (question) {
      if (question._id.toString() === questionId.toString()) {
        question.answers.push(answer);
      }
    });
    return (0, _q2.default)(assessment.save());
  },


  /**
   * Edit an existing answer of a question within the context of an assessment, assumes valid input
   * @param {object} assessment - the assessment containing the question which contains the answer we want to edit
   * @param {string} questionId - the question identifier for the question which contains the answer we want to edit
   * @param {string} answerId - the answer identifier of the answer we want to edit
   * @param {string} answerDisplayText - the updated text of the answer
   * @param {string} answerResultDescription - the updated result description of the answer
   * @param {string} answerImageUrl - the url of the uploaded image held in S3
   * @returns {object} assessment - the updated assessment, with the edited answer
   */
  editAnswerOfQuestionOfAssessment: function editAnswerOfQuestionOfAssessment(assessment, questionId, answerId, answerDisplayText, answerResultDescription, answerImageUrl) {
    _underscore2.default.each(assessment.questions, function (question) {
      if (question._id.toString() === questionId.toString()) {
        _underscore2.default.each(question.answers, function (answer) {
          if (answer._id.toString() === answerId.toString()) {
            answer.displayText = answerDisplayText;
            answer.resultDescription = answerResultDescription;
            // if no change to image null will be passed in so only update when param set
            if (!!answerImageUrl) {
              answer.resultImage = answerImageUrl;
            }
          }
        });
      }
    });
    return (0, _q2.default)(assessment.save());
  },


  /**
   * Delete an answer of a question by identifier, within context of an assessment
   * @param {object} assessment - the assessment containing the question which contains the answer we want to delete
   * @param {string} questionId - the question identifier for the question which contains the answer we want to delete
   * @param {string} answerId - the answer identifier of the answer we want to delete
   * @returns {object} assessment - the updated assessment, with the answer deleted
   */
  deleteAnswerOfQuestionOfAssessment: function deleteAnswerOfQuestionOfAssessment(assessment, questionId, answerId) {
    _underscore2.default.each(assessment.questions, function (question) {
      if (question._id.toString() === questionId.toString()) {
        question.answers = _underscore2.default.reject(question.answers, function (answer) {
          return answer._id.toString() === answerId.toString();
        });
      }
    });
    return (0, _q2.default)(assessment.save());
  }
};