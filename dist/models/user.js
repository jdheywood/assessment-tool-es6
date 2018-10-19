'use strict';

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _passportLocalMongoose = require('passport-local-mongoose');

var _passportLocalMongoose2 = _interopRequireDefault(_passportLocalMongoose);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _mongoose2.default.Schema;


/**
 * UserSchema, for administrative users (who create and manage assessments)
 */
var UserSchema = new Schema({
  username: { type: String, index: { unique: true, dropDups: true } },
  created: { type: Date, default: (0, _moment2.default)().format() },
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
  this.lastLogin = (0, _moment2.default)().format();
  next();
});

/**
 * Schema extension method, call this on login to update visit count
 */
UserSchema.methods.incrementVisits = function () {
  this.visits++;
};

var options = { usernameLowerCase: true, usernameUnique: true };
/**
 * Plug in our auth helper, currently using local
 */
UserSchema.plugin(_passportLocalMongoose2.default, options);

var User = _mongoose2.default.model('User', UserSchema);

module.exports = { User: User };