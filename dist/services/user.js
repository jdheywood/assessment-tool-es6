'use strict';

var _appConfig = require('../../config/appConfig.json');

var _appConfig2 = _interopRequireDefault(_appConfig);

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

var _user = require('../models/user');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * User service
 * @module services/user
 */
module.exports = {

  /**
   *
   * @param {object} user - The user object to record a visit on
   * @returns {object} user - The updated user object, or an error object if save failed
   */
  recordVisit: function recordVisit(user) {
    user.incrementVisits();
    return (0, _q2.default)(user.save(function (error) {
      if (error) {
        console.log(error);
      }
    }));
  },


  /**
   *
   * @returns {array} users - array of all users in the system
   */
  getAllUsers: function getAllUsers() {
    return (0, _q2.default)(_user.User.find({}).sort({ 'username': 'asc' }).exec());
  },


  /**
   *
   * @param {array} users - all users in the system
   * @returns {array} chunks - array of arrays of users, or chunks, based on page size held in config
   */
  paginateAllUsers: function paginateAllUsers(users) {
    var pageSize = _appConfig2.default.app.userAdminListPageSize;
    var chunks = [],
        i = 0,
        n = users.length;
    while (i < n) {
      chunks.push(users.slice(i, i += pageSize));
    }
    return chunks;
  },


  /**
   *
   * @param {string} username - the username, (email address)
   * @returns {object} user - the user with the username (email) passed in, or null if not found
   */
  getUserByUsername: function getUserByUsername(username) {
    return (0, _q2.default)(_user.User.find({ 'username': username }).exec());
  },


  /**
   *
   * @param {string} id - the unique user identifier
   * @returns {object} user - the user with the identifier, or null if not found
   */
  getUserById: function getUserById(id) {
    return (0, _q2.default)(_user.User.findById(id).exec());
  },


  /**
   *
   * @param {string} id - the password reset identifier, previously allocated and saved against the user object
   * @returns {object} user - the user with the password reset id, or null of not found
   */
  getUserByPasswordResetId: function getUserByPasswordResetId(id) {
    return (0, _q2.default)(_user.User.find({ 'passwordResetId': id }).exec());
  },


  /**
   *
   * @param {object} user - the user object to save
   * @returns {object} user - the updated user object
   */
  saveUser: function saveUser(user) {
    return (0, _q2.default)(user.save(function (error) {
      if (error) {
        console.log(error);
      }
    }));
  }
};