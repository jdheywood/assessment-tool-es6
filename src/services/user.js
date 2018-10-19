'use strict';

import appConfig from '../../config/appConfig.json';
import q from 'q';
import {User} from '../models/user';

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
  recordVisit(user) {
    user.incrementVisits();
    return q(user.save(function (error) {
      if (error) {
        console.log(error);
      }
    }));
  },

  /**
   *
   * @returns {array} users - array of all users in the system
   */
  getAllUsers() {
    return q(User.find({}).sort({ 'username': 'asc'}).exec());
  },

  /**
   *
   * @param {array} users - all users in the system
   * @returns {array} chunks - array of arrays of users, or chunks, based on page size held in config
   */
  paginateAllUsers(users) {
    let pageSize = appConfig.app.userAdminListPageSize;
    let chunks = [],
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
  getUserByUsername(username) {
    return q(User.find({'username': username}).exec());
  },

  /**
   *
   * @param {string} id - the unique user identifier
   * @returns {object} user - the user with the identifier, or null if not found
   */
  getUserById(id) {
    return q(User.findById(id).exec());
  },

  /**
   *
   * @param {string} id - the password reset identifier, previously allocated and saved against the user object
   * @returns {object} user - the user with the password reset id, or null of not found
   */
  getUserByPasswordResetId(id) {
    return q(User.find({'passwordResetId': id}).exec());
  },

  /**
   *
   * @param {object} user - the user object to save
   * @returns {object} user - the updated user object
   */
  saveUser(user) {
    return q(user.save(function (error) {
      if (error) {
        console.log(error);
      }
    }));
  },

};
