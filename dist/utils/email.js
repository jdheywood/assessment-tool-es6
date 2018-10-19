'use strict';

var _appConfig = require('../../config/appConfig.json');

var _appConfig2 = _interopRequireDefault(_appConfig);

var _environment = require('./environment');

var _environment2 = _interopRequireDefault(_environment);

var _sendgrid = require('sendgrid');

var _sendgrid2 = _interopRequireDefault(_sendgrid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Map of email subject lines for use when sending emails, mapped by email type, use type as key to get subject string
 * @type {{registration: string, newRegistrationAlert: string, forgotten: string, unknown: string}}
 */
var SubjectMap = {
  registration: 'Assessment Tool Registration Confirmation',
  newRegistrationAlert: 'New Registration Alert',
  forgotten: 'Assessment Tool Password Reset Link',
  thanks: 'Your Results',
  completed: 'Assessment Completed',
  unknown: 'Test Assessment Tool Email'
};

/**
 * Email utility, for sending emails via SendGrid
 * @module utils/email
 */
module.exports = {

  /**
   * Send an email via SendGrid, settings specified in app configuration
   * @param {string} type - the type of email to send
   * @param {email} to - the recipient's email address
   * @param {string} detail - the detail of the message, a simple string
   * @param {string} link - url of a related link, empty string if not provided
   */
  send: function send(type, to, detail) {
    var link = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';

    var sendGridDetails = _environment2.default.getSendGridDetails();
    var fromEmail = new _sendgrid2.default.mail.Email(_appConfig2.default.app.emailsFromAddress);
    var toEmail = new _sendgrid2.default.mail.Email(to);
    var subject = this.getSubject(type);
    var content = '';
    if (!!_appConfig2.default.app.completedAssessmentHtmlEmails) {
      content = new _sendgrid2.default.mail.Content('text/html', this.getContent(type, detail, link));
    } else {
      content = new _sendgrid2.default.mail.Content('text/plain', this.getContent(type, detail, link));
    }
    var mail = new _sendgrid2.default.mail.Mail(fromEmail, subject, toEmail, content);
    if (!!_appConfig2.default.app.completedAssessmentHtmlEmails) {
      mail.setTemplateId(sendGridDetails.templateId);
    }

    var sg = (0, _sendgrid2.default)(sendGridDetails.apiKey);
    var request = sg.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: mail.toJSON()
    });

    sg.API(request, function (error, response) {
      if (process.env.ENV_NAME === 'development') {
        console.log(response.statusCode);
        console.log(response.body);
        console.log(response.headers);
      }
      if (error) {
        console.log(error);
      }
    });
  },


  /**
   * Use the subjectMap constant to return the relevant subject or a default value if no entry found for type
   * @param {string} type - the type of email
   * @returns {string} subject - the subject line for the email
   */
  getSubject: function getSubject(type) {
    var subject = SubjectMap[type];
    return !!subject ? subject : SubjectMap['unknown'];
  },


  /**
   * Get the content string for the email using type and detail
   * @param {string} type - the type of email being sent
   * @param {string} detail - specific detail to use in the content string via interpolation
   * @param {string} link - link to include in the email content
   * @returns {string} content - the content string for the email body
   */
  getContent: function getContent(type, detail, link) {
    var content = '';
    if (type === 'registration') {
      content = 'Thanks for registering with Assessment Tool!';
    } else if (type === 'new registration alert') {
      content = 'A new user has registered: ' + detail;
    } else if (type === 'forgotten') {
      content = 'Follow this link ' + detail + ' to reset your password';
    } else if (type === 'thanks') {
      content = detail;
    } else if (type === 'completed') {
      content = 'Assessment completed by ' + detail + ', view the results here: ' + link;
    } else {
      content = 'Hello friend, this is a test from me, Assessment Bot!';
    }
    return content;
  },


  /**
   * Get the full url for password reset links to be included in email content
   * @param {string} identifier - the password reset identifier set against the user model to include in the full url
   * @returns {string} passwordResetUrl - full url to reset password on relevant environment
   */
  getPasswordResetLink: function getPasswordResetLink(identifier) {
    var url = _environment2.default.getRootUrl();
    return url + _appConfig2.default.app.resetPasswordRoute + identifier;
  }
};