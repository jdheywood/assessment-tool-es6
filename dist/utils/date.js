'use strict';

var _appConfig = require('../../config/appConfig.json');

var _appConfig2 = _interopRequireDefault(_appConfig);

var _momentTimezone = require('moment-timezone');

var _momentTimezone2 = _interopRequireDefault(_momentTimezone);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Date utility, for date and time calculations
 * @module utils/date
 */
module.exports = {

  /**
   * For a given date, get the ISO week number
   *
   * Algorithm is to find nearest thursday, it's year is the year of the week number.
   * Then get weeks between that date and the first day of that year.
   *
   * Note that dates in one year can be weeks of previous or next year, overlap is up to 3 days.
   *
   * e.g. 2014/12/29 is Monday in week  1 of 2015
   *      2012/1/1   is Sunday in week 52 of 2011
   *
   * @param {date} d - the date to calculate the week number of
   * @returns {array} yearAndWeekNumber - the full year (4 digits) and week number for the given date
   */
  getWeekNumber: function getWeekNumber(d) {
    // Copy date so don't modify original
    d = new Date(+d);
    d.setHours(0, 0, 0);
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    // Get first day of year
    var yearStart = new Date(d.getFullYear(), 0, 1);
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    // Return array of year and week number
    return [d.getFullYear(), weekNo];
  },


  /**
   * Get the current day of the week, (1 being Monday NOT Sunday) based on GMT timezone
   * @returns {string} weekday - current day of the week (Monday based)
   */
  getDayOfWeek: function getDayOfWeek() {
    var weekDayAsNumber = (0, _momentTimezone2.default)().tz('Europe/London').isoWeekday();
    var weekday = new Array(7);
    weekday[1] = 'Monday';
    weekday[2] = 'Tuesday';
    weekday[3] = 'Wednesday';
    weekday[4] = 'Thursday';
    weekday[5] = 'Friday';
    weekday[6] = 'Saturday';
    weekday[7] = 'Sunday';
    return weekday[weekDayAsNumber];
  },


  /**
   * Gets the current time of the day in GMT based of configurable morning start and evening start hours
   * @returns {string} timeOfDay - 'Morning' or 'Evening' based on arbitrary cut off hour specified in app config
   */
  getTimeOfDay: function getTimeOfDay() {
    var d = (0, _momentTimezone2.default)().tz('Europe/London');
    var currentHour = d.hour();
    if (currentHour >= _appConfig2.default.app.morningStart && currentHour < _appConfig2.default.app.eveningStart) {
      return 'Morning';
    } else {
      return 'Evening';
    }
  },


  /**
   * Get the previous day of the week, based on the current day of the week
   * @param {string} currentDayOfTheWeek - 'Monday', 'Tuesday', etc
   * @returns {string} previousDayOfTheWeek - 'Sunday', 'Monday', etc
   */
  getPreviousDayOfTheWeek: function getPreviousDayOfTheWeek(currentDayOfTheWeek) {
    var previousDayOfTheWeek = null;
    if (currentDayOfTheWeek === 'Monday') {
      previousDayOfTheWeek = 'Sunday';
    } else if (currentDayOfTheWeek === 'Tuesday') {
      previousDayOfTheWeek = 'Monday';
    } else if (currentDayOfTheWeek === 'Wednesday') {
      previousDayOfTheWeek = 'Tuesday';
    } else if (currentDayOfTheWeek === 'Thursday') {
      previousDayOfTheWeek = 'Wednesday';
    } else if (currentDayOfTheWeek === 'Friday') {
      previousDayOfTheWeek = 'Thursday';
    } else if (currentDayOfTheWeek === 'Saturday') {
      previousDayOfTheWeek = 'Friday';
    } else {
      previousDayOfTheWeek = 'Saturday';
    }
    return previousDayOfTheWeek;
  },


  /**
   * Get the maximum week number of a given year (depending on how days fall a year has an uneven number of weeks)
   * Rather than calculate this I have looked up the data for the next 5 years
   * @param {number} year - The year to calculate for, supported years are 2015 to 2020
   * @returns {number} maxWeekNumber - 52 or 53 depending on year
   */
  getMaxWeekNumberByYear: function getMaxWeekNumberByYear(year) {
    var maxWeekNumber = 52;
    if (year === 2015) {
      maxWeekNumber = 53;
    } else if (year === 2016) {
      maxWeekNumber = 52;
    } else if (year === 2017) {
      maxWeekNumber = 52;
    } else if (year === 2018) {
      maxWeekNumber = 52;
    } else if (year === 2019) {
      maxWeekNumber = 52;
    } else if (year === 2020) {
      maxWeekNumber = 53;
    }
    return maxWeekNumber;
  },


  /**
   * Gets the current period of the day, Morning or Evening, based off GMT and configured morning start
   * and evening start hours
   *
   * Eg. If checking after midnight on Tuesday the day will be Wednesday but time will be evening,
   * which will be the wrong period, it should be Tuesday evening (not Wednesday evening!)
   *
   * So as well as adjusting the day, we may also need to adjust the week number and possibly the year
   * - if we are on an edge case, for example before 4am on Jan 1st
   *
   * @returns {object} currentPeriod - object containing day of week, time of day, week number and year properties
   * adjusted based on GMT and configured morning & evening start hours
   */
  getCurrentPeriod: function getCurrentPeriod() {
    var self = this;

    var currentPeriod = {
      dayOfWeek: self.getDayOfWeek(),
      timeOfDay: self.getTimeOfDay(), // 'Morning' or 'Evening'
      weekNumber: (0, _momentTimezone2.default)().tz('Europe/London').isoWeek(),
      year: (0, _momentTimezone2.default)().tz('Europe/London').isoWeekYear()
    };

    var currentHour = (0, _momentTimezone2.default)().tz('Europe/London').hour();

    if (currentPeriod.timeOfDay === 'Evening' && currentHour < 4) {
      var previousDay = self.getPreviousDayOfTheWeek(currentPeriod.dayOfWeek);
      currentPeriod.dayOfWeek = previousDay;
      if (previousDay === 'Sunday') {
        currentPeriod.weekNumber = currentPeriod.weekNumber - 1;
      }
      if (currentPeriod.weekNumber === 0) {
        var previousYear = currentPeriod.year - 1;
        currentPeriod.year = previousYear;
        currentPeriod.weekNumber = self.getMaxWeekNumberByYear(previousYear);
      }
    }

    return currentPeriod;
  }
};