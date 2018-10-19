'use strict';

import GoogleSheets from 'google-drive-sheets';
import environment from './environment';
import alert from './alert';

/**
 * Google sheet utility, for storing data in secure google spreadsheet
 * @module utils/sheet
 */
module.exports = {

  /**
   * Gets an instance of the GoogleSheets object
   * @returns {GoogleSheets}
   */
  getSheet() {
    let googleDetails = environment.getGoogleDetails();
    return new GoogleSheets(googleDetails.sheetId);
  },

  /**
   * Gets the secure access credentials
   * @returns {{client_email, private_key}}
   */
  getCreds() {
    let googleDetails = environment.getGoogleDetails();
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
  addParticipation(email, assessmentName, resultsLink) {
    let date = new Date();
    let sheet = this.getSheet();
    let credentials = this.getCreds();

    sheet.useServiceAccountAuth(credentials, (error) => {
      if (error) {
        alert.send('error', 'Cannot access Google Sheet using credentials');
      }
      let row = { email: email, date: date, assessment: assessmentName, link: resultsLink };
      sheet.addRow(1, row, (error) => {
        if (error) {
          alert.send('error', 'Error adding row to Google sheet');
        }
      });
    });
  },

};
