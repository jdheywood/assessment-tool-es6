'use strict';

/**
 * String utilities, additional functions either added to string prototype or available to import and call
 * @module utils/string
 */
module.exports = {

  /**
   * Initialise new prototype functions for string.
   * [1] toProperCase() - Proper cases the string that executes this function
   */
  initialise() {
    String.prototype.toProperCase = function () {
      return this.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    };
  },

  /**
   *
   * @param {array} array - the array to turn into a sentence
   * @param {string} defaultValue - a default value to return if array is empty
   * @returns {string} result - the resulting sentence
   */
  arrayToSentence (array, defaultValue) {
    if (!!array && array.length > 0) {
      let str = array.toString();
      let pos = str.lastIndexOf(',');
      if (pos !== -1) {
        // str = (str.substr(0, pos) + ' and ' + str.substr(pos + 1)).replace(/,/g, ', ');
        let beginning = str.substr(0, pos);
        let end = str.substr(pos + 1);
        str = (`${beginning} and ${end}`).replace(/,/g, ', ');
      }
      return str[0].toUpperCase() + str.substr(1) + '.';
    } else {
      return defaultValue;
    }
  },

};
