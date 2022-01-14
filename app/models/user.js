var mongoose = require('mongoose')
  , bcrypt = require('bcrypt')
  , jwt = require('jsonwebtoken')
  , config = require('./../../config/config')
  , utils = require('../../utils');

var userSchema = mongoose.Schema({
  created : Date,
  local : {
    email : String,
    password : String,
  },
  facebook : {
    id : String,
    token : String,
    email: String,
    name : String
  },
  google : {
    id : String,
    token : String,
    email : String,
    name : String
  },
  verificationToken : String,
  telegramUserId : String
}, {
  usePushEach: true
});

userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

userSchema.methods.validHash = function (hash) {
  return hash === this.local.password;
};

userSchema.methods.validFacebook = function (token) {
  return token === this.facebook.token;
}

userSchema.methods.jwtSerialize = function(strategy) {
  var self = this.toObject();
  var payload = {};
  payload[strategy] = self[strategy];
  payload.strategy = strategy;

  if (payload[strategy].token) delete payload[strategy].token;
  if (payload[strategy].password) delete payload[strategy].password;

  return jwt.sign(payload, config.secret, { expiresIn : config.tokenExpire });
};

userSchema.methods.generateToken = function() {
  this.verificationToken = utils.generateUUID(16);
  return this.verificationToken;
};

userSchema.methods.clearToken = function() {
  this.verificationToken = '';
}

userSchema.methods.getEmail = function() {
  if (this.local) return this.local.email;
  if (this.facebook) return this.facebook.email;
  if (this.google) return this.google.email;
  return null;
}

module.exports = mongoose.model('User', userSchema);
