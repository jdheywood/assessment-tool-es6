'use strict';

import appConfig from '../../config/appConfig.json';
import environment from './environment';
import sendGrid from 'sendgrid';

/**
 * Map of email subject lines for use when sending emails, mapped by email type, use type as key to get subject string
 * @type {{registration: string, newRegistrationAlert: string, forgotten: string, unknown: string}}
 */
const SubjectMap = {
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
  send(type, to, detail, link = '') {
    let sendGridDetails = environment.getSendGridDetails();
    let fromEmail = new sendGrid.mail.Email(appConfig.app.emailsFromAddress);
    let toEmail = new sendGrid.mail.Email(to);
    let subject = this.getSubject(type);
    let content = '';
    if (!!appConfig.app.completedAssessmentHtmlEmails) {
      content = new sendGrid.mail.Content('text/html', this.getContent(type, detail, link));
    } else {
      content = new sendGrid.mail.Content('text/plain', this.getContent(type, detail, link));
    }
    let mail = new sendGrid.mail.Mail(fromEmail, subject, toEmail, content);
    if (!!appConfig.app.completedAssessmentHtmlEmails) {
      mail.setTemplateId(sendGridDetails.templateId);
    }

    let sg = sendGrid(sendGridDetails.apiKey);
    let request = sg.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: mail.toJSON(),
    });

    sg.API(request, function(error, response) {
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
  getSubject(type) {
    let subject = SubjectMap[type];
    return !!subject ? subject : SubjectMap['unknown'];
  },

  /**
   * Get the content string for the email using type and detail
   * @param {string} type - the type of email being sent
   * @param {string} detail - specific detail to use in the content string via interpolation
   * @param {string} link - link to include in the email content
   * @returns {string} content - the content string for the email body
   */
  getContent(type, detail, link) {
    let content = '';
    if (type === 'registration') {
      content = 'Thanks for registering with Assessment Tool!';
    } else if (type === 'new registration alert') {
      content = `A new user has registered: ${detail}`;
    } else if (type === 'forgotten') {
      content = `Follow this link ${detail} to reset your password`;
    } else if (type === 'thanks') {
      content = detail;
    } else if (type === 'completed') {
      content = `Assessment completed by ${detail}, view the results here: ${link}`;
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
  getPasswordResetLink(identifier) {
    let url = environment.getRootUrl();
    return url + appConfig.app.resetPasswordRoute + identifier;
  },

};