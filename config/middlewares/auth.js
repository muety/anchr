var config = require('../config');

var strategies = [ 'jwt' ];
if (config.basicAuth) strategies.push('basic');

module.exports = function (passport) {
  return function (req, res, next) {
    passport.authenticate(strategies, { session: false }, function (err, user) {
      if (err || !user) return res.makeError(401, err ? err.message : 'Unable to authenticate');
      req.user = user.toObject();
      req.userObj = user;
      next();
    })(req, res, next);
  };
};
