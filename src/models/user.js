'use strict';

import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import passportLocalMongoose from 'passport-local-mongoose';
import moment from 'moment';

/**
 * UserSchema, for administrative users (who create and manage assessments)
 */
const UserSchema = new Schema({
  username: {type: String, index: {unique: true, dropDups: true}},
  created: { type: Date, default: moment().format() },
  lastLogin: Date,
  visits: { type: Number, default: 0 },
  displayName: String,
  passwordResetId: String,
  canDebug: { type: Boolean, default: false }
});

/**
 * Pre-save function to maintain last login date and time data
 */
UserSchema.pre('save', function (next) {
  this.lastLogin = moment().format();
  next();
});

/**
 * Schema extension method, call this on login to update visit count
 */
UserSchema.methods.incrementVisits = function() {
  this.visits++;
};

const options = { usernameLowerCase: true, usernameUnique: true };
/**
 * Plug in our auth helper, currently using local
 */
UserSchema.plugin(passportLocalMongoose, options);

const User = mongoose.model('User', UserSchema);

module.exports = { User };
