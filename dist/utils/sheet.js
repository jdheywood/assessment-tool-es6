'use strict';

var _googleDriveSheets = require('google-drive-sheets');

var _googleDriveSheets2 = _interopRequireDefault(_googleDriveSheets);

var _environment = require('./environment');

var _environment2 = _interopRequireDefault(_environment);

var _alert = require('./alert');

var _alert2 = _interopRequireDefault(_alert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Google sheet utility, for storing data in secure google spreadsheet
 * @module utils/sheet
 */
module.exports = {

  /**
   * Gets an instance of the GoogleSheets object
   * @returns {GoogleSheets}
   */
  getSheet: function getSheet() {
    var googleDetails = _environment2.default.getGoogleDetails();
    return new _googleDriveSheets2.default(googleDetails.sheetId);
  },


  /**
   * Gets the secure access credentials
   * @returns {{client_email, private_key}}
   */
  getCreds: function getCreds() {
    var googleDetails = _environment2.default.getGoogleDetails();
    /*jshint camelcase: false */
    return {
      client_email: googleDetails.email,
      private_key: googleDetails.key
    };
  },


  /**
   * Adds a row to the participation google sheet for use in marketing comms
   * @param {string} email - the email of the participant
   * @param {string} assessmentName - the name of the assessment participated in
   * @param {string} resultsLink - the link to this participation results
   */
  addParticipation: function addParticipation(email, assessmentName, resultsLink) {
    var date = new Date();
    var sheet = this.getSheet();
    var credentials = this.getCreds();

    sheet.useServiceAccountAuth(credentials, function (error) {
      if (error) {
        _alert2.default.send('error', 'Cannot access Google Sheet using credentials');
      }
      var row = { email: email, date: date, assessment: assessmentName, link: resultsLink };
      sheet.addRow(1, row, function (error) {
        if (error) {
          _alert2.default.send('error', 'Error adding row to Google sheet');
        }
      });
    });
  }
};